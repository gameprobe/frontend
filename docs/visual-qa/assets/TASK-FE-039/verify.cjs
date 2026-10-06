const { chromium } = require(process.env.PLAYWRIGHT_MODULE);
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const mode = process.argv[2] || 'before';
const out = __dirname;
const results = [];
(async () => {
  const browser = await chromium.launch();
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, isMobile: width === 390, hasTouch: width === 390 });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    // Existing demo video IDs are not playable: avoid third-party requests during baseline capture.
    await page.route('**/www.youtube.com/**', route => route.abort());
    const shot = async name => { await page.evaluate(() => window.scrollTo(0, 0)); await page.screenshot({ path: path.join(out, `${mode}-${width}-${name}.png`), fullPage: true }); };
    await page.goto('http://localhost:3000/lineups');
    await page.getByRole('button', { name: 'Ascent', exact: true }).click();
    await page.getByRole('button', { name: 'Sova', exact: true }).click();
    await page.getByRole('button', { name: 'E', exact: true }).click();
    if (mode === 'before') {
      await shot('destinations');
      await page.getByRole('button', { name: /도착 위치에서 시작 요원 보기/ }).click();
      await page.mouse.move(0, 0);
      await shot('origins');
      await page.getByRole('link', { name: '선택한 라인업 상세 보기 →' }).click();
      await page.getByRole('heading', { name: 'A 메인 진입용 사이트 리콘 볼트' }).waitFor();
      await shot('detail');
    } else {
      const groupButton = page.getByRole('button', { name: '예시 A 도착점 · 공략 3개', exact: true });
      await groupButton.waitFor();
      assert.equal(await page.getByRole('button', { name: / · 공략 \d개$/ }).count(), 2);
      assert.equal(await page.locator('[data-lineup-id]').count(), 0);
      await shot('destinations');
      await groupButton.click();
      await page.mouse.move(0, 0);
      await page.waitForFunction(() => document.querySelectorAll('[data-lineup-id]').length === 3);
      assert.equal(await page.getByRole('region', { name: '선택한 도착점의 공략' }).getByRole('link').count(), 3);
      const selectedOrigin = page.getByRole('link', { name: '예시 · 다른 출발점에서 A 도착점으로 ② 상세 자료 보기', exact: true });
      await shot('origins');
      if (width === 1440) {
        await selectedOrigin.hover();
        await page.waitForFunction(() => document.querySelectorAll('[data-lineup-id]').length === 1);
        assert.equal(await page.locator('[data-lineup-id]').getAttribute('data-lineup-id'), 'example-ascent-sova-a-recon-origin-2');
        await shot('hover-route');
        await page.mouse.move(0, 0);
        await page.waitForFunction(() => document.querySelectorAll('[data-lineup-id]').length === 3);
        await page.getByRole('link', { name: 'A 메인 진입용 사이트 리콘 볼트 상세 자료 보기', exact: true }).hover();
        await selectedOrigin.focus();
        await page.waitForFunction(() => document.querySelectorAll('[data-lineup-id]').length === 1);
        assert.equal(await page.locator('[data-lineup-id]').getAttribute('data-lineup-id'), 'example-ascent-sova-a-recon-origin-2');
        await selectedOrigin.press('Enter');
      } else { await selectedOrigin.tap(); }
      await page.getByRole('heading', { name: '예시 · 다른 출발점에서 A 도착점으로 ②', exact: true }).waitFor();
      assert.ok(page.url().endsWith('/lineups/example-ascent-sova-a-recon-origin-2'));
      assert.equal(await page.locator('iframe').count(), 0);
      await page.getByText('이 예시에는 실제 영상이 연결되어 있지 않습니다.').waitFor();
      assert.equal(await page.locator('.lineup-path-overlay polyline').getAttribute('points'), '43,80 61,67 72,42');
      await shot('detail');
      await page.goto('http://localhost:3000/lineups');
      await page.getByRole('button', { name: 'Ascent', exact: true }).click();
      await page.getByRole('button', { name: 'Sova', exact: true }).click();
      await page.getByRole('button', { name: 'E', exact: true }).click();
      await groupButton.click();
      await page.getByRole('button', { name: '예시 별도 도착점 · 공략 1개', exact: true }).click();
      assert.equal(await page.getByRole('region', { name: '선택한 도착점의 공략' }).getByRole('link').count(), 1);
      await page.getByRole('button', { name: 'Q', exact: true }).click();
      assert.equal(await page.getByRole('region', { name: '선택한 도착점의 공략' }).count(), 0);
      assert.equal(await page.locator('[data-lineup-id]').count(), 0);
      await page.getByRole('button', { name: '수비', exact: true }).click();
      await page.getByText('현재 예시에는 선택한 조건에 맞는 라인업이 없어요.', { exact: false }).waitFor();
      await shot('empty');
      await page.getByRole('button', { name: 'Killjoy', exact: true }).click();
      await page.getByRole('button', { name: /예시 B 설치 위치 · 공략 1개/ }).click();
      const path = await page.locator('[data-lineup-id]').getAttribute('points');
      assert.ok(path.startsWith('43,78') && path.endsWith('31,65'), path);
      await page.getByRole('button', { name: 'Ascent 맵 변경', exact: true }).click();
      await page.getByRole('button', { name: 'Haven 맵 선택', exact: true }).click();
      assert.equal(await page.locator('[data-lineup-id]').count(), 0);
      assert.equal(await page.getByRole('region', { name: '선택한 도착점의 공략' }).count(), 0);
      await page.getByRole('button', { name: '공격', exact: true }).click();
      await page.getByRole('button', { name: 'Sova', exact: true }).click();
      await page.getByRole('button', { name: /예시 C 도착점 · 공략 1개/ }).click();
      assert.equal(await page.getByRole('region', { name: '선택한 도착점의 공략' }).getByRole('link').count(), 1);
      results.push({ width, checks: ['distinct destinations', 'shared origins/routes', 'hover/focus or touch', 'detail identity/coordinates', 'missing demo media', 'destination switch', 'skill/side/map/agent reset', 'empty results', 'defense rotation'] });
    }
    assert.deepEqual(errors, []);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    results.push({ width, errors, overflow: false });
    await page.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(out, `${mode}.json`), JSON.stringify(results, null, 2));
  console.log(`${mode}: PASS 2 viewports`);
})().catch(e => { console.error(e); process.exit(1); });
