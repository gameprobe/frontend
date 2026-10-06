/** Read-only TASK-FE-040 list/detail map regression. Synthetic cases intercept GETs only. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE);
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const mode = process.argv[2] || 'after';
const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
const backend = process.env.BACKEND_URL || 'http://localhost:8080';
const realId = '15f99bbd-3982-469e-b447-09f4ffcc4064';
const results = [];
const faults = [];
const writes = [];
const out = __dirname;
const orient = (point, side) => side === 'ATTACK' ? { x: 1 - point.y, y: point.x } : { x: point.y, y: 1 - point.x };
const pointList = (points, side) => points.map(point => { const next = orient(point, side); return [next.x * 100, next.y * 100]; });
const close = (actual, expected, message, tolerance = 0.025) => assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: actual ${actual}, expected ${expected}`);
const record = (name, details = {}) => { results.push({ name, status: 'PASS', ...details }); console.log(`PASS ${name}`); };
async function readyImages(page) {
  await page.evaluate(async () => {
    await Promise.all(Array.from(document.images, image => { image.loading = 'eager'; return image.decode().catch(() => undefined); }));
  });
  assert.deepEqual(await page.locator('img').evaluateAll(images => images.filter(image => !image.naturalWidth).map(image => image.getAttribute('src'))), [], 'all images load');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'no horizontal overflow');
}
async function screenshot(page, name) {
  await readyImages(page); await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(out, name), fullPage: true });
}
async function routeState(locator) {
  return locator.evaluate(element => {
    const style = getComputedStyle(element);
    return { points: element.getAttribute('points').split(/\s+/).map(point => point.split(',').map(Number)), stroke: style.stroke, width: style.strokeWidth, opacity: style.strokeOpacity, dash: style.strokeDasharray, effect: style.vectorEffect, join: style.strokeLinejoin, cap: style.strokeLinecap };
  });
}
function expectRoute(actual, points, side) {
  const expected = pointList(points, side);
  assert.equal(actual.points.length, expected.length);
  actual.points.forEach((point, index) => point.forEach((value, axis) => close(value, expected[index][axis], `route ${index}/${axis}`)));
  assert.equal(actual.effect, 'non-scaling-stroke'); assert.equal(actual.dash, 'none');
  assert.equal(actual.join, 'round'); assert.equal(actual.cap, 'round');
}
async function markerStates(page, selector, canvasSelector) {
  return page.locator(selector).evaluateAll((elements, canvasSelector) => {
    const canvas = document.querySelector(canvasSelector).getBoundingClientRect();
    const stage = document.querySelector(canvasSelector).parentElement.getBoundingClientRect();
    return elements.map(element => {
      const box = element.getBoundingClientRect();
      return { left: parseFloat(element.style.left), top: parseFloat(element.style.top), width: box.width, height: box.height, center: [(box.x + box.width / 2 - canvas.x) / canvas.width * 100, (box.y + box.height / 2 - canvas.y) / canvas.height * 100], inStage: box.x >= stage.x - .1 && box.y >= stage.y - .1 && box.right <= stage.right + .1 && box.bottom <= stage.bottom + .1 };
    });
  }, canvasSelector);
}
function expectMarkers(actual, markers, side) {
  assert.equal(actual.length, markers.length);
  actual.forEach((item, index) => {
    const expected = orient(markers[index].position, side);
    close(item.left, expected.x * 100, 'marker left'); close(item.top, expected.y * 100, 'marker top');
    close(item.center[0], expected.x * 100, 'marker visual center x', .12); close(item.center[1], expected.y * 100, 'marker visual center y', .12);
    close(item.width, 40, 'marker width'); close(item.height, 40, 'marker height');
    assert.equal(item.inStage, true, 'edge marker is inside stage padding');
  });
}
async function newContext(browser, width, fixtures) {
  const context = await browser.newContext({ viewport: { width, height: 1000 }, isMobile: width === 390, hasTouch: width === 390 });
  await context.route('**/api/**', async route => {
    const request = route.request(); const url = new URL(request.url());
    if (request.method() !== 'GET') { writes.push({ url: url.pathname, method: request.method() }); return route.abort(); }
    if (fixtures && url.pathname.startsWith('/api/lineups')) {
      const id = url.pathname.split('/')[3]; const item = id ? fixtures.find(fixture => fixture.id === id) : fixtures;
      return route.fulfill({ status: item ? 200 : 404, contentType: 'application/json', body: JSON.stringify(item || {}) });
    }
    return route.continue();
  });
  const page = await context.newPage(); page.setDefaultTimeout(15000);
  page.on('pageerror', error => faults.push({ width, error: error.message }));
  return { context, page };
}
async function listToDetail(page, lineup, width, capture = false) {
  await page.goto(`${frontend}/lineups`);
  await page.getByRole('button', { name: 'Abyss', exact: true }).click();
  await page.getByRole('button', { name: 'Brimstone', exact: true }).click();
  await page.getByRole('button', { name: 'Q', exact: true }).click();
  if (lineup.side === 'DEFENSE') await page.getByRole('button', { name: '수비', exact: true }).click();
  await page.getByRole('button', { name: `${lineup.registration.destination.name} · 공략 1개`, exact: true }).click();
  await page.mouse.move(0, 0); await readyImages(page);
  const listRouteLocator = page.locator(`[data-lineup-id="${lineup.id}"]`);
  const listNormal = await routeState(listRouteLocator);
  const rawRoute = [lineup.agentMarkers[0].position, ...lineup.pathPoints, lineup.skillMarkers[0].position];
  expectRoute(listNormal, rawRoute, lineup.side); assert.equal(listNormal.width, '3px');
  const listImage = await page.locator('.strats-map-image-rotated').evaluate(image => ({ transform: getComputedStyle(image).transform, fit: getComputedStyle(image).objectFit, src: image.getAttribute('src') }));
  const origin = page.getByRole('link', { name: `${lineup.title} 상세 자료 보기`, exact: true });
  await origin.focus();
  await page.waitForFunction(id => getComputedStyle(document.querySelector(`[data-lineup-id="${id}"]`)).strokeWidth === '4px', lineup.id);
  const listActive = await routeState(listRouteLocator); assert.equal(listActive.opacity, '1');
  const listMarkers = await origin.evaluate(element => ({ left: parseFloat(element.style.left), top: parseFloat(element.style.top) }));
  await origin.click();
  await page.getByRole('heading', { name: lineup.title, exact: true }).waitFor();
  await page.locator('h1').click(); await page.mouse.move(0, 0); await readyImages(page);
  const canvas = await page.locator('.lineup-map-canvas').evaluate(element => {
    const box = element.getBoundingClientRect(); const stage = getComputedStyle(element.parentElement); const image = element.querySelector('img'); const style = getComputedStyle(image);
    return { width: box.width, height: box.height, padding: stage.paddingTop, transform: style.transform, fit: style.objectFit, src: image.getAttribute('src') };
  });
  close(canvas.width, canvas.height, 'square detail canvas'); assert.ok(canvas.width <= 640.1); assert.equal(canvas.padding, width === 390 ? '24px' : '26px');
  assert.equal(canvas.transform, listImage.transform); assert.equal(canvas.fit, 'contain'); assert.equal(listImage.fit, 'contain');
  const assetUrl = value => { const url = new URL(value, frontend); return url.searchParams.get('url') || url.pathname; };
  assert.equal(assetUrl(canvas.src), assetUrl(listImage.src));
  const route = page.locator('.lineup-path-overlay polyline'); const normal = await routeState(route);
  expectRoute(normal, rawRoute, lineup.side); assert.equal(normal.width, listNormal.width); assert.equal(normal.stroke, listNormal.stroke); assert.equal(normal.opacity, listNormal.opacity);
  const agents = await markerStates(page, '.lineup-agent-marker', '.lineup-map-canvas'); const skills = await markerStates(page, '.lineup-skill-marker', '.lineup-map-canvas');
  expectMarkers(agents, lineup.agentMarkers, lineup.side); expectMarkers(skills, lineup.skillMarkers, lineup.side);
  close(agents[0].left, listMarkers.left, 'list/detail origin x'); close(agents[0].top, listMarkers.top, 'list/detail origin y');
  const skillImage = page.locator('.lineup-skill-marker img'); assert.equal(await skillImage.count(), 1);
  assert.ok(decodeURIComponent(await skillImage.getAttribute('src')).includes('/assets/abilities/brimstone-q.png'));
  await page.locator('.lineup-agent-marker').hover();
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.lineup-path-overlay polyline')).strokeWidth === '4px');
  const active = await routeState(route); assert.equal(active.width, listActive.width); assert.equal(active.stroke, listActive.stroke); assert.equal(active.opacity, '1'); assert.equal(active.effect, 'non-scaling-stroke');
  await page.mouse.move(0, 0); await page.locator('h1').click();
  await page.keyboard.press('Tab'); await page.locator('.lineup-skill-marker').focus();
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.lineup-path-overlay polyline')).strokeWidth === '4px');
  assert.equal(await page.locator('.lineup-skill-marker').evaluate(element => element.matches(':focus-visible')), true);
  await page.locator('h1').click(); await page.mouse.move(0, 0);
  if (capture) await screenshot(page, `map-consistency-after-${width}-detail.png`);
  record(`${width}px ${lineup.side} ${lineup.pathPoints.length}-intermediate list/detail consistency`, { id: lineup.id, canvas, route: normal, activeStroke: active.stroke, agents, skills, source: capture ? 'existing real published example, read only' : 'intercepted synthetic GET responses' });
}
function fixture(id, side, start, destination, pathPoints) {
  return { id, title: `지도 일치 QA ${id}`, description: 'DB에 쓰지 않는 브라우저 응답 전용 검증 자료', mapId: 'abyss', side, agentId: 'brimstone', difficulty: 'MEDIUM', status: 'PUBLISHED', authorId: 'synthetic-qa', createdAt: '', updatedAt: '', agentMarkers: [{ position: start }], skillMarkers: [{ abilityId: 'brimstone-incendiary', position: destination, order: 0 }], pathPoints, registration: { destination: { id: `${id}-destination`, name: `QA ${id} 도착점`, point: destination }, media: { type: 'VIDEO', url: 'https://example.com/qa-map-video' }, site: 'A', abilitySlot: 'Q' } };
}
async function legacyCheck(page, legacy, width) {
  await page.goto(`${frontend}/lineups/${legacy.id}`); await page.getByRole('heading', { name: legacy.title, exact: true }).waitFor(); await readyImages(page);
  const agents = await markerStates(page, '.lineup-agent-marker', '.lineup-map-canvas'); const skills = await markerStates(page, '.lineup-skill-marker', '.lineup-map-canvas');
  expectMarkers(agents, legacy.agentMarkers, legacy.side); expectMarkers(skills, legacy.skillMarkers, legacy.side);
  expectRoute(await routeState(page.locator('.lineup-path-overlay polyline')), legacy.pathPoints, legacy.side);
  assert.equal(await page.locator('.lineup-skill-marker img').count(), 0, 'legacy slots are not inferred from ambiguous IDs');
  assert.equal(await page.getByRole('link', { name: '원본 자료 새 탭에서 보기 ↗' }).getAttribute('href'), legacy.skillMarkers[0].youtubeUrl);
  await page.locator('.lineup-skill-marker').nth(1).click();
  assert.equal(await page.locator('.lineup-skill-marker').nth(1).getAttribute('aria-pressed'), 'true');
  assert.equal(await page.getByRole('link', { name: '원본 자료 새 탭에서 보기 ↗' }).getAttribute('href'), legacy.skillMarkers[1].youtubeUrl);
  record(`${width}px legacy multiple markers and selected media retained`, { routePointCount: legacy.pathPoints.length, agentMarkers: agents.length, skillMarkers: skills.length });
}
(async () => {
  assert.match(frontend, /^http:\/\/(localhost|127\.0\.0\.1):3000$/u);
  assert.match(backend, /^http:\/\/(localhost|127\.0\.0\.1):8080$/u);
  const response = await fetch(`${backend}/api/lineups/${realId}`); assert.equal(response.status, 200); const real = await response.json();
  const browser = await chromium.launch();
  try {
    if (mode === 'before') {
      const { context, page } = await newContext(browser, 1440);
      await page.goto(`${frontend}/lineups/${realId}`); await page.getByRole('heading', { name: real.title, exact: true }).waitFor();
      await screenshot(page, 'map-consistency-before-1440-detail.png'); record('1440px before existing published detail capture'); await context.close();
    } else {
      const defense = fixture('qa-defense-multiple-edges', 'DEFENSE', { x: 0, y: 0 }, { x: 1, y: 1 }, [{ x: .2, y: .3 }, { x: .7, y: .9 }]);
      const straight = fixture('qa-attack-straight-edges', 'ATTACK', { x: 0, y: 1 }, { x: 1, y: 0 }, []);
      const legacy = { ...fixture('qa-legacy-multiple', 'DEFENSE', { x: .1, y: .9 }, { x: 0, y: 0 }, [{ x: .1, y: .2 }, { x: .4, y: .5 }]), registration: null, agentMarkers: [{ position: { x: .1, y: .9 } }, { position: { x: .3, y: .8 } }], skillMarkers: [{ abilityId: 'legacy-first', position: { x: 0, y: 0 }, youtubeUrl: 'https://example.com/legacy-first', order: 0 }, { abilityId: 'legacy-second', position: { x: 1, y: 1 }, youtubeUrl: 'https://example.com/legacy-second', order: 1 }] };
      for (const width of [1440, 390]) {
        const actual = await newContext(browser, width); await listToDetail(actual.page, real, width, true); await actual.context.close();
        for (const synthetic of [defense, straight]) { const test = await newContext(browser, width, [synthetic]); await listToDetail(test.page, synthetic, width); await test.context.close(); }
        const old = await newContext(browser, width, [legacy]); await legacyCheck(old.page, legacy, width); await old.context.close();
      }
      const after = await fetch(`${backend}/api/lineups/${realId}`); assert.equal(after.status, 200); assert.deepEqual(await after.json(), real);
      record('existing database record unchanged and synthetic cases caused zero API writes');
    }
    assert.deepEqual(faults, []); assert.deepEqual(writes, []);
    record('zero page exceptions, broken images, horizontal overflow or API writes');
  } finally { await browser.close(); fs.writeFileSync(path.join(out, `map-consistency-${mode}-results.json`), JSON.stringify({ checks: results, pageErrors: faults, blockedWrites: writes }, null, 2)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
