const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const runtime = process.env.PLAYWRIGHT_MODULES || '/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright';
const { chromium } = require(runtime), { expect } = require(runtime + '/test');
const phase = process.argv[2];
if (!['before', 'after'].includes(phase)) throw new Error('Pass before or after');
const directory = path.resolve('docs/visual-qa/assets/TASK-FE-029');
const selectedOnly = process.argv[3] === 'selected-only';
const output = selectedOnly ? JSON.parse(fs.readFileSync(path.join(directory, `${phase}.json`), 'utf8')) : { phase, screenshots: [], checks: [], errors: [], consoleErrors: [], expectedApiErrors: [], requests: [] };
const initialCheckCount = output.checks.length;
function record(id, side = 'ATTACK', ability = 'sova-recon-bolt', start = { x: .2, y: .7 }, end = { x: .6, y: .3 }, map = 'ascent', agent = 'sova') {
  return { id, title: 'QA ' + id, description: 'Controlled status regression fixture', mapId: map, side, agentId: agent, difficulty: 'EASY', skillMarkers: [{ abilityId: ability, position: end }], agentMarkers: [{ position: start }], pathPoints: [start, { x: .45, y: .5 }, end], status: 'PUBLISHED', authorId: 'qa-fixture' };
}
const fixture = [record('qa-a'), record('qa-b', 'ATTACK', 'sova-recon-bolt', { x: .3, y: .6 }), record('qa-q', 'ATTACK', 'sova-shock-bolt', { x: .4, y: .65 }, { x: .7, y: .4 }), record('qa-def', 'DEFENSE', 'sova-recon-bolt', { x: .8, y: .2 }, { x: .3, y: .7 }), record('qa-split', 'ATTACK', 'omen-dark-cover', { x: .22, y: .66 }, { x: .67, y: .33 }, 'split', 'omen')];
function check(name, actual, expected) { assert.deepEqual(actual, expected, name); output.checks.push(name); }
function track(page, width, mode) {
  page.on('pageerror', error => output.errors.push({ width, mode, error: error.message }));
  page.on('console', message => {
    if (message.type() !== 'error') return;
    const data = { width, mode, text: message.text(), location: message.location() };
    if (message.text().includes('503') && message.location().url.includes('/api/lineups')) output.expectedApiErrors.push(data);
    else output.consoleErrors.push(data);
  });
}
async function context(browser, width, mode) {
  const ctx = await browser.newContext({ viewport: { width, height: 960 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  let release;
  const held = new Promise(resolve => { release = resolve; });
  await ctx.route('**/api/lineups', async route => {
    output.requests.push({ width, mode, method: route.request().method(), url: route.request().url() });
    if (mode === 'loading') await held;
    await route.fulfill({ status: mode === 'failure' ? 503 : 200, contentType: 'application/json', body: JSON.stringify(mode === 'failure' ? { error: 'CONTROLLED_SERVER_DETAIL_DO_NOT_DISPLAY' } : mode === 'empty' ? [] : fixture), headers: { 'access-control-allow-origin': '*' } }).catch(() => {});
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(15000);
  track(page, width, mode);
  return { ctx, page, release };
}
async function go(page, route, mode) {
  const response = await page.goto('http://localhost:3000' + route, { waitUntil: mode === 'loading' ? 'domcontentloaded' : 'networkidle', timeout: 45000 });
  check(`${route} ${mode}: HTTP 200`, response.status(), 200);
  await expect(page.getByRole('navigation', { name: 'Valorant navigation', exact: true })).toBeVisible();
  if (route === '/lineups') {
    const notice = page.locator('aside[role="status"]').first();
    if (mode === 'loading') await expect(notice).toContainText(/불러오/);
    else if (mode === 'failure') await expect(notice).toContainText(/데모|예시/);
    else await expect(notice).toContainText(/공개|자료/);
  }
}
async function capture(page, width, name) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.race([Promise.all([...document.images].filter(image => image.getBoundingClientRect().top < innerHeight).map(image => image.decode().catch(() => {}))), new Promise(resolve => setTimeout(resolve, 3000))]);
    window.scrollTo(0, 0);
  });
  const facts = await page.evaluate(() => {
    const box = element => { const r = element.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; };
    return {
      overflow: document.documentElement.scrollWidth - innerWidth,
      statuses: [...document.querySelectorAll('[role="status"], .strats-map-empty, .smoke-selection-hint')].map(element => ({ text: element.textContent, role: element.getAttribute('role'), live: element.getAttribute('aria-live'), atomic: element.getAttribute('aria-atomic'), ...box(element) })),
      mapCards: document.querySelectorAll('.strats-map-card').length,
      guideCards: document.querySelectorAll('.smoke-guide-card').length,
      rotation: [...document.querySelectorAll('.strats-map-image-rotated')].map(element => getComputedStyle(element).transform),
      pins: [...document.querySelectorAll('.strats-map-pin')].map(element => ({ label: element.getAttribute('aria-label'), class: element.className, left: element.style.left, top: element.style.top })),
      paths: [...document.querySelectorAll('.strats-path-overlay polyline')].map(element => element.getAttribute('points')),
      lines: [...document.querySelectorAll('.smoke-wall-line')].map(element => ['x1', 'y1', 'x2', 'y2'].map(key => element.getAttribute(key))),
      detailLink: document.querySelector('.strats-open-detail')?.getAttribute('href') || null,
      nav: [...document.querySelector('nav[aria-label="Valorant navigation"]').children[1].children].map(element => ({ label: element.textContent, current: element.getAttribute('aria-current'), href: element.getAttribute('href') })),
    };
  });
  check(`${width}px ${name}: no global overflow`, facts.overflow, 0);
  const file = `${phase}-${width}-${name}.png`;
  await page.screenshot({ path: path.join(directory, file), fullPage: !['home', 'profile'].includes(name), animations: 'disabled' });
  output.screenshots = output.screenshots.filter(record => record.width !== width || record.name !== name);
  output.screenshots.push({ name, width, file, ...facts });
  console.log(file);
}
(async () => {
  fs.mkdirSync(directory, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [1440, 820, 390]) {
      for (const mode of selectedOnly ? ['success'] : ['loading', 'success', 'empty', 'failure']) {
        const { ctx, page, release } = await context(browser, width, mode);
        await go(page, '/lineups', mode);
        if (!selectedOnly) await capture(page, width, `lineups-${mode}`);
        if (mode === 'success') {
          await page.getByRole('button', { name: 'Ascent', exact: true }).click();
          await page.getByRole('button', { name: 'Sova', exact: true }).click();
          check(`${width}px: attack rotation`, await page.locator('.strats-map-image-rotated').evaluate(element => getComputedStyle(element).transform), 'matrix(0, 1, -1, 0, 0, 0)');
          await page.locator('.strats-skill-pin').click();
          check(`${width}px: two same-ability candidates`, await page.locator('.strats-agent-pin').count(), 2);
          await page.locator('.strats-agent-pin').nth(1).click();
          check(`${width}px: selected path`, await page.locator('.strats-path-overlay').count(), 1);
          await capture(page, width, 'lineups-selected');
          if (!selectedOnly) {
            await page.getByRole('button', { name: 'C', exact: true }).click();
            check(`${width}px: unmatched filter has no pin`, await page.locator('.strats-map-pin').count(), 0);
            await capture(page, width, 'lineups-filter-empty');
          }
        }
        release();
        await ctx.close();
      }
      if (selectedOnly) continue;
      const { ctx, page } = await context(browser, width, 'smoke');
      await go(page, '/smokes', 'smoke');
      await page.getByRole('button', { name: 'Ascent 스모크 보기', exact: true }).click();
      check(`${width}px: smoke selection initially empty`, await page.locator('.smoke-path-overlay').count(), 0);
      await capture(page, width, 'smokes-example');
      await page.locator('.smoke-common-pin').click();
      check(`${width}px: smoke selected path`, await page.locator('.smoke-path-overlay').count(), 1);
      await capture(page, width, 'smokes-selected');
      await page.getByRole('button', { name: 'B', exact: true }).click();
      check(`${width}px: smoke unmatched filter`, await page.locator('.smoke-guide-card').count(), 0);
      await capture(page, width, 'smokes-filter-empty');
      if (width === 1440) {
        for (const [name, route] of [['home', '/'], ['profile', '/players/ied-agent-allen']]) {
          await go(page, route, 'regression');
          await capture(page, width, name);
        }
      }
      await ctx.close();
    }
    check('No page errors', output.errors, []);
    check('No unexpected console errors', output.consoleErrors, []);
    output.status = 'PASS';
    if (selectedOnly) output.updates = [...(output.updates || []), 'Refreshed selected lineups at 1440/820/390px after removing optional path visibility claims.'];
  } catch (error) {
    output.status = 'FAIL'; output.failure = error.stack; process.exitCode = 1;
  } finally {
    fs.writeFileSync(path.join(directory, `${phase}.json`), JSON.stringify(output, null, 2) + '\n');
    await browser.close();
    console.log(JSON.stringify({ phase, status: output.status, screenshots: output.screenshots.length, checks: output.checks.length, checksAdded: output.checks.length - initialCheckCount, errors: output.errors, consoleErrors: output.consoleErrors, failure: output.failure }));
  }
})();
