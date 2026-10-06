// FE-036: QA_STAGE=theme reproduces the first styling pass; final is the current default.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const phase = process.argv[2];
assert.ok(['before', 'after'].includes(phase));
const stage = process.env.QA_STAGE || 'final';
assert.ok(['theme', 'final'].includes(stage));
const prefix = stage === 'theme' ? phase : `final-${phase}`;
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:3000';
const result = { phase, screens: [], checks: [], errors: [], insights: [] };
async function screenshot(page, name, fullPage = false) {
  await page.screenshot({ path: `${__dirname}/${prefix}-${name}.png`, fullPage, animations: 'disabled' });
  result.screens.push(`${prefix}-${name}.png`);
}
async function ready(page, path, locale) {
  await page.goto(base + path);
  await page.waitForFunction(l => document.querySelector('main')?.lang === l, locale);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].filter(img => {
    const rect = img.getBoundingClientRect();
    return rect.width && rect.height && rect.bottom > 0 && rect.top < innerHeight;
  }).every(img => img.complete));
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, path);
  if (phase === 'after') {
    const links = await page.locator('nav[aria-label="Valorant navigation"] a').allTextContents();
    // Menu links may be visually clipped on mobile; the shared order must stay intact.
    const tactical = links.map(x => x.trim()).filter(x => ['Insights', 'Lineups', 'Smokes'].includes(x));
    assert.deepEqual(tactical, stage === 'theme' ? ['Insights', 'Lineups', 'Smokes'] : ['Lineups', 'Smokes', 'Insights'], path);
  }
}
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [1440, 390]) for (const locale of ['ko', 'en']) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      page.on('pageerror', error => result.errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') result.errors.push(message.text()); });
      await page.addInitScript(l => localStorage.setItem('gameprobe:locale', l), locale);
      await ready(page, '/insights', locale);
      const tabs = page.getByRole('tab');
      const names = locale === 'ko' ? ['교전 위치', '교전 타이밍', '반복 습관'] : ['Positioning', 'Timing', 'Habits'];
      for (let i = 0; i < names.length; i++) {
        await page.getByRole('tab', { name: names[i], exact: true }).click();
        assert.equal(await tabs.nth(i).getAttribute('aria-selected'), 'true');
        assert.equal(await page.getByRole('tabpanel').count(), 1);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        result.insights.push({ width, locale, tab: i, text: await page.locator('[class*="Insights_report"]').innerText() });
        await page.evaluate(() => window.scrollTo(0, 0));
        await screenshot(page, `${width}-${locale}-insights-${i}`, true);
      }
      await tabs.nth(2).press('ArrowRight');
      assert.equal(await tabs.nth(0).getAttribute('aria-selected'), 'true');
      await tabs.nth(0).press('End');
      assert.equal(await tabs.nth(2).getAttribute('aria-selected'), 'true');
      await tabs.nth(2).press('Home');
      assert.equal(await tabs.nth(0).getAttribute('aria-selected'), 'true');
      assert.equal(await page.locator('[class*="Insights_actions"] a[href="/connect"]').count(), 1);
      assert.equal(await page.locator('[class*="Insights_actions"] a[href="/players/demo-player-01"]').count(), 1);
      assert.equal(await page.locator('footer a[href="/privacy"]').count(), 1);
      if (phase === 'after') {
        const styles = await page.evaluate(() => {
          const main = getComputedStyle(document.querySelector('main'));
          const active = getComputedStyle(document.querySelector('[role="tab"][aria-selected="true"]'));
          const action = getComputedStyle(document.querySelector('[class*="Insights_actions"] a'));
          return { accent: main.getPropertyValue('--accent').trim(), tab: active.borderBottomColor, action: action.backgroundColor };
        });
        assert.equal(styles.tab, 'rgb(240, 82, 96)');
        assert.equal(styles.action, 'rgb(201, 54, 72)');
      }
      if (locale === 'ko') for (const [name, route] of [['home', '/'], ['profile', '/players/ied-agent-allen'], ['lineups', '/lineups'], ['smokes', '/smokes']]) {
        await ready(page, route, locale);
        await screenshot(page, `${width}-${locale}-${name}`);
      }
      if (width === 390) {
        await ready(page, '/players/demo-player-01', locale);
        if (stage === 'theme') {
          const more = page.getByRole('button', { name: 'More navigation' });
          await more.click();
          const controls = await more.getAttribute('aria-controls');
          await page.locator(`[id="${controls}"] a[href="/insights"]`).click();
        } else {
          await page.locator('nav[aria-label="Valorant navigation"] a[href="/insights"]').click();
        }
        await page.waitForURL('**/insights');
        await page.getByRole('heading', { name: locale === 'ko' ? '내 플레이, 다음 한 걸음' : 'Your play. Your next step.' }).waitFor();
      }
      result.checks.push({ width, locale, tabs: 'PASS', keyboard: 'PASS', overflow: 'PASS', links: 'PASS' });
      await page.close();
    }
    // Keep the colleague's localized metric text, checking the narrow desktop column.
    const tablet = await browser.newPage({ viewport: { width: 1024, height: 1000 } });
    await tablet.addInitScript(() => localStorage.setItem('gameprobe:locale', 'ko'));
    await ready(tablet, '/players/ied-agent-allen', 'ko');
    const metric = tablet.locator('[class*="matchMetric"] small').filter({ hasText: '성과점수' }).first();
    await metric.scrollIntoViewIfNeeded();
    await screenshot(tablet, '1024-ko-profile-metric');
    result.metric = await metric.evaluate(el => ({ text: el.textContent, width: el.clientWidth, scrollWidth: el.scrollWidth, height: el.clientHeight, lineHeight: getComputedStyle(el).lineHeight }));
    await tablet.close();
    if (phase === 'after') {
      const before = JSON.parse(fs.readFileSync(`${__dirname}/before.json`));
      assert.deepEqual(result.insights, before.insights, 'Insights copy/data must remain identical');
    }
    assert.equal(result.errors.length, 0, JSON.stringify(result.errors));
  } finally {
    await browser.close();
    fs.writeFileSync(`${__dirname}/${prefix}.json`, JSON.stringify(result, null, 2));
  }
  console.log(JSON.stringify({ phase, screens: result.screens.length, checks: result.checks, errors: result.errors, metric: result.metric }));
})().catch(error => { console.error(error); process.exitCode = 1; });
