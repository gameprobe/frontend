const {chromium}=require(process.env.PLAYWRIGHT_MODULE || '/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),assert=require('assert/strict');
const {setup}=require('./capture.cjs');
(async()=>{
 const b=await chromium.launch({headless:true});const results=[];
 const urls=['/lineups/ascent-killjoy-b-site-molly-003','/lineups/theme-qa-missing','/matches/mock-match-ascent-001','/theme-qa-unknown','/connect','/privacy','/terms','/players/theme-qa-missing','/matches/theme-qa-missing','/admin','/admin/lineups','/admin/lineups/new','/admin/lineups/theme-qa-lineup/edit'];
 for(const width of [1440,390]){
  const c=await b.newContext({viewport:{width,height:960}});await setup(c,'fallback');
  for(const url of urls){const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));const r=await p.goto('http://localhost:3000'+url,{waitUntil:'domcontentloaded'});
   const nav=p.getByRole('navigation',{name:'Valorant navigation'});await nav.waitFor();await p.waitForLoadState('networkidle');
   await p.evaluate(()=>document.fonts.ready);
   const links=nav.locator('a').filter({hasText:/^(Home|Overview|Lineups|Smokes)$/});
   assert.deepEqual(await links.allTextContents(),['Home','Overview','Lineups','Smokes'],url);
   assert.equal(await p.locator('main').count(),1,url+' exactly one main');assert.equal(await p.locator('main main').count(),0);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,url+' overflow');
   assert.equal(await p.locator('.site-header').isVisible(),false,url+' legacy header hidden');
   const more=nav.getByRole('button',{name:'More navigation',exact:true});await more.click();await p.waitForFunction(()=>document.querySelector('button[aria-label="More navigation"]')?.getAttribute('aria-expanded')==='true');assert.equal(await more.getAttribute('aria-expanded'),'true');await more.press('Escape');await p.waitForFunction(()=>document.querySelector('button[aria-label="More navigation"]')?.getAttribute('aria-expanded')==='false');assert.equal(await more.getAttribute('aria-expanded'),'false');assert.equal(await more.evaluate(el=>el===document.activeElement),true);
   const smokes=nav.getByRole('link',{name:'Smokes',exact:true});await smokes.focus();const focus=await smokes.evaluate(n=>({active:document.activeElement===n,style:getComputedStyle(n).outlineStyle,width:getComputedStyle(n).outlineWidth}));assert.equal(focus.active,true);assert.notEqual(focus.style,'none');assert.notEqual(focus.width,'0px');
   if(url==='/theme-qa-unknown'){assert.equal(r.status(),404);assert.equal(await p.getByRole('link',{name:'홈으로 돌아가기',exact:true}).getAttribute('href'),'/');assert.equal(await p.getByRole('link',{name:'라인업 둘러보기',exact:true}).getAttribute('href'),'/lineups');}
   assert.deepEqual(errors,[],url);results.push({width,url,passed:true});console.log('PASS',width,url);await p.close();
  }
  // Actual links navigate to the existing page routes, including small-screen overflow navigation.
  const p=await c.newPage();await p.goto('http://localhost:3000/connect');await p.getByRole('navigation',{name:'Valorant navigation'}).getByRole('link',{name:'Smokes',exact:true}).click();await p.waitForURL('**/smokes');await p.getByRole('heading',{name:'스모크 가이드 센터'}).waitFor();results.push({width,action:'Support→Smokes',passed:true});await p.close();await c.close();
 }
 await b.close();fs.writeFileSync(__dirname+'/interaction-results.json',JSON.stringify(results,null,2));console.log(`PASS: ${results.length} shell/navigation scenarios`);
})().catch(e=>{console.error(e);process.exit(1)});
