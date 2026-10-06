/** TASK-FE-040 disposable-environment integration QA. Never point this at production. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const backend = process.env.BACKEND_URL || 'http://localhost:18080';
const frontend = process.env.FRONTEND_URL || 'http://localhost:3101';
const token = process.env.QA_ADMIN_TOKEN || 'fe040-disposable-test-token';
const mode = process.argv[2] || 'all';
const out = __dirname;
const results = [];
const createdIds = new Set();
const destination = { id: 'fe040-qa-ascent-a', name: '통합 검증 A 도착점', point: { x: 0.72, y: 0.28 } };
function fixture(overrides = {}) {
  return {
    title: 'TASK-FE-040 통합 검증', description: '폐기 가능한 로컬 DB의 합성 검증 자료',
    mapId: 'ascent', side: 'ATTACK', agentId: 'sova', difficulty: 'MEDIUM', status: 'DRAFT',
    skillMarkers: [{ abilityId: 'sova-recon-bolt', position: destination.point, order: 0 }],
    agentMarkers: [{ position: { x: 0.31, y: 0.8 }, label: '출발' }], pathPoints: [],
    registration: { destination, media: { type: 'IMAGE', url: `${frontend}/__qa__/lineup.svg` }, site: 'A', abilitySlot: 'E' },
    ...overrides,
  };
}
async function request(url, method = 'GET', body, authenticated = true, expected = 200) {
  const response = await fetch(`${backend}${url}`, {
    method, headers: { Accept: 'application/json', ...(authenticated ? { 'X-Admin-Token': token } : {}), ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const content = await response.text();
  assert.equal(response.status, expected, `${method} ${url}: ${response.status} ${content}`);
  return content ? JSON.parse(content) : null;
}
async function create(payload) {
  const result = await request('/api/admin/lineups', 'POST', payload, true, 201);
  createdIds.add(result.id);
  return result;
}
function record(name, details = {}) { results.push({ name, status: 'PASS', ...details }); console.log(`PASS ${name}`); }
async function apiChecks() {
  await request('/api/admin/session', 'POST', { token: 'fe040-deliberately-invalid' }, false, 401);
  await request('/api/admin/lineups', 'GET', undefined, false, 403);
  await request('/api/admin/session', 'POST', { token }, false, 200);
  record('real API rejects invalid token and accepts isolated test token');
  for (const points of [[], [{ x: 0.5, y: 0.5 }], [{ x: 0.4, y: 0.7 }, { x: 0.6, y: 0.4 }]]) {
    const payload = fixture({ pathPoints: points });
    const saved = await create(payload);
    const fresh = await request(`/api/admin/lineups/${saved.id}`);
    assert.deepEqual(fresh.pathPoints, points);
    assert.deepEqual(fresh.registration, payload.registration);
    await request(`/api/lineups/${saved.id}`, 'GET', undefined, false, 404);
    await request(`/api/admin/lineups/${saved.id}/status`, 'PATCH', { status: 'PUBLISHED' });
    const published = await request(`/api/lineups/${saved.id}`, 'GET', undefined, false);
    assert.deepEqual(published.pathPoints, points);
    assert.deepEqual(published.registration, payload.registration);
    const updated = await request(`/api/admin/lineups/${saved.id}`, 'PUT', { ...payload, title: `${payload.title} 수정`, pathPoints: [...points].reverse(), status: 'REVIEW' });
    assert.equal(updated.status, 'REVIEW');
    assert.deepEqual(updated.pathPoints, [...points].reverse());
    assert.deepEqual(updated.registration, payload.registration);
    await request(`/api/lineups/${saved.id}`, 'GET', undefined, false, 404);
    record(`real API round trip for ${points.length} intermediate points`, { id: saved.id });
  }
  const videoPayload = fixture({ registration: { destination, media: { type: 'VIDEO', url: `${frontend}/__qa__/lineup.webm` }, site: 'A', abilitySlot: 'E' } });
  const video = await create(videoPayload);
  assert.deepEqual(video.registration, videoPayload.registration);
  record('real API VIDEO media persistence');
  const legacyPayload = fixture({ registration: null, skillMarkers: [{ abilityId: 'sova-recon-bolt', position: destination.point, order: 0 }, { abilityId: 'sova-shock-bolt', position: { x: 0.5, y: 0.5 }, order: 1 }], agentMarkers: [{ position: { x: 0.3, y: 0.8 } }, { position: { x: 0.4, y: 0.9 } }] });
  const legacy = await create(legacyPayload);
  const legacyStatus = await request(`/api/admin/lineups/${legacy.id}/status`, 'PATCH', { status: 'REVIEW' });
  assert.deepEqual(legacyStatus.skillMarkers, legacy.skillMarkers);
  assert.deepEqual(legacyStatus.agentMarkers, legacy.agentMarkers);
  record('legacy multiple markers preserved by status update');
  for (const invalid of [fixture({ description: '' }), fixture({ pathPoints: [{ y: 0.5 }] }), fixture({ pathPoints: [{ x: 1.1, y: 0.5 }] }), fixture({ registration: { ...fixture().registration, media: { type: 'IMAGE', url: 'javascript:alert(1)' } } })]) {
    await request('/api/admin/lineups', 'POST', invalid, true, 400);
  }
  record('real API rejects missing description, incomplete/out-of-range points, invalid media URL');
  const deleted = await create(fixture());
  await request(`/api/admin/lineups/${deleted.id}`, 'DELETE', undefined, true, 204);
  createdIds.delete(deleted.id);
  await request(`/api/admin/lineups/${deleted.id}`, 'GET', undefined, true, 404);
  await request(`/api/lineups/${deleted.id}`, 'GET', undefined, false, 404);
  record('real API deletion returns 204 and subsequent reads return 404');
}
async function uiChecks() {
  const { chromium } = require(process.env.PLAYWRIGHT_MODULE);
  const browser = await chromium.launch();
  const failures = [];
  async function context(width, withToken = false) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, isMobile: width === 390, hasTouch: width === 390 });
    if (withToken) await context.addInitScript(value => sessionStorage.setItem('lineup-admin-token', value), token);
    await context.route('**/__qa__/lineup.svg', route => route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="#10202c"/><text x="45" y="145" fill="#d9bc83" font-size="36">TASK-FE-040</text><text x="45" y="190" fill="#c5d0db" font-size="20">Synthetic local QA image</text></svg>' }));
    await context.route('**/__qa__/lineup.webm', route => route.fulfill({ contentType: 'video/webm', path: path.join(out, 'qa-video.webm') }));
    const page = await context.newPage();
    page.on('pageerror', error => failures.push({ width, error: error.message }));
    page.setDefaultTimeout(12000);
    return { context, page };
  }
  async function shot(page, width, name) {
    await page.evaluate(async () => {
      window.scrollTo(0, 0);
      await Promise.all(Array.from(document.images, image => { image.loading = 'eager'; return image.decode().catch(() => undefined); }));
    });
    const brokenImages = await page.locator('img').evaluateAll(images => images.filter(image => !image.complete || !image.naturalWidth).map(image => ({ src: image.getAttribute('src'), alt: image.alt })));
    assert.deepEqual(brokenImages, [], `${width} ${name} images must be decoded before capture`);
    await page.screenshot({ path: path.join(out, `after-${width}-${name}.png`), fullPage: true });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${width} ${name} horizontal overflow`);
  }
  async function fill(page, title, mediaType = 'image', mediaUrl = `${frontend}/__qa__/lineup.svg`) {
    await page.locator('#registration-title').fill(title);
    await page.locator('#registration-notes').fill('폐기 가능한 로컬 검증 자료입니다. 출발점에서 중간 지점을 거쳐 도착점으로 사용합니다.');
    await page.locator('#registration-media-type').selectOption(mediaType);
    await page.locator('#registration-url').fill(mediaUrl);
    await page.locator('#registration-ability').selectOption('sova-recon-bolt');
    await page.locator('#registration-difficulty').selectOption('hard');
  }
  async function point(page, x, y) {
    const map = page.getByRole('button', { name: '지도 위치 지정', exact: true });
    const box = await map.boundingBox();
    assert.ok(box);
    await map.click({ position: { x: box.width * x, y: box.height * y } });
  }
  async function save(page, method = 'PUT', expected = 200) {
    const responsePromise = page.waitForResponse(response => response.url().startsWith(`${backend}/api/admin/lineups`) && response.request().method() === method);
    await page.getByRole('button', { name: '저장', exact: true }).click();
    const response = await responsePromise.catch(async error => {
      console.error('SAVE DIAGNOSTIC', await page.locator('[role=alert]').allTextContents(), await page.locator('input,select,textarea').evaluateAll(elements => elements.map(element => ({id:element.id,value:element.value}))));
      await page.screenshot({ path: path.join(out, 'integration-failure.png'), fullPage: true });
      throw error;
    });
    assert.equal(response.status(), expected);
    const body = await response.json();
    if (expected >= 200 && expected < 300) {
      createdIds.add(body.id);
      await page.waitForURL(`**/admin/lineups/${body.id}/edit`);
      await page.locator('#registration-title').waitFor();
      await page.waitForFunction(() => !document.querySelector('fieldset')?.disabled);
    }
    return body;
  }
  async function publicSelection(page, name) {
    await page.goto(`${frontend}/lineups`);
    await page.getByRole('button', { name: 'Ascent', exact: true }).click();
    await page.getByRole('button', { name: 'Sova', exact: true }).click();
    await page.getByRole('button', { name: 'E', exact: true }).click();
    await page.getByRole('button', { name: `${name} · 공략 2개`, exact: true }).click();
    await page.mouse.move(0, 0);
    await page.waitForFunction(() => document.querySelectorAll('[data-lineup-id]').length === 2);
  }
  try {
    for (const width of [1440, 390]) {
      const { context: adminContext, page } = await context(width);
      await page.goto(`${frontend}/admin`);
      await page.getByRole('heading', { name: '관리자 인증', exact: true }).waitFor();
      await shot(page, width, 'login');
      await page.getByLabel('관리자 토큰', { exact: true }).fill('fe040-deliberately-invalid');
      await page.getByRole('button', { name: '관리자 페이지로 이동' }).click();
      await page.getByRole('alert').filter({ hasText: '관리자 토큰' }).waitFor();
      await page.getByLabel('관리자 토큰', { exact: true }).fill(token);
      await page.getByRole('button', { name: '관리자 페이지로 이동' }).click();
      await page.waitForURL('**/admin/lineups');
      record(`${width}px actual login rejects wrong token then accepts test token`);
      await page.getByRole('button', { name: '＋ 새 라인업 등록', exact: true }).click();
      await page.locator('#registration-title').waitFor();
      await page.getByRole('button', { name: '저장', exact: true }).click();
      await page.getByRole('alert').filter({ hasText: '아래 항목' }).waitFor();
      assert.equal((await request('/api/admin/lineups')).some(item => item.title === ''), false);
      await shot(page, width, 'validation');
      const destinationName = `통합 검증 A 도착점 ${width}`;
      const firstTitle = `이미지 공략 ${width}`;
      await page.locator('#registration-destination-name').fill(destinationName);
      await fill(page, firstTitle);
      await page.locator('#registration-status').selectOption('review');
      await point(page, 0.72, 0.28);
      await point(page, 0.31, 0.8);
      const first = await save(page, 'POST', 201);
      assert.equal(first.status, 'REVIEW'); assert.deepEqual(first.pathPoints, []);
      await page.reload(); await page.locator('#registration-title').waitFor();
      assert.equal(await page.locator('#registration-title').inputValue(), firstTitle);
      assert.equal(await page.locator('#registration-status').inputValue(), 'review');
      assert.equal(await page.locator('#registration-difficulty').inputValue(), 'hard');
      await request(`/api/lineups/${first.id}`, 'GET', undefined, false, 404);
      record(`${width}px browser creates and reloads zero-intermediate REVIEW image with persisted fields`);
      await page.getByText('중간 지점 추가 (선택)', { exact: true }).click();
      await page.getByRole('button', { name: '중간 지점', exact: true }).click();
      await point(page, 0.44, 0.66);
      const onePoint = await save(page); assert.equal(onePoint.pathPoints.length, 1);
      await page.reload(); await page.locator('#registration-title').waitFor();
      assert.equal(await page.locator('[data-route-point]').count(), 1);
      await page.getByText('중간 지점 추가 (선택)', { exact: true }).click();
      await page.getByRole('button', { name: '중간 지점', exact: true }).click();
      await point(page, 0.6, 0.4);
      await page.locator('#registration-title').fill(`${firstTitle} 수정`);
      // Exercise the real backend's 400 response through the frontend request path.
      const rejectOnce = async route => {
        if (route.request().method() !== 'PUT') return route.continue();
        const body = route.request().postDataJSON(); body.description = '';
        await route.continue({ postData: JSON.stringify(body) });
      };
      await page.route(`${backend}/api/admin/lineups/${first.id}`, rejectOnce);
      await save(page, 'PUT', 400);
      await page.unroute(`${backend}/api/admin/lineups/${first.id}`, rejectOnce);
      await page.getByRole('alert').filter({ hasText: '입력 내용을 확인' }).waitFor();
      assert.equal(await page.locator('#registration-title').inputValue(), `${firstTitle} 수정`);
      const updated = await save(page);
      assert.equal(updated.pathPoints.length, 2); assert.equal(updated.status, 'REVIEW');
      assert.deepEqual(updated.registration, first.registration);
      record(`${width}px browser edits one/multiple intermediates, preserves registration/status, recovers real API 400`);
      await shot(page, width, 'editor');
      await page.getByRole('button', { name: '미리보기', exact: true }).click();
      await page.getByRole('region', { name: '자료 미리보기', exact: true }).waitFor();
      await shot(page, width, 'editor-preview');
      await page.getByRole('button', { name: '편집으로 돌아가기', exact: true }).click();
      // Cancel unsaved navigation and retain edited input.
      await page.locator('#registration-title').fill('미저장 이탈 검증');
      const dialog = page.waitForEvent('dialog');
      const click = page.getByRole('button', { name: '← 목록으로', exact: true }).click();
      const prompt = await dialog; assert.match(prompt.message(), /저장하지 않은/); await prompt.dismiss(); await click;
      assert.equal(await page.locator('#registration-title').inputValue(), '미저장 이탈 검증');
      await page.locator('#registration-title').fill(updated.title);
      await page.getByRole('button', { name: '← 목록으로', exact: true }).click();
      const statusResponse = page.waitForResponse(response => response.url() === `${backend}/api/admin/lineups/${first.id}/status` && response.request().method() === 'PATCH');
      await page.getByLabel(`${updated.title} 공개 상태`, { exact: true }).selectOption('PUBLISHED');
      assert.equal((await statusResponse).status(), 200);
      await page.getByRole('button', { name: `${updated.title} 편집`, exact: true }).click();
      await page.getByRole('button', { name: '이 도착점에 공략 추가', exact: true }).click();
      await page.waitForURL('**/admin/lineups/new?destinationFrom=*');
      await page.getByRole('heading', { name: '새 공략 등록', exact: true }).waitFor();
      await page.waitForFunction(() => document.querySelector('#registration-title')?.value === '');
      assert.equal(await page.getByRole('button', { name: '이 도착점에 공략 추가', exact: true }).count(), 0);
      assert.equal(await page.locator('#registration-url').inputValue(), '');
      assert.equal(await page.locator('[data-pin=시작]').count(), 0);
      await fill(page, `영상 공략 ${width}`, 'video', `${frontend}/__qa__/lineup.webm`);
      await page.locator('#registration-status').selectOption('published');
      assert.equal(await page.getByRole('button', { name: '도착 위치', exact: true }).isDisabled(), true);
      assert.equal(await page.getByRole('button', { name: '도착점 수정', exact: true }).count(), 0);
      await point(page, 0.49, 0.9);
      await page.getByText('중간 지점 추가 (선택)', { exact: true }).click();
      await page.getByRole('button', { name: '중간 지점', exact: true }).click();
      await point(page, 0.59, 0.65);
      const second = await save(page, 'POST', 201);
      assert.equal(second.registration.destination.id, first.registration.destination.id);
      assert.deepEqual(second.registration.destination.point, first.registration.destination.point);
      assert.notDeepEqual(second.agentMarkers, first.agentMarkers);
      assert.equal(second.registration.media.type, 'VIDEO');
      const firstAgain = await request(`/api/admin/lineups/${first.id}`);
      assert.deepEqual(firstAgain.registration, first.registration);
      await page.getByRole('button', { name: '← 목록으로', exact: true }).click();
      await page.locator('#guide-search').fill(`공략 ${width}`);
      await shot(page, width, 'list');
      record(`${width}px status PATCH publication, unsaved-change cancel, second origin, shared-destination lock`);
      const { context: publicContext, page: publicPage } = await context(width);
      await publicSelection(publicPage, destinationName);
      assert.equal(await publicPage.evaluate(() => sessionStorage.getItem('lineup-admin-token')), null);
      assert.equal(await publicPage.getByRole('region', { name: '선택한 도착점의 공략' }).getByRole('link').count(), 2);
      const routePoints = await publicPage.locator(`[data-lineup-id="${first.id}"]`).getAttribute('points');
      const expectedPublicRoute = [firstAgain.agentMarkers[0].position, ...firstAgain.pathPoints, firstAgain.skillMarkers[0].position].map(p => `${(1 - p.y) * 100},${p.x * 100}`).join(' ');
      assert.equal(routePoints, expectedPublicRoute);
      await shot(publicPage, width, 'public');
      await publicPage.getByRole('link', { name: `${updated.title} 상세 자료 보기`, exact: true }).click();
      await publicPage.getByRole('heading', { name: updated.title, exact: true }).waitFor();
      await publicPage.getByAltText('라인업 위치와 사용 방법 안내 이미지').scrollIntoViewIfNeeded();
      await publicPage.waitForFunction(() => document.querySelector('img[alt="라인업 위치와 사용 방법 안내 이미지"]')?.naturalWidth > 0);
      assert.equal(await publicPage.locator('.lineup-path-overlay polyline').getAttribute('points'), expectedPublicRoute);
      await shot(publicPage, width, 'detail-image');
      await publicPage.goto(`${frontend}/lineups/${second.id}`);
      await publicPage.getByRole('heading', { name: second.title, exact: true }).waitFor();
      await publicPage.waitForFunction(() => document.querySelector('video')?.readyState >= 1);
      assert.equal(await publicPage.locator('video').getAttribute('src'), `${frontend}/__qa__/lineup.webm`);
      await publicPage.locator('video').evaluate(video => video.play());
      await publicPage.waitForFunction(() => document.querySelector('video')?.currentTime > 0.1);
      await publicPage.locator('video').evaluate(video => video.pause());
      await shot(publicPage, width, 'detail-video');
      record(`${width}px anonymous public grouped origins, exact ordered route, rendered IMAGE and playable VIDEO`);
      await page.locator('#guide-search').fill('');
      const unpublish = page.waitForResponse(response => response.url() === `${backend}/api/admin/lineups/${first.id}/status` && response.request().method() === 'PATCH');
      await page.getByLabel(`${updated.title} 공개 상태`, { exact: true }).selectOption('DRAFT');
      assert.equal((await unpublish).status(), 200);
      await request(`/api/lineups/${first.id}`, 'GET', undefined, false, 404);
      await publicPage.goto(`${frontend}/lineups/${first.id}`);
      await publicPage.getByRole('heading', { name: '라인업을 불러오지 못했습니다.', exact: true }).waitFor();
      await shot(publicPage, width, 'unpublished');
      const legacy = await create(fixture({ title: `기존 다중 마커 ${width}`, registration: null, agentMarkers: [{ position: { x: .1, y: .9 } }, { position: { x: .2, y: .8 } }], skillMarkers: [{ abilityId: 'sova-recon-bolt', position: { x: .7, y: .3 } }, { abilityId: 'sova-shock-bolt', position: { x: .6, y: .4 } }] }));
      await page.goto(`${frontend}/admin/lineups/${legacy.id}/edit`);
      await page.getByRole('region', { name: '기존 자료 읽기 전용' }).waitFor();
      assert.equal(await page.getByRole('button', { name: '저장', exact: true }).count(), 0);
      const legacyStatus = page.waitForResponse(response => response.url().endsWith(`/api/admin/lineups/${legacy.id}/status`) && response.request().method() === 'PATCH');
      await page.locator('#legacy-status').selectOption('REVIEW'); await legacyStatus;
      const legacyAgain = await request(`/api/admin/lineups/${legacy.id}`);
      assert.deepEqual(legacyAgain.agentMarkers, legacy.agentMarkers); assert.deepEqual(legacyAgain.skillMarkers, legacy.skillMarkers);
      await shot(page, width, 'legacy');
      await page.goto(`${frontend}/admin/lineups/${second.id}/edit`);
      await page.getByRole('button', { name: '공략 삭제', exact: true }).waitFor();
      page.once('dialog', dialog => dialog.accept());
      const deletion = page.waitForResponse(response => response.url().endsWith(`/api/admin/lineups/${second.id}`) && response.request().method() === 'DELETE');
      await page.getByRole('button', { name: '공략 삭제', exact: true }).click(); assert.equal((await deletion).status(), 204); createdIds.delete(second.id);
      await request(`/api/lineups/${second.id}`, 'GET', undefined, false, 404);
      record(`${width}px unpublish exclusion, legacy marker protection, UI DELETE -> public 404`);
      const previewPage = await publicContext.newPage();
      const previewApiRequests = [];
      previewPage.on('request', request => { if (request.url().startsWith(backend)) previewApiRequests.push(request.url()); });
      await previewPage.goto(`${frontend}/admin/preview`);
      await previewPage.getByLabel('예시 입장 코드').fill('DEMO1234');
      await previewPage.getByRole('button', { name: '예시 화면 들어가기', exact: true }).click();
      await previewPage.locator('[data-guide-id]').first().click();
      await previewPage.locator('#preview-title').waitFor();
      await previewPage.getByText('중간 지점 추가 (선택)', { exact: true }).click();
      assert.equal(await previewPage.getByRole('button', { name: '벽 튕김', exact: true }).count(), 0);
      assert.equal(await previewPage.getByText('충전', { exact: true }).count(), 0);
      await shot(previewPage, width, 'preview');
      await previewPage.locator('#preview-title').fill('메모리 저장 검증');
      await previewPage.getByRole('button', { name: '예시 목록에 저장', exact: true }).click();
      await previewPage.getByRole('status').filter({ hasText: '예시 목록에 저장했습니다.' }).waitFor();
      await previewPage.reload();
      await previewPage.getByLabel('예시 입장 코드').fill('DEMO1234');
      await previewPage.getByRole('button', { name: '예시 화면 들어가기', exact: true }).click();
      assert.equal(await previewPage.getByRole('button', { name: '메모리 저장 검증 편집', exact: true }).count(), 0);
      assert.deepEqual(previewApiRequests, []);
      record(`${width}px preview retains memory-only save/reset and simplified lineup intermediate tool`);
      await publicContext.close(); await adminContext.close();
    }
    const shortIdRecord = await create(fixture({ title: '기존 짧은 스킬 ID', skillMarkers: [{ abilityId: 'E', position: destination.point, order: 0 }], status: 'REVIEW' }));
    const { context: shortContext, page: shortPage } = await context(1440, true);
    await shortPage.goto(`${frontend}/admin/lineups/${shortIdRecord.id}/edit`);
    await shortPage.locator('#registration-title').waitFor();
    assert.equal(await shortPage.locator('#registration-ability-id').inputValue(), 'E');
    await shortPage.locator('#registration-title').fill('기존 짧은 스킬 ID 제목 수정');
    const shortSaved = await save(shortPage);
    assert.deepEqual(shortSaved.skillMarkers, shortIdRecord.skillMarkers);
    assert.deepEqual(shortSaved.registration, shortIdRecord.registration);
    assert.equal(shortSaved.status, 'REVIEW');
    await shortContext.close();
    record('existing literal E skill ID survives a title-only UI edit');
    for (const failureMode of ['server500', 'network']) {
      const { context: retryContext, page: retryPage } = await context(1440, true);
      const failSession = route => failureMode === 'network' ? route.abort('connectionfailed') : route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
      await retryPage.route(`${backend}/api/admin/session`, failSession);
      await retryPage.goto(`${frontend}/admin`);
      await retryPage.getByRole('button', { name: '저장된 인증으로 다시 시도', exact: true }).waitFor();
      assert.equal(await retryPage.evaluate(() => sessionStorage.getItem('lineup-admin-token')), token);
      await retryPage.unroute(`${backend}/api/admin/session`, failSession);
      await retryPage.getByRole('button', { name: '저장된 인증으로 다시 시도', exact: true }).click();
      await retryPage.waitForURL('**/admin/lineups');
      await retryPage.locator('#guide-search').waitFor();
      await retryContext.close();
      record(`saved login token retained on ${failureMode} and retry succeeds`);
    }
    const { context: errorContext, page: errorPage } = await context(1440, true);
    const failRead = route => route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
    await errorPage.route(`${backend}/api/admin/lineups`, failRead);
    await errorPage.goto(`${frontend}/admin/lineups`);
    await errorPage.getByRole('heading', { name: '자료를 불러오지 못했습니다.', exact: true }).waitFor();
    await errorPage.unroute(`${backend}/api/admin/lineups`, failRead);
    await errorPage.getByRole('button', { name: '다시 불러오기', exact: true }).click();
    await errorPage.locator('#guide-search').waitFor();
    await errorPage.evaluate(() => sessionStorage.setItem('lineup-admin-token', 'fe040-deliberately-invalid'));
    // addInitScript would restore the valid token on reload; navigate the same document via new context instead.
    await errorContext.close();
    const badContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await badContext.addInitScript(() => sessionStorage.setItem('lineup-admin-token', 'fe040-deliberately-invalid'));
    const badPage = await badContext.newPage(); await badPage.goto(`${frontend}/admin/lineups`);
    await badPage.getByRole('heading', { name: '관리자 인증이 만료되었습니다.', exact: true }).waitFor();
    assert.equal(await badPage.evaluate(() => sessionStorage.getItem('lineup-admin-token')), null);
    await shot(badPage, 1440, 'expired'); await badContext.close();
    record('frontend handles server-read failure/retry and real 403 by expiring the token');
    assert.deepEqual(failures, []); record('both viewports have zero page exceptions and zero horizontal overflow');
  } finally { await browser.close(); }
}
async function listChecks() {
  const { chromium } = require(process.env.PLAYWRIGHT_MODULE);
  const browser = await chromium.launch();
  try {
    for (const width of [1440, 390]) {
      const currentDestination = { ...destination, id: `fe040-list-${width}`, name: `통합 검증 A 도착점 ${width}` };
      const first = await create(fixture({ title: `이미지 공략 ${width} 수정`, status: 'PUBLISHED', registration: { ...fixture().registration, destination: currentDestination } }));
      const second = await create(fixture({ title: `영상 공략 ${width}`, status: 'PUBLISHED', agentMarkers: [{ position: { x: 0.49, y: 0.9 } }], registration: { destination: currentDestination, media: { type: 'VIDEO', url: `${frontend}/__qa__/lineup.webm` }, site: 'A', abilitySlot: 'E' } }));
      const context = await browser.newContext({ viewport: { width, height: 1000 }, isMobile: width === 390, hasTouch: width === 390 });
      await context.addInitScript(value => sessionStorage.setItem('lineup-admin-token', value), token);
      const page = await context.newPage(); const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`${frontend}/admin/lineups`);
      await page.locator('#guide-search').fill(`공략 ${width}`);
      await page.waitForFunction(() => document.querySelectorAll('[data-guide-id]').length === 2);
      await page.evaluate(async () => { window.scrollTo(0, 0); await Promise.all(Array.from(document.images, image => { image.loading = 'eager'; return image.decode().catch(() => undefined); })); });
      const labels = await page.locator('label').evaluateAll(labels => labels.filter(label => Array.from(label.childNodes).some(node => node.nodeType === 3 && node.textContent.trim() === '공개 상태')).map(label => {
        const text = Array.from(label.childNodes).find(node => node.nodeType === 3 && node.textContent.trim() === '공개 상태');
        const range = document.createRange(); range.selectNodeContents(text);
        return { whiteSpace: getComputedStyle(label).whiteSpace, textLines: range.getClientRects().length, textHeight: range.getBoundingClientRect().height, labelHeight: label.getBoundingClientRect().height };
      }));
      assert.equal(labels.length, 2);
      for (const label of labels) { assert.equal(label.whiteSpace, 'nowrap'); assert.equal(label.textLines, 1); assert.ok(label.textHeight < label.labelHeight); }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      assert.deepEqual(errors, []);
      assert.deepEqual(await page.locator('img').evaluateAll(images => images.filter(image => !image.naturalWidth).map(image => image.src)), []);
      await page.screenshot({ path: path.join(out, `after-${width}-list.png`), fullPage: true });
      record(`${width}px list status labels remain one line after CSS fix`, { labels, pageErrors: errors, overflow: false });
      await context.close();
      for (const id of [first.id, second.id]) { await request(`/api/admin/lineups/${id}`, 'DELETE', undefined, true, 204); createdIds.delete(id); }
    }
  } finally { await browser.close(); }
}

(async () => {
  assert.match(backend, /^http:\/\/(localhost|127\.0\.0\.1):18080$/u, 'Only the designated disposable backend port is allowed.');
  try {
    if (mode === 'all' || mode === 'api') await apiChecks();
    if (mode === 'all' || mode === 'ui') await uiChecks();
    if (mode === 'list') await listChecks();
  } finally {
    for (const id of createdIds) await request(`/api/admin/lineups/${id}`, 'DELETE', undefined, true, 204);
    fs.writeFileSync(path.join(out, `integration-${mode}-results.json`), JSON.stringify(results, null, 2));
  }
  console.log(`${mode}: PASS ${results.length} checks`);
})().catch(error => { console.error(error); process.exitCode = 1; });
