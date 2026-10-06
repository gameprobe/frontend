// 로컬 브라우저에서 가로챈 자료만 사용한다. 실제 API·영상 서비스에는 요청을 보내지 않는다.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const { setup, metrics } = require('./capture.cjs');
const before = JSON.parse(fs.readFileSync(path.join(__dirname, 'before.json'), 'utf8'));
const result = { checks: 0, cases: [], errors: [] };
function check(value, expected, message) {
  assert.deepEqual(value, expected, message);
  result.checks += 1;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [1440, 820, 390]) {
      for (const mode of ['success', 'no-video', 'loading', 'error', 'fallback']) {
        const context = await browser.newContext({ viewport: { width, height: 960 }, deviceScaleFactor: 1 });
        await setup(context, mode === 'error' ? 'fallback' : mode);
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        try {
          const id = mode === 'fallback' ? 'ascent-killjoy-b-site-molly-003' : mode === 'error' ? 'theme-qa-missing' : 'theme-qa-lineup';
          await page.goto(`http://localhost:3000/lineups/${id}`, { waitUntil: 'domcontentloaded' });
          await page.locator(mode === 'error' ? '.lineup-detail-state-error' : mode === 'loading' ? '.lineup-detail-state' : '.lineup-detail-header').waitFor();
          const first = await metrics(page);
          check(first.overflow, false, `${width}/${mode}: no document overflow`);
          check(first.mainCount, 1, `${width}/${mode}: one main`);
          check(await page.locator('main main').count(), 0, 'no nested main');
          check(await page.locator('main nav a[href="/smokes"]').count(), 1, 'shared Smokes navigation');
          check(await page.locator('main nav a[href="/lineups"]').getAttribute('aria-current'), 'page', 'Lineups current navigation');
          check(await page.locator('main h1').count(), 1, 'one screen heading');

          if (mode === 'loading' || mode === 'error') {
            check(await page.locator('.lineup-detail-state').getAttribute('role'), mode === 'loading' ? 'status' : 'alert', 'state semantics');
            if (mode === 'error') {
              check(await page.locator('.lineup-detail-state a').getAttribute('href'), '/lineups', 'error recovery link');
              await page.locator('.lineup-detail-state a').click();
              await page.waitForURL('**/lineups');
              check(new URL(page.url()).pathname, '/lineups', 'error recovery navigation');
            }
          } else {
            check(first.difficulty.position, 'static', 'difficulty remains in metadata');
            check(await page.locator('.lineup-detail-meta .lineup-difficulty').count(), 1, 'metadata owns difficulty');
            const baselineName = mode === 'fallback' ? 'lineup' : mode === 'success' ? 'lineup-api' : 'lineup-no-video';
            const baseline = before.find(row => row.width === width && row.name === baselineName)
              || before.find(row => row.width === 1440 && row.name === baselineName);
            check(first.pins, baseline.pins, 'unchanged marker percentages');
            check(first.paths, baseline.paths, 'unchanged path points');
            check(first.iframe, baseline.iframe, 'unchanged initial video');
            check(await page.locator('.lineup-back-link').getAttribute('href'), '/lineups', 'back link preserved');
            const stage = await page.locator('.lineup-map-stage').boundingBox();
            check(Math.abs(stage.height - (width > 900 ? Math.min(width * .65, 720) : width > 540 ? Math.min(width, 640) : width * .92)) < 1, true, 'map stage height preserved');
            const labelSizes = await page.locator('.lineup-detail-header p,.lineup-detail-meta span,.lineup-agent-marker span,.lineup-skill-marker strong,.lineup-map-legend,.lineup-panel-heading span,.lineup-guide-panel p,.lineup-sova-settings span').evaluateAll(nodes => nodes.map(node => parseFloat(getComputedStyle(node).fontSize)));
            check(labelSizes.every(size => size >= 12), true, 'labels at least 12px');
            if (mode === 'no-video') {
              check(await page.locator('iframe').count(), 0, 'no missing-video iframe');
              check(await page.locator('.lineup-video-empty').innerText(), '이 스킬에는 연결된 영상이 없습니다.', 'missing-video message');
            }
            if (mode === 'success') {
              const markers = page.locator('.lineup-skill-marker');
              check(await markers.count(), 2, 'two selectable skills');
              check(await markers.nth(0).getAttribute('aria-pressed'), 'true', 'initial selected skill');
              await markers.nth(1).focus();
              await page.keyboard.press('Enter');
              check(await markers.nth(1).getAttribute('aria-pressed'), 'true', 'keyboard selects second skill');
              check(await markers.nth(0).getAttribute('aria-pressed'), 'false', 'first skill deselected');
              check(await page.locator('iframe').getAttribute('src'), 'https://www.youtube.com/embed/fe030second', 'second video chosen');
              if (width === 390) {
                check(await page.locator('.lineup-selected-ability').innerText(), '선택한 스킬 2 · Shock Bolt', 'mobile selected skill caption');
                check(await markers.locator('strong').evaluateAll(nodes => nodes.every(node => getComputedStyle(node).visibility === 'hidden')), true, 'mobile labels avoid nearby marker overlap');
              }
              const focusTarget = width === 390 ? markers.nth(1).locator('span') : markers.nth(1);
              check(await focusTarget.evaluate(node => ({ style: getComputedStyle(node).outlineStyle, width: getComputedStyle(node).outlineWidth })), { style: 'solid', width: '2px' }, 'visible keyboard outline');
              check((await metrics(page)).pins, first.pins, 'selection preserves marker coordinates');
              check((await metrics(page)).paths, first.paths, 'selection preserves trajectory');
              check(await page.locator('.lineup-sova-settings').innerText(), '차징 단계\n2/3\n튕김 횟수\n1회', 'Sova settings preserved');
              await page.screenshot({ path: path.join(__dirname, `after-${width}-lineup-keyboard.png`), fullPage: true });
              await markers.nth(0).click();
              check(await page.locator('iframe').getAttribute('src'), 'https://www.youtube.com/embed/fe030first1', 'pointer restores first video');
              await page.locator('.lineup-back-link').click();
              await page.waitForURL('**/lineups');
              check(new URL(page.url()).pathname, '/lineups', 'back navigation');
            }
          }
          check(errors, [], 'no browser exceptions');
          result.cases.push({ width, mode, status: 'PASS' });
          console.log(`PASS lineup ${width} ${mode}`);
        } finally {
          await context.close();
        }
      }
    }
  } catch (error) {
    result.errors.push(error.stack);
    process.exitCode = 1;
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(__dirname, 'lineup-results.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result));
  }
}
main();
