// Width follow-up: preserve the original FE-036 captures and record this revision separately.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const phase = process.argv[2];
assert.ok(['before', 'after'].includes(phase));
const results = { phase, screens: [], layouts: [], text: [], errors: [] };
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:3000';
const body = '[class*="SupportPage_content"]';
async function visit(page, route, locale) {
  await page.goto(base + route);
  await page.waitForFunction(l => document.querySelector('main')?.lang === l, locale);
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, route);
}
async function capture(page, name) {
  const file = `width-${phase}-${name}.png`;
  await page.screenshot({ path: `${__dirname}/${file}`, fullPage: true, animations: 'disabled' });
  results.screens.push(file);
}
const box = locator => locator.evaluate(el => {
  const b = el.getBoundingClientRect();
  return { x: b.x, width: b.width };
});
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const [width, locale] of [[1920, 'ko'], [1440, 'en'], [650, 'en'], [390, 'ko']]) {
      const page = await browser.newPage({ viewport: { width, height: 1080 } });
      page.on('pageerror', e => results.errors.push(e.message));
      page.on('console', m => { if (m.type() === 'error') results.errors.push(m.text()); });
      await page.addInitScript(l => localStorage.setItem('gameprobe:locale', l), locale);
      await visit(page, '/', locale);
      const home = await box(page.locator('[class*="HomeLanding_hero__"]'));
      await visit(page, '/insights', locale);
      const insight = await box(page.locator(body));
      results.layouts.push({ width, locale, home, insight });
      if (phase === 'after') assert.deepEqual(insight, home, 'Insights and home outer content edges must match');
      results.text.push({ width, text: await page.locator(body).innerText() });
      await capture(page, `${width}-${locale}-insights`);
      await page.getByRole('tab').nth(0).press('ArrowRight');
      assert.equal(await page.getByRole('tab').nth(1).getAttribute('aria-selected'), 'true');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      if (width === 1440 || width === 390) {
        for (const [name, route] of [['privacy', '/privacy'], ['connect', '/connect'], ['missing', '/players/qa-width-missing-record']]) {
          await visit(page, route, locale);
          results.layouts.push({ width, locale, page: name, box: await box(page.locator(body)) });
          await capture(page, `${width}-${locale}-${name}`);
        }
      }
      await page.close();
    }
    if (phase === 'after') {
      const before = JSON.parse(fs.readFileSync(`${__dirname}/width-before.json`));
      assert.deepEqual(results.text, before.text, 'Copy must be preserved');
      assert.deepEqual(results.layouts.filter(x => x.page), before.layouts.filter(x => x.page), 'Other SupportPage layouts must not change');
    }
    assert.equal(results.errors.length, 0, JSON.stringify(results.errors));
  } finally {
    await browser.close();
    fs.writeFileSync(`${__dirname}/width-${phase}.json`, JSON.stringify(results, null, 2));
  }
  console.log(JSON.stringify({ phase, screens: results.screens.length, layouts: results.layouts, errors: results.errors }));
})().catch(error => { console.error(error); process.exitCode = 1; });
