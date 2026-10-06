const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const modules=process.env.PLAYWRIGHT_MODULES;
const runtime=modules?(path.basename(modules)==='playwright'?modules:path.join(modules,'playwright')):'playwright';
const {chromium}=require(runtime),{expect}=require(runtime+'/test');
const base=process.env.BASE_URL||'http://localhost:3000';
const result={checks:[],errors:[],consoleErrors:[],layouts:[],contexts:[]};
const check=(name,actual,expected)=>{assert.deepEqual(actual,expected,name);result.checks.push(name);};
const locale=page=>page.locator('main');
const toggle=page=>page.getByRole('button',{name:/^(Switch to English|한국어로 전환)$/});
async function pageIn(context){const page=await context.newPage();page.on('pageerror',e=>result.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')result.consoleErrors.push(m.text());});return page;}
async function go(page,route){const response=await page.goto(base+route,{waitUntil:'networkidle'});assert.equal(response.status(),200);}
async function chooseLocale(page,value){const main=locale(page);if(await main.getAttribute('lang')!==value)await toggle(page).click();await expect(main).toHaveAttribute('lang',value);}
async function layout(page,label){
 const value=await page.evaluate(()=>({overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),mainCount:document.querySelectorAll('main').length,width:innerWidth}));
 check(`${label}: single main`,value.mainCount,1);check(`${label}: no global overflow`,value.overflow,0);
 const language=await toggle(page).boundingBox();const more=await page.getByRole('button',{name:'More navigation',exact:true}).boundingBox();
 assert.ok(language.x>=0&&language.x+language.width<=value.width+0.5,`${label}: language button inside screen`);
 assert.ok(more.x>=0&&more.x+more.width<=value.width+0.5,`${label}: More button inside screen`);
 assert.ok(language.x+language.width<=more.x+0.5||more.x+more.width<=language.x+0.5||language.y+language.height<=more.y+0.5||more.y+more.height<=language.y+0.5,`${label}: language and More do not overlap`);
 result.checks.push(`${label}: language/More controls visible without overlap`);result.layouts.push({label,...value,language,more});
}
(async()=>{const browser=await chromium.launch({headless:true});try{
 // Storage and navigation are exercised through real browser events and links.
 const context=await browser.newContext({viewport:{width:1440,height:960}});const page=await pageIn(context);
 await go(page,'/');await expect(locale(page)).toHaveAttribute('lang','ko');result.checks.push('Fresh browser defaults to ko');
 await toggle(page).click();await expect(locale(page)).toHaveAttribute('lang','en');check('EN stored under locale key',await page.evaluate(()=>localStorage.getItem('gameprobe:locale')),'en');
 await page.locator('[class*="accountLink"]').click();await page.waitForURL(base+'/connect');await expect(locale(page)).toHaveAttribute('lang','en');result.checks.push('English retained on account client navigation');
 await page.reload({waitUntil:'networkidle'});await expect(locale(page)).toHaveAttribute('lang','en');result.checks.push('English retained on reload');
 const sibling=await pageIn(context);await go(sibling,'/privacy');await expect(locale(sibling)).toHaveAttribute('lang','en');result.checks.push('New tab reads English preference');
 await toggle(page).click();await expect(locale(sibling)).toHaveAttribute('lang','ko');result.checks.push('storage event synchronizes ko to second tab');
 await toggle(sibling).click();await expect(locale(page)).toHaveAttribute('lang','en');result.checks.push('storage event synchronizes en to first tab');
 await context.close();
 // Invalid persisted values safely resolve to Korean without rewriting policy/UI state.
 const invalid=await browser.newContext();await invalid.addInitScript(()=>localStorage.setItem('gameprobe:locale','invalid-locale'));
 const invalidPage=await pageIn(invalid);await go(invalidPage,'/terms');await expect(locale(invalidPage)).toHaveAttribute('lang','ko');result.checks.push('Invalid saved locale falls back to ko');await invalid.close();
 // Browser storage can be unavailable; in-page switching and client navigation must remain usable.
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{
  for(const name of ['getItem','setItem','removeItem'])Object.defineProperty(Storage.prototype,name,{configurable:true,value:function(){throw new DOMException('QA storage unavailable','SecurityError');}});
 });
 const blockedPage=await pageIn(blocked);await go(blockedPage,'/');await expect(locale(blockedPage)).toHaveAttribute('lang','ko');
 await toggle(blockedPage).click();await expect(locale(blockedPage)).toHaveAttribute('lang','en');result.checks.push('Storage blocked: English toggle works');
 await blockedPage.locator('[class*="accountLink"]').click();await blockedPage.waitForURL(base+'/connect');await expect(locale(blockedPage)).toHaveAttribute('lang','en');result.checks.push('Storage blocked: current-tab client navigation retains English');
 await toggle(blockedPage).click();await expect(locale(blockedPage)).toHaveAttribute('lang','ko');result.checks.push('Storage blocked: switch back to Korean works');await blocked.close();
 // Dialog state is changed through another tab so no inert modal backdrop is bypassed.
 for(const [id,count]of [['ied-agent-allen',9],['demo-player-01',2]]){
  const c=await browser.newContext({viewport:{width:1440,height:960}});const profile=await pageIn(c),control=await pageIn(c);
  await go(profile,'/players/'+id);await go(control,'/');
  const nav=profile.getByRole('navigation',{name:'Profile sections',includeHidden:true}),rows=profile.locator('button[aria-controls^="details-"]');
  await nav.getByRole('button',{name:'Matches',exact:true}).click();await profile.getByLabel('Agent',{exact:true}).selectOption({label:'Jett'});await expect(rows).toHaveCount(count);
  const agentValue=await profile.getByLabel('Agent',{exact:true}).inputValue();const save=profile.locator('[class*="saveButton"]');await save.click();await expect(save).toHaveAttribute('aria-pressed','true');
  await chooseLocale(profile,'en');await expect(nav.getByRole('button',{name:'Matches',exact:true})).toHaveAttribute('aria-current','page');check(`${id}: filter retained after direct toggle`,await profile.getByLabel('Agent',{exact:true}).inputValue(),agentValue);await expect(save).toHaveAttribute('aria-pressed','true');await expect(rows).toHaveCount(count);result.checks.push(`${id}: direct toggle preserves tab/filter/save/count`);
  await expect(locale(control)).toHaveAttribute('lang','en');await rows.first().click();const dialog=profile.getByRole('dialog');await expect(dialog).toBeVisible();await dialog.getByRole('tab',{name:'Performance',exact:true}).click();
  await toggle(control).click();await expect(locale(profile)).toHaveAttribute('lang','ko');await expect(dialog).toBeVisible();await expect(dialog.getByRole('tab',{name:'Performance',exact:true})).toHaveAttribute('aria-selected','true');
  await expect(nav.getByRole('button',{name:'Matches',exact:true})).toHaveAttribute('aria-current','page');check(`${id}: cross-tab toggle preserves filter`,await profile.getByLabel('Agent',{exact:true}).inputValue(),agentValue);await expect(save).toHaveAttribute('aria-pressed','true');result.checks.push(`${id}: external locale event preserves open dialog and detail tab`);
  await profile.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(rows.first()).toBeFocused();result.checks.push(`${id}: locale-switched dialog still closes and restores focus`);
  await c.close();
 }
 // Four widths cover navigation controls and longer translated text, including the small screen boundary.
 for(const width of [1440,820,390,320]){
  const c=await browser.newContext({viewport:{width,height:width<=390?844:960},reducedMotion:'reduce'}),p=await pageIn(c);
  for(const route of ['/','/players/ied-agent-allen','/players/demo-player-01','/connect','/privacy','/terms']){
   await go(p,route);
   for(const language of ['ko','en']){await chooseLocale(p,language);await layout(p,`${width} ${route} ${language}`);}
  }
  await go(p,'/players/demo-player-01');
  for(const language of ['ko','en'])for(const tab of ['Agents','Weapons']){await chooseLocale(p,language);await p.getByRole('navigation',{name:'Profile sections'}).getByRole('button',{name:tab,exact:true}).click();await layout(p,`${width} new ${tab} ${language}`);}
  await c.close();
 }
 check('no uncaught/hydration errors',result.errors,[]);check('no console/hydration errors',result.consoleErrors,[]);result.status='PASS';
}catch(error){result.status='FAIL';result.failure=error.stack;throw error;}finally{fs.writeFileSync(path.join(__dirname,'language-state-results.json'),JSON.stringify(result,null,2));await browser.close();console.log(JSON.stringify({status:result.status,checks:result.checks.length,layouts:result.layouts.length,errors:result.errors,consoleErrors:result.consoleErrors}));}})().catch(error=>{console.error(error);process.exitCode=1;});
