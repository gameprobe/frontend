const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const phase = process.argv[2];
assert.ok(['before', 'after'].includes(phase));
const result = { phase, screens: [], checks: [], errors: [], apiRequests: [] };
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:3000';
async function capture(page, name) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    window.scrollTo({ top: 0, behavior: 'instant' });
    await new Promise(requestAnimationFrame); await new Promise(requestAnimationFrame);
  });
  const file = `multiroute-${phase}-${name}.png`;
  await page.screenshot({ path: `${__dirname}/${file}`, fullPage: true, animations: 'disabled' });
  result.screens.push(file);
}
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      await page.addInitScript(() => localStorage.setItem('gameprobe:locale', 'ko'));
      page.on('pageerror', e => result.errors.push(e.message));
      page.on('console', m => { if (m.type() === 'error') result.errors.push(m.text()); });
      page.on('request', r => { if (r.url().includes('/api/')) result.apiRequests.push(r.url()); });
      await page.goto(base + '/admin/preview');
      await page.getByLabel('예시 입장 코드', { exact: true }).fill('DEMO1234');
      await page.getByRole('button', { name: '예시 화면 들어가기' }).click();
      await page.getByRole('heading', { name: '전술 자료 관리', exact: true }).waitFor();
      await page.waitForFunction(() => [...document.images].filter(i => i.closest('[class*="mapCanvas"]')).every(i => i.complete && i.naturalWidth > 0));
      await capture(page, `${width}-editor`);
      await page.getByRole('button', { name: '미리보기', exact: true }).click();
      await capture(page, `${width}-preview`);
      if (phase === 'after') {
        assert.equal(await page.locator('[data-pin="시작"]').count(), 1);
        assert.equal(await page.locator('[data-pin="도착"]').count(), 2);
        const trajectory = id => page.locator(`[data-route="trajectory"][data-route-id="${id}"]`);
        const routePoints = () => page.locator('[data-route="trajectory"]').evaluateAll(nodes => nodes.map(el => ({ id: el.dataset.routeId, points: el.getAttribute('points') })));
        const map = page.locator('[class*="mapCanvas"][role="button"]');
        const point = async (x,y) => {
          await map.scrollIntoViewIfNeeded(); const box = await map.boundingBox();
          await map.click({position:{x:box.width*x,y:box.height*y}});
        };
        const choose = n => page.getByRole('button', {name:`경로 ${n}`, exact:true}).click();
        const save = () => page.getByRole('button', {name:'예시 목록에 저장',exact:true}).click();
        await page.getByRole('button', {name:'편집으로 돌아가기'}).click();
        const ids = await page.locator('[data-editor-route]').evaluateAll(nodes => nodes.map(el=>el.dataset.editorRoute));
        const originalFirst = await trajectory(ids[0]).getAttribute('points');
        const originalSecond = await trajectory(ids[1]).getAttribute('points');
        await choose(2);
        await page.getByRole('button', {name:'벽 튕김',exact:true}).click(); await point(.52,.58);
        assert.equal(await trajectory(ids[0]).getAttribute('points'),originalFirst);
        assert.notEqual(await trajectory(ids[1]).getAttribute('points'),originalSecond);
        await page.getByRole('button', {name:'마지막 지점 취소'}).click();
        assert.equal(await trajectory(ids[1]).getAttribute('points'),originalSecond);
        await page.getByRole('button', {name:'시작 위치',exact:true}).click(); await point(.2,.8);
        const starts = (await routePoints()).map(route=>route.points.split(' ')[0]);
        assert.equal(new Set(starts).size,1);
        assert.ok(Math.abs(Number(starts[0].split(',')[0])-200)<4);
        await page.getByRole('button', {name:/경로 추가/}).click();
        assert.equal(await page.locator('[data-editor-route]').count(),3);
        await save();
        assert.match(await page.locator('[class*="errorBox"]').innerText(),/경로 3.*도착/);
        await point(.8,.23);
        await page.getByRole('button', {name:'경유점',exact:true}).click(); await point(.6,.7);
        await page.getByRole('button', {name:'벽 튕김',exact:true}).click(); await point(.72,.42);
        await page.getByLabel('제목 *',{exact:true}).fill('QA · 복수 도착');
        await save();
        const saved = await routePoints(); assert.equal(saved.length,3);
        const thirdId = saved[2].id;
        await capture(page,`${width}-three-routes-editor`);
        await page.getByRole('button',{name:'미리보기',exact:true}).click();
        assert.deepEqual(await routePoints(),saved);
        assert.equal(await page.locator('[data-pin="시작"]').count(),1);
        assert.equal(await page.locator('[data-pin="도착"]').count(),3);
        await capture(page,`${width}-three-routes-preview`);
        await page.getByRole('button',{name:'편집으로 돌아가기'}).click();
        const list = page.getByRole('complementary',{name:'예시 자료 목록'});
        await list.getByRole('button',{name:/^스모크/}).click();
        await list.getByRole('button',{name:/^라인업/}).click();
        assert.deepEqual(await routePoints(),saved);
        await choose(2); await page.getByRole('button',{name:'선택 경로 삭제'}).click();
        assert.equal(await page.locator('[data-editor-route]').count(),2);
        assert.equal(await trajectory(ids[1]).count(),0);
        assert.equal(await trajectory(thirdId).getAttribute('points'),saved[2].points);
        await choose(2);
        assert.equal(await page.locator('[data-editor-route][aria-pressed="true"]').getAttribute('data-editor-route'),thirdId);
        const firstBeforeReset = await trajectory(ids[0]).getAttribute('points');
        await page.getByRole('button',{name:'선택 경로 비우기'}).click();
        assert.equal(await trajectory(ids[0]).getAttribute('points'),firstBeforeReset);
        assert.equal(await trajectory(thirdId).count(),0);
        assert.equal(await page.locator('[data-pin="시작"]').count(),1);
        await point(.8,.3); // refill selected destination
        await page.getByLabel('맵',{exact:true}).selectOption('bind');
        assert.equal(await page.locator('[data-pin]').count(),0);
        assert.equal(await page.locator('[data-route="trajectory"]').count(),0);
        assert.equal(await page.locator('[data-editor-route]').count(),2);
        await save();
        const errors = await page.locator('[class*="errorBox"]').innerText();
        assert.match(errors,/경로 1.*도착/); assert.match(errors,/경로 2.*도착/);
        page.once('dialog',d=>d.accept());
        await list.getByRole('button',{name:/^스모크/}).click();
        await list.getByRole('button',{name:/하버 벽형/}).click();
        await page.getByRole('button',{name:/경로 추가/}).click();
        await point(.65,.4);
        await page.getByRole('button',{name:'벽 끝',exact:true}).click(); await point(.8,.4);
        await save();
        assert.equal(await page.locator('[data-wall-route]').count(),2);
        assert.equal(await page.locator('[data-pin="벽 끝"]').count(),2);
        await capture(page,`${width}-multiple-walls`);
        await page.getByLabel('스모크 형태').selectOption('circle');
        assert.equal(await page.locator('[data-wall-route]').count(),0);
        assert.equal(await page.locator('[data-pin="벽 끝"]').count(),0);
        await page.getByRole('button',{name:'전체 위치 초기화'}).click();
        assert.equal(await page.locator('[data-pin]').count(),0);
        assert.equal(await page.getByRole('button',{name:'시작 위치',exact:true}).getAttribute('aria-pressed'),'true');
        await page.getByRole('button',{name:'선택 경로 삭제'}).click();
        assert.equal(await page.getByRole('button',{name:'선택 경로 삭제'}).isDisabled(),true);
        await page.reload();
        await page.getByLabel('예시 입장 코드',{exact:true}).fill('DEMO1234');
        await page.getByRole('button',{name:'예시 화면 들어가기'}).click();
        assert.equal(await page.locator('[data-editor-route]').count(),2);
        assert.notEqual(await page.getByLabel('제목 *',{exact:true}).inputValue(),'QA · 복수 도착');
        result.checks.push({width,sharedStart:'PASS',isolatedRoutes:'PASS',allRouteValidation:'PASS',savedPreview:'PASS',stableDelete:'PASS',selectedReset:'PASS',mapReset:'PASS',multipleWalls:'PASS',allReset:'PASS',reload:'PASS'});
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.close();
    }
    assert.deepEqual(result.errors, []); assert.deepEqual(result.apiRequests, []);
  } finally {
    await browser.close();
    fs.writeFileSync(`${__dirname}/multiroute-${phase}.json`, JSON.stringify(result, null, 2) + '\n');
  }
  console.log(JSON.stringify(result));
})().catch(error => { console.error(error); process.exitCode = 1; });
