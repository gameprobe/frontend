const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const phase = process.argv[2];
assert.ok(['before', 'after'].includes(phase));
const result = { phase, screenshots: [], checks: [], errors: [], apiRequests: [] };
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:3000';
async function capture(page, name) {
  await page.evaluate(async () => { await document.fonts.ready; window.scrollTo({ top: 0, behavior: 'instant' }); await new Promise(requestAnimationFrame); await new Promise(requestAnimationFrame); });
  const filename = `${phase}-${name}.png`;
  await page.screenshot({ path: `${__dirname}/${filename}`, fullPage: true, animations: 'disabled' });
  result.screenshots.push(filename);
}
async function before(page, width) {
  await capture(page, `${width}-lineup-editor-sidebar`);
  await page.getByRole('button', { name: '미리보기', exact: true }).click();
  await capture(page, `${width}-preview`);
  await page.getByRole('button', { name: '편집으로 돌아가기', exact: true }).click();
  await page.getByRole('complementary', { name: '예시 자료 목록' }).getByRole('button', { name: /^스모크/ }).click();
  await capture(page, `${width}-smoke-editor-sidebar`);
  result.checks.push({ width, captured: true });
}
async function after(page, width) {
  const nav = name => page.getByRole('button', { name: new RegExp(`^${name} 관리`) });
  const rows = page.locator('[data-guide-id]');
  const row = id => page.locator(`[data-guide-id="${id}"]`);
  const query = page.getByRole('textbox', { name: '자료 검색', exact: true });
  const status = page.getByRole('combobox', { name: '목록 상태 필터', exact: true });
  const back = () => page.getByRole('button', { name: '목록으로', exact: true }).click();
  const save = () => page.getByRole('button', { name: '예시 목록에 저장', exact: true }).click();
  const reset = () => page.getByRole('button', { name: '검색 조건 초기화', exact: true }).click();
  const title = page.locator('#preview-title');
  let nextDecision = null;
  const dialogs = [];
  page.on('dialog', async dialog => {
    const decision = nextDecision;
    nextDecision = null;
    dialogs.push({ message: dialog.message(), decision: decision || 'unexpected' });
    if (decision === 'accept') await dialog.accept();
    else await dialog.dismiss();
  });
  async function decide(decision, action) {
    const count = dialogs.length; nextDecision = decision;
    await action(); assert.equal(dialogs.length, count + 1, `${decision} discard confirmation`);
    assert.equal(nextDecision, null);
  }
  async function noDialog(action) { const count = dialogs.length; await action(); assert.equal(dialogs.length, count, 'no unexpected discard prompt'); }
  async function meaningfulFocus(label) {
    await page.evaluate(async () => { await new Promise(requestAnimationFrame); await new Promise(requestAnimationFrame); });
    const focus = await page.evaluate(() => { const el = document.activeElement; return { tag: el?.tagName, text: el?.textContent?.trim(), hidden: el instanceof HTMLElement ? !el.getClientRects().length : true }; });
    assert.notEqual(focus.tag, 'BODY', label); assert.equal(focus.hidden, false, label);
    return focus;
  }
  async function assertList(count) {
    await query.waitFor({ state: 'visible' }); assert.equal(await title.count(), 0); assert.equal(await rows.count(), count);
  }
  async function clickMap(x, y) {
    const canvas = page.locator('[class*="mapCanvas"]');
    const placement = page.getByRole('button', { name: '지도 위치 지정', exact: true });
    await canvas.evaluate(el => el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }));
    const b = await placement.boundingBox(); assert.ok(b);
    if (width === 390) await page.touchscreen.tap(b.x + b.width * x, b.y + b.height * y);
    else await placement.click({ position: { x: b.width * x, y: b.height * y } });
  }
  await assertList(3);
  assert.equal(await nav('라인업').count(), 1); assert.equal(await nav('스모크').count(), 1);
  const initialFocus = await meaningfulFocus('initial list focus');
  await capture(page, `${width}-lineup-list`);
  if (width === 390) {
    const a = await nav('라인업').boundingBox(), b = await nav('스모크').boundingBox(); assert.ok(a && b);
    assert.ok(Math.abs(a.y - b.y) < 8, 'mobile management menu is compact horizontal navigation');
  }
  await query.fill('소바'); await status.selectOption('review'); await assertList(1);
  await row('preview-lineup-01').focus(); await row('preview-lineup-01').press('Enter');
  await title.waitFor({ state: 'visible' }); assert.equal(await rows.count(), 0);
  const editorFocus = await meaningfulFocus('editor receives focus after keyboard activation');
  const originalTitle = await title.inputValue();
  await capture(page, `${width}-lineup-editor`);
  await noDialog(back); await assertList(1);
  assert.equal(await query.inputValue(), '소바'); assert.equal(await status.inputValue(), 'review');
  const returnFocus = await meaningfulFocus('return-to-list focus');
  await nav('스모크').click(); await assertList(2);
  assert.equal(await query.inputValue(), ''); assert.equal(await status.inputValue(), 'all');
  await query.fill('원형'); await status.selectOption('draft'); await assertList(1);
  await nav('라인업').click(); await assertList(1); assert.equal(await query.inputValue(), '소바'); assert.equal(await status.inputValue(), 'review');
  await nav('스모크').click(); await assertList(1); assert.equal(await query.inputValue(), '원형'); assert.equal(await status.inputValue(), 'draft');
  await capture(page, `${width}-smoke-filtered-list`);
  await query.fill('없는 자료 QA'); await assertList(0); await capture(page, `${width}-empty-list`);
  await reset(); await assertList(2); assert.equal(await query.inputValue(), ''); assert.equal(await status.inputValue(), 'all');

  await nav('라인업').click(); await row('preview-lineup-01').click();
  await title.fill('QA · 저장하지 않은 라인업');
  await decide('dismiss', back); assert.equal(await title.inputValue(), 'QA · 저장하지 않은 라인업');
  await decide('dismiss', () => nav('라인업').click()); assert.equal(await title.inputValue(), 'QA · 저장하지 않은 라인업');
  await decide('dismiss', () => nav('스모크').click()); assert.equal(await title.inputValue(), 'QA · 저장하지 않은 라인업');
  await noDialog(() => page.getByRole('button', { name: '미리보기', exact: true }).click());
  assert.equal(await page.getByRole('heading', { name: 'QA · 저장하지 않은 라인업', exact: true }).count(), 1);
  await decide('dismiss', back); assert.equal(await title.count(), 0);
  await decide('dismiss', () => nav('스모크').click());
  await capture(page, `${width}-dirty-preview`);
  await noDialog(() => page.getByRole('button', { name: '편집으로 돌아가기', exact: true }).click());
  assert.equal(await title.inputValue(), 'QA · 저장하지 않은 라인업');
  await decide('dismiss', () => page.getByRole('button', { name: '이 도착점에 공략 추가', exact: true }).click());
  assert.equal(await title.inputValue(), 'QA · 저장하지 않은 라인업');
  await decide('accept', back); await assertList(1);
  await row('preview-lineup-01').click(); assert.equal(await title.inputValue(), originalTitle);

  // Saving does not clear list conditions even when the edited title no longer matches.
  await title.fill('QA · 제목 수정 저장'); await noDialog(save);
  assert.equal(await title.inputValue(), 'QA · 제목 수정 저장'); assert.equal(await query.count(), 0);
  await capture(page, `${width}-saved-editor`);
  await noDialog(back); await assertList(0); assert.equal(await query.inputValue(), '소바'); assert.equal(await status.inputValue(), 'review');
  await reset(); await assertList(3);
  await row('preview-lineup-01').click(); assert.equal(await title.inputValue(), 'QA · 제목 수정 저장');
  await title.fill('QA · 다른 새 공략 전환');
  await decide('accept', () => page.getByRole('button', { name: '이 도착점에 공략 추가', exact: true }).click());
  assert.equal(await title.inputValue(), ''); assert.equal(await page.locator('#preview-url').inputValue(), '');
  await noDialog(back); await assertList(3);

  await page.getByRole('button', { name: '새 라인업 등록', exact: true }).click();
  await meaningfulFocus('new lineup editor focus');
  assert.equal(await title.inputValue(), '');
  await title.fill('QA · 신규 라인업'); await page.locator('#preview-destination-name').fill('QA · 신규 도착점'); await page.locator('#preview-url').fill('https://example.com/new-lineup');
  await clickMap(.75, .25); await clickMap(.25, .8);
  await capture(page, `${width}-new-lineup`);
  await save(); assert.equal(await title.inputValue(), 'QA · 신규 라인업');
  await noDialog(back); await assertList(4);
  const created = rows.filter({ hasText: 'QA · 신규 라인업' }); assert.equal(await created.count(), 1);
  await created.click(); assert.equal(await title.inputValue(), 'QA · 신규 라인업'); await noDialog(back);

  await nav('스모크').click(); await assertList(2);
  await page.getByRole('button', { name: '새 스모크 등록', exact: true }).click();
  await title.fill('QA · 신규 스모크'); await page.locator('#preview-destination-name').fill('QA · 신규 연막 도착점'); await page.locator('#preview-url').fill('https://example.com/new-smoke');
  await clickMap(.68, .32); await clickMap(.3, .76);
  await page.getByRole('button', { name: '미리보기', exact: true }).click();
  assert.equal(await page.getByRole('heading', { name: 'QA · 신규 스모크', exact: true }).count(), 1);
  await noDialog(save); assert.equal(await page.getByRole('button', { name: '편집으로 돌아가기', exact: true }).count(), 1);
  await capture(page, `${width}-smoke-preview`);
  await noDialog(back); await assertList(3);
  await capture(page, `${width}-smoke-list`);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  assert.deepEqual(dialogs.filter(dialog => dialog.decision === 'unexpected'), []);
  await page.reload(); await page.getByLabel('예시 입장 코드', { exact: true }).waitFor();
  assert.equal(await rows.count(), 0);
  await page.getByLabel('예시 입장 코드', { exact: true }).fill('DEMO1234'); await page.getByRole('button', { name: '예시 화면 들어가기' }).click();
  await assertList(3); assert.equal(await query.inputValue(), ''); assert.equal(await status.inputValue(), 'all');
  assert.deepEqual(await page.evaluate(() => Object.keys(localStorage).filter(key => key !== 'gameprobe:locale')), []);
  result.checks.push({ width, initialList: 'PASS', keyboardOpen: 'PASS', focus: { initialFocus, editorFocus, returnFocus }, perKindFilters: 'PASS', emptyReset: 'PASS', dirtyGuard: 'PASS', dialogs, saveStaysEditor: 'PASS', savePreservesFilters: 'PASS', newLineup: 'PASS', newSmoke: 'PASS', preview: 'PASS', reload: 'PASS', overflow: false });
}
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, hasTouch: width === 390 });
      await page.addInitScript(() => localStorage.setItem('gameprobe:locale', 'ko'));
      page.on('pageerror', error => result.errors.push(error.message));
      page.on('request', request => { if (request.url().includes('/api/')) result.apiRequests.push(request.url()); });
      await page.goto(`${base}/admin/preview`);
      await capture(page, `${width}-gate`);
      await page.getByLabel('예시 입장 코드', { exact: true }).fill('DEMO1234');
      await page.getByRole('button', { name: '예시 화면 들어가기' }).click();
      await page.getByRole('heading', { name: '전술 자료 관리', exact: true }).waitFor();
      await page.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth > 0));
      if (phase === 'before') await before(page, width);
      else await after(page, width);
      await page.close();
    }
    assert.deepEqual(result.errors, []); assert.deepEqual(result.apiRequests, []);
  } catch (error) { result.failure = String(error); throw error; }
  finally { fs.writeFileSync(`${__dirname}/${phase}.json`, JSON.stringify(result, null, 2) + '\n'); await browser.close(); }
  console.log(JSON.stringify(result));
})().catch(error => { console.error(error); process.exitCode = 1; });
