// Final menu acceptance: preserve earlier styling/width screenshots as revision history.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const phase = process.argv[2];
assert.ok(['before', 'after'].includes(phase));
const result = { phase, screens: [], checks: [], errors: [] };
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:3000';
const navSelector = 'nav[aria-label="Valorant navigation"]';
const expected = phase === 'after' ? ['Lineups', 'Smokes', 'Insights'] : ['Insights', 'Lineups', 'Smokes'];
async function visit(page, route, locale) {
  await page.goto(base + route);
  await page.waitForFunction(l => document.querySelector('main')?.lang === l, locale);
  await page.evaluate(() => document.fonts.ready);
}
async function capture(page, name) {
  const file = `menu-${phase}-${name}.png`;
  await page.screenshot({ path: `${__dirname}/${file}`, animations: 'disabled' });
  result.screens.push(file);
}
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [1440, 390]) for (const locale of ['ko', 'en']) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      page.on('pageerror', e => result.errors.push(e.message));
      page.on('console', m => { if (m.type() === 'error') result.errors.push(m.text()); });
      await page.addInitScript(l => localStorage.setItem('gameprobe:locale', l), locale);
      for (const route of ['/', '/players/ied-agent-allen', '/lineups', '/smokes', '/insights']) {
        await visit(page, route, locale);
        const nav = page.locator(navSelector);
        assert.deepEqual((await nav.locator('a').allTextContents()).map(x => x.trim()).slice(-3), expected, route);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, route);
        const more = page.getByRole('button', { name: 'More navigation' });
        await more.click();
        const menu = page.locator(`[id="${await more.getAttribute('aria-controls')}"]`);
        assert.deepEqual(await menu.locator('a').evaluateAll(links => links.map(a => a.getAttribute('href'))), phase === 'after' ? ['/privacy', '/terms', '/connect'] : ['/insights', '/privacy', '/terms', '/connect']);
        if (route === '/insights' || route === '/players/ied-agent-allen') {
          const name = route === '/insights' ? 'insights' : 'profile';
          await capture(page, `${width}-${locale}-${name}-more`);
        }
        await more.press('Escape');
        assert.equal(await more.getAttribute('aria-expanded'), 'false');
        assert.equal(await more.evaluate(el => el === document.activeElement), true);
        // Mobile nav scroll and keyboard focus must still expose the moved final item.
        const insight = nav.locator('a[href="/insights"]');
        await insight.focus();
        await insight.press('Enter');
        await page.waitForURL('**/insights');
        await page.getByRole('heading', { name: locale === 'ko' ? '내 플레이, 다음 한 걸음' : 'Your play. Your next step.' }).waitFor();
        assert.equal(await page.locator(`${navSelector} a[href="/insights"]`).getAttribute('aria-current'), 'page');
        result.checks.push({ width, locale, route, order: 'PASS', more: 'PASS', keyboard: 'PASS', insightsLink: 'PASS' });
      }
      const nav = page.locator(navSelector);
      await nav.locator('a[href="/insights"]').scrollIntoViewIfNeeded();
      await capture(page, `${width}-${locale}-insights-nav`);
      // Follow a retained More link to verify the menu remains usable.
      const more = page.getByRole('button', { name: 'More navigation' });
      await more.click();
      const menu = page.locator(`[id="${await more.getAttribute('aria-controls')}"]`);
      await menu.locator('a[href="/privacy"]').click();
      await page.waitForURL('**/privacy');
      assert.equal(await page.getByRole('button', { name: 'More navigation' }).getAttribute('aria-expanded'), 'false');
      await page.close();
    }
    assert.deepEqual(result.errors, []);
  } finally {
    await browser.close();
    fs.writeFileSync(`${__dirname}/menu-${phase}.json`, JSON.stringify(result, null, 2) + '\n');
  }
  console.log(JSON.stringify({ phase, screens: result.screens.length, checks: result.checks.length, errors: result.errors }));
})().catch(error => { console.error(error); process.exitCode = 1; });
