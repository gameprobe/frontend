// 저장소 루트에서 실행. PLAYWRIGHT_MODULES는 기존 Playwright 설치 경로다.
const { chromium } = require(process.env.PLAYWRIGHT_MODULES || 'playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1728, height: 941 } });
    await page.goto('http://localhost:3000/players/demo-player-01?scenario=empty', { waitUntil: 'networkidle' });
    const overview = page.getByRole('region', { name: 'Season overview' });
    await overview.scrollIntoViewIfNeeded();
    const donut = overview.locator('[class*="winDonut"]');
    assert.equal(await donut.evaluate(element => getComputedStyle(element).backgroundColor), 'rgb(41, 60, 73)');
    assert.equal(await donut.evaluate(element => getComputedStyle(element).backgroundImage), 'none');
    await overview.screenshot({ path: 'docs/visual-qa/assets/TASK-FE-024/after-1728-empty-overview.png' });
    await page.goto('http://localhost:3000/players/demo-player-01', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Deathmatch', exact: true }).click();
    const killsPerMatch = overview.locator('div').filter({ has: page.locator('span').filter({ hasText: /^Kills\/Match$/ }) }).filter({ has: page.locator('strong') });
    assert.equal(await killsPerMatch.last().locator('strong').innerText(), '—');
    assert.equal(await page.locator('button[aria-controls^="details-"]').count(), 0);
    console.log('PASS: empty neutral donut; unsupported Deathmatch Kills/Match is unavailable');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
