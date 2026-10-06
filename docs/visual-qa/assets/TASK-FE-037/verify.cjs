const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const phase = process.argv[2];
assert.ok(['before', 'after'].includes(phase));
const result = { phase, screens: [], checks: [], errors: [], apiRequests: [] };
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:3000';
async function capture(page, name, fullPage = true) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    window.scrollTo({ top: 0, behavior: 'instant' });
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
  });
  const file = `${phase}-${name}.png`;
  await page.screenshot({ path: `${__dirname}/${file}`, fullPage, animations: 'disabled' });
  result.screens.push(file);
}
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      await page.addInitScript(() => localStorage.setItem('gameprobe:locale', 'ko'));
      page.on('pageerror', e => result.errors.push(e.message));
      if (phase === 'after') page.on('console', m => { if (m.type() === 'error') result.errors.push(m.text()); });
      page.on('request', r => { if (r.url().includes('/api/')) result.apiRequests.push({ url: r.url(), method: r.method() }); });
      await page.goto(base + '/admin');
      await page.getByRole('heading', { name: '관리자 인증', exact: true }).waitFor();
      await capture(page, `${width}-admin`);
      await page.goto(base + '/admin/preview');
      if (phase === 'before') {
        await capture(page, `${width}-preview-missing`);
      } else {
        await page.getByRole('heading', { name: '관리자 화면 체험', exact: true }).waitFor();
        await capture(page, `${width}-entry-code`);
        await page.getByLabel('예시 입장 코드', { exact: true }).fill('WRONG');
        await page.getByRole('button', { name: '예시 화면 들어가기' }).click();
        await page.getByText('예시 코드 DEMO1234를 입력해 주세요.', { exact: true }).waitFor();
        assert.equal(await page.getByRole('heading', { name: '전술 자료 관리', exact: true }).count(), 0);
        await page.getByLabel('예시 입장 코드', { exact: true }).fill('DEMO1234');
        await page.getByRole('button', { name: '예시 화면 들어가기' }).click();
        await page.getByRole('heading', { name: '전술 자료 관리', exact: true }).waitFor();
        const list = page.getByRole('complementary', { name: '예시 자료 목록' });
        const map = page.locator('[class*="mapCanvas"][role="button"]');
        const save = page.getByRole('button', { name: '예시 목록에 저장', exact: true });
        const pins = () => page.locator('[data-pin]');
        const point = async (x, y) => {
          await map.scrollIntoViewIfNeeded();
          const box = await map.boundingBox();
          assert.ok(Math.abs(box.width - box.height) < 1, 'map must be square, without letterboxing');
          await map.click({ position: { x: box.width * x, y: box.height * y } });
        };
        await page.waitForFunction(() => [...document.images].filter(i => i.closest('[class*="mapCanvas"]')).every(i => i.complete && i.naturalWidth > 0));
        await capture(page, `${width}-editor`);
        assert.equal(await pins().count(), 3);
        await page.getByRole('button', { name: '미리보기', exact: true }).click();
        await page.getByRole('region', { name: '자료 미리보기' }).waitFor();
        assert.equal(await page.locator('a[href="https://example.com/lineup-video"]').count(), 1);
        await capture(page, `${width}-preview`);
        await page.getByRole('button', { name: '편집으로 돌아가기' }).click();
        await page.getByRole('button', { name: /새 자료/ }).click();
        await save.click();
        await page.locator('[class*="errorBox"][role="alert"]').waitFor();
        assert.match(await page.locator('[class*="errorBox"][role="alert"]').innerText(), /자료 제목/);
        assert.match(await page.locator('[class*="errorBox"][role="alert"]').innerText(), /시작 위치/);
        await page.getByLabel('제목 *', { exact: true }).fill('QA · 신규 라인업');
        await page.getByLabel('자료 주소 *', { exact: true }).fill('javascript:alert(1)');
        await save.click();
        assert.match(await page.locator('[class*="errorBox"][role="alert"]').innerText(), /http/);
        await page.getByRole('button', { name: '미리보기', exact: true }).click();
        assert.equal(await page.locator('a[href^="javascript:"]').count(), 0);
        await page.getByRole('button', { name: '편집으로 돌아가기' }).click();
        await page.getByLabel('자료 주소 *', { exact: true }).fill('https://example.com/qa-video');
        await point(.25, .75); // start then auto-target
        await point(.6, .3);
        assert.equal(await pins().count(), 2);
        const startLeft = await page.locator('[data-pin="시작"]').evaluate(el => parseFloat(el.style.left));
        assert.ok(Math.abs(startLeft - 25) < 1);
        await page.getByRole('button', { name: '경유점', exact: true }).click();
        await point(.4, .6);
        await page.getByRole('button', { name: '벽 튕김', exact: true }).click();
        await point(.7, .55); await point(.5, .4);
        assert.equal(await page.locator('[data-route-point="bounce"]').count(), 2);
        assert.equal(await page.locator('[data-route-point="waypoint"]').count(), 1);
        const trajectory = page.locator('[data-route="trajectory"]');
        const routeBefore = await trajectory.getAttribute('points');
        const expected = [[250,750],[400,600],[700,550],[500,400],[600,300]];
        routeBefore.split(' ').forEach((pair, i) => pair.split(',').forEach((value, axis) => assert.ok(Math.abs(Number(value)-expected[i][axis])<4)));
        assert.equal(routeBefore.split(' ').length, 5);
        await capture(page, `${width}-bent-route-editor`);
        await page.getByRole('button', { name: '미리보기', exact: true }).click();
        assert.equal(await trajectory.getAttribute('points'), routeBefore);
        assert.equal(await page.locator('[data-route-point="bounce"]').count(), 2);
        await capture(page, `${width}-bent-route-preview`);
        await page.getByRole('button', { name: '편집으로 돌아가기' }).click();
        assert.match(await page.locator('[class*="mapFooter"]').innerText(), /중간 지점 3 \/ 30/);
        await page.getByRole('button', { name: '마지막 지점 취소' }).click();
        assert.match(await page.locator('[class*="mapFooter"]').innerText(), /중간 지점 2 \/ 30/);
        await save.click();
        assert.match(await page.getByRole('status').innerText(), /예시 목록에 반영/);
        assert.equal(await list.getByRole('button', { name: /QA · 신규 라인업/ }).count(), 1);
        await page.getByLabel('제목 *', { exact: true }).fill('QA · 수정된 라인업');
        await save.click();
        assert.equal(await list.getByRole('button', { name: /QA · 수정된 라인업/ }).count(), 1);
        assert.equal(await list.getByRole('button', { name: /QA · 신규 라인업/ }).count(), 0);
        // Saved mixed route keeps its order and point types when another entry is opened.
        const savedRoute = await trajectory.getAttribute('points');
        await list.getByRole('button', { name: /소바 라인업 등록/ }).click();
        await list.getByRole('button', { name: /QA · 수정된 라인업/ }).click();
        assert.equal(await trajectory.getAttribute('points'), savedRoute);
        assert.equal(await page.locator('[data-route-point="bounce"]').count(), 1);
        await page.getByLabel('자료 검색', { exact: true }).fill('없는 자료');
        await list.getByText('조건에 맞는 예시 자료가 없습니다.').waitFor();
        await page.getByLabel('자료 검색', { exact: true }).fill('');
        await page.getByLabel('목록 상태 필터').selectOption('review');
        assert.equal(await list.getByRole('button', { name: /QA · 수정된 라인업/ }).count(), 0);
        await page.getByLabel('목록 상태 필터').selectOption('all');
        await list.getByRole('button', { name: /^스모크/ }).click();
        await list.getByRole('button', { name: /하버 벽형/ }).click();
        assert.equal(await pins().count(), 3);
        await capture(page, `${width}-smoke-wall`);
        await page.getByLabel('맵', { exact: true }).selectOption('bind');
        assert.equal(await pins().count(), 0);
        await save.click();
        assert.match(await page.locator('[class*="errorBox"][role="alert"]').innerText(), /벽 끝 위치/);
        // Keyboard coordinate placement: use original map direction at 51%,50%.
        await map.focus(); await map.press('ArrowRight'); await map.press('Enter');
        const left = await page.locator('[data-pin="시작"]').evaluate(el => parseFloat(el.style.left));
        assert.ok(Math.abs(left - 51) < .1);
        await point(.4, .4);
        await page.getByRole('button', { name: '벽 끝', exact: true }).click();
        await point(.7, .4); await save.click();
        assert.equal(await pins().count(), 3);
        await page.getByLabel('스모크 형태').selectOption('circle');
        assert.equal(await page.locator('[data-pin="벽 끝"]').count(), 0);
        // Do not silently discard unsaved input when switching to another kind.
        page.once('dialog', d => d.dismiss());
        await list.getByRole('button', { name: /^라인업/ }).click();
        assert.equal(await page.getByLabel('스모크 형태').count(), 1);
        page.once('dialog', d => d.accept());
        await list.getByRole('button', { name: /^라인업/ }).click();
        await page.reload();
        await page.getByRole('heading', { name: '관리자 화면 체험', exact: true }).waitFor();
        await page.getByLabel('예시 입장 코드', { exact: true }).fill('DEMO1234');
        await page.getByRole('button', { name: '예시 화면 들어가기' }).click();
        await page.getByRole('heading', { name: '전술 자료 관리', exact: true }).waitFor();
        await page.getByLabel('자료 검색', { exact: true }).fill('QA ·');
        await list.getByText('조건에 맞는 예시 자료가 없습니다.').waitFor();
        assert.equal(await page.evaluate(() => sessionStorage.getItem('lineup-admin-token')), null);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        result.checks.push({ width, exampleCode: 'PASS', mixedBounceRoute: 'PASS', routePreviewAndSave: 'PASS', createEdit: 'PASS', filters: 'PASS', url: 'PASS', positions: 'PASS', mapReset: 'PASS', wall: 'PASS', keyboard: 'PASS', discard: 'PASS', reloadReset: 'PASS' });
      }
      await page.close();
    }
    const reference = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await reference.addInitScript(() => localStorage.setItem('gameprobe:locale', 'ko'));
    for (const [name, route] of [['home','/'], ['insights','/insights'], ['lineups','/lineups'], ['smokes','/smokes']]) {
      await reference.goto(base + route);
      await reference.evaluate(() => document.fonts.ready);
      await reference.waitForFunction(() => [...document.images].filter(i => {
        const r = i.getBoundingClientRect();
        return r.width && r.height && r.bottom > 0 && r.top < innerHeight;
      }).every(i => i.complete));
      await capture(reference, `1440-${name}`, false);
    }
    await reference.close();
    assert.deepEqual(result.errors, []);
    assert.deepEqual(result.apiRequests, []);
  } finally {
    await browser.close();
    fs.writeFileSync(`${__dirname}/${phase}.json`, JSON.stringify(result, null, 2) + '\n');
  }
  console.log(JSON.stringify(result));
})().catch(error => { console.error(error); process.exitCode = 1; });
