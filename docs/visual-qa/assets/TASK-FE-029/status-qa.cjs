const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const runtime = process.env.PLAYWRIGHT_MODULES || '/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright';
const { chromium } = require(runtime), { expect } = require(runtime + '/test');
const directory = path.resolve('docs/visual-qa/assets/TASK-FE-029');
const out = { checks: [], transitions: [], notices: [], errors: [], consoleErrors: [], expectedApiErrors: [], requests: [] };
const pass = name => out.checks.push(name);
function check(name, actual, expected) { assert.deepEqual(actual, expected, name); pass(name); }
const sourceNotice = page => page.getByRole('status', { name: '자료 상태', exact: true });
const selectionNotice = page => page.getByRole('status', { name: '라인업 탐색 안내', exact: true });
const fixture = [
  { id: 'qa-state', title: 'QA state', description: 'Status transition fixture', mapId: 'ascent', side: 'ATTACK', agentId: 'sova', difficulty: 'EASY', skillMarkers: [{ abilityId: 'sova-recon-bolt', position: { x: .6, y: .3 } }], agentMarkers: [{ position: { x: .2, y: .7 } }], pathPoints: [{ x: .2, y: .7 }, { x: .6, y: .3 }], status: 'PUBLISHED', authorId: 'qa-fixture' },
];
async function makeContext(browser, width, outcome, items = fixture) {
  const context = await browser.newContext({ viewport: { width, height: 960 }, reducedMotion: 'reduce' });
  let release, observed;
  const pending = new Promise(resolve => { release = resolve; });
  const requested = new Promise(resolve => { observed = resolve; });
  await context.route('**/api/lineups', async route => {
    out.requests.push({ width, outcome, method: route.request().method(), url: route.request().url() }); observed();
    await pending;
    await route.fulfill({ status: outcome === 'failure' ? 503 : 200, contentType: 'application/json', body: JSON.stringify(outcome === 'failure' ? { error: 'CONTROLLED_PRIVATE_BACKEND_MESSAGE' } : outcome === 'empty' ? [] : items), headers: { 'access-control-allow-origin': '*' } }).catch(() => {});
  });
  const page = await context.newPage(); page.setDefaultTimeout(15000);
  page.on('pageerror', error => out.errors.push({ width, outcome, error: error.message }));
  page.on('console', message => {
    if (message.type() !== 'error') return;
    const record = { width, outcome, text: message.text(), location: message.location() };
    if (message.text().includes('503') && message.location().url.includes('/api/lineups')) out.expectedApiErrors.push(record);
    else out.consoleErrors.push(record);
  });
  return { page, context, release, requested };
}
async function inspect(page, label) {
  const facts = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - innerWidth,
    statuses: [...document.querySelectorAll('[role="status"]')].map(element => {
      const rect = element.getBoundingClientRect(), style = getComputedStyle(element);
      const text = [...element.querySelectorAll('strong,p,span')].map(child => {
        const box = child.getBoundingClientRect(); return { text: child.textContent, width: box.width, scrollWidth: child.scrollWidth, clientWidth: child.clientWidth, height: box.height, size: parseFloat(getComputedStyle(child).fontSize) };
      });
      return { text: element.textContent, label: element.getAttribute('aria-label'), live: element.getAttribute('aria-live'), atomic: element.getAttribute('aria-atomic'), width: rect.width, height: rect.height, visible: style.display !== 'none' && style.visibility === 'visible', scrollWidth: element.scrollWidth, clientWidth: element.clientWidth, children: text };
    }),
  }));
  check(label + ': document has no horizontal overflow', facts.overflow, 0);
  assert.ok(facts.statuses.every(status => status.visible && status.width > 0 && status.height > 0 && status.scrollWidth <= status.clientWidth + 1), label + ': a live notice is clipped');
  pass(label + ': live notices fit their containers');
  assert.ok(facts.statuses.every(status => status.live === null || status.live === 'polite'), label + ': status must announce politely');
  pass(label + ': polite live status semantics');
  assert.ok(facts.statuses.every(status => status.atomic === null || status.atomic === 'true'), label + ': status must be atomic');
  pass(label + ': atomic live status semantics');
  for (const status of facts.statuses) {
    assert.ok(!/API|Preview|503|CONTROLLED_PRIVATE_BACKEND_MESSAGE|요청 실패/.test(status.text), label + ': implementation/error detail leaked');
    assert.ok(status.children.every(child => child.size >= 12), label + ': notice text smaller than 12px');
  }
  pass(label + ': user-facing Korean status copy without raw server detail');
  out.notices.push({ label, ...facts });
}
async function keyboardClick(page, control, label) {
  await control.focus(); await page.keyboard.press('Enter'); pass(label + ': keyboard activation');
}
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [1440, 820, 390]) {
      for (const outcome of ['success', 'empty', 'failure']) {
        const { page, context, release, requested } = await makeContext(browser, width, outcome);
        await page.goto('http://localhost:3000/lineups', { waitUntil: 'domcontentloaded', timeout: 45000 });
        await Promise.race([requested, new Promise((_, reject) => setTimeout(() => reject(new Error('Controlled API request not observed')), 15000))]);
        await expect(sourceNotice(page)).toHaveCount(1);
        await expect(sourceNotice(page)).toContainText('라인업을 불러오고 있어요');
        await expect(sourceNotice(page)).toContainText('예시');
        const beforeNode = await sourceNotice(page).elementHandle();
        await keyboardClick(page, page.getByRole('button', { name: 'Ascent', exact: true }), `${width} ${outcome} map`);
        await expect(selectionNotice(page)).toHaveCount(1);
        await keyboardClick(page, page.getByRole('button', { name: 'Sova', exact: true }), `${width} ${outcome} agent`);
        await keyboardClick(page, page.getByRole('button', { name: 'C', exact: true }), `${width} ${outcome} unmatched loading skill`);
        await expect(selectionNotice(page)).toContainText(/불러오/);
        assert.ok(!/없어요|없습니다|0건/.test(await selectionNotice(page).textContent()), `${width} ${outcome}: loading incorrectly says empty`);
        pass(`${width} ${outcome}: loading examples are disclosed and no premature empty message`);
        await inspect(page, `${width} loading before ${outcome}`);
        release();
        const title = outcome === 'success' ? '공개 라인업' : outcome === 'empty' ? '공개된 라인업이 없어요' : '예시 라인업을 보고 있어요';
        await expect(sourceNotice(page).getByText(title, { exact: true })).toBeVisible();
        assert.ok(await beforeNode.evaluate(element => element.isConnected), `${width} ${outcome}: live region remounted instead of updating`);
        pass(`${width} ${outcome}: existing live status receives the completed response`);
        if (outcome === 'success') {
          await expect(selectionNotice(page)).toContainText(/조건/);
          await expect(selectionNotice(page)).toContainText(/없/);
          assert.ok(!(await sourceNotice(page).textContent()).includes('없어요'), `${width}: filtered empty incorrectly labels the source empty`);
          pass(`${width}: filtered empty differs from a nonempty public source`);
          await keyboardClick(page, page.getByRole('button', { name: 'E', exact: true }), `${width} restore matching skill`);
          await expect(page.locator('.strats-skill-pin')).toHaveCount(1);
          await keyboardClick(page, page.locator('.strats-skill-pin'), `${width} select destination`);
          await expect(page.locator('.strats-path-overlay')).toHaveCount(1);
          await expect(page.locator('.strats-open-detail')).toHaveAttribute('href', '/lineups/qa-state');
          pass(`${width}: matching result restores map selection and detail URL`);
          await keyboardClick(page, page.getByRole('button', { name: '수비', exact: true }), `${width} unmatched defense`);
          await expect(selectionNotice(page)).toContainText(/조건/);
          await expect(page.locator('.strats-path-overlay')).toHaveCount(0);
          pass(`${width}: side filter updates empty status and clears path`);
        } else if (outcome === 'empty') {
          await expect(selectionNotice(page)).toContainText(/공개/);
          await expect(page.locator('.strats-map-pin')).toHaveCount(0);
          pass(`${width}: zero public records do not reuse fallback examples`);
        } else {
          await expect(sourceNotice(page)).toContainText('검증');
          await page.getByRole('button', { name: 'E', exact: true }).click();
          await expect(page.locator('.strats-skill-pin')).toHaveCount(1);
          pass(`${width}: failed fetch preserves disclosed fallback examples`);
        }
        await inspect(page, `${width} settled ${outcome}`);
        out.transitions.push({ width, outcome, source: await sourceNotice(page).textContent(), selection: await selectionNotice(page).textContent() });
        await context.close();
      }
    }
    // Public records can legitimately lack map coordinates; do not call them an empty source.
    const sparse = [{ ...fixture[0], skillMarkers: [], agentMarkers: [], pathPoints: [] }];
    const sparseRun = await makeContext(browser, 390, 'sparse', sparse);
    sparseRun.release();
    await sparseRun.page.goto('http://localhost:3000/lineups', { waitUntil: 'networkidle' });
    await sparseRun.page.getByRole('button', { name: 'Ascent', exact: true }).click();
    await sparseRun.page.getByRole('button', { name: 'Sova', exact: true }).click();
    await expect(sourceNotice(sparseRun.page)).toContainText('공개 라인업');
    await expect(selectionNotice(sparseRun.page)).toContainText(/위치/);
    await expect(sparseRun.page.locator('.strats-map-pin')).toHaveCount(0);
    await expect(sparseRun.page.locator('.strats-open-detail')).toHaveAttribute('href', '/lineups/qa-state');
    pass('Sparse public record keeps its detail link and explains unavailable map positions');
    await inspect(sparseRun.page, '390 sparse public coordinates');
    await sparseRun.context.close();
    check('No page errors', out.errors, []);
    check('No unexpected console errors', out.consoleErrors, []);
    check('Only read-only API requests', [...new Set(out.requests.map(request => request.method))], ['GET']);
    out.status = 'PASS';
  } catch (error) { out.status = 'FAIL'; out.failure = error.stack; process.exitCode = 1; }
  finally { fs.writeFileSync(path.join(directory, 'status-results.json'), JSON.stringify(out, null, 2) + '\n'); await browser.close(); console.log(JSON.stringify({ status: out.status, checks: out.checks.length, transitions: out.transitions.length, errors: out.errors, consoleErrors: out.consoleErrors, failure: out.failure })); }
})();
