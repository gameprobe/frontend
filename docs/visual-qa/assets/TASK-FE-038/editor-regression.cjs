const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');

// FE-037의 지도/공유 도착점 회귀를 FE-038 목록 → 편집 전환에 맞춰 확인한다.
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:3000';
const result = { screens: [], checks: [], errors: [], apiRequests: [] };
const settle = page => page.evaluate(async () => { await new Promise(requestAnimationFrame); await new Promise(requestAnimationFrame); });
const point = locator => locator.evaluate(el => ({ x: parseFloat(el.style.left) / 100, y: parseFloat(el.style.top) / 100 }));
function near(actual, expected, label) {
  assert.ok(Math.abs(actual.x - expected.x) < .006 && Math.abs(actual.y - expected.y) < .006, `${label}: ${JSON.stringify(actual)} expected ${JSON.stringify(expected)}`);
}
async function capture(page, name) {
  await page.evaluate(async () => { await document.fonts.ready; window.scrollTo({ top: 0, behavior: 'instant' }); });
  await settle(page);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${name}: no horizontal overflow`);
  const file = `editor-${name}.png`;
  await page.screenshot({ path: `${__dirname}/${file}`, fullPage: true, animations: 'disabled' });
  result.screens.push(file);
}
async function verify(page, width) {
  const touch = width === 390;
  const cdp = touch ? await page.context().newCDPSession(page) : null;
  const canvas = page.locator('[class*="mapCanvas"]');
  const placement = page.getByRole('button', { name: '지도 위치 지정', exact: true });
  const origin = page.locator('[data-pin="시작"]');
  const target = page.locator('[data-pin="도착"]');
  const wall = page.locator('[data-pin="벽 끝"]');
  const waypoint = page.locator('[data-route-point="waypoint"][data-point-index="0"]');
  const bounce = page.locator('[data-route-point="bounce"][data-point-index="1"]');
  const route = () => page.locator('[data-route="trajectory"]').getAttribute('points');
  const options = page.locator('summary').filter({ hasText: '경유·벽 튕김 추가' });
  const editDestination = page.getByRole('button', { name: '도착점 수정', exact: true });
  const cancelDestination = page.getByRole('button', { name: '도착점 수정 취소', exact: true });
  const back = async () => { await page.getByRole('button', { name: '목록으로', exact: true }).click(); await settle(page); };
  const menu = async kind => { await page.getByRole('button', { name: kind === 'lineup' ? '라인업 관리' : '스모크 관리', exact: true }).click(); await settle(page); };
  const guide = id => page.locator(`[data-guide-id="${id}"]`);
  async function open(id) {
    await guide(id).click();
    await page.locator('#preview-title').waitFor();
    await page.waitForFunction(() => [...document.images].filter(image => image.closest('[class*="mapCanvas"]')).every(image => image.complete && image.naturalWidth > 0));
    await settle(page);
  }
  async function save() { await page.getByRole('button', { name: '예시 목록에 저장', exact: true }).click(); await settle(page); }
  async function centerMap() { await canvas.evaluate(el => el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' })); await settle(page); }
  async function startPointer(marker, useTouch = touch) {
    await centerMap();
    const b = await marker.boundingBox(); assert.ok(b);
    const from = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
    assert.equal(await marker.evaluate((el, p) => el.contains(document.elementFromPoint(p.x, p.y)), from), true, 'marker visible before drag');
    if (useTouch) await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...from, id: 1, radiusX: 3, radiusY: 3, force: 1 }] });
    else { await page.mouse.move(from.x, from.y); await page.mouse.down(); }
    return from;
  }
  async function movePointer(from, next, useTouch = touch) {
    const b = await canvas.boundingBox(); assert.ok(b);
    const to = { x: b.x + b.width * next.x, y: b.y + b.height * next.y };
    if (useTouch) {
      for (let step = 1; step <= 8; step += 1) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from.x + (to.x - from.x) * step / 8, y: from.y + (to.y - from.y) * step / 8, id: 1, radiusX: 3, radiusY: 3, force: 1 }] });
    } else await page.mouse.move(to.x, to.y, { steps: 8 });
    await settle(page);
  }
  async function endPointer(useTouch = touch) {
    if (useTouch) await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    else await page.mouse.up();
    await settle(page);
  }
  async function drag(marker, next) { const from = await startPointer(marker); await movePointer(from, next); await endPointer(); near(await point(marker), next, 'dragged marker'); }
  async function place(x, y) { await centerMap(); const b = await placement.boundingBox(); assert.ok(b); await placement.click({ position: { x: b.width * x, y: b.height * y } }); await settle(page); }
  async function snapshot() {
    return {
      destination: await point(target), destinationId: await page.locator('#preview-destination').inputValue(),
      origin: await origin.count() ? await point(origin) : null,
      path: await page.locator('[data-route-point]').evaluateAll(nodes => nodes.map(el => ({ kind: el.dataset.routePoint, index: el.dataset.pointIndex, x: parseFloat(el.style.left) / 100, y: parseFloat(el.style.top) / 100 }))),
      wall: await wall.count() ? await point(wall) : null,
      media: await page.locator('#preview-url').inputValue(), title: await page.locator('#preview-title').inputValue(),
    };
  }
  function peerPreserved(actual, original) {
    for (const key of ['origin', 'path', 'wall', 'media', 'destinationId']) assert.deepEqual(actual[key], original[key], `${key} stays independent`);
  }
  async function previewMatches(expectedRoute, name) {
    await page.getByRole('button', { name: '미리보기', exact: true }).click(); await settle(page);
    assert.equal(await route(), expectedRoute);
    assert.equal(await page.locator('button[data-pin],button[data-route-point]').count(), 0, 'preview is read only');
    await capture(page, `${width}-${name}`);
    await page.getByRole('button', { name: '편집으로 돌아가기', exact: true }).click(); await settle(page);
  }
  async function impact(count) {
    const notice = page.locator('[class*="destinationEdit"]');
    assert.match(await notice.innerText(), new RegExp(`${count}개`));
    assert.match(await notice.innerText(), /예시 목록에 저장할 때 반영/);
  }
  try {
    // Baselines are collected by reopening rows through the new list screen.
    const originals = {};
    for (const id of ['preview-lineup-01', 'preview-lineup-02', 'preview-lineup-03']) { await open(id); originals[id] = await snapshot(); await back(); }
    await open('preview-lineup-01');
    assert.equal(await target.evaluate(el => el.tagName), 'SPAN');
    const lockedRoute = await route(); await target.click(); assert.equal(await route(), lockedRoute);
    await options.click(); await page.getByRole('button', { name: '벽 튕김', exact: true }).click();
    await drag(origin, { x: .2, y: .8 });
    await drag(waypoint, { x: .34, y: .61 });
    await drag(bounce, { x: .57, y: .42 });
    assert.deepEqual(await page.locator('[data-route-point]').evaluateAll(nodes => nodes.map(el => [el.dataset.routePoint, el.dataset.pointIndex])), [['waypoint', '0'], ['bounce', '1']]);
    near(await point(target), originals['preview-lineup-01'].destination, 'shared target stays locked');
    const cancelBaseline = await point(origin);
    const from = await startPointer(origin, false); await movePointer(from, { x: .45, y: .8 }, false); await page.keyboard.press('Escape'); await endPointer(false);
    near(await point(origin), cancelBaseline, 'escape reverts drag');
    if (touch) {
      const touchFrom = await startPointer(origin); await movePointer(touchFrom, { x: .36, y: .7 });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] }); await settle(page);
      near(await point(origin), cancelBaseline, 'touch cancel reverts drag');
    }
    const edgeFrom = await startPointer(origin); await movePointer(edgeFrom, { x: -.05, y: .73 }); await endPointer();
    near(await point(origin), { x: 0, y: .73 }, 'edge clamped'); await drag(origin, cancelBaseline);
    await waypoint.focus(); const beforeKey = await point(waypoint); await waypoint.press('ArrowRight');
    near(await point(waypoint), { x: beforeKey.x + .01, y: beforeKey.y }, 'keyboard moves existing point');
    const keyboardRoute = await route(); await waypoint.press('Enter'); await waypoint.press('Space'); assert.equal(await route(), keyboardRoute);
    assert.equal(await page.locator('[data-route-point]').count(), 2, 'release does not append a point');
    await save(); const savedRoute = await route(); originals['preview-lineup-01'] = await snapshot();
    await capture(page, `${width}-dragged-editor`); await previewMatches(savedRoute, 'dragged-preview');
    await back(); await open('preview-lineup-01'); assert.equal(await route(), savedRoute, 'saved route survives list roundtrip');

    // Shared movement remains staged; cancellation retains other edits and invalid save cannot propagate.
    await page.locator('#preview-title').fill('QA · 취소해도 유지되는 제목');
    await editDestination.click(); await impact(3); await drag(target, { x: .73, y: .25 });
    await cancelDestination.click(); near(await point(target), originals['preview-lineup-01'].destination, 'shared cancel restores target');
    assert.equal(await page.locator('#preview-title').inputValue(), 'QA · 취소해도 유지되는 제목');
    await save(); originals['preview-lineup-01'].title = 'QA · 취소해도 유지되는 제목';
    await editDestination.click(); await drag(target, { x: .73, y: .25 });
    await page.locator('#preview-url').fill('not a url'); await save();
    assert.match(await page.locator('[role="alert"]:not(#__next-route-announcer__)').innerText(), /http/);
    await back(); await open('preview-lineup-02'); near(await point(target), originals['preview-lineup-02'].destination, 'invalid save does not update peer');
    await back(); await open('preview-lineup-01'); await editDestination.click(); await impact(3); await drag(target, { x: .73, y: .25 });
    await capture(page, `${width}-shared-staged`); await save(); assert.equal(await target.evaluate(el => el.tagName), 'SPAN');
    await back();
    for (const id of ['preview-lineup-01', 'preview-lineup-02', 'preview-lineup-03']) {
      await open(id); const current = await snapshot(); near(current.destination, { x: .73, y: .25 }, 'shared save propagates'); peerPreserved(current, originals[id]); await back();
    }

    // A single saved smoke stays editable; creating a second guide makes its destination shared.
    await menu('smoke'); assert.equal(await page.locator('[data-guide-id]').count(), 2); await open('preview-smoke-02');
    assert.equal(await target.evaluate(el => el.tagName), 'BUTTON'); assert.equal(await editDestination.count(), 0);
    const singleBefore = await snapshot(); await drag(target, { x: .49, y: .5 }); await drag(wall, { x: .7, y: .36 });
    near(await point(origin), singleBefore.origin, 'wall/target movement keeps origin');
    await save(); const singleSaved = await snapshot();
    await capture(page, `${width}-single-smoke`); await previewMatches(await route(), 'wall-preview');
    await page.getByRole('button', { name: '이 도착점에 공략 추가', exact: true }).click(); await settle(page);
    assert.equal(await target.evaluate(el => el.tagName), 'SPAN'); assert.equal(await origin.count(), 0); assert.equal(await wall.count(), 0);
    assert.equal(await page.locator('#preview-url').inputValue(), ''); assert.equal(await page.locator('#preview-title').inputValue(), '');
    await save(); assert.match(await page.locator('[role="alert"]:not(#__next-route-announcer__)').innerText(), /출발/);
    await page.locator('#preview-title').fill('QA · 같은 도착점 새 스모크'); await page.locator('#preview-url').fill('https://example.com/shared-smoke');
    await editDestination.click(); await impact(2); await drag(target, { x: .56, y: .49 });
    await page.getByRole('button', { name: '출발 위치', exact: true }).click(); await place(.2, .8);
    await save(); assert.match(await page.locator('[role="alert"]:not(#__next-route-announcer__)').innerText(), /벽 끝/);
    await page.getByRole('button', { name: '벽 끝 위치', exact: true }).click(); await place(.78, .32);
    await options.click(); await page.getByRole('button', { name: '경유점', exact: true }).click(); await place(.3, .66);
    await page.getByRole('button', { name: '벽 튕김', exact: true }).click(); await place(.41, .58);
    await page.getByRole('button', { name: '마지막 지점 취소', exact: true }).click(); assert.equal(await page.locator('[data-route-point="bounce"]').count(), 0); await place(.41, .58);
    assert.deepEqual(await page.locator('[data-route-point]').evaluateAll(nodes => nodes.map(el => el.dataset.routePoint)), ['waypoint', 'bounce']);
    await save(); const addedRoute = await route(); assert.equal(await target.evaluate(el => el.tagName), 'SPAN');
    await capture(page, `${width}-new-shared-smoke`); await previewMatches(addedRoute, 'new-shared-preview');
    await back();
    const added = page.locator('[data-guide-id]').filter({ hasText: 'QA · 같은 도착점 새 스모크' }); assert.equal(await added.count(), 1);
    const newId = await added.getAttribute('data-guide-id'); assert.ok(newId);
    await open('preview-smoke-02'); const propagated = await snapshot(); near(propagated.destination, { x: .56, y: .49 }, 'new guide save propagates'); peerPreserved(propagated, singleSaved);
    await back(); await open(newId); assert.equal(await route(), addedRoute, 'new route survives list roundtrip');

    const pointerTypes = await page.evaluate(() => window.__editorPointerTypes || []); assert.ok(pointerTypes.includes(touch ? 'touch' : 'mouse'));
    await page.reload(); await page.getByLabel('예시 입장 코드', { exact: true }).fill('WRONG'); await page.getByRole('button', { name: '예시 화면 들어가기' }).click();
    assert.match(await page.locator('[role="alert"]:not(#__next-route-announcer__)').innerText(), /DEMO1234/);
    await page.getByLabel('예시 입장 코드', { exact: true }).fill('DEMO1234'); await page.getByRole('button', { name: '예시 화면 들어가기' }).click();
    assert.equal(await page.locator('[data-guide-id]').count(), 3); await open('preview-lineup-01');
    near(await point(target), { x: .64, y: .32 }, 'reload restores original destination');
    assert.deepEqual(await page.evaluate(() => Object.keys(localStorage).filter(key => key !== 'gameprobe:locale')), [], 'no data/auth storage');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    result.checks.push({ width, input: touch ? 'touch' : 'mouse', markerDrag: 'PASS', keyboard: 'PASS', escape: 'PASS', touchCancel: touch ? 'PASS' : 'not applicable', clamp: 'PASS', noExtraPoints: 'PASS', sharedCancel: 'PASS', invalidSaveIsolation: 'PASS', sharedSavePropagation: 'PASS', listRoundtrip: 'PASS', singleDestination: 'PASS', newSharedGuide: 'PASS', waypointBounce: 'PASS', wall: 'PASS', preview: 'PASS', reload: 'PASS', overflow: false, pointerTypes: [...new Set(pointerTypes)] });
  } finally { if (cdp) await cdp.detach(); }
}
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, hasTouch: width === 390 });
      await page.addInitScript(() => { localStorage.setItem('gameprobe:locale', 'ko'); window.__editorPointerTypes = []; document.addEventListener('pointerdown', event => { if (event.target.closest('[data-pin],[data-route-point]')) window.__editorPointerTypes.push(event.pointerType); }); });
      page.on('dialog', dialog => dialog.accept());
      page.on('pageerror', error => result.errors.push(error.message));
      page.on('request', request => { if (request.url().includes('/api/')) result.apiRequests.push(request.url()); });
      await page.goto(`${base}/admin/preview`);
      await page.getByLabel('예시 입장 코드', { exact: true }).fill('DEMO1234'); await page.getByRole('button', { name: '예시 화면 들어가기' }).click();
      await page.locator('[data-guide-id="preview-lineup-01"]').waitFor();
      await verify(page, width); await page.close();
    }
    assert.deepEqual(result.errors, []); assert.deepEqual(result.apiRequests, []);
  } catch (error) { result.failure = String(error); throw error; }
  finally { fs.writeFileSync(`${__dirname}/editor-results.json`, JSON.stringify(result, null, 2) + '\n'); await browser.close(); }
  console.log(JSON.stringify(result));
})().catch(error => { console.error(error); process.exitCode = 1; });
