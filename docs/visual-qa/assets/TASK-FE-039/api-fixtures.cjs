// 임시 빌드 서버의 로컬 API 응답만 대체한다. 운영 API/DB에 요청하거나 자료를 쓰지 않는다.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE);
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.QA_BASE || 'http://localhost:3101';
const a = { x: .2, y: .7 }, b = { x: .7, y: .3 };
function fixture(id, overrides = {}) {
  return { id, title: `검증 ${id}`, description: '브라우저 검증 전용', mapId: 'ascent', side: 'ATTACK', agentId: 'sova', difficulty: 'EASY', skillMarkers: [{ abilityId: 'sova-recon-bolt', position: b }], agentMarkers: [{ position: a }], pathPoints: [], status: 'PUBLISHED', authorId: 'qa-only', ...overrides };
}
const fixtures = [fixture('no-route'), fixture('recorded-route', { pathPoints: [{ x: .1, y: .1 }, { x: .4, y: .8 }] }), fixture('no-origin', { agentMarkers: [], skillMarkers: [{ abilityId: 'sova-recon-bolt', position: { x: .4, y: .4 } }] }), fixture('no-target', { skillMarkers: [] })];
(async () => {
  const browser = await chromium.launch();
  const results = [];
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    const shot = async name => {
      // Full-page capture includes off-screen lazy images: request them and wait for decode first.
      await page.locator('img').evaluateAll(async images => {
        images.forEach(img => { img.loading = 'eager'; });
        await Promise.all(images.map(img => img.decode()));
      });
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: path.join(__dirname, `api-${width}-${name}.png`), fullPage: true });
    };
    const errors = [];
    const requests = [];
    page.on('pageerror', e => errors.push(e.message));
    let scenario = fixtures;
    await page.route('**/test-api/api/lineups**', async route => {
      requests.push({ url: route.request().url(), method: route.request().method() });
      const id = new URL(route.request().url()).pathname.split('/api/lineups/')[1];
      const body = id ? fixtures.find(x => x.id === id) : scenario;
      await route.fulfill({ status: body ? 200 : 404, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(body || {}) });
    });
    await page.goto(`${base}/lineups`);
    await page.getByText('공개 승인된 라인업을 보고 있어요.', { exact: false }).waitFor();
    await page.getByRole('button', { name: 'Ascent', exact: true }).click();
    await page.getByRole('button', { name: 'Sova', exact: true }).click();
    assert.equal(await page.getByRole('button', { name: / · 공략 1개$/ }).count(), 3, 'same coordinates/ability must remain independent without destination ID');
    const missingTarget = page.getByRole('region', { name: '지도 위치 없는 공략' });
    assert.equal(await missingTarget.getByRole('link').count(), 1);
    assert.equal(await missingTarget.getByRole('link').getAttribute('href'), '/lineups/no-target');
    await page.getByRole('button', { name: '검증 no-route 1개', exact: true }).click();
    assert.equal(await page.locator('[data-lineup-id]').count(), 0, 'no invented direct path');
    await page.getByRole('region', { name: '선택한 도착점의 공략' }).getByText('· 경로 미등록', { exact: false }).waitFor();
    await page.getByRole('button', { name: '검증 recorded-route 1개', exact: true }).click();
    assert.equal(await page.locator('[data-lineup-id]').getAttribute('points'), '90,10 19.999999999999996,40');
    await page.getByRole('button', { name: '검증 no-origin · 공략 1개', exact: true }).click();
    assert.equal(await page.getByRole('link', { name: '검증 no-origin 상세 자료 보기', exact: true }).count(), 0);
    const guides = page.getByRole('region', { name: '선택한 도착점의 공략' });
    assert.equal(await guides.getByRole('link').getAttribute('href'), '/lineups/no-origin');
    await page.getByText('출발 위치가 아직 없어요.', { exact: false }).waitFor();
    await shot('missing-positions');
    await missingTarget.getByRole('link').click();
    await page.getByRole('heading', { name: '검증 no-target', exact: true }).waitFor();
    assert.equal(await page.locator('.lineup-skill-marker').count(), 0);
    assert.equal(await page.locator('.lineup-path-overlay polyline').count(), 0);
    scenario = [];
    await page.goto(`${base}/lineups`);
    await page.getByText('공개된 라인업이 없어요', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Ascent', exact: true }).click();
    await page.getByRole('button', { name: 'Sova', exact: true }).click();
    assert.equal(await page.getByRole('button', { name: / · 공략 \d개$/ }).count(), 0);
    assert.equal(await page.locator('[data-lineup-id]').count(), 0);
    await shot('empty');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.deepEqual(errors, []);
    assert.ok(requests.length >= 3);
    assert.ok(requests.every(r => r.method === 'GET'));
    results.push({ width, checks: ['no implicit grouping', 'empty path unchanged', 'recorded path unchanged', 'missing origin guide accessible', 'missing target guide accessible', 'detail identity', 'successful empty API response', 'no overflow/errors'], requests });
    await page.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'api-fixtures.json'), JSON.stringify(results, null, 2));
  console.log('API fixture UI: PASS 1440/390');
})().catch(e => { console.error(e); process.exit(1); });
