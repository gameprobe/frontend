/* TASK-FE-025: PLAYWRIGHT_MODULES may be a package path or node_modules directory. */
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const moduleRoot = process.env.PLAYWRIGHT_MODULES;
const playwright = moduleRoot ? require(path.basename(moduleRoot) === 'playwright' ? moduleRoot : path.join(moduleRoot, 'playwright')) : require('playwright');
const phase = process.argv[2];
assert.ok(['before', 'after'].includes(phase), 'Expected before or after');
const output = __dirname;
const baseURL = process.env.BASE_URL || 'http://localhost:3000';
const routes = [
  ['connect', '/connect', 'support'],
  ['privacy', '/privacy', 'support'],
  ['terms', '/terms', 'support'],
  ['missing-legacy-match', '/matches/fe025-missing', 'support'],
  ['missing-synthetic-match', '/matches/demo-match-missing', 'support'],
  ['missing-player', '/players/fe025-missing', 'support'],
  ['home', '/', 'regression'],
  ['legacy-profile', '/players/ied-agent-allen', 'regression'],
  ['new-profile', '/players/demo-player-01', 'regression'],
  ['synthetic-detail', '/matches/demo-match-001', 'regression'],
];
const preservation = new Set(['connect', 'privacy', 'terms']);
const result = { phase, viewport: {}, checks: [], errors: [], comparison: {} };
const check = (label, actual, expected) => { assert.deepEqual(actual, expected, label); result.checks.push(label); };
async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (const image of document.images) image.loading = 'eager';
    await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
  });
  await page.mouse.move(0, 0);
  await page.waitForTimeout(160);
}
async function regressionSnapshot(page) {
  return page.locator('main').evaluate(root => [root, ...root.querySelectorAll('*')].map(el => {
    const r = el.getBoundingClientRect(), s = getComputedStyle(el);
    return { tag: el.tagName, text: el.children.length ? null : el.textContent,
      box: [r.x, r.y, r.width, r.height], scroll: [el.scrollWidth, el.scrollHeight, el.scrollLeft, el.scrollTop],
      style: Object.fromEntries(['display', 'position', 'font-family', 'font-size', 'font-weight', 'line-height', 'color', 'background-color', 'background-image', 'padding', 'margin', 'gap', 'border-radius', 'border-color', 'border-width', 'grid-template-columns', 'overflow-x', 'overflow-y'].map(name => [name, s.getPropertyValue(name)])),
      attrs: Object.fromEntries(['role', 'aria-selected', 'aria-pressed', 'aria-expanded', 'aria-current', 'alt', 'href', 'disabled'].filter(name => el.hasAttribute(name)).map(name => [name, el.getAttribute(name)])) };
  }));
}
async function pageFacts(page) {
  return page.evaluate(() => {
    const visible = el => !!el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden';
    const main = document.querySelector('main');
    const title = main?.querySelector('h1');
    const r = title?.getBoundingClientRect();
    const blocks = [...(main?.querySelectorAll('h1,h2,h3,p,li,button:disabled') || [])].map(el => ({tag: el.tagName, text: el.textContent.replace(/\s+/g, ' ').trim()}));
    return { mainCount: document.querySelectorAll('main').length, visibleLegacyHeaders: [...document.querySelectorAll('.site-header')].filter(visible).length,
      visibleFooters: [...document.querySelectorAll('footer')].filter(visible).length,
      visibleNavs: [...document.querySelectorAll('nav[aria-label="Valorant navigation"]')].filter(visible).length,
      overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth), title: title?.textContent,
      titleFontSize: title ? getComputedStyle(title).fontSize : null, titleBox: r ? [r.x, r.y, r.width, r.height] : null,
      blocks, disabledButtons: [...(main?.querySelectorAll('button:disabled') || [])].map(el => ({text: el.textContent.replace(/\s+/g, ' ').trim(), disabled: el.disabled})),
      mainText: main?.innerText };
  });
}
(async () => {
  const browser = await playwright.chromium.launch({headless: true});
  try {
    for (const width of [1440, 390]) {
      const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 960 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
      const page = await context.newPage();
      page.on('pageerror', error => result.errors.push(error.message));
      result.viewport[width] = {};
      for (const [name, route, kind] of routes) {
        const response = await page.goto(baseURL + route, {waitUntil: 'networkidle'});
        await settle(page);
        await page.evaluate(() => scrollTo(0, 0));
        const facts = await pageFacts(page);
        facts.http = response.status();
        check(`${width} ${name}: HTTP 200`, facts.http, 200);
        check(`${width} ${name}: single main`, facts.mainCount, 1);
        if (phase === 'after' || kind === 'regression') check(`${width} ${name}: document overflow 0`, facts.overflow, 0);
        const screenshot = `${phase}-${width}-${name}.png`;
        await page.screenshot({path: path.join(output, screenshot), fullPage: true, animations: 'disabled'});
        facts.screenshot = screenshot;
        if (kind === 'regression') {
          const snapshot = await regressionSnapshot(page);
          const serialized = JSON.stringify(snapshot);
          facts.snapshotDigest = crypto.createHash('sha256').update(serialized).digest('hex');
          facts.snapshotElements = snapshot.length;
          fs.writeFileSync(path.join(require('node:os').tmpdir(), `fe025-${phase}-${width}-${name}-dom.json`), serialized);
        }
        result.viewport[width][name] = facts;
        console.log(phase, width, name);
        if (phase === 'after' && kind === 'support') {
          check(`${width} ${name}: legacy header hidden`, facts.visibleLegacyHeaders, 0);
          check(`${width} ${name}: one visible shared navigation`, facts.visibleNavs, 1);
          check(`${width} ${name}: one visible footer`, facts.visibleFooters, 1);
          check(`${width} ${name}: title 28px`, facts.titleFontSize, '28px');
          assert.ok(facts.titleBox[2] <= 920, `${width} ${name}: document reading width <= 920`);
          result.checks.push(`${width} ${name}: document reading width <= 920`);
          check(`${width} ${name}: home Search target`, await page.getByRole('link', {name: 'Riot ID 검색으로 이동', exact: true}).getAttribute('href'), '/#riot-id');
          if (width === 1440) check(`${width} ${name}: Overview targets legacy`, await page.getByRole('navigation', {name: 'Valorant navigation'}).getByRole('link', {name: 'Overview', exact: true}).getAttribute('href'), '/players/ied-agent-allen');
          if (name.startsWith('missing')) {
            const returnLink = page.locator('main').getByRole('link', {name: /프로필로 돌아가기/});
            check(`${width} ${name}: return target`, await returnLink.getAttribute('href'), name === 'missing-synthetic-match' ? '/players/demo-player-01' : '/players/ied-agent-allen');
          }
        }
      }
      if (phase === 'after') {
        await page.goto(baseURL + '/connect', {waitUntil: 'networkidle'});
        const disabled = page.getByRole('button', {name: 'Riot 계정 연결 준비 중'});
        check(`${width}: connect button remains disabled`, await disabled.isDisabled(), true);
        const more = page.getByRole('button', {name: 'More navigation'});
        await more.click();
        check(`${width}: More opens`, await more.getAttribute('aria-expanded'), 'true');
        const menuPrivacy = page.getByRole('link', {name: 'Privacy policy', exact: true});
        await menuPrivacy.focus();
        await page.keyboard.press('Escape');
        check(`${width}: Escape closes More`, await more.getAttribute('aria-expanded'), 'false');
        check(`${width}: Escape restores focus`, await more.evaluate(el => el === document.activeElement), true);
        await more.click();
        await menuPrivacy.click();
        await page.waitForURL(baseURL + '/privacy');
        check(`${width}: More Privacy navigates`, await page.getByRole('heading', {name: '개인정보처리방침', exact: true}).count(), 1);
        await page.locator('footer:visible').getByRole('link', {name: 'Terms', exact: true}).click();
        await page.waitForURL(baseURL + '/terms');
        check(`${width}: footer Terms navigates`, await page.getByRole('heading', {name: '이용약관', exact: true}).count(), 1);
        await page.getByRole('link', {name: 'Riot ID 검색으로 이동', exact: true}).click();
        await page.waitForURL(baseURL + '/#riot-id');
        await page.locator('#riot-id').waitFor({state: 'visible'});
        await settle(page);
        const input = page.locator('#riot-id');
        check(`${width}: Search reaches home input`, await input.evaluate(el => el.tagName), 'INPUT');
        const box = await input.boundingBox();
        assert.ok(box.y >= 0 && box.y < (width === 390 ? 844 : 960), `${width}: Search input in viewport`);
        result.checks.push(`${width}: Search input in viewport`);
      }
      await context.close();
    }
    check('no page errors', result.errors, []);
    if (phase === 'after') {
      const before = JSON.parse(fs.readFileSync(path.join(output, 'before-results.json'), 'utf8'));
      for (const width of [1440, 390]) for (const [name,,kind] of routes) {
        const actual = result.viewport[width][name], original = before.viewport[width][name];
        if (preservation.has(name)) {
          check(`${width} ${name}: original text blocks exactly preserved`, actual.blocks, original.blocks);
          check(`${width} ${name}: disabled state exactly preserved`, actual.disabledButtons, original.disabledButtons);
        }
        if (kind === 'regression') {
          check(`${width} ${name}: DOM/style/geometry unchanged`, actual.snapshotDigest, original.snapshotDigest);
          result.comparison[`${width}-${name}`] = 'DOM/style/geometry unchanged';
        }
      }
    }
    result.status = 'PASS';
  } catch (error) {
    result.status = 'FAIL'; result.failure = error.stack; throw error;
  } finally {
    fs.writeFileSync(path.join(output, `${phase}-results.json`), JSON.stringify(result, null, 2));
    await browser.close();
    console.log(JSON.stringify({phase, status: result.status, checks: result.checks.length, errors: result.errors}));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
