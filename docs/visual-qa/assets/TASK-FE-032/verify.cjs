// Local-only UI verification. Existing public demos remain independent of the consent simulation.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const phase = process.argv[2] || 'before';
const origin = 'http://localhost:3000';
const results = [], checks = [], errors = [], apiRequests = [];
async function ready(page) {
  await page.evaluate(() => Promise.all([document.fonts.ready, ...Array.from(document.images, img => Promise.race([
    img.decode().catch(() => {}), new Promise(resolve => setTimeout(resolve, 1200)),
  ]))]));
}
async function main() {
  const browser = await chromium.launch({ headless: true });
  async function create(width, locale = 'ko') {
    const context = await browser.newContext({ viewport: { width, height: 960 }, deviceScaleFactor: 1 });
    await context.addInitScript(locale => localStorage.setItem('gameprobe:locale', locale), locale);
    await context.route('**/api/**', route => { apiRequests.push(route.request().url()); return route.fulfill({ status: 503, json: {} }); });
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(e.message));
    return page;
  }
  async function capture(page, name, width, locale = 'ko') {
    await ready(page);
    // Full-page images otherwise place the sticky navigation at the current scrolled document offset.
    await page.evaluate(() => { window.scrollTo({ top: 0, behavior: 'instant' }); });
    const file = `${phase}-${width}-${name}-${locale}.png`;
    await page.screenshot({ path: path.join(__dirname, file), fullPage: true, animations: 'disabled' });
    const metrics = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      mainCount: document.querySelectorAll('main').length,
      locale: document.querySelector('main')?.lang,
      headings: Array.from(document.querySelectorAll('h1,h2'), n => n.textContent),
    }));
    assert.equal(metrics.overflow, false, `${name}/${width} document overflow`);
    assert.equal(metrics.mainCount, 1, `${name}/${width} main landmark`);
    assert.equal(metrics.locale, locale);
    results.push({ file, name, width, locale, ...metrics });
    console.log(`${phase}: ${name}/${width}/${locale}`);
  }
  try {
    for (const width of [1440, 820, 390, 320]) {
      for (const locale of width === 1440 || width === 390 ? ['ko', 'en'] : ['ko']) {
        const page = await create(width, locale);
        await page.goto(origin + '/connect');
        await capture(page, 'connect', width, locale);
        if (phase !== 'before') await exercise(page, width, locale, capture, checks);
        await page.context().close();
      }
    }
    for (const [name, url] of [['home', '/'], ['legacy', '/players/ied-agent-allen'], ['synthetic', '/players/demo-player-01']]) {
      const page = await create(1440);
      await page.goto(origin + url);
      if (name === 'synthetic') await page.getByRole('heading', { name: /DemoPlayer01/ }).waitFor();
      await capture(page, name, 1440);
      if (phase !== 'before') {
        const beforeFile = path.join(__dirname, `before-1440-${name}-ko.png`);
        const afterFile = path.join(__dirname, `${phase}-1440-${name}-ko.png`);
        assert.ok(fs.readFileSync(beforeFile).equals(fs.readFileSync(afterFile)), `${name} regression screenshot changed`);
        checks.push(`${name}: identical screenshot; default demo preserved`);
      }
      await page.context().close();
    }
    assert.deepEqual(errors, [], 'Browser errors');
    assert.deepEqual(apiRequests, [], 'No API calls');
    fs.writeFileSync(path.join(__dirname, `${phase}.json`), JSON.stringify({ results, checks, errors, apiRequests }, null, 2));
  } finally { await browser.close(); }
}
async function exercise(page, width, locale, capture, checks) {
  const ko = locale === 'ko';
  const button = name => page.getByRole('button', { name, exact: true });
  const start = ko ? '공개 동의 체험하기' : 'Try sharing consent';
  const grant = ko ? '동의하고 데모 프로필 보기' : 'Agree and view demo profile';
  const cancel = ko ? '동의하지 않고 취소' : 'Cancel without sharing';
  const again = ko ? '공개 동의 다시 체험' : 'Review sharing consent again';
  const revoke = ko ? '공개 동의 철회 체험' : 'Try withdrawing consent';
  const restart = ko ? '처음부터 다시 보기' : 'Restart demo';
  const preview = page.locator('[aria-label="합성 프로필 요약"], [aria-label="Synthetic profile summary"]');
  async function assertHidden() { assert.equal(await preview.count(), 0, 'Profile must be unmounted'); }
  async function assertFocusedHeading() {
    assert.equal(await page.locator('h2').evaluate(n => n === document.activeElement), true, 'Stage heading receives focus');
    const heading = await page.locator('h2').boundingBox();
    const nav = await page.getByRole('navigation', { name: 'Valorant navigation' }).boundingBox();
    assert.ok(heading.y >= nav.y + nav.height, 'Focused stage is below the sticky navigation');
  }
  const storageBefore = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage }, cookies: document.cookie }));
  await assertHidden();
  await button(start).focus();
  await page.keyboard.press('Enter');
  await assertFocusedHeading();
  assert.equal(await page.getByRole('checkbox').isChecked(), false);
  assert.equal(await button(grant).isDisabled(), true);
  await assertHidden();
  await capture(page, 'consent-unchecked', width, locale);

  await page.getByRole('checkbox').focus();
  await page.keyboard.press('Space');
  assert.equal(await button(grant).isEnabled(), true);
  await page.keyboard.press('Space');
  assert.equal(await button(grant).isDisabled(), true);
  await page.getByRole('checkbox').check();
  // Policy opens separately; reviewing it must not discard the checkbox selection.
  if (width === 1440 && ko) {
    const popupEvent = page.waitForEvent('popup');
    await page.getByRole('link', { name: '개인정보처리방침 (새 탭)' }).click();
    const popup = await popupEvent;
    await popup.waitForLoadState('domcontentloaded');
    assert.equal(new URL(popup.url()).pathname, '/privacy');
    await popup.close();
    assert.equal(await page.getByRole('checkbox').isChecked(), true);
    checks.push('Policy opens in new tab and keeps selection');
  }
  await button(cancel).click();
  await assertFocusedHeading();
  await assertHidden();
  await capture(page, 'cancelled', width, locale);
  await button(again).click();
  assert.equal(await page.getByRole('checkbox').isChecked(), false, 'Cancel clears consent');
  await page.getByRole('checkbox').check();
  await button(grant).click();
  await preview.waitFor();
  await assertFocusedHeading();
  const stats = await preview.locator('dd').allTextContents();
  assert.deepEqual(stats, ['4', '3 / 1', '65 / 56 / 23'], 'Existing synthetic totals');
  assert.equal(await preview.locator('li').count(), 4);
  assert.equal(await preview.getByRole('heading', { name: /DemoPlayer01/ }).count(), 1);
  assert.equal(/DemoPlayer0[2-9]/.test(await preview.innerText()), false, 'Only selected player shown');
  await capture(page, 'profile', width, locale);

  // Locale changes must keep the existing consent/profile; no second grant action.
  await page.getByRole('button', { name: 'Language', exact: true }).click();
  await page.getByRole('menuitemradio', { name: ko ? 'English' : '한국어', exact: true }).click();
  assert.deepEqual(await preview.locator('dd').allTextContents(), stats);
  assert.equal(await page.locator('h2').evaluate(n => n === document.activeElement), false, 'Locale change does not steal focus');
  await page.getByRole('button', { name: 'Language', exact: true }).click();
  await page.getByRole('menuitemradio', { name: ko ? '한국어' : 'English', exact: true }).click();

  await button(revoke).click();
  await assertFocusedHeading();
  await assertHidden();
  await capture(page, 'revoked', width, locale);
  await button(again).click();
  assert.equal(await page.getByRole('checkbox').isChecked(), false, 'Withdrawal requires fresh consent');
  assert.equal(await button(grant).isDisabled(), true);
  await assertHidden();
  await page.getByRole('checkbox').check();
  await button(grant).click();
  await preview.waitFor();
  await button(restart).click();
  await assertHidden();
  await button(start).click();
  await page.getByRole('checkbox').check();
  await button(grant).click();
  await preview.waitFor();
  await page.reload();
  await button(start).waitFor();
  await assertHidden();
  const storageAfter = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage }, cookies: document.cookie }));
  assert.deepEqual(storageAfter, storageBefore, 'No consent storage/cookie changes');
  const nav = page.getByRole('navigation', { name: 'Valorant navigation' });
  assert.equal(await nav.getByRole('link', { name: 'Overview', exact: true }).getAttribute('href'), '/players/ied-agent-allen');
  await button(start).click();
  await page.getByRole('checkbox').check();
  await button(grant).click();
  await preview.waitFor();
  await nav.getByRole('link', { name: 'Home', exact: true }).click();
  await page.waitForURL(origin + '/');
  await page.getByRole('link', { name: 'Connect account', exact: true }).click();
  await page.waitForURL(origin + '/connect');
  await button(start).waitFor();
  await assertHidden();
  checks.push(`${width}px/${locale}: keyboard, unchecked guard, cancel, sample totals, locale, withdrawal, re-consent, reset, reload, route return, no storage changes`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
