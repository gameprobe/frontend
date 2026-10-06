// Local Playwright QA for policy copy and shared footer. No external API writes.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { PNG } = require('/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const pixelmatchModule = require('/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pixelmatch');
const pixelmatch = pixelmatchModule.default || pixelmatchModule;
const phase = process.argv[2] || 'before';
const results = [], checks = [], errors = [];
const output = name => path.join(__dirname, name);
async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [1440, 390, 320]) for (const locale of ['ko', 'en']) {
      const context = await browser.newContext({ viewport: { width, height: 960 }, deviceScaleFactor: 1 });
      await context.addInitScript(locale => localStorage.setItem('gameprobe:locale', locale), locale);
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      for (const route of ['privacy', 'terms']) {
        const response = await page.goto(`http://localhost:3000/${route}`);
        assert.equal(response.status(), 200);
        await page.waitForFunction(locale => document.querySelector('main')?.lang === locale, locale);
        await page.evaluate(() => document.fonts.ready);
        if (phase === 'after') {
          const contact = page.locator(`section[aria-labelledby="${route}-contact"]`);
          assert.match(await contact.innerText(), /example@example\.com/);
          assert.match(await contact.innerText(), locale === 'ko' ? /예시.*접수하지/ : /example.*not.*inbox/is);
          assert.equal(await page.locator('a[href^="mailto:"]').count(), 0);
          assert.match(await page.locator('footer:visible').innerText(), /example@example\.com/);
          for (const href of ['/privacy', '/terms', '/privacy#privacy-contact']) {
            assert.equal(await page.locator(`footer:visible a[href="${href}"]`).count(), 1);
          }
        }
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
        assert.equal(overflow, false, `${route}/${width}/${locale} overflow`);
        const file = `${phase}-${width}-${route}-${locale}.png`;
        await page.screenshot({ path: output(file), fullPage: true, animations: 'disabled' });
        results.push({ file, route, width, locale, overflow, status: response.status() });
        console.log(file);
      }
      // Follow the footer links; Contact scrolls to an existing policy heading.
      if (phase === 'after') {
        await page.locator('footer:visible a[href="/privacy#privacy-contact"]').click();
        await page.waitForURL('**/privacy#privacy-contact');
        await page.locator('#privacy-contact').waitFor({ state: 'visible' });
        const target = await page.locator('#privacy-contact').boundingBox();
        const nav = await page.getByRole('navigation', { name: 'Valorant navigation' }).boundingBox();
        assert.ok(target.y >= nav.y + nav.height && target.y < 960, 'Contact heading is visible below sticky navigation');
        await page.locator('footer:visible a[href="/terms"]').click();
        await page.waitForURL('**/terms');
        checks.push(`policy links + contact anchor + placeholder non-link: ${width}/${locale}`);
      }
      await context.close();
    }
    for (const width of [1440, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 960 }, deviceScaleFactor: 1 });
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      for (const [name, route] of [['home', '/'], ['profile', '/players/ied-agent-allen'], ['connect', '/connect']]) {
        await page.goto(`http://localhost:3000${route}`);
        await page.evaluate(() => document.fonts.ready);
        if (name === 'home' || name === 'profile') {
          await page.evaluate(() => Promise.all(Array.from(document.images, image => Promise.race([image.decode().catch(() => {}), new Promise(resolve => setTimeout(resolve, 1200))]))));
          const topFile = `${phase}-${width}-${name}-top.png`;
          await page.screenshot({ path: output(topFile), animations: 'disabled' });
          if (phase === 'after') {
            const before = PNG.sync.read(fs.readFileSync(output(topFile.replace('after-', 'before-'))));
            const after = PNG.sync.read(fs.readFileSync(output(topFile)));
            assert.equal(after.width, before.width);
            assert.equal(after.height, before.height);
            // Ignore subpixel edge antialiasing, but require zero perceptible changed pixels.
            const changed = pixelmatch(before.data, after.data, null, after.width, after.height, { threshold: 0.1 });
            assert.equal(changed, 0, `${name}/${width} top unchanged`);
            checks.push(`${name}/${width}: 0 changed pixels (antialiasing excluded, threshold 0.1)`);
          }
          results.push({ file: topFile, route, width, locale: 'ko', part: 'top' });
        }
        const footer = page.locator('footer:visible');
        await footer.scrollIntoViewIfNeeded();
        const file = `${phase}-${width}-${name}-footer.png`;
        await footer.screenshot({ path: output(file), animations: 'disabled' });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
        assert.equal(overflow, false);
        results.push({ file, route, width, locale: 'ko', part: 'footer', overflow });
        if (phase === 'after') {
          assert.match(await footer.innerText(), /example@example\.com/);
          checks.push(`${name}/${width}: shared footer + no document overflow`);
        }
      }
      if (phase === 'after') {
        await page.getByRole('button', { name: '공개 동의 체험하기', exact: true }).click();
        const checkbox = page.getByRole('checkbox');
        await checkbox.check();
        await page.getByRole('button', { name: '동의하고 데모 프로필 보기', exact: true }).click();
        await page.getByRole('heading', { name: /DemoPlayer01/ }).waitFor();
        await page.getByRole('button', { name: '공개 동의 철회 체험', exact: true }).click();
        assert.equal(await page.locator('[aria-label="합성 프로필 요약"]').count(), 0);
        checks.push(`connect consent + revoke preserved: ${width}`);
      }
      await context.close();
    }
    assert.deepEqual(errors, []);
    fs.writeFileSync(output(`${phase}.json`), JSON.stringify({ results, checks, errors }, null, 2) + '\n');
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
