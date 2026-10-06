// Local browser verification only. No real API calls or administrator writes.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const phase = process.argv[2] || 'before';
const dir = __dirname;
const origin = 'http://localhost:3000';
const profile = '/players/demo-player-01';
const tabs = ['Scoreboard', 'Performance', 'Economy', 'Rounds', 'Duels'];
const expectedNavigation = [
  { text: 'Home', href: '/' }, { text: 'Overview', href: '/players/ied-agent-allen' },
  { text: 'Lineups', href: '/lineups' }, { text: 'Smokes', href: '/smokes' },
];
async function ready(p) {
  // Off-screen lazy images need not load for a viewport capture; avoid waiting forever for them.
  await p.evaluate(() => Promise.all([document.fonts.ready, ...Array.from(document.images, img => Promise.race([
    img.decode().catch(() => {}), new Promise(resolve => setTimeout(resolve, 1500)),
  ]))]));
}
async function main() {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  const errors = [];
  const checks = [];
  const previous = phase === 'after' ? JSON.parse(fs.readFileSync(path.join(dir, 'before.json'))) : null;
  async function page(width) {
    const context = await browser.newContext({ viewport: { width, height: 960 }, deviceScaleFactor: 1 });
    await context.route('**/api/**', r => r.fulfill({ status: 503, json: { message: 'Local isolated QA' } }));
    const p = await context.newPage();
    p.on('pageerror', e => errors.push(e.message));
    return p;
  }
  async function capture(p, name, width, panelTexts = null) {
    await ready(p);
    const file = `${phase}-${width}-${name}.png`;
    await p.screenshot({ path: path.join(dir, file), fullPage: true, animations: 'disabled' });
    const metrics = await p.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      mainCount: document.querySelectorAll('main').length,
      navCount: document.querySelectorAll('nav[aria-label="Valorant navigation"]').length,
      nav: Array.from(document.querySelectorAll('nav[aria-label="Valorant navigation"] a[href]'))
        .filter(n => ['Home', 'Overview', 'Lineups', 'Smokes'].includes(n.textContent.trim()))
        .map(n => ({ text: n.textContent.trim(), href: n.getAttribute('href') })),
      sharedLink: document.querySelector('a[target="_blank"][href*="/matches/"]')?.getAttribute('href'),
    }));
    assert.equal(metrics.overflow, false, `${name}/${width} document overflow`);
    assert.equal(metrics.mainCount, 1, `${name}/${width} main landmark`);
    results.push({ name, width, file, ...metrics, panelTexts });
    console.log(`${phase}: ${name}/${width}`);
    if (previous) {
      const before = previous.results.find(r => r.name === name && r.width === width);
      assert.deepEqual(panelTexts, before.panelTexts, `${name}/${width} detail contents changed`);
      assert.equal(metrics.sharedLink, before.sharedLink, `${name}/${width} share target changed`);
    }
    return metrics;
  }
  let detailHref;
  try {
    // Discover the actual new-tab URL through the existing profile modal.
    for (const width of [1440, 390]) {
      const p = await page(width);
      await p.goto(origin + profile);
      await p.getByRole('button', { name: /^Jett Ascent Victory 13-9/ }).click();
      const dialog = p.getByRole('dialog');
      await dialog.waitFor();
      detailHref = await dialog.getByRole('link', { name: '이 경기 새 탭에서 보기' }).getAttribute('href');
      await capture(p, 'modal', width, await dialog.innerText());
      assert.equal(await dialog.locator('nav[aria-label="Valorant navigation"]').count(), 0);
      if (phase === 'after' && width === 1440) {
        const popupEvent = p.waitForEvent('popup');
        await dialog.getByRole('link', { name: '이 경기 새 탭에서 보기' }).click();
        const popup = await popupEvent;
        await popup.waitForLoadState('domcontentloaded');
        await popup.getByRole('navigation', { name: 'Valorant navigation' }).waitFor();
        assert.equal(popup.url(), origin + detailHref);
        assert.equal(await dialog.isVisible(), true);
        await popup.close();
        checks.push('Modal new-tab action preserves match/viewer and original modal');
      }
      await p.context().close();
    }
    for (const width of [1440, 820, 390]) {
      const p = await page(width);
      await p.goto(origin + detailHref);
      const panelTexts = {};
      for (const tab of tabs) {
        await p.getByRole('tab', { name: tab, exact: true }).click();
        panelTexts[tab] = await p.getByRole('tabpanel').innerText();
      }
      await p.getByRole('tab', { name: 'Scoreboard', exact: true }).click();
      await p.evaluate(() => scrollTo(0, 0));
      const metrics = await capture(p, 'standalone', width, panelTexts);
      assert.equal(metrics.navCount, phase === 'before' ? 0 : 1);
      if (phase === 'after') {
        assert.deepEqual(metrics.nav, expectedNavigation);
        const nav = p.getByRole('navigation', { name: 'Valorant navigation' });
        const navBox = await nav.boundingBox();
        const matchBox = await p.locator('[data-detail-close]').boundingBox();
        assert.ok(matchBox.y >= navBox.y + navBox.height, 'Menu does not overlap match header');
        assert.equal(await nav.locator('[aria-current]').count(), 0);
        assert.equal(await nav.locator('a').first().getAttribute('href'), '/#riot-id');
        const more = p.getByRole('button', { name: 'More navigation' });
        await more.click();
        await nav.getByRole('link', { name: 'Privacy policy' }).focus();
        await p.keyboard.press('Escape');
        assert.equal(await more.getAttribute('aria-expanded'), 'false');
        assert.equal(await more.evaluate(n => n === document.activeElement), true);
        await p.getByRole('button', { name: 'Language', exact: true }).focus();
        await p.keyboard.press('ArrowDown');
        await p.getByRole('menuitemradio', { name: 'English' }).click();
        assert.equal(await p.locator('main').getAttribute('lang'), 'en');
        await p.getByRole('button', { name: 'Language', exact: true }).focus();
        await p.keyboard.press('ArrowDown');
        await p.getByRole('menuitemradio', { name: '한국어' }).click();
        const share = p.getByRole('button', { name: '경기 링크 복사' });
        await share.scrollIntoViewIfNeeded();
        const box = await share.boundingBox();
        assert.ok(box.y >= 0 && box.y + box.height <= 960, 'Share footer remains reachable');
        checks.push(`${width}px shared navigation, More Escape/focus, language and footer accessibility`);
        if (width === 390) await p.screenshot({ path: path.join(dir, 'after-390-share-reachable.png') });
      }
      await p.context().close();
    }
    // Alternate viewer preserves the URL and personal selection.
    const alternate = detailHref.replace('viewer=demo-player-01', 'viewer=demo-player-02');
    for (const [name, url, width, selector] of [
      ['alternate-viewer', alternate, 1440, '[data-detail-close]'],
      ['missing', '/matches/demo-match-missing', 390, 'h1'],
      ['legacy', '/matches/mock-match-ascent-001', 1440, '#match-rounds-heading'],
    ]) {
      const p = await page(width);
      await p.goto(origin + url);
      await p.locator(selector).waitFor();
      const text = name === 'alternate-viewer' ? await p.getByRole('tabpanel').innerText() : null;
      await capture(p, name, width, text);
      await p.context().close();
    }
    if (phase === 'after') {
      const p = await page(1440);
      for (const item of expectedNavigation) {
        await p.goto(origin + detailHref);
        await p.getByRole('navigation', { name: 'Valorant navigation' }).getByRole('link', { name: item.text, exact: true }).click();
        await p.waitForURL(origin + item.href);
      }
      await p.goto(origin + detailHref);
      await p.getByRole('navigation', { name: 'Valorant navigation' }).locator('a').first().click();
      await p.waitForURL(origin + '/#riot-id');
      await p.goto(origin + detailHref);
      const back = p.locator('a[href="/players/demo-player-01"]').first();
      await back.click();
      await p.waitForURL(origin + profile);
      await p.goto(origin + detailHref);
      await p.getByRole('button', { name: '경기 상세 닫기' }).click();
      await p.waitForURL(origin + profile);
      checks.push('Actual Home/Overview/Lineups/Smokes/Search, back and close navigation');
      await p.context().close();
    }
    assert.deepEqual(errors, [], 'No uncaught browser exceptions');
    console.log(`${phase}: ${results.length} captures, all checks passed`);
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(dir, `${phase}.json`), JSON.stringify({ detailHref, results, checks, errors }, null, 2) + '\n');
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
