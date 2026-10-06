const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const { fixture } = require('./capture.cjs');
const app = 'http://localhost:3000';
const token = 'isolated-qa-token-not-a-credential';
const report = { checks: [], requests: [], pageErrors: [], screenshots: [], externalBlocked: 0 };
function check(condition, name) { assert.ok(condition, name); report.checks.push(name); }
async function ready(page, selector) { await page.locator(selector).first().waitFor(); }
async function snapshot(page, name) {
  await page.evaluate(() => Promise.all([...document.images].map(i => i.decode().catch(() => {}))));
  await page.evaluate(() => { window.scrollTo(0, 0); return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
  const file = `after-admin-${name}.png`;
  await page.screenshot({ path: path.join(__dirname, file), fullPage: true });
  report.screenshots.push(file);
}
async function buildContext(browser, width, authenticated = true) {
  const ctx = await browser.newContext({ viewport: { width, height: 960 }, deviceScaleFactor: 1 });
  if (authenticated) await ctx.addInitScript(t => {
    if (window === window.top && location.origin === 'http://localhost:3000') sessionStorage.setItem('lineup-admin-token', t);
  }, token);
  const state = {
    rows: ['DRAFT', 'REVIEW', 'PUBLISHED', 'REJECTED'].map((status, n) => ({ ...structuredClone(fixture), id: `qa-${status.toLowerCase()}`, title: `${n + 1} ${fixture.title}`, status })),
    mutations: [], failSave: false, failStatus: false,
  };
  // 모든 API는 브라우저 안에서 응답하고, 다른 호스트의 요청은 차단한다.
  await ctx.route('**/*', async route => {
    const req = route.request(), u = new URL(req.url()), method = req.method();
    if (u.pathname.startsWith('/api/')) {
      const body = req.postDataJSON();
      report.requests.push({ path: u.pathname, method, intercepted: true });
      if (u.pathname === '/api/admin/session') return route.fulfill(body.token === token ? { json: { role: 'ADMIN', adminId: 'qa-only' } } : { status: 401, json: {} });
      if (method !== 'GET') {
        check(req.headers()['x-admin-token'] === token, `${width}: mutation uses isolated token`);
        state.mutations.push({ path: u.pathname, method, body });
      }
      if (method === 'PATCH') {
        if (state.failStatus) return route.fulfill({ status: 503, json: {} });
        const id = u.pathname.split('/')[4];
        state.rows = state.rows.map(r => r.id === id ? { ...r, status: body.status } : r);
        return route.fulfill({ json: state.rows.find(r => r.id === id) });
      }
      if (method === 'POST' || method === 'PUT') {
        if (state.failSave) return route.fulfill({ status: 503, json: {} });
        return route.fulfill({ json: method === 'POST' ? { id: fixture.id } : { ...fixture, ...body } });
      }
      if (u.pathname === '/api/admin/lineups') return route.fulfill({ json: state.rows });
      return route.fulfill({ json: fixture });
    }
    if (u.origin !== app) { report.externalBlocked++; return route.abort(); }
    return route.continue();
  });
  const page = await ctx.newPage();
  page.on('pageerror', e => report.pageErrors.push({ width, url: page.url(), message: e.message }));
  return { ctx, page, state };
}
async function layout(page, name) {
  const result = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > innerWidth,
    mains: document.querySelectorAll('main').length,
    theme: [...document.querySelectorAll('main')].some(n => n.className.includes('theme')),
    text: [...document.querySelectorAll('.admin-review-page button,.lineup-editor-controls label,.lineup-editor-controls input,.lineup-editor-controls select,.admin-login-card button')].filter(n => n.getBoundingClientRect().height > 0).map(n => parseFloat(getComputedStyle(n).fontSize)),
  }));
  check(!result.overflow, `${name}: no document overflow`);
  check(result.mains === 1, `${name}: one main landmark`);
  check(result.theme, `${name}: shared theme`);
  check(result.text.every(size => size >= 14), `${name}: controls/body minimum 14px`);
  check(await page.getByRole('link', { name: 'Smokes', exact: true }).count() === 1, `${name}: shared Smokes menu`);
}
async function focus(page, selector, name) {
  await page.keyboard.press('Tab');
  await page.locator(selector).first().focus();
  const v = await page.locator(selector).first().evaluate(n => ({ active: document.activeElement === n, outline: getComputedStyle(n).outlineStyle, width: parseFloat(getComputedStyle(n).outlineWidth) }));
  check(v.active && v.outline !== 'none' && v.width >= 2, name);
}
async function clickPoint(page, x, y) {
  const r = await page.locator('.lineup-editor-map').boundingBox();
  await page.mouse.click(r.x + r.width * x, r.y + r.height * y);
}
function near(actual, expected, name) {
  check(Math.abs(actual.x - expected.x) < .004 && Math.abs(actual.y - expected.y) < .004, name);
}
async function run() {
  const browser = await chromium.launch({ headless: true });
  try {
    // 토큰 없는 접근, 실패 및 성공 인증 모두 실제 서버 없이 확인한다.
    {
      const { ctx, page } = await buildContext(browser, 390, false);
      for (const route of ['/admin/lineups', '/admin/lineups/new', `/admin/lineups/${fixture.id}/edit`]) {
        await page.goto(app + route); await ready(page, '.admin-access-primary-link');
        check((await page.locator('h1').innerText()).includes('인증이 필요'), `unauthenticated gate ${route}`);
        await layout(page, `gate ${route}`);
      }
      await page.goto(app + '/admin'); await ready(page, '#admin-token');
      await page.locator('#admin-token').fill('fake-invalid-token');
      await page.getByRole('button', { name: '관리자 페이지로 이동' }).click();
      await ready(page, '.admin-access-error');
      check(await page.evaluate(() => sessionStorage.getItem('lineup-admin-token')) === null, 'invalid token not stored');
      await page.locator('#admin-token').fill(token);
      await focus(page, '#admin-token', 'login field visible focus');
      await snapshot(page, '390-login-focus');
      await page.getByRole('button', { name: '관리자 페이지로 이동' }).click();
      await ready(page, '.lineup-editor-map');
      check(page.url().endsWith('/admin/lineups/new'), 'valid fake token redirects to new editor');
      check(await page.evaluate(() => sessionStorage.getItem('lineup-admin-token')) === token, 'valid fake token stored in isolated session');
      await page.getByRole('button', { name: '로그아웃' }).click();
      await ready(page, '.admin-access-primary-link');
      check(await page.evaluate(() => sessionStorage.getItem('lineup-admin-token')) === null, 'editor logout clears session');
      await ctx.close();
    }
    for (const width of [1440, 820, 390]) {
      const { ctx, page, state } = await buildContext(browser, width);
      await page.goto(app + '/admin/lineups'); await ready(page, '.admin-lineup-card');
      await layout(page, `${width} list`);
      check(await page.locator('.admin-lineup-card').count() === 4, `${width}: all status rows present`);
      for (const [label, status] of [['초안', 'draft'], ['검수 대기', 'review'], ['공개', 'published'], ['반려', 'rejected']]) {
        await page.locator('.admin-status-filter').getByRole('button', { name: new RegExp(`^${label}`) }).click();
        check(await page.locator('.admin-lineup-card').count() === 1, `${width}: ${label} filter count`);
        check(await page.locator(`.admin-status-${status}`).count() === 1, `${width}: ${label} filter value`);
      }
      await page.locator('.admin-status-filter').getByRole('button', { name: /^전체/ }).click();
      await focus(page, '.admin-status-filter button', `${width}: filter visible focus`);
      await snapshot(page, `${width}-list-focus`);
      if (width === 1440) {
        const card = page.locator('.admin-lineup-card').filter({ has: page.getByRole('heading', { name: `1 ${fixture.title}` }) });
        for (const [label, status] of [['검수 요청', 'REVIEW'], ['공개 승인', 'PUBLISHED'], ['검수로 되돌리기', 'REVIEW'], ['반려', 'REJECTED'], ['초안으로 되돌리기', 'DRAFT']]) {
          await card.getByRole('button', { name: label, exact: true }).click();
          await page.waitForFunction(s => document.querySelector('.admin-review-feedback')?.textContent.includes(s), ({ REVIEW: '검수 대기', PUBLISHED: '공개', REJECTED: '반려', DRAFT: '초안' })[status]);
          check(state.mutations.at(-1).body.status === status, `${width}: ${label} status payload`);
          check(state.rows[0].status === status, `${width}: ${label} response applied`);
        }
        state.failStatus = true;
        await card.getByRole('button', { name: '검수 요청', exact: true }).click();
        await page.getByText('상태 변경 실패 (503)').waitFor();
        check(state.rows[0].status === 'DRAFT', 'failed status request preserves state');
        state.failStatus = false;
      }
      await page.goto(app + '/admin/lineups/new'); await ready(page, '.lineup-editor-map');
      await layout(page, `${width} new editor`);
      check(await page.getByRole('button', { name: '요원 배치', exact: true }).isDisabled(), `${width}: agent placement requires skill`);
      await page.getByLabel('제목', { exact: true }).fill('  QA 새 라인업  ');
      await page.getByLabel('설명', { exact: true }).fill('  QA 좌표와 저장 확인  ');
      const before = state.mutations.length;
      await page.getByRole('button', { name: '초안으로 저장', exact: true }).click();
      await page.getByText('제목·설명과 스킬/요원 위치를 모두 입력해 주세요.').waitFor();
      check(state.mutations.length === before, `${width}: incomplete markers prevent API save`);
      await page.getByLabel('맵').and(page.locator('select')).selectOption('haven');
      await page.getByLabel('진영').and(page.locator('select')).selectOption('defense');
      await page.getByLabel('요원').and(page.locator('select')).selectOption('jett');
      check(await page.getByLabel('스킬').and(page.locator('select')).inputValue() === 'jett-cloudburst', `${width}: agent changes ability`);
      await page.getByLabel('요원').and(page.locator('select')).selectOption('sova');
      await page.getByLabel('난이도').and(page.locator('select')).selectOption('hard');
      await page.locator('.lineup-editor-map').scrollIntoViewIfNeeded();
      await clickPoint(page, .35, .42);
      await page.getByLabel('스킬').and(page.locator('select')).selectOption('sova-recon-bolt');
      await page.getByLabel('YouTube URL', { exact: true }).fill('https://youtu.be/fe030saved1');
      await page.locator('.lineup-editor-map').scrollIntoViewIfNeeded();
      await clickPoint(page, .72, .2);
      check(await page.locator('.lineup-editor-skill-marker').count() === 2, `${width}: skill marker creation`);
      await page.getByRole('button', { name: '선택한 스킬 마커 삭제' }).click();
      check(await page.locator('.lineup-editor-skill-marker').count() === 1, `${width}: selected skill deletion`);
      await page.getByRole('button', { name: '요원 배치', exact: true }).click();
      await page.locator('.lineup-editor-map').scrollIntoViewIfNeeded();
      await clickPoint(page, .6, .64); await clickPoint(page, .8, .72);
      await page.getByRole('button', { name: '요원 위치 2 삭제' }).click();
      check(await page.locator('.lineup-editor-agent-marker').count() === 1, `${width}: agent add/remove`);
      await page.getByRole('button', { name: '경로 그리기', exact: true }).click();
      await page.locator('.lineup-editor-map').scrollIntoViewIfNeeded();
      await clickPoint(page, .25, .3); await clickPoint(page, .56, .48);
      check(await page.locator('.lineup-path-point').count() === 2, `${width}: path points create`);
      await page.getByRole('button', { name: '경로 초기화' }).click();
      check(await page.locator('.lineup-path-point').count() === 0, `${width}: path reset`);
      await page.locator('.lineup-editor-map').scrollIntoViewIfNeeded();
      await clickPoint(page, .25, .3); await clickPoint(page, .56, .48);
      await focus(page, '.lineup-editor-skill-marker', `${width}: skill marker visible focus`);
      await focus(page, '.lineup-editor-agent-marker', `${width}: agent marker visible focus`);
      await focus(page, '.lineup-editor-panel textarea', `${width}: textarea visible focus`);
      await page.getByLabel('차징 단계').and(page.locator('select')).selectOption('3');
      await page.getByLabel('튕김 횟수').and(page.locator('select')).selectOption('2');
      await snapshot(page, `${width}-new-editor`);
      state.failSave = true;
      await page.getByRole('button', { name: '초안으로 저장', exact: true }).click();
      await page.getByText('라인업 저장 실패 (503)').waitFor();
      check(await page.getByRole('button', { name: '초안으로 저장', exact: true }).isEnabled(), `${width}: save error re-enables submit`);
      state.failSave = false;
      await page.getByRole('button', { name: '초안으로 저장', exact: true }).click();
      await page.waitForURL(app + '/lineups/' + fixture.id);
      const created = state.mutations.at(-1);
      check(created.method === 'POST' && created.path === '/api/admin/lineups', `${width}: create endpoint/method`);
      check(created.body.title === 'QA 새 라인업' && created.body.description === 'QA 좌표와 저장 확인', `${width}: trimmed title/description`);
      check(created.body.mapId === 'haven' && created.body.side === 'DEFENSE' && created.body.agentId === 'sova' && created.body.difficulty === 'HARD' && created.body.status === 'DRAFT', `${width}: selected values and draft status`);
      check(created.body.skillMarkers.length === 1 && created.body.agentMarkers.length === 1, `${width}: final marker counts`);
      check(created.body.skillMarkers[0].abilityId === 'sova-recon-bolt' && created.body.skillMarkers[0].youtubeUrl === 'https://youtu.be/fe030saved1', `${width}: selected skill metadata`);
      near(created.body.skillMarkers[0].position, { x: .35, y: .42 }, `${width}: normalized skill point`);
      near(created.body.agentMarkers[0].position, { x: .6, y: .64 }, `${width}: normalized agent point`);
      near(created.body.pathPoints[0], { x: .25, y: .3 }, `${width}: normalized path start`);
      near(created.body.pathPoints[1], { x: .56, y: .48 }, `${width}: normalized path end`);
      check(created.body.sovaSettings.chargeLevel === 3 && created.body.sovaSettings.bounceCount === 2, `${width}: sova settings`);
      await page.goto(app + `/admin/lineups/${fixture.id}/edit`); await ready(page, '.lineup-editor-skill-marker');
      await layout(page, `${width} edit`);
      check(await page.getByLabel('제목', { exact: true }).inputValue() === fixture.title, `${width}: edit loads title`);
      const positions = await page.locator('.lineup-editor-skill-marker').evaluateAll(nodes => nodes.map(n => ({ left: n.style.left, top: n.style.top })));
      check(positions[0].left === '72%' && positions[0].top === '42%', `${width}: edit loaded marker coordinates`);
      await page.getByLabel('제목', { exact: true }).fill('QA 수정 제목');
      await page.getByRole('button', { name: '수정 내용 저장', exact: true }).click();
      await page.waitForURL(app + '/admin/lineups');
      const updated = state.mutations.at(-1);
      check(updated.method === 'PUT' && updated.path === `/api/admin/lineups/${fixture.id}`, `${width}: update endpoint/method`);
      check(updated.body.title === 'QA 수정 제목' && updated.body.status === 'REVIEW', `${width}: edit keeps review status`);
      assert.deepEqual(updated.body.skillMarkers, fixture.skillMarkers); report.checks.push(`${width}: edit preserves skill markers`);
      assert.deepEqual(updated.body.agentMarkers, fixture.agentMarkers); report.checks.push(`${width}: edit preserves agent markers`);
      assert.deepEqual(updated.body.pathPoints, fixture.pathPoints); report.checks.push(`${width}: edit preserves path points`);
      await ready(page, '.admin-lineup-card');
      await page.getByRole('button', { name: '로그아웃' }).click();
      await ready(page, '.admin-access-primary-link');
      check(await page.evaluate(() => sessionStorage.getItem('lineup-admin-token')) === null, `${width}: list logout clears session`);
      await ctx.close();
    }
    check(report.pageErrors.length === 0, 'no browser/hydration errors across admin routes');
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(__dirname, 'admin-results.json'), JSON.stringify(report, null, 2));
  }
  console.log(`Admin QA PASS: ${report.checks.length} checks, ${report.requests.length} intercepted API requests, ${report.pageErrors.length} page errors`);
}
run().catch(error => { console.error(error); process.exitCode = 1; });
