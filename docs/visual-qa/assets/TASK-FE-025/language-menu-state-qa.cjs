const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const mods=process.env.PLAYWRIGHT_MODULES;
const runtime=mods?(path.basename(mods)==='playwright'?mods:path.join(mods,'playwright')):'playwright';
const {chromium}=require(runtime),{expect}=require(runtime+'/test');
const base=process.env.BASE_URL||'http://localhost:3000';
const result={checks:[],layouts:[],errors:[],consoleErrors:[]};
const check=(name,a,b)=>{assert.deepEqual(a,b,name);result.checks.push(name);};
const pass=name=>result.checks.push(name);
const trigger=p=>p.getByRole('button',{name:'Language',exact:true});
const menu=p=>p.getByRole('menu',{name:'Language',exact:true});
const item=(p,label)=>menu(p).getByRole('menuitemradio',{name:label,exact:true});
const main=p=>p.locator('main');
async function pageIn(c){const p=await c.newPage();p.on('pageerror',e=>result.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')result.consoleErrors.push(m.text());});return p;}
async function go(p,route){const r=await p.goto(base+route,{waitUntil:'networkidle'});assert.equal(r.status(),200,`${route}: HTTP200`);}
async function closed(p,name){await expect(menu(p)).not.toBeVisible();await expect(trigger(p)).toHaveAttribute('aria-expanded','false');pass(name);}
async function open(p){await trigger(p).focus();await p.keyboard.press('ArrowDown');await expect(menu(p)).toBeVisible();}
async function choose(p,locale){await open(p);await item(p,locale==='ko'?'한국어':'English').click();await expect(main(p)).toHaveAttribute('lang',locale);await expect(menu(p)).not.toBeVisible();}
async function layout(p,label){
 const facts=await p.evaluate(()=>({width:innerWidth,overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),mainCount:document.querySelectorAll('main').length}));
 check(`${label}: no global overflow`,facts.overflow,0);check(`${label}: one main`,facts.mainCount,1);
 const language=await trigger(p).boundingBox(),list=await menu(p).boundingBox(),more=await p.getByRole('button',{name:'More navigation',exact:true}).boundingBox();
 for(const [name,rect]of [['trigger',language],['menu',list],['More',more]]){assert.ok(rect&&rect.x>=-0.5&&rect.x+rect.width<=facts.width+0.5,`${label}: ${name} within viewport`);pass(`${label}: ${name} within viewport`);}
 assert.ok(language.x+language.width<=more.x+0.5||more.x+more.width<=language.x+0.5||language.y+language.height<=more.y+0.5||more.y+more.height<=language.y+0.5,`${label}: trigger and More do not overlap`);pass(`${label}: trigger and More do not overlap`);
 result.layouts.push({label,...facts,language,list,more});
}
(async()=>{const browser=await chromium.launch({headless:true});try{
 const c=await browser.newContext({viewport:{width:1440,height:960},reducedMotion:'reduce'}),p=await pageIn(c);
 await go(p,'/');await expect(main(p)).toHaveAttribute('lang','ko');pass('Fresh browser defaults to ko');
 await expect(trigger(p)).toHaveAttribute('aria-haspopup','menu');await expect(trigger(p)).toHaveAttribute('aria-expanded','false');pass('Language trigger exposes menu semantics and closed state');
 await trigger(p).hover();await expect(menu(p)).toBeVisible();await expect(trigger(p)).toHaveAttribute('aria-expanded','true');pass('Mouse hover opens menu');
 check('Exactly two choices',await menu(p).getByRole('menuitemradio').count(),2);
 await expect(item(p,'한국어')).toHaveAttribute('aria-checked','true');await expect(item(p,'English')).toHaveAttribute('aria-checked','false');pass('Current Korean option is checked');
 const englishBox=await item(p,'English').boundingBox();await p.mouse.move(englishBox.x+englishBox.width/2,englishBox.y+englishBox.height/2,{steps:12});await expect(menu(p)).toBeVisible();pass('Pointer can travel from trigger to option across dropdown gap');
 await p.mouse.move(0,400);await closed(p,'Pointer leaving menu closes without keyboard focus');
 const searchInput=p.getByRole('textbox',{name:'Riot ID',exact:true});await searchInput.focus();await trigger(p).hover();await expect(menu(p)).toBeVisible();
 await p.keyboard.press('Escape');await closed(p,'Escape closes hover menu while focus is outside');await expect(searchInput).toBeFocused();pass('Outside-focus Escape preserves search input focus');await p.mouse.move(0,400);
 // Clicks use a stationary pointer after hover, as a mouse user would do.
 await trigger(p).hover();await trigger(p).click();await expect(menu(p)).toBeVisible();pass('Click pins a hovered menu open');
 await trigger(p).click();await closed(p,'Second click toggles pinned menu closed');
 await trigger(p).click();await expect(menu(p)).toBeVisible();pass('Click opens closed menu');
 await p.mouse.click(10,400);await closed(p,'Outside pointerdown closes menu');
 await trigger(p).focus();await p.keyboard.press('ArrowDown');await expect(item(p,'한국어')).toBeFocused();pass('ArrowDown on trigger opens and focuses first choice');
 await trigger(p).hover();await p.mouse.move(0,400);await expect(menu(p)).toBeVisible();pass('Pointer leave retains menu while keyboard focus is inside');
 await p.keyboard.press('ArrowUp');await expect(item(p,'English')).toBeFocused();pass('ArrowUp wraps from first to last');
 await p.keyboard.press('ArrowDown');await expect(item(p,'한국어')).toBeFocused();pass('ArrowDown wraps from last to first');
 await p.keyboard.press('End');await expect(item(p,'English')).toBeFocused();pass('End focuses last choice');
 await p.keyboard.press('Home');await expect(item(p,'한국어')).toBeFocused();pass('Home focuses first choice');
 await p.keyboard.press('Escape');await closed(p,'Escape closes keyboard menu');await expect(trigger(p)).toBeFocused();pass('Escape returns focus to Language trigger');
 await p.keyboard.press('ArrowUp');await expect(item(p,'English')).toBeFocused();pass('ArrowUp on trigger opens and focuses last choice');
 await p.keyboard.press('Enter');await expect(main(p)).toHaveAttribute('lang','en');await closed(p,'Enter selects English and closes menu');
 check('English persisted in storage',await p.evaluate(()=>localStorage.getItem('gameprobe:locale')),'en');
 await open(p);await expect(item(p,'English')).toHaveAttribute('aria-checked','true');await expect(item(p,'한국어')).toHaveAttribute('aria-checked','false');pass('English selection marker updates');
 await p.keyboard.press('End');await p.keyboard.press('Tab');await closed(p,'Tab out of menu closes it');
 check('Tab focus leaves menu',await p.evaluate(()=>Boolean(document.activeElement?.closest('[role="menu"]'))),false);
 await p.locator('[class*="accountLink"]').click();await p.waitForURL(base+'/connect');await expect(main(p)).toHaveAttribute('lang','en');pass('Selected language survives client navigation');
 await p.reload({waitUntil:'networkidle'});await expect(main(p)).toHaveAttribute('lang','en');pass('Selected language survives reload');
 const sibling=await pageIn(c);await go(sibling,'/players/ied-agent-allen');await expect(main(sibling)).toHaveAttribute('lang','en');pass('New tab reads selected language');
 await choose(sibling,'ko');await expect(main(p)).toHaveAttribute('lang','ko');pass('Menu selection synchronizes another tab');
 await c.close();
 // A touch-only context verifies the menu does not require hover.
 const touch=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'}),t=await pageIn(touch);
 await go(t,'/');await trigger(t).tap();await expect(menu(t)).toBeVisible();pass('Touch opens Language menu');
 await trigger(t).tap();await closed(t,'Touch toggles Language menu closed');
 await trigger(t).tap();await item(t,'English').tap();await expect(main(t)).toHaveAttribute('lang','en');await closed(t,'Touch selects English and closes menu');
 await trigger(t).tap();await t.touchscreen.tap(10,400);await closed(t,'Outside touch closes menu');await touch.close();
 // The full width matrix uses an open menu in both languages on three shell types.
 for(const width of [1440,820,390,320]){
  const ctx=await browser.newContext({viewport:{width,height:width<=390?844:960},reducedMotion:'reduce'}),page=await pageIn(ctx);
  for(const route of ['/','/players/ied-agent-allen','/connect']){
   await go(page,route);
   for(const value of ['ko','en']){
    await choose(page,value);await open(page);await expect(item(page,value==='ko'?'한국어':'English')).toHaveAttribute('aria-checked','true');pass(`${width} ${route} ${value}: selection checked`);
    await layout(page,`${width} ${route} ${value}`);await page.keyboard.press('Escape');
   }
  }
  await ctx.close();
 }
 check('No page or hydration errors',result.errors,[]);check('No console or hydration errors',result.consoleErrors,[]);result.status='PASS';
}catch(error){result.status='FAIL';result.failure=error.stack;throw error;}finally{fs.writeFileSync(path.join(__dirname,'language-menu-state-results.json'),JSON.stringify(result,null,2));await browser.close();console.log(JSON.stringify({status:result.status,checks:result.checks.length,layouts:result.layouts.length,errors:result.errors,consoleErrors:result.consoleErrors}));}})().catch(e=>{console.error(e);process.exitCode=1;});
