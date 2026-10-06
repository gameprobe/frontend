const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const mods=process.env.PLAYWRIGHT_MODULES;
const runtime=mods?(path.basename(mods)==='playwright'?mods:path.join(mods,'playwright')):'playwright';
const {chromium}=require(runtime),{expect}=require(runtime+'/test');
const phase=process.argv[2];assert.ok(['before','after'].includes(phase));
const base=process.env.BASE_URL||'http://localhost:3000';
const result={phase,checks:[],captures:[],states:{},errors:[],consoleErrors:[]};
const check=(name,a,b)=>{assert.deepEqual(a,b,name);result.checks.push(name);};
const routes=[['home','/'],['profile','/players/ied-agent-allen'],['connect','/connect']];
async function capture(page,key){
 await page.evaluate(async()=>{await document.fonts.ready;for(const i of document.images)i.loading='eager';await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));scrollTo(0,0);});await page.waitForTimeout(120);
 const state=await page.locator('main').evaluate(root=>({lang:root.getAttribute('lang'),mainCount:document.querySelectorAll('main').length,overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),text:root.innerText}));
 check(`${key}: one main`,state.mainCount,1);check(`${key}: no global overflow`,state.overflow,0);result.states[key]=state;
 const file=`language-menu-${phase}-${key}.png`;await page.screenshot({path:path.join(__dirname,file),fullPage:true,animations:'disabled'});result.captures.push(file);console.log(phase,key);
}
(async()=>{const browser=await chromium.launch({headless:true});try{
 for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:width===390?844:960},deviceScaleFactor:1,reducedMotion:'reduce'});const page=await context.newPage();
  page.on('pageerror',e=>result.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')result.consoleErrors.push(m.text());});
  for(const [name,route]of routes){
   const response=await page.goto(base+route,{waitUntil:'networkidle'});check(`${width} ${name}: HTTP200`,response.status(),200);
   if(phase==='before'){await expect(page.locator('main')).toHaveAttribute('lang','ko');await page.mouse.move(0,0);await capture(page,`${width}-${name}-ko`);}
   else{
    const trigger=page.getByRole('button',{name:'Language',exact:true}),menu=page.getByRole('menu',{name:'Language',exact:true});
    for(const [locale,label]of [['ko','한국어'],['en','English']]){
     await page.mouse.move(0,150);await trigger.hover();await expect(menu).toBeVisible();await menu.getByRole('menuitemradio',{name:label,exact:true}).click();await expect(page.locator('main')).toHaveAttribute('lang',locale);
     await page.mouse.move(0,150);await trigger.hover();await expect(menu).toBeVisible();
     await expect(menu.getByRole('menuitemradio',{name:label,exact:true})).toHaveAttribute('aria-checked','true');
     await capture(page,`${width}-${name}-${locale}-open`);
     await page.keyboard.press('Escape');await expect(menu).not.toBeVisible();
    }
   }
  }
  await context.close();
 }
 check('no page errors',result.errors,[]);check('no console errors',result.consoleErrors,[]);result.status='PASS';
}catch(error){result.status='FAIL';result.failure=error.stack;throw error;}finally{fs.writeFileSync(path.join(__dirname,`language-menu-${phase}-results.json`),JSON.stringify(result,null,2));await browser.close();console.log(JSON.stringify({phase,status:result.status,captures:result.captures.length,checks:result.checks.length,errors:result.errors,consoleErrors:result.consoleErrors}));}})().catch(error=>{console.error(error);process.exitCode=1;});
