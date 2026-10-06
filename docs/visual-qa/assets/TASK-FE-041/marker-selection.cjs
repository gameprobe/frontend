/** TASK-FE-041: browser-only fixtures. Every API request is intercepted and writes are blocked. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE);
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const mode = process.argv[2] || 'after';
const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
const out = process.env.OUTPUT_DIR ? path.resolve(process.env.OUTPUT_DIR) : __dirname;
const longAbility = '기존-등록-자료의-아주-긴-스킬-이름으로-줄바꿈과-선택을-확인하는-세번째-스킬';
const firstUrl = 'https://example.com/qa-skill-1';
const secondUrl = 'https://example.com/qa-skill-2';
const results = [], pageErrors = [], blockedWrites = [];
function fixture(side = 'ATTACK', count = 3) {
  return { id: `qa-overlapping-${side.toLowerCase()}-${count}`, title: '겹친 스킬 자료 선택 검증', description: 'DB에 쓰지 않는 합성 브라우저 응답', mapId: 'ascent', side, agentId: 'sova', difficulty: 'MEDIUM', status: 'PUBLISHED', authorId: 'synthetic-qa', createdAt: '', updatedAt: '', registration: null, agentMarkers: [{ position: { x: .25, y: .8 } }], pathPoints: count > 1 ? [{ x: .4, y: .6 }, { x: .5, y: .5 }] : [], skillMarkers: [
    { abilityId: 'sova-recon-bolt', position: { x: .5, y: .5 }, youtubeUrl: firstUrl, order: 0 },
    { abilityId: 'sova-recon-bolt', position: { x: .5, y: .5 }, youtubeUrl: secondUrl, order: 1 },
    { abilityId: longAbility, position: { x: .502, y: .498 }, youtubeUrl: null, order: 2 },
  ].slice(0, count) };
}
const orient = (point, side) => side === 'ATTACK' ? { x: 1 - point.y, y: point.x } : { x: point.y, y: 1 - point.x };
const record = (name, details = {}) => { results.push({ name, status: 'PASS', ...details }); console.log(`PASS ${name}`); };
async function contextFor(browser, width, height = 1000) {
  const context = await browser.newContext({ viewport: { width, height }, isMobile: width < 700, hasTouch: width < 700 });
  const state = { data: fixture() };
  await context.route('**/api/**', route => {
    if (route.request().method() !== 'GET') { blockedWrites.push({ method: route.request().method(), pathname: new URL(route.request().url()).pathname }); return route.abort(); }
    return route.fulfill({ json: state.data });
  });
  const page = await context.newPage(); page.setDefaultTimeout(15000);
  page.on('pageerror', error => pageErrors.push({ width, error: error.message }));
  const open = async data => { state.data = data; await page.goto(`${frontend}/lineups/${data.id}`); await page.getByRole('heading', { name: data.title, exact: true }).waitFor(); };
  return { context, page, open };
}
async function checkPage(page) {
  await page.evaluate(async () => { await Promise.all(Array.from(document.images, image => { image.loading = 'eager'; return image.decode().catch(() => undefined); })); });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'page horizontal overflow');
  assert.deepEqual(await page.locator('img').evaluateAll(images => images.filter(image => !image.naturalWidth).map(image => image.getAttribute('src'))), [], 'broken images');
}
async function captureMap(page, filename) {
  const viewport = page.viewportSize();
  const panel = page.locator('.lineup-map-panel');
  const height = Math.ceil((await panel.boundingBox()).height);
  // Keep the full panel below the sticky navigation without hiding any product UI.
  await page.setViewportSize({ width: viewport.width, height: Math.max(viewport.height, height + 300) });
  await panel.evaluate(element => window.scrollTo(0, window.scrollY + element.getBoundingClientRect().top - 160));
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  assert.ok((await panel.boundingBox()).y >= 150, 'map capture clears the sticky navigation');
  await panel.screenshot({ path: path.join(out, filename) });
  await page.setViewportSize(viewport);
}
async function choiceAppearance(choices) {
  const styles = await choices.evaluateAll(elements => elements.map(element => {
    const style = getComputedStyle(element);
    const normalizeColor = variable => { const probe = document.createElement('span'); probe.style.color = style.getPropertyValue(variable).trim(); return probe.style.color; };
    return { borderWidth: style.borderTopWidth, borderStyle: style.borderTopStyle, borderColor: style.borderTopColor, background: style.backgroundColor, expectedBackground: normalizeColor('--raised'), expectedBorder: normalizeColor(element.getAttribute('aria-pressed') === 'true' ? '--gold' : '--line') };
  }));
  for (const style of styles) {
    assert.equal(style.borderWidth, '1px', 'selection control border survives shell reset');
    assert.equal(style.borderStyle, 'solid');
    assert.equal(style.background, style.expectedBackground, 'selection control keeps its raised surface');
    assert.equal(style.borderColor, style.expectedBorder, 'selection control keeps normal/selected border colors');
  }
  assert.notEqual(styles[1].borderColor, styles[0].borderColor, 'selected choice has a distinct border');
  return styles;
}
async function geometry(page, data) {
  const actual = await page.locator('.lineup-skill-marker').evaluateAll(elements => elements.map(element => ({ left: element.style.left, top: element.style.top })));
  assert.deepEqual(actual, data.skillMarkers.map(marker => { const point = orient(marker.position, data.side); return { left: `${point.x * 100}%`, top: `${point.y * 100}%` }; }));
  const raw = data.skillMarkers.length === 1 ? [data.agentMarkers[0].position, ...data.pathPoints, data.skillMarkers[0].position] : data.pathPoints;
  const expected = raw.map(point => { const next = orient(point, data.side); return `${next.x * 100},${next.y * 100}`; }).join(' ');
  const route = page.locator('.lineup-path-overlay polyline');
  assert.equal(await route.count(), raw.length > 1 ? 1 : 0);
  if (raw.length > 1) assert.equal(await route.getAttribute('points'), expected);
  return { markerPositions: actual, pathPoints: expected };
}
async function expectSelected(page, index) {
  const region = page.getByRole('region', { name: '스킬 자료 선택', exact: true });
  const choices = region.getByRole('button'); const markers = page.locator('.lineup-skill-marker');
  await page.waitForFunction(selected => {
    const controls = Array.from(document.querySelector('[aria-label="스킬 자료 선택"]').querySelectorAll('button'));
    return controls.every((button, i) => button.getAttribute('aria-pressed') === String(i === selected));
  }, index);
  for (let i = 0; i < 3; i++) {
    assert.equal(await choices.nth(i).getAttribute('aria-pressed'), String(i === index));
    assert.equal(await markers.nth(i).getAttribute('aria-pressed'), String(i === index));
  }
  const media = page.locator('#lineup-media-panel');
  assert.equal(await media.locator('h2').innerText(), (await choices.nth(index).getAttribute('aria-label')).replace(/ 자료 보기$/u, ''));
  if (index === 2) {
    await media.getByText('선택한 스킬에는 등록된 영상이 없습니다.', { exact: true }).waitFor();
    assert.equal(await media.getByRole('link').count(), 0);
    assert.equal(await media.locator('video,iframe,img').count(), 0);
  } else {
    const link = media.getByRole('link', { name: '원본 자료 새 탭에서 보기 ↗' }); await link.waitFor();
    assert.equal(await link.getAttribute('href'), index === 0 ? firstUrl : secondUrl);
  }
  assert.ok((await page.locator('.lineup-selected-ability').innerText()).startsWith(`선택한 스킬 ${index + 1} ·`));
}
async function pressChoice(page, width, index) {
  const choice = page.getByRole('region', { name: '스킬 자료 선택', exact: true }).getByRole('button').nth(index);
  if (width < 700) await choice.tap(); else await choice.click();
  await expectSelected(page, index);
}
async function isTopMarker(page, index) {
  await page.locator('.lineup-map-canvas').scrollIntoViewIfNeeded();
  return page.locator('.lineup-skill-marker').nth(index).evaluate(element => {
    const box = element.getBoundingClientRect(); return document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)?.closest('.lineup-skill-marker') === element;
  });
}
async function before(browser) {
  for (const width of [1440, 390]) {
    const { context, page, open } = await contextFor(browser, width); const data = fixture(); await open(data); await checkPage(page);
    assert.equal(await page.getByRole('region', { name: '스킬 자료 선택', exact: true }).count(), 0);
    const positions = await geometry(page, data);
    await captureMap(page, `before-${width}-map.png`);
    record(`${width}px before: coincident skills have no separate selection controls`, positions);
    await context.close();
  }
}
async function after(browser) {
  for (const width of [1440, 390, 320]) {
    const { context, page, open } = await contextFor(browser, width);
    for (const side of ['ATTACK', 'DEFENSE']) {
      const data = fixture(side); await open(data);
      const region = page.getByRole('region', { name: '스킬 자료 선택', exact: true }); await region.waitFor();
      const choices = region.getByRole('button'); const markers = page.locator('.lineup-skill-marker');
      assert.equal(await choices.count(), 3);
      assert.equal(await choices.nth(0).getAttribute('aria-label'), '스킬 1 · Recon Bolt 자료 보기');
      assert.equal(await choices.nth(1).getAttribute('aria-label'), '스킬 2 · Recon Bolt 자료 보기');
      for (let index = 0; index < 3; index++) assert.equal(await choices.nth(index).getAttribute('aria-controls'), 'lineup-media-panel');
      assert.equal(await page.locator('#lineup-media-panel').count(), 1);
      assert.equal(await region.evaluate(element => Boolean(document.querySelector('.lineup-map-legend').compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING)), true);
      assert.equal(await region.evaluate(element => element.parentElement.matches('.lineup-detail-sidebar') && element.nextElementSibling?.id === 'lineup-media-panel'), true, 'selector is directly above media within sidebar');
      if (width < 700) assert.ok((await region.boundingBox()).y >= (await page.locator('.lineup-map-panel').boundingBox()).y + (await page.locator('.lineup-map-panel').boundingBox()).height, 'mobile selector follows map visually');
      for (let index = 0; index < 3; index++) {
        assert.equal(await choices.nth(index).isEnabled(), true, 'missing media remains selectable');
        assert.equal(await choices.nth(index).getByText('자료 없음', { exact: true }).count(), index === 2 ? 1 : 0);
      }
      assert.equal(await choices.nth(2).evaluate(element => (element.getAttribute('aria-describedby') || '').split(/\s+/u).some(id => document.getElementById(id)?.textContent === '자료 없음')), true, 'missing media badge is an accessible description');
      const initial = await geometry(page, data); await expectSelected(page, 0);
      for (const selected of [1, 2, 0]) {
        await pressChoice(page, width, selected); assert.deepEqual(await geometry(page, data), initial);
        assert.equal(await markers.nth(selected).evaluate(element => getComputedStyle(element).zIndex), '4');
        assert.equal(await isTopMarker(page, selected), true, 'selected marker is visible above identical/nearby markers');
      }
      record(`${width}px ${side}: ${width < 700 ? 'touch' : 'mouse'} selects duplicate and nearby skills with exact media`, { ...initial, choices: 3 });
      // Ordinary buttons retain native Tab / Shift+Tab / Enter / Space navigation.
      await choices.nth(0).focus(); await page.keyboard.press('Tab');
      assert.equal(await choices.nth(1).evaluate(element => document.activeElement === element), true);
      await page.keyboard.press('Enter'); await expectSelected(page, 1);
      await page.keyboard.press('Tab'); assert.equal(await choices.nth(2).evaluate(element => document.activeElement === element), true);
      await page.keyboard.press('Space'); await expectSelected(page, 2);
      await page.keyboard.press('Shift+Tab'); assert.equal(await choices.nth(1).evaluate(element => document.activeElement === element), true);
      // Focus a covered map marker directly as a keyboard user can through tab order.
      await markers.nth(0).focus();
      assert.equal(await markers.nth(0).evaluate(element => element.matches(':focus-visible')), true);
      assert.equal(await markers.nth(0).evaluate(element => getComputedStyle(element).zIndex), '5');
      assert.equal(await isTopMarker(page, 0), true);
      await page.keyboard.press('Enter'); await expectSelected(page, 0);
      await markers.nth(1).focus(); await page.keyboard.press('Space'); await expectSelected(page, 1);
      assert.deepEqual(await geometry(page, data), initial);
      record(`${width}px ${side}: keyboard controls and map selection synchronize, focused hidden marker comes forward`);
      await pressChoice(page, width, 1); await checkPage(page);
      assert.deepEqual(await choices.evaluateAll(elements => elements.filter(element => element.scrollWidth > element.clientWidth + 1 || element.getBoundingClientRect().height < 44).map(element => ({ label: element.getAttribute('aria-label'), width: element.clientWidth, contentWidth: element.scrollWidth }))), [], 'long skill names wrap inside full-sized targets');
      const styles = await choiceAppearance(choices);
      if (side === 'ATTACK' && width !== 320) await captureMap(page, `after-${width}-map.png`);
      record(`${width}px ${side}: long name fits, choice surfaces remain visible, no image or horizontal layout errors`, { choiceStyles: styles });
    }
    for (const count of [0, 1]) {
      const data = fixture('ATTACK', count); await open(data); await checkPage(page); await geometry(page, data);
      assert.equal(await page.getByRole('region', { name: '스킬 자료 선택', exact: true }).count(), 0);
      assert.equal(await page.locator('.lineup-skill-marker').count(), count);
      assert.equal(await page.locator('#lineup-media-panel h2').innerText(), '자료 가이드');
      if (count === 0) await page.getByText('이 공략에는 표시할 수 있는 자료가 없습니다.', { exact: true }).waitFor();
      else {
        const marker = page.locator('.lineup-skill-marker'); if (width < 700) await marker.tap(); else await marker.click();
        assert.equal(await page.getByRole('link', { name: '원본 자료 새 탭에서 보기 ↗' }).getAttribute('href'), firstUrl);
      }
      record(`${width}px ${count}-marker detail retains existing UI and media`);
    }
    await context.close();
  }
  for (const [width, height] of [[1366, 768], [390, 844]]) {
    const { context, page, open } = await contextFor(browser, width, height);
    await open(fixture()); await checkPage(page);
    const region = page.getByRole('region', { name: '스킬 자료 선택', exact: true });
    await region.evaluate(element => window.scrollTo(0, window.scrollY + element.getBoundingClientRect().top - 150));
    await pressChoice(page, width, 1);
    const visible = [];
    for (const element of [region.getByRole('button').nth(1), page.locator('#lineup-media-panel h2')]) {
      visible.push(await element.evaluate(element => {
        const box = element.getBoundingClientRect();
        const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
        return { top: box.top, bottom: box.bottom, withinViewport: box.top >= 0 && box.bottom <= innerHeight, unoccluded: element === hit || element.contains(hit) };
      }));
    }
    assert.ok(visible.every(element => element.withinViewport && element.unoccluded), 'selected button and media heading are simultaneously visible');
    await page.screenshot({ path: path.join(__dirname, `usability-after-${width}.png`) });
    record(`${width}x${height}: selected choice and matching media heading are visible together`, { visible });
    await context.close();
  }
}
(async () => {
  assert.ok(['before', 'after'].includes(mode)); assert.match(frontend, /^http:\/\/(localhost|127\.0\.0\.1):\d+$/u); fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  try { if (mode === 'before') await before(browser); else await after(browser); assert.deepEqual(pageErrors, []); assert.deepEqual(blockedWrites, []); record('zero page exceptions, broken images, horizontal overflow or API writes'); }
  finally { await browser.close(); fs.writeFileSync(path.join(out, `${mode}-results.json`), JSON.stringify({ checks: results, pageErrors, blockedWrites }, null, 2)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
