const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const runtime = process.env.PLAYWRIGHT_MODULES || '/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright';
const { chromium } = require(runtime), { expect } = require(runtime + '/test');
const directory = path.resolve('docs/visual-qa/assets/TASK-FE-029');
const out = { checks: [], states: [], errors: [] };
const base = { id: 'qa-edge', title: 'QA sparse path', description: 'Map positions without a registered path', mapId: 'ascent', side: 'ATTACK', agentId: 'sova', difficulty: 'EASY', skillMarkers: [{ abilityId: 'sova-recon-bolt', position: { x: .6, y: .3 } }], agentMarkers: [{ position: { x: .2, y: .7 } }], pathPoints: [], status: 'PUBLISHED', authorId: 'qa-fixture' };
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [name, fixture] of [['pathless', base], ['no-start', { ...base, agentMarkers: [] }]]) {
      const context = await browser.newContext({ viewport: { width: 390, height: 960 }, reducedMotion: 'reduce' });
      await context.route('**/api/lineups', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([fixture]), headers: { 'access-control-allow-origin': '*' } }));
      const page = await context.newPage(); page.on('pageerror', error => out.errors.push(error.message));
      await page.goto('http://localhost:3000/lineups', { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: 'Ascent', exact: true }).click();
      await page.getByRole('button', { name: 'Sova', exact: true }).click();
      await page.locator('.strats-skill-pin').click();
      const notice = page.getByRole('status', { name: '라인업 탐색 안내', exact: true });
      const state = { name, message: await notice.textContent(), paths: await page.locator('.strats-path-overlay').count(), startPins: await page.locator('.strats-agent-pin').count() };
      out.states.push(state);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: path.join(directory, `after-390-${name}.png`), fullPage: true, animations: 'disabled' });
      await expect(page.locator('.strats-open-detail')).toHaveAttribute('href', '/lineups/qa-edge');
      assert.equal(state.paths, 0); out.checks.push(`${name}: no fabricated path and preserved detail link`);
      if (name === 'pathless') {
        assert.ok(!state.message.includes('등록된 경로를 표시'), 'Pathless record incorrectly claims a registered path is displayed');
        assert.ok(/시작 위치/.test(state.message) && state.startPins === 1, 'Selected notice should describe the displayed start position');
      } else assert.ok(/시작 위치.*않/.test(state.message), 'Missing start position should be disclosed');
      out.checks.push(`${name}: copy matches the unavailable map geometry`);
      await context.close();
    }
    assert.deepEqual(out.errors, []); out.status = 'PASS';
  } catch (error) { out.status = 'FAIL'; out.failure = error.stack; process.exitCode = 1; }
  finally { fs.writeFileSync(path.join(directory, 'edge-results.json'), JSON.stringify(out, null, 2) + '\n'); await browser.close(); console.log(JSON.stringify(out)); }
})();
