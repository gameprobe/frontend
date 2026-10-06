const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const phase = process.argv[2];
assert.ok(['before', 'after'].includes(phase));
const result = { phase, screens: [], checks: [], errors: [], apiRequests: [] };
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:3000';
async function capture(page, name) {
  await page.evaluate(async () => { await document.fonts.ready; window.scrollTo({ top: 0, behavior: 'instant' }); await new Promise(requestAnimationFrame); await new Promise(requestAnimationFrame); });
  const file = `shared-destination-${phase}-${name}.png`;
  await page.screenshot({ path: `${__dirname}/${file}`, fullPage: true, animations: 'disabled' });
  result.screens.push(file);
}
async function captureBefore(page, width) {
  await capture(page, `${width}-shared-editor`);
  await page.getByRole('complementary', { name: '예시 자료 목록' }).getByRole('button', { name: /^스모크/ }).click();
  await page.locator('[data-guide-id="preview-smoke-02"]').click();
  await capture(page, `${width}-single-editor`);
  result.checks.push({ width, capture: 'PASS' });
}
function near(actual, expected, label) {
  assert.ok(Math.abs(actual.x - expected.x) < .006 && Math.abs(actual.y - expected.y) < .006, `${label}: ${JSON.stringify(actual)} expected ${JSON.stringify(expected)}`);
}
async function verifyAfter(page, width) {
  const touch = width === 390;
  const cdp = touch ? await page.context().newCDPSession(page) : null;
  const canvas = page.locator('[class*="mapCanvas"]');
  const target = page.locator('[data-pin="도착"]');
  const edit = page.getByRole('button', { name: '도착점 수정', exact: true });
  const cancel = page.getByRole('button', { name: '도착점 수정 취소', exact: true });
  const save = () => page.getByRole('button', { name: '예시 목록에 저장', exact: true }).click();
  const guide = id => page.locator(`[data-guide-id="${id}"]`);
  const library = page.getByRole('complementary', { name: '예시 자료 목록' });
  const point = locator => locator.evaluate(el => ({ x: parseFloat(el.style.left) / 100, y: parseFloat(el.style.top) / 100 }));
  const settle = () => page.evaluate(async () => { await new Promise(requestAnimationFrame); await new Promise(requestAnimationFrame); });
  const kind = value => library.getByRole('button', { name: value === 'lineup' ? /^라인업/ : /^스모크/ }).click();
  async function snapshot() {
    return {
      destination: await point(target), destinationId: await page.locator('#preview-destination').inputValue(),
      origin: await point(page.locator('[data-pin="시작"]')),
      path: await page.locator('[data-route-point]').evaluateAll(nodes => nodes.map(el => ({ kind: el.dataset.routePoint, index: el.dataset.pointIndex, x: parseFloat(el.style.left) / 100, y: parseFloat(el.style.top) / 100 }))),
      wall: await page.locator('[data-pin="벽 끝"]').count() ? await point(page.locator('[data-pin="벽 끝"]')) : null,
      media: await page.locator('#preview-url').inputValue(), title: await page.locator('#preview-title').inputValue()
    };
  }
  function preserved(actual, expected, label) {
    for (const key of ['origin', 'path', 'wall', 'media', 'destinationId']) assert.deepEqual(actual[key], expected[key], `${label}: ${key} preserved`);
  }
  async function dragDestination(next) {
    assert.equal(await target.evaluate(el => el.tagName), 'BUTTON');
    await settle(); // Let validation's scheduled focus finish before positioning the map.
    await canvas.evaluate(el => el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }));
    await settle();
    const bounds = await canvas.boundingBox(); const marker = await target.boundingBox(); assert.ok(bounds && marker);
    const from = { x: marker.x + marker.width / 2, y: marker.y + marker.height / 2 };
    const to = { x: bounds.x + bounds.width * next.x, y: bounds.y + bounds.height * next.y };
    assert.equal(await target.evaluate((el, p) => el.contains(document.elementFromPoint(p.x, p.y)), from), true);
    if (touch) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...from, id: 1, radiusX: 3, radiusY: 3, force: 1 }] });
      for (let i = 1; i <= 8; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from.x + (to.x - from.x) * i / 8, y: from.y + (to.y - from.y) * i / 8, id: 1, radiusX: 3, radiusY: 3, force: 1 }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    } else { await page.mouse.move(from.x, from.y); await page.mouse.down(); await page.mouse.move(to.x, to.y, { steps: 8 }); await page.mouse.up(); }
    await settle(); near(await point(target), next, 'destination drag');
  }
  async function place(x, y) {
    const button = page.getByRole('button', { name: '지도 위치 지정', exact: true });
    await canvas.evaluate(el => el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }));
    await settle(); const b = await button.boundingBox(); assert.ok(b);
    await button.click({ position: { x: b.width * x, y: b.height * y } });
  }
  async function impact(count) {
    const notice = page.locator('[class*="destinationEdit"]');
    assert.match(await notice.innerText(), new RegExp(`${count}개`));
    assert.match(await notice.innerText(), /예시 목록에 저장할 때 반영/);
  }
  const peers = {};
  for (const id of ['preview-lineup-01', 'preview-lineup-02', 'preview-lineup-03']) { await guide(id).click(); peers[id] = await snapshot(); }
  await guide('preview-lineup-01').click();
  assert.equal(await target.evaluate(el => el.tagName), 'SPAN');
  await capture(page, `${width}-shared-locked`);
  await page.locator('#preview-title').fill('QA · 취소해도 유지되는 제목');
  await edit.click(); await impact(3); await dragDestination({ x: .73, y: .25 });
  await capture(page, `${width}-shared-staged`);
  await cancel.click(); near(await point(target), peers['preview-lineup-01'].destination, 'cancel restores destination');
  assert.equal(await page.locator('#preview-title').inputValue(), 'QA · 취소해도 유지되는 제목');
  assert.equal(await target.evaluate(el => el.tagName), 'SPAN');
  await save(); peers['preview-lineup-01'].title = 'QA · 취소해도 유지되는 제목';

  // A failed save must not update any peer; abandoning the draft removes staged changes.
  await edit.click(); await dragDestination({ x: .73, y: .25 });
  await page.locator('#preview-url').fill('not a url'); await save();
  assert.equal(await page.locator('[role="alert"]:not(#__next-route-announcer__)').count(), 1);
  near(await point(target), { x: .73, y: .25 }, 'failed save retains current staged draft');
  await dragDestination({ x: .77, y: .28 });
  await guide('preview-lineup-02').click();
  near(await point(target), peers['preview-lineup-02'].destination, 'failed save leaves peer untouched');
  await guide('preview-lineup-01').click();
  near(await point(target), peers['preview-lineup-01'].destination, 'abandoned stage not saved');
  assert.equal(await target.evaluate(el => el.tagName), 'SPAN', 'opening guide resets activation');

  await edit.click(); await impact(3); await dragDestination({ x: .73, y: .25 });
  await save(); assert.equal(await target.evaluate(el => el.tagName), 'SPAN', 'save resets shared edit activation');
  for (const id of Object.keys(peers)) {
    await guide(id).click(); const current = await snapshot();
    near(current.destination, { x: .73, y: .25 }, `${id} saved destination propagation`);
    preserved(current, peers[id], id); assert.equal(current.title, peers[id].title);
  }
  await guide('preview-lineup-01').click(); await capture(page, `${width}-shared-saved`);

  // Map and destination changes revoke shared edit activation.
  await edit.click(); await page.locator('#preview-map').selectOption('bind');
  assert.equal(await cancel.count(), 0); assert.equal(await target.count(), 0);
  await guide('preview-lineup-02').click(); assert.equal(await target.evaluate(el => el.tagName), 'SPAN');
  await edit.click(); const originalId = peers['preview-lineup-02'].destinationId;
  await page.locator('#preview-destination').selectOption(''); assert.equal(await cancel.count(), 0);
  await page.locator('#preview-destination').selectOption(originalId);
  assert.equal(await target.evaluate(el => el.tagName), 'SPAN', 'destination selection resets activation');
  await guide('preview-lineup-01').click();

  // Detach changes this guide only, leaving the former destination group intact.
  await page.locator('#preview-destination').selectOption('');
  await page.locator('#preview-destination-name').fill('QA · 별도 도착점');
  await place(.82, .22); await save();
  assert.equal(await target.evaluate(el => el.tagName), 'BUTTON', 'single saved destination stays editable');
  assert.notEqual(await page.locator('#preview-destination').inputValue(), originalId);
  for (const id of ['preview-lineup-02', 'preview-lineup-03']) {
    await guide(id).click(); near(await point(target), { x: .73, y: .25 }, 'detaching leaves other guides untouched');
    assert.equal(await target.evaluate(el => el.tagName), 'SPAN');
  }

  await kind('smoke'); await guide('preview-smoke-02').click();
  const single = await snapshot(); assert.equal(await target.evaluate(el => el.tagName), 'BUTTON', 'single saved smoke can move immediately');
  assert.equal(await edit.count(), 0);
  await dragDestination({ x: .49, y: .5 });
  preserved(await snapshot(), single, 'single smoke target move'); await save();
  assert.equal(await target.evaluate(el => el.tagName), 'BUTTON');
  await dragDestination({ x: .52, y: .53 }); await save();
  const singleSaved = await snapshot(); await capture(page, `${width}-single-editable`);
  await page.getByRole('button', { name: '이 도착점에 공략 추가', exact: true }).click();
  assert.equal(await target.evaluate(el => el.tagName), 'SPAN', 'new guide makes the sole destination shared');
  await edit.click(); await impact(2);
  await page.locator('#preview-title').fill('QA · 같은 도착점 새 스모크');
  await page.locator('#preview-url').fill('https://example.com/shared-smoke');
  await dragDestination({ x: .56, y: .49 });
  await page.getByRole('button', { name: '출발 위치', exact: true }).click(); await place(.2, .8); await place(.78, .32);
  await capture(page, `${width}-new-shared-draft`);
  await save(); assert.equal(await target.evaluate(el => el.tagName), 'SPAN');
  const newId = await library.locator('[data-guide-id][aria-pressed="true"]').getAttribute('data-guide-id');
  assert.ok(newId && newId !== 'preview-smoke-02');
  await guide('preview-smoke-02').click(); const propagatedSmoke = await snapshot();
  near(propagatedSmoke.destination, { x: .56, y: .49 }, 'new guide save propagates destination to existing guide');
  preserved(propagatedSmoke, singleSaved, 'existing smoke details preserved');
  await guide(newId).click(); near(await point(target), { x: .56, y: .49 }, 'new shared guide destination');
  await page.getByRole('button', { name: '미리보기', exact: true }).click();
  assert.equal(await page.locator('button[data-pin]').count(), 0);
  await capture(page, `${width}-shared-preview`);
  await page.getByRole('button', { name: '편집으로 돌아가기', exact: true }).click();
  assert.equal(await target.evaluate(el => el.tagName), 'SPAN');

  await page.locator('summary').filter({ hasText: '설명·자료 형식·기타 설정' }).click();
  const selects = await page.locator('select').evaluateAll(nodes => nodes.filter(el => el.getClientRects().length).map(el => {
    const style = getComputedStyle(el); const rect = el.getBoundingClientRect();
    return { id: el.id || el.getAttribute('aria-label'), appearance: style.appearance, background: style.backgroundImage, position: style.backgroundPosition, paddingRight: parseFloat(style.paddingRight), width: rect.width };
  }));
  assert.ok(selects.length >= 10);
  for (const select of selects) { assert.equal(select.appearance, 'none', `${select.id} native arrow hidden`); assert.notEqual(select.background, 'none', `${select.id} custom arrow present`); assert.ok(select.paddingRight >= 32, `${select.id} text padding protects arrow`); assert.ok(select.width > 64); }
  await capture(page, `${width}-select-spacing`);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.reload(); await page.getByLabel('예시 입장 코드', { exact: true }).fill('DEMO1234');
  await page.getByRole('button', { name: '예시 화면 들어가기' }).click();
  near(await point(target), peers['preview-lineup-01'].destination, 'reload restores original examples');
  assert.equal(await library.locator('[data-guide-id]').count(), 3);
  assert.deepEqual(await page.evaluate(() => Object.keys(localStorage).filter(key => key !== 'gameprobe:locale')), [], 'no real auth or prototype storage');
  result.checks.push({ width, input: touch ? 'touch' : 'mouse', sharedCount: 3, cancelPreservesOtherEdits: 'PASS', invalidSaveIsolation: 'PASS', savePropagation: 'PASS', peerFields: 'PASS', activationReset: 'PASS', detach: 'PASS', soleDestination: 'PASS', newGuideCount: 2, newGuidePropagation: 'PASS', preview: 'PASS', reload: 'PASS', selects, overflow: false });
  if (cdp) await cdp.detach();
}
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, hasTouch: width === 390 });
      await page.addInitScript(() => localStorage.setItem('gameprobe:locale', 'ko'));
      page.on('dialog', dialog => dialog.accept());
      page.on('pageerror', error => result.errors.push(error.message));
      page.on('request', request => { if (request.url().includes('/api/')) result.apiRequests.push(request.url()); });
      await page.goto(`${base}/admin/preview`);
      await page.getByLabel('예시 입장 코드', { exact: true }).fill('DEMO1234');
      await page.getByRole('button', { name: '예시 화면 들어가기' }).click();
      await page.getByRole('heading', { name: '전술 자료 관리', exact: true }).waitFor();
      await page.waitForFunction(() => [...document.images].filter(image => image.closest('[class*="mapCanvas"]')).every(image => image.complete && image.naturalWidth > 0));
      if (phase === 'before') await captureBefore(page, width);
      else await verifyAfter(page, width);
      await page.close();
    }
    assert.deepEqual(result.errors, []);
    assert.deepEqual(result.apiRequests, []);
  } catch (error) { result.failure = String(error); throw error; }
  finally { fs.writeFileSync(`${__dirname}/shared-destination-${phase}.json`, JSON.stringify(result, null, 2) + '\n'); await browser.close(); }
  console.log(JSON.stringify(result));
})().catch(error => { console.error(error); process.exitCode = 1; });
