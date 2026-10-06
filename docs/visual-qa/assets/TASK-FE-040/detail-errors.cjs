/** Focused read-only detail regression. All API responses are intercepted; no DB access is needed. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE);
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const mode = process.argv[2] || 'after';
const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
const out = process.env.OUTPUT_DIR ? path.resolve(process.env.OUTPUT_DIR) : __dirname;
const results = [];
const errors = [];
const writes = [];
const firstUrl = 'https://example.com/qa-first-skill';
const secondUrl = 'https://example.com/qa-second-skill';
function fixture(id = 'qa-legacy-null', second = null) {
  const secondSkill = { abilityId: 'sova-shock-bolt', position: { x: .75, y: .65 }, order: 1 };
  if (second !== undefined) secondSkill.youtubeUrl = second;
  return { id, title: '자료 선택 오류 검증', description: '브라우저 응답으로만 제공하는 구형 다중 스킬 검증 자료입니다.', mapId: 'ascent', side: 'ATTACK', agentId: 'sova', difficulty: 'MEDIUM', skillMarkers: [{ abilityId: 'sova-recon-bolt', position: { x: .7, y: .3 }, youtubeUrl: firstUrl, order: 0 }, secondSkill], agentMarkers: [{ position: { x: .3, y: .8 } }], pathPoints: [], registration: null, status: 'PUBLISHED', authorId: 'synthetic-qa', createdAt: '', updatedAt: '' };
}
function record(name, details = {}) { results.push({ name, status: 'PASS', ...details }); console.log(`PASS ${name}`); }
async function checkPage(page) {
  await page.evaluate(async () => { await Promise.all(Array.from(document.images, image => { image.loading = 'eager'; return image.decode().catch(() => undefined); })); });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  assert.deepEqual(await page.locator('img').evaluateAll(images => images.filter(image => !image.naturalWidth).map(image => image.getAttribute('src'))), []);
}
async function capture(page, width, state, locator) {
  await checkPage(page);
  await locator.screenshot({ path: path.join(out, `detail-errors-${mode}-${width}-${state}.png`) });
}
async function scenario(browser, width) {
  const context = await browser.newContext({ viewport: { width, height: 1000 }, isMobile: width === 390, hasTouch: width === 390 });
  const state = { kind: 'error', status: 500, data: null };
  await context.route('**/__qa__/detail-errors-registration.svg', route => route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="200"><rect width="360" height="200" fill="#10202c"/><text x="30" y="100" fill="#d8c879" font-size="24">Registration media QA</text></svg>' }));
  await context.route('**/api/**', route => {
    const request = route.request();
    if (request.method() !== 'GET') { writes.push({ method: request.method(), path: new URL(request.url()).pathname }); return route.abort(); }
    if (state.kind === 'offline') return route.abort('connectionfailed');
    return route.fulfill({ status: state.kind === 'data' ? 200 : state.status, contentType: 'application/json', body: JSON.stringify(state.kind === 'data' ? state.data : {}) });
  });
  const page = await context.newPage(); page.setDefaultTimeout(15000);
  page.on('pageerror', error => errors.push({ width, error: error.message }));
  const open = async id => page.goto(`${frontend}/lineups/${id}`);
  return { context, page, state, open };
}
async function before(browser) {
  for (const width of [1440, 390]) {
    const { context, page, state, open } = await scenario(browser, width);
    await open('qa-error-500');
    const alert = page.locator('.lineup-detail-state-error'); await alert.waitFor();
    assert.ok((await alert.innerText()).includes('라인업을 찾을 수 없습니다.'));
    await capture(page, width, 'server-error', alert);
    record(`${width}px before server500 incorrectly shows missing-data message`, { text: await alert.innerText() });
    state.kind = 'data'; state.data = fixture(); await open(state.data.id);
    await page.getByRole('heading', { name: state.data.title, exact: true }).waitFor();
    await page.locator('.lineup-skill-marker').nth(1).click();
    assert.equal(await page.locator('.lineup-skill-marker').nth(1).getAttribute('aria-pressed'), 'true');
    const original = page.getByRole('link', { name: '원본 자료 새 탭에서 보기 ↗' });
    assert.equal(await original.getAttribute('href'), firstUrl);
    await capture(page, width, 'missing-second-media', page.locator('.lineup-video-panel'));
    record(`${width}px before empty second skill incorrectly borrows first media`, { selectedSkill: 2, displayedUrl: await original.getAttribute('href') });
    await context.close();
  }
}
async function after(browser) {
  for (const width of [1440, 390]) {
    const { context, page, state, open } = await scenario(browser, width);
    for (const item of [
      { id: 'qa-not-found', kind: 'error', status: 404, text: '자료가 없거나 더 이상 공개되어 있지 않습니다.' },
      { id: 'qa-server-error', kind: 'error', status: 500, text: '서버에서 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.' },
      { id: 'qa-offline', kind: 'offline', status: 0, text: '서버에 연결하지 못했습니다. 연결을 확인한 뒤 다시 시도해 주세요.' },
    ]) {
      state.kind = item.kind; state.status = item.status; await open(item.id);
      const alert = page.locator('.lineup-detail-state-error'); await alert.getByText(item.text, { exact: true }).waitFor();
      assert.equal(await alert.getByText('라인업을 찾을 수 없습니다.', { exact: true }).count(), 0);
      if (item.status === 500) await capture(page, width, 'server-error', alert); else await checkPage(page);
      record(`${width}px ${item.kind === 'offline' ? 'offline' : item.status} preserves the matching failure message`, { text: item.text });
    }
    for (const errorKind of ['404', 'offline']) {
      state.kind = errorKind === 'offline' ? 'offline' : 'error'; state.status = 404;
      await open('example-ascent-sova-a-recon-origin-2');
      await page.getByRole('heading', { name: '예시 · 다른 출발점에서 A 도착점으로 ②', exact: true }).waitFor();
      await page.getByText('이 예시에는 실제 영상이 연결되어 있지 않습니다.', { exact: true }).waitFor();
      assert.equal(await page.locator('.lineup-detail-state-error').count(), 0);
      await checkPage(page); record(`${width}px demo fallback survives ${errorKind}`);
    }
    state.kind = 'data';
    for (const missing of ['null', 'undefined', 'empty']) {
      state.data = fixture(`qa-legacy-${missing}`, missing === 'empty' ? '' : null);
      if (missing === 'undefined') delete state.data.skillMarkers[1].youtubeUrl;
      await open(state.data.id); await page.getByRole('heading', { name: state.data.title, exact: true }).waitFor();
      const original = page.getByRole('link', { name: '원본 자료 새 탭에서 보기 ↗' });
      assert.equal(await original.getAttribute('href'), firstUrl);
      await page.locator('.lineup-skill-marker').nth(1).click();
      assert.equal(await page.locator('.lineup-skill-marker').nth(1).getAttribute('aria-pressed'), 'true');
      await page.getByText('선택한 스킬에는 등록된 영상이 없습니다.', { exact: true }).waitFor();
      assert.equal(await original.count(), 0);
      assert.equal(await page.locator('.lineup-video-panel iframe, .lineup-video-panel video, .lineup-video-panel img').count(), 0);
      if (missing === 'null') await capture(page, width, 'missing-second-media', page.locator('.lineup-video-panel'));
      await page.locator('.lineup-skill-marker').first().click(); await original.waitFor();
      assert.equal(await original.getAttribute('href'), firstUrl);
      assert.equal(await page.getByText('선택한 스킬에는 등록된 영상이 없습니다.', { exact: true }).count(), 0);
      await checkPage(page); record(`${width}px legacy second URL ${missing} stays empty; selecting first restores only first media`);
    }
    state.data = fixture('qa-legacy-two-urls', secondUrl); await open(state.data.id);
    await page.getByRole('heading', { name: state.data.title, exact: true }).waitFor();
    const original = page.getByRole('link', { name: '원본 자료 새 탭에서 보기 ↗' });
    assert.equal(await original.getAttribute('href'), firstUrl);
    await page.locator('.lineup-skill-marker').nth(1).click(); assert.equal(await original.getAttribute('href'), secondUrl);
    await page.locator('.lineup-skill-marker').first().click(); assert.equal(await original.getAttribute('href'), firstUrl);
    await checkPage(page); record(`${width}px legacy first and second URLs remain separately selectable`);
    for (const mediaType of ['VIDEO', 'IMAGE']) {
      const url = mediaType === 'IMAGE' ? `${frontend}/__qa__/detail-errors-registration.svg` : 'https://example.com/qa-registration-video';
      state.data = fixture(`qa-registration-${mediaType.toLowerCase()}`);
      state.data.skillMarkers = [{ ...state.data.skillMarkers[0], youtubeUrl: mediaType === 'IMAGE' ? null : url }];
      state.data.registration = { destination: { id: 'qa-registration-destination', name: '등록 자료 검증 도착점', point: state.data.skillMarkers[0].position }, media: { type: mediaType, url }, site: 'A', abilitySlot: 'E' };
      await open(state.data.id); await page.getByRole('heading', { name: state.data.title, exact: true }).waitFor();
      assert.equal(await original.getAttribute('href'), url);
      if (mediaType === 'IMAGE') { await page.getByAltText('라인업 위치와 사용 방법 안내 이미지').scrollIntoViewIfNeeded(); await page.waitForFunction(() => document.querySelector('.lineup-video-panel img')?.naturalWidth > 0); }
      else await page.getByText('이 영상은 원본 사이트에서 확인할 수 있습니다.', { exact: true }).waitFor();
      await checkPage(page);
    }
    record(`${width}px registered VIDEO and IMAGE media still render their own source`);
    state.data = fixture('qa-zero-skill-markers'); state.data.skillMarkers = [];
    await open(state.data.id); await page.getByRole('heading', { name: state.data.title, exact: true }).waitFor();
    await page.getByText('이 공략에는 표시할 수 있는 자료가 없습니다.', { exact: true }).waitFor();
    assert.equal(await page.locator('.lineup-skill-marker').count(), 0);
    await checkPage(page); record(`${width}px zero-marker record retains generic empty guidance`);
    await context.close();
  }
  record('zero page exceptions, broken images, horizontal overflow or API writes');
}
(async () => {
  assert.match(frontend, /^http:\/\/(localhost|127\.0\.0\.1):\d+$/u);
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  try { if (mode === 'before') await before(browser); else await after(browser); assert.deepEqual(errors, []); assert.deepEqual(writes, []); }
  finally { await browser.close(); fs.writeFileSync(path.join(out, `detail-errors-${mode}-results.json`), JSON.stringify({ checks: results, pageErrors: errors, blockedWrites: writes }, null, 2)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
