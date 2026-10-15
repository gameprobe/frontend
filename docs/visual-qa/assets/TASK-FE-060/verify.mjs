import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
const out = path.dirname(new URL(import.meta.url).pathname);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [], errors = [], dataRequests = [];
const routes = ['/', '/review', '/review?lang=en', '/privacy', '/privacy?lang=en', '/terms', '/terms?lang=en', '/insights', '/insights?lang=en', '/my', '/my/consent', '/my/login-failed', '/players/demo-player-01', '/matches/demo-match-001', '/lineups', '/smokes'];
async function go(page, route, origin = base) {
  await page.goto(origin + route, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
}
async function setCheckbox(page, name, checked) {
  const input = page.getByRole('checkbox',{name,exact:true});
  if (await input.isChecked() !== checked) await input.locator('..').click();
  assert.equal(await input.isChecked(),checked);
}
try {
  for (const [label, width] of [['desktop',1440], ['mobile',390]]) {
    const ctx = await browser.newContext({ viewport: { width, height: label === 'desktop' ? 1000 : 844 } });
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push(e.message));
    page.on('request', req => { const u = new URL(req.url()); if (/riotgames\.com$/.test(u.hostname) || /\/api\//.test(u.pathname)) dataRequests.push(req.url()); });
    // Production Before remains unchanged; mobile evidence for the same routes.
    if (label === 'mobile') {
      for (const route of ['/', '/privacy', '/insights', '/my/consent']) {
        await go(page, route, 'https://www.game-probe.com');
        await page.screenshot({path: path.join(out, `before-${label}-${route === '/' ? 'home' : route.slice(1).replaceAll('/','-')}.png`), fullPage:true});
      }
    }
    for (const route of routes) {
      await go(page, route);
      const text = await page.locator('main').innerText();
      assert(!text.includes('페이지를 찾을 수 없어요'), `${route} rendered 404`);
      assert(text.trim().length > 20, `${route} empty`);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${label} overflow ${route}`);
      if (route === '/players/demo-player-01') assert(decodeURIComponent(page.url()).includes('프로브#KR1'));
      results.push({ label, route, rendered: true, overflow: false });
      if (['/', '/review', '/review?lang=en', '/privacy', '/insights', '/insights?lang=en', '/my/consent'].includes(route)) {
        await page.screenshot({path:path.join(out, `after-${label}-${route === '/' ? 'home' : route.slice(1).replaceAll('/','-').replace('?lang=','-')}.png`),fullPage:true});
      }
      if (route === '/privacy?lang=en') {
        await page.reload({waitUntil:'networkidle'});
        assert(await page.getByRole('heading',{name:'Your data, clearly explained.'}).count() === 1);
        await page.getByRole('button',{name:'한국어',exact:true}).click();
        assert(await page.getByRole('heading',{name:'정보가 어디에 남는지 알려드릴게요.'}).count() === 1);
        await page.getByRole('button',{name:'English',exact:true}).click();
        assert(page.url().includes('lang=en'));
        await page.getByRole('link',{name:'Read terms →'}).click();
        assert(await page.getByRole('heading',{name:'Using GameProbe.'}).count() === 1);
      }
    }
    // Public reviewer links are functional, not just present.
    await go(page,'/review?lang=en');
    for (const label of ['Open sample profile','Open sample match','Open consent demo','Open example report']) {
      await page.getByRole('link',{name:label,exact:true}).click();
      assert(!(await page.locator('main').innerText()).includes('페이지를 찾을 수 없어요'));
      await go(page,'/review?lang=en');
    }
    await go(page,'/connect');
    assert(new URL(page.url()).pathname === '/my/consent');
    const submit = page.getByRole('button',{name:'선택하고 예시 연결',exact:true});
    assert(await submit.isDisabled());
    assert(await page.locator('input[type=checkbox]:checked').count() === 0);
    const keyboardBox=page.getByRole('checkbox',{name:'필수 Riot ID 및 태그',exact:true});
    await keyboardBox.focus(); await keyboardBox.press('Space'); assert(await keyboardBox.isChecked());
    await keyboardBox.press('Space'); assert(!(await keyboardBox.isChecked()));
    await setCheckbox(page, '필수 Riot ID 및 태그', true);
    assert(await submit.isDisabled());
    await page.getByRole('link',{name:'취소',exact:true}).click();
    assert.equal(await page.evaluate(()=>localStorage.getItem('gp:mock-session')),null);
    await go(page,'/connect');
    assert(await page.locator('input[type=checkbox]:checked').count() === 0);
    await setCheckbox(page, '필수 Riot ID 및 태그', true);
    await setCheckbox(page, '필수 종료된 매치 기록 및 플레이어 통계', true);
    assert(await submit.isEnabled());
    await submit.click();
    assert.equal(new URL(page.url()).pathname,'/my');
    let session = await page.evaluate(()=>JSON.parse(localStorage.getItem('gp:mock-session')));
    assert.equal(session.gameName,'프로브'); assert.equal(session.shareRegion,false);
    await page.reload({waitUntil:'networkidle'});
    await page.getByRole('button',{name:'예시 연결 해제',exact:true}).click();
    assert.equal(await page.evaluate(()=>localStorage.getItem('gp:mock-session')),null);
    await page.reload({waitUntil:'networkidle'});
    assert(await page.getByRole('heading',{name:'예시 계정으로 연결 과정을 살펴보세요'}).count() === 1);
    // Optional and select-all behavior, then clean up.
    await go(page,'/connect');
    await setCheckbox(page, '전체 동의', true);
    assert.equal(await page.locator('input[type=checkbox]:checked').count(),4);
    await setCheckbox(page, '전체 동의', false);
    assert(await submit.isDisabled());
    await setCheckbox(page, '전체 동의', true);
    await submit.click();
    session=await page.evaluate(()=>JSON.parse(localStorage.getItem('gp:mock-session')));
    assert.equal(session.shareRegion,true);
    await page.getByRole('button',{name:'예시 연결 해제',exact:true}).click();
    results.push({label,consent:'unchecked / required gating / cancel / persist / unlink / optional / select-all PASS',walkthrough:'4 links PASS',language:'switch / link / reload PASS'});
    await ctx.close();
  }
  assert.equal(errors.length,0,JSON.stringify(errors));
  assert.equal(dataRequests.length,0,JSON.stringify(dataRequests));
  const report = {status:'PASS',base,routes:results,errors,dataRequests,checkedAt:new Date().toISOString()};
  await fs.writeFile(path.join(out,'results.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({status:'PASS',routeChecks:32,flows:2,errors:errors.length,dataRequests:dataRequests.length}));
} catch (e) {
  await fs.writeFile(path.join(out,'failure.json'),JSON.stringify({error:String(e),results,errors,dataRequests},null,2));
  throw e;
} finally { await browser.close(); }
