// Submission demo browser check. Uses existing Playwright + installed Chrome; no dependency install.
// Set PLAYWRIGHT_MODULE to a local Playwright package path, QA_BASE_URL to a reviewed deployment.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const phase = process.argv[2] || 'before';
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:3100';
const report = {phase, base, capturedAt: new Date().toISOString(), screens: [], checks: [], errors: [], consoleErrors: [], failedRequests: [], apiRequests: []};
const outputDir = process.env.QA_OUTPUT_DIR || __dirname;
fs.mkdirSync(outputDir, {recursive:true});
const output = name => path.join(outputDir, name);
const routes = [['home','/'],['profile','/players/demo-player-01'],['match','/matches/demo-match-001'],['connect','/connect'],['privacy','/privacy'],['terms','/terms'],['lineups','/lineups'],['smokes','/smokes']];
async function ready(page, locale) {
  await page.waitForFunction(locale => document.querySelector('main')?.lang === locale, locale);
  await page.evaluate(() => Promise.all([document.fonts.ready, ...Array.from(document.images, img => Promise.race([img.decode().catch(()=>{}), new Promise(r=>setTimeout(r,1500))]))]));
}
async function capture(page, name, width, locale, fullPage=true) {
  await ready(page, locale);
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${name}/${width}/${locale}: overflow`);
  assert.equal(await page.locator('main:visible').count(),1);
  assert.equal(await page.locator('[data-nextjs-dialog]').count(),0);
  const file=`${phase}-${width}-${locale}-${name}.png`;
  await page.screenshot({path:output(file), fullPage, animations:'disabled'});
  report.screens.push({name,width,locale,file});
}
async function main() {
  const browser=await chromium.launch({channel:'chrome',headless:true});
  try {
    for (const width of [1440,390]) for (const locale of ['ko','en']) {
      const ctx=await browser.newContext({viewport:{width,height:960},deviceScaleFactor:1});
      await ctx.addInitScript(locale=>localStorage.setItem('gameprobe:locale',locale),locale);
      const page=await ctx.newPage();
      page.setDefaultTimeout(15000);
      page.on('pageerror',e=>report.errors.push({url:page.url(),message:e.message}));
      page.on('console',e=>{if(e.type()==='error')report.consoleErrors.push({url:page.url(),message:e.text(),location:e.location()});});
      page.on('request',r=>{if(new URL(r.url()).pathname.startsWith('/api/'))report.apiRequests.push({url:r.url(),method:r.method()});});
      page.on('requestfailed',r=>report.failedRequests.push({url:r.url(),error:r.failure()?.errorText}));
      for (const [name,route] of routes) {
        const response=await page.goto(base+route);
        assert.equal(response.status(),200,route);
        if(name==='profile') await page.getByRole('heading',{name:/DemoPlayer01/}).waitFor();
        await capture(page,name,width,locale);
        if(phase==='after') {
          const footer=page.locator('footer:visible:has(a[href="/privacy"])');
          assert.equal(await footer.count(),1,`${route}: one visible footer`);
          assert.match(await footer.innerText(),/Riot Games/);
          for(const href of ['/privacy','/terms','/privacy#privacy-contact'])assert.equal(await footer.locator(`a[href="${href}"]`).count(),1);
          report.checks.push(`${route}/${width}/${locale}: HTTP200, single main/footer, policy/contact links, no overflow`);
        }
        if(name==='match') {
          for(const tab of ['Scoreboard','Performance','Economy','Rounds','Duels']) {
            await page.getByRole('tab',{name:tab,exact:true}).click();
            assert.equal(await page.getByRole('tab',{name:tab,exact:true}).getAttribute('aria-selected'),'true');
            await capture(page,`match-${tab.toLowerCase()}`,width,locale,false);
          }
          if(phase==='after') {
            await page.locator('footer:visible:has(a[href="/privacy"])').scrollIntoViewIfNeeded();
            await page.locator('footer:visible:has(a[href="/privacy"])').screenshot({path:output(`after-${width}-${locale}-match-footer.png`)});
            await page.locator('footer:visible:has(a[href="/privacy"]) a[href="/privacy#privacy-contact"]').click();
            await page.waitForURL('**/privacy#privacy-contact');
            await page.locator('#privacy-contact').waitFor({state:'visible'});
            report.checks.push(`match/${width}/${locale}: five tabs + working footer contact link`);
          }
        }
      }
      if(phase==='after') await exercise(page,width,locale);
      await ctx.close();
      console.log(`${phase}: ${width}/${locale} complete`);
    }
    assert.deepEqual(report.errors,[],'No browser exceptions');
    if(phase==='after') {
      assert.deepEqual(report.consoleErrors, [], 'No console errors');
      const unexpected = report.failedRequests.filter(r=>!(r.error==='net::ERR_ABORTED' && new URL(r.url).searchParams.has('_rsc') && new URL(r.url).origin===new URL(base).origin));
      assert.deepEqual(unexpected, [], 'No unexpected network failures (navigation-cancelled RSC recorded separately)');
      assert.deepEqual(report.apiRequests, [], 'Submission example mode must not send API requests');
    }
  } finally {await browser.close();fs.writeFileSync(output(`${phase}.json`),JSON.stringify(report,null,2)+'\n');}
}
async function exercise(page,width,locale) {
  const ko=locale==='ko';
  const button=name=>page.getByRole('button',{name,exact:true});
  await page.goto(base+'/');await ready(page,locale);
  await page.locator('a[href="/players/demo-player-01"]:visible').first().click();
  await page.getByRole('heading',{name:/DemoPlayer01/}).waitFor();
  assert.match(await page.locator('main').innerText(),/65[\s\S]*56[\s\S]*23/);
  await page.getByRole('button',{name:'Jett Ascent Victory 13-9, 2026-09-20 00:00 UTC',exact:true}).click();
  await page.getByRole('tab',{name:'Scoreboard',exact:true}).waitFor();
  const direct=page.locator('a[href*="/matches/demo-match-001"]:visible');
  const href=await direct.first().getAttribute('href');
  assert.ok(href.includes('demo-match-001'));
  await page.goto(new URL(href,base).href);
  await page.getByRole('tab',{name:'Scoreboard',exact:true}).waitFor();
  await page.getByRole('link',{name:ko?'← 데모 프로필로 돌아가기':'← Back to demo profile',exact:true}).click();
  await page.getByRole('heading',{name:/DemoPlayer01/}).waitFor();
  report.checks.push(`home → synthetic profile → match modal → direct detail → profile: ${width}/${locale}`);
  await page.getByRole('link',{name:'Connect account',exact:true}).click();
  await ready(page,locale);
  const preview=page.locator('[aria-label="합성 프로필 요약"], [aria-label="Synthetic profile summary"]');
  const start=ko?'공개 동의 체험하기':'Try sharing consent';
  const grant=ko?'동의하고 데모 프로필 보기':'Agree and view demo profile';
  const again=ko?'공개 동의 다시 체험':'Review sharing consent again';
  assert.equal(await preview.count(),0);
  await button(start).click();
  assert.equal(await page.getByRole('checkbox').isChecked(),false);
  assert.equal(await button(grant).isDisabled(),true);
  await button(ko?'동의하지 않고 취소':'Cancel without sharing').click();
  assert.equal(await preview.count(),0);
  await button(again).click();
  assert.equal(await page.getByRole('checkbox').isChecked(),false);
  await page.getByRole('checkbox').check();await button(grant).click();
  await preview.waitFor();assert.match(await preview.innerText(),/65[\s\S]*56[\s\S]*23/);
  await capture(page,'consent-granted',width,locale);
  await button(ko?'공개 동의 철회 체험':'Try withdrawing consent').click();
  assert.equal(await preview.count(),0);
  await capture(page,'consent-withdrawn',width,locale);
  await button(again).click();assert.equal(await page.getByRole('checkbox').isChecked(),false);
  await page.getByRole('checkbox').check();await button(grant).click();await preview.waitFor();
  await page.reload();await button(start).waitFor();assert.equal(await preview.count(),0);
  report.checks.push(`consent default-off → cancel → agree → preview → revoke → renewed consent → reload reset: ${width}/${locale}`);
}
main().catch(e=>{report.failure=e.stack;fs.writeFileSync(output(`${phase}.json`),JSON.stringify(report,null,2)+'\n');console.error(e);process.exitCode=1;});
