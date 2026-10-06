// FE039 PR 전, 변경하지 않은 공개 화면과 관리자 예시 흐름의 회귀 확인.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE);
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch();
  const results = [];
  try {
    for (const width of [1440, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, isMobile: width === 390, hasTouch: width === 390 });
      const page = await context.newPage();
      page.setDefaultTimeout(10000);
      const errors = [];
      const writes = [];
      page.on('pageerror', error => errors.push(error.message));
      // 실제 저장·외부 전송 없이 새 브라우저의 메모리 예시만 조작한다.
      await page.route('**/*', async route => {
        const request = route.request();
        if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) {
          writes.push({ method: request.method(), url: request.url() });
          return route.abort();
        }
        return route.continue();
      });
      const check = async name => {
        await page.evaluate(async () => {
          window.scrollTo(0, 0);
          await Promise.all([...document.images].map(image => {
            image.loading = 'eager';
            return image.decode().catch(() => {});
          }));
          await document.fonts.ready;
        });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
        assert.equal(overflow, false, `${width} ${name}: horizontal overflow`);
        assert.deepEqual(errors, [], `${width} ${name}: page errors`);
        await page.screenshot({ path: path.join(__dirname, `regression-${width}-${name}.png`), fullPage: true });
        results.push({ width, name, overflow, errors: [...errors] });
      };
      await page.goto('http://localhost:3000/');
      await page.getByRole('button', { name: '데모 보기', exact: true }).waitFor();
      await check('home');
      await page.getByRole('navigation', { name: 'Valorant navigation' }).getByRole('link', { name: 'Overview', exact: true }).click();
      await page.waitForURL('**/players/ied-agent-allen');
      await page.getByRole('heading').filter({ hasText: 'IED agent' }).waitFor();
      await check('overview');
      await page.goto('http://localhost:3000/insights');
      await page.getByRole('heading', { level: 1 }).waitFor();
      await check('insights');
      await page.goto('http://localhost:3000/smokes');
      await page.getByRole('button', { name: 'Ascent 스모크 보기', exact: true }).click();
      await page.getByRole('button', { name: 'Ascent A 진입 공통 원형 연막 선택', exact: true }).click();
      await check('smokes');
      await page.getByRole('button', { name: '수비', exact: true }).click();
      await page.getByRole('region', { name: '스모크 전술 지도', exact: true }).getByText(/개 가이드 · 수비/).waitFor();
      await check('smokes-defense');
      await page.goto('http://localhost:3000/admin/preview');
      await page.getByPlaceholder('DEMO1234').fill('DEMO1234');
      await page.getByRole('button', { name: '예시 화면 들어가기', exact: true }).click();
      const list = page.getByRole('region', { name: '라인업 목록', exact: true });
      await list.waitFor();
      await page.getByRole('textbox', { name: '자료 검색', exact: true }).fill('벽 튕김');
      await page.getByRole('button', { name: '예시 · 소바 벽 튕김 공략 편집', exact: true }).click();
      await page.getByRole('button', { name: '2번 벽 튕김 이동', exact: true }).waitFor();
      assert.equal(await page.getByRole('button', { name: '도착 위치', exact: true }).isDisabled(), true);
      await check('admin-editor');
      await page.getByRole('textbox', { name: '공략 제목 *', exact: true }).fill('예시 · 소바 벽 튕김 공략 회귀 확인');
      await page.getByRole('button', { name: '예시 목록에 저장', exact: true }).click();
      await page.getByRole('button', { name: '목록으로', exact: true }).click();
      await page.getByRole('button', { name: '예시 · 소바 벽 튕김 공략 회귀 확인 편집', exact: true }).waitFor();
      assert.equal(await page.getByRole('textbox', { name: '자료 검색', exact: true }).inputValue(), '벽 튕김');
      await page.getByRole('navigation', { name: '관리자 메뉴', exact: true }).getByRole('button', { name: '스모크 관리', exact: true }).click();
      await page.getByRole('region', { name: '스모크 목록', exact: true }).waitFor();
      await check('admin-smokes');
      await page.getByRole('navigation', { name: '관리자 메뉴', exact: true }).getByRole('button', { name: '라인업 관리', exact: true }).click();
      assert.equal(await page.getByRole('textbox', { name: '자료 검색', exact: true }).inputValue(), '벽 튕김');
      await check('admin-lineups');
      assert.deepEqual(writes, [], 'unexpected network write');
      results.push({ width, checks: ['home navigation', 'overview/insights rendering', 'smoke guide and defense filter', 'admin example admission', 'shared destination locked', 'bounce point remains', 'edit/save/list', 'per-kind search persistence'], writes });
      await context.close();
    }
    fs.writeFileSync(path.join(__dirname, 'regression.json'), JSON.stringify(results, null, 2));
    console.log('regression: PASS 1440/390px, 16 screenshots, no page errors/overflow/network writes');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
