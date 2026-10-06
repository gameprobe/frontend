const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const runtime = process.env.PLAYWRIGHT_MODULES || '/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright';
const { chromium } = require(runtime);
const { expect } = require(runtime + '/test');
const directory = path.resolve('docs/visual-qa/assets/TASK-FE-028');
const origin = 'http://localhost:3000';
const profileTabs = ['Overview', 'Matches', 'Performance', 'Agents', 'Maps', 'Weapons'];
const publicOrder = ['Home', 'Overview', 'Lineups', 'Smokes'];
const profileOrder = ['Home', ...profileTabs, 'Lineups', 'Smokes'];
const results = { checks: [], layouts: [], focus: [], screenshots: [], errors: [], consoleErrors: [], expectedApiErrors: [], requests: [] };
const pass = name => results.checks.push(name);
function check(name, actual, expected) { assert.deepEqual(actual, expected, name); pass(name); }
const navFor = page => page.getByRole('navigation', { name: 'Valorant navigation', exact: true });
const railFor = page => navFor(page).getByRole('link', { name: 'Home', exact: true }).locator('..');

async function go(page, route) {
  const response = await page.goto(origin + route, { waitUntil: 'networkidle', timeout: 45000 });
  check(`${route}: HTTP 200`, response.status(), 200);
  await expect(navFor(page)).toBeVisible();
}
async function current(page, label, name) {
  await expect(navFor(page).locator('[aria-current="page"]')).toHaveCount(1);
  await expect(navFor(page).locator('[aria-current="page"]')).toHaveText(name);
  pass(`${label}: exactly one current item (${name})`);
}
async function layout(page, label, expected) {
  const rail = railFor(page);
  check(`${label}: common navigation order`, await rail.locator(':scope > a, :scope > button').allTextContents(), expected);
  const details = await page.evaluate(() => {
    const nav = document.querySelector('nav[aria-label="Valorant navigation"]');
    const rail = nav.querySelector('a[href="/"]').parentElement;
    const rect = rail.getBoundingClientRect();
    return {
      overflow: document.documentElement.scrollWidth - innerWidth,
      rail: { width: rect.width, scrollWidth: rail.scrollWidth, clientWidth: rail.clientWidth, overflowX: getComputedStyle(rail).overflowX },
      items: [...rail.children].map(element => ({
        label: element.textContent, tag: element.tagName,
        display: getComputedStyle(element).display, visibility: getComputedStyle(element).visibility,
        width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height,
      })),
    };
  });
  check(`${label}: no document horizontal overflow`, details.overflow, 0);
  assert.ok(details.items.every(item => item.display !== 'none' && item.visibility === 'visible' && item.width > 0 && item.height > 0), `${label}: a navigation item is CSS-hidden`);
  pass(`${label}: every navigation item is rendered and available`);
  if (details.rail.scrollWidth > details.rail.clientWidth) {
    assert.ok(['auto', 'scroll'].includes(details.rail.overflowX), `${label}: clipped navigation has no scrollable rail`);
    pass(`${label}: overflowing navigation uses a scrollable rail`);
  }
  results.layouts.push({ label, ...details });
}
async function more(page, label) {
  const nav = navFor(page);
  const button = nav.getByRole('button', { name: 'More navigation', exact: true });
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  for (const [name, href] of [['Privacy policy', '/privacy'], ['Terms of service', '/terms'], ['Connect account', '/connect']]) {
    const link = nav.getByRole('link', { name, exact: true });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', href);
    pass(`${label}: More retains ${href}`);
  }
  await nav.getByRole('link', { name: 'Terms of service', exact: true }).focus();
  await page.keyboard.press('Escape');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(button).toBeFocused();
  await expect(nav.getByRole('link', { name: 'Privacy policy', exact: true })).toHaveCount(0);
  pass(`${label}: More Escape closes and restores trigger focus`);
}
async function language(page, label, expectedOrder) {
  const button = page.getByRole('button', { name: 'Language', exact: true });
  await button.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitemradio')).toHaveCount(2);
  await page.getByRole('menuitemradio', { name: 'English', exact: true }).click();
  await expect(page.locator('main')).toHaveAttribute('lang', 'en');
  await expect(button).toBeFocused();
  check(`${label}: English selection stored`, await page.evaluate(() => localStorage.getItem('gameprobe:locale')), 'en');
  check(`${label}: English keeps navigation labels and order`, await railFor(page).locator(':scope > a, :scope > button').allTextContents(), expectedOrder);
  await button.focus();
  await page.keyboard.press('ArrowDown');
  await page.getByRole('menuitemradio', { name: '한국어', exact: true }).click();
  await expect(page.locator('main')).toHaveAttribute('lang', 'ko');
  await expect(button).toBeFocused();
  pass(`${label}: Language switches both directions and restores focus`);
}
async function focusDetails(page, label) {
  const details = await page.evaluate(() => {
    const element = document.activeElement, rail = element.parentElement;
    const rect = element.getBoundingClientRect(), railRect = rail.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      label: element.textContent, left: rect.left, right: rect.right, railLeft: railRect.left, railRight: railRect.right,
      scrollLeft: rail.scrollLeft, focusVisible: element.matches(':focus-visible'),
      outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth, outlineColor: style.outlineColor,
      boxShadow: style.boxShadow,
    };
  });
  assert.ok(details.left >= details.railLeft - 1 && details.right <= details.railRight + 1, `${label}: keyboard focus is clipped: ${JSON.stringify(details)}`);
  assert.ok(details.focusVisible && ((details.outlineStyle !== 'none' && parseFloat(details.outlineWidth) > 0 && details.outlineColor !== 'rgba(0, 0, 0, 0)') || details.boxShadow !== 'none'), `${label}: missing visible focus`);
  pass(`${label}: keyboard auto-scroll reveals full link and visible focus`);
  results.focus.push({ case: label, ...details });
}
async function keyboardEnd(page, label, expectedOrder, screenshotName) {
  const nav = navFor(page);
  await nav.getByRole('link', { name: 'Home', exact: true }).focus();
  for (const name of expectedOrder.slice(1)) {
    await page.keyboard.press('Tab');
    await expect(nav.getByRole(profileTabs.includes(name) && expectedOrder.length > 4 ? 'button' : 'link', { name, exact: true })).toBeFocused();
    pass(`${label}: Tab reaches ${name}`);
    if (name === 'Lineups' || name === 'Smokes') await focusDetails(page, `${label} ${name}`);
  }
  if (screenshotName) {
    await page.screenshot({ path: path.join(directory, screenshotName), animations: 'disabled' });
    results.screenshots.push(screenshotName);
  }
  await page.keyboard.press('Shift+Tab');
  await expect(nav.getByRole('link', { name: 'Lineups', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await page.waitForURL(origin + '/lineups');
  await current(page, `${label}: keyboard Lineups activation`, 'Lineups');
  await navFor(page).getByRole('link', { name: 'Lineups', exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(navFor(page).getByRole('link', { name: 'Smokes', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await page.waitForURL(origin + '/smokes');
  await current(page, `${label}: keyboard Smokes activation`, 'Smokes');
}
async function profileActions(page, label, route) {
  const nav = navFor(page);
  for (const tab of profileTabs) {
    await nav.getByRole('button', { name: tab, exact: true }).click();
    await current(page, `${label}: internal ${tab}`, tab);
    check(`${label}: ${tab} preserves selected player URL`, new URL(page.url()).pathname, route);
    const sections = page.getByRole('navigation', { name: 'Profile sections', exact: true });
    await expect(sections.getByRole('button', { name: tab, exact: true })).toHaveAttribute('aria-current', 'page');
    pass(`${label}: ${tab} synchronizes existing profile section`);
  }
  await nav.getByRole('button', { name: 'Overview', exact: true }).click();
  const input = nav.getByRole('textbox', { name: 'Search Riot ID', exact: true });
  await expect(input).toBeVisible();
  await expect(input).toHaveAttribute('placeholder', 'Search');
  await input.fill('IED agent#Allen');
  await input.press('Enter');
  await expect(input).toHaveValue('IED agent#Allen');
  check(`${label}: profile Search retains player route`, new URL(page.url()).pathname, route);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [1440, 820, 390]) {
      const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 960 }, reducedMotion: 'reduce', deviceScaleFactor: 1 });
      await context.route('**/api/lineups', async route => {
        results.requests.push({ width, url: route.request().url(), status: 503 });
        await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Controlled navigation QA unavailable response' }), headers: { 'access-control-allow-origin': '*' } });
      });
      const page = await context.newPage();
      page.setDefaultTimeout(15000);
      page.on('pageerror', error => results.errors.push({ width, route: page.url(), error: error.message }));
      page.on('console', message => {
        if (message.type() !== 'error') return;
        const detail = { width, route: page.url(), text: message.text(), location: message.location() };
        if (message.text().includes('503') && message.location().url.includes('/api/lineups')) results.expectedApiErrors.push(detail);
        else results.consoleErrors.push(detail);
      });
      await go(page, '/');
      const synthetic = await page.locator('a[href^="/players/"]').evaluateAll(links => links.map(link => link.getAttribute('href')).find(href => href !== '/players/ied-agent-allen'));
      assert.ok(synthetic, 'Home should expose a distinct synthetic demo profile');
      results.syntheticProfile = synthetic;
      for (const [slug, route, active] of [
        ['home', '/', 'Home'], ['profile', '/players/ied-agent-allen', 'Overview'],
        ['synthetic-profile', synthetic, 'Overview'], ['lineups', '/lineups', 'Lineups'], ['smokes', '/smokes', 'Smokes'],
      ]) {
        const label = `${width}px ${slug}`;
        await go(page, route);
        const isProfile = route.startsWith('/players/');
        const order = isProfile ? profileOrder : publicOrder;
        await layout(page, label, order);
        await current(page, label, active);
        await expect(navFor(page).getByRole('link', { name: 'Home', exact: true })).toHaveAttribute('href', '/');
        if (!isProfile) await expect(navFor(page).getByRole('link', { name: 'Overview', exact: true })).toHaveAttribute('href', '/players/ied-agent-allen');
        pass(`${label}: Home and Overview destinations retained`);
        await more(page, label);
        await language(page, label, order);
        if (isProfile) await profileActions(page, label, route);
        else {
          const search = navFor(page).getByRole('link', { name: 'Riot ID 검색으로 이동', exact: true });
          await expect(search).toHaveAttribute('href', route === '/' ? '#riot-id' : '/#riot-id');
          await search.click();
          await page.waitForURL(origin + '/#riot-id');
          await expect(page.locator('#riot-id')).toBeVisible();
          pass(`${label}: Search reaches the home Riot ID input`);
          await go(page, route);
        }
        await keyboardEnd(page, label, order, isProfile ? `after-keyboard-${slug}-${width}.png` : null);
      }
      // Follow the retained shared destinations through actual links, beyond href assertions.
      await go(page, '/');
      await navFor(page).getByRole('link', { name: 'Overview', exact: true }).click();
      await page.waitForURL(origin + '/players/ied-agent-allen');
      await current(page, `${width}px Overview destination`, 'Overview');
      await navFor(page).getByRole('link', { name: 'Home', exact: true }).click();
      await page.waitForURL(origin + '/');
      await current(page, `${width}px Home destination`, 'Home');
      for (const [name, destination] of [['Privacy policy', '/privacy'], ['Terms of service', '/terms'], ['Connect account', '/connect']]) {
        await go(page, '/');
        await navFor(page).getByRole('button', { name: 'More navigation', exact: true }).click();
        await navFor(page).getByRole('link', { name, exact: true }).click();
        await page.waitForURL(origin + destination);
        pass(`${width}px More ${name} follows ${destination}`);
      }
      await context.close();
    }
    check('No browser runtime errors', results.errors, []);
    check('No unexpected browser console errors', results.consoleErrors, []);
    results.status = 'PASS';
  } catch (error) {
    results.status = 'FAIL';
    results.failure = error.stack;
    process.exitCode = 1;
  } finally {
    fs.writeFileSync(path.join(directory, 'navigation-results.json'), JSON.stringify(results, null, 2));
    await browser.close();
    console.log(JSON.stringify({ status: results.status, checks: results.checks.length, layouts: results.layouts.length, focus: results.focus.length, screenshots: results.screenshots.length, errors: results.errors, consoleErrors: results.consoleErrors, failure: results.failure }));
  }
})();
