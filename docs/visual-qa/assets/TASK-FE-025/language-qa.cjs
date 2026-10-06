const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const modules=process.env.PLAYWRIGHT_MODULES;
const runtime=modules?(path.basename(modules)==='playwright'?modules:path.join(modules,'playwright')):'playwright';
const {chromium}=require(runtime);const {expect}=require(runtime+'/test');
const phase=process.argv[2];assert.ok(['before','after'].includes(phase));
const base=process.env.BASE_URL||'http://localhost:3000';
const routes=[['home','/'],['legacy','/players/ied-agent-allen'],['new','/players/demo-player-01'],['connect','/connect'],['privacy','/privacy'],['terms','/terms']];
const result={phase,checks:[],states:{},captures:[],errors:[],consoleErrors:[]};
const check=(name,actual,expected)=>{assert.deepEqual(actual,expected,name);result.checks.push(name);};
async function settle(page){await page.evaluate(async()=>{await document.fonts.ready;for(const i of document.images)i.loading='eager';await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});await page.mouse.move(0,0);await page.waitForTimeout(150);}
async function capture(page,key){
 await settle(page);await page.evaluate(()=>scrollTo(0,0));
 const state=await page.locator('main').evaluate(root=>({lang:root.getAttribute('lang'),mainCount:document.querySelectorAll('main').length,overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),height:document.documentElement.scrollHeight,text:root.innerText,contentText:root.innerText.replace(root.querySelector('button[aria-label="한국어로 전환"]')?.innerText ?? '\u0000',''),buttons:[...root.querySelectorAll('button')].map(el=>({text:el.textContent,disabled:el.disabled,label:el.getAttribute('aria-label')}))}));
 check(`${key}: one main`,state.mainCount,1);check(`${key}: no overflow`,state.overflow,0);
 result.states[key]=state;
 const file=`language-${phase}-${key}.png`;await page.screenshot({path:path.join(__dirname,file),fullPage:true,animations:'disabled'});result.captures.push(file);console.log(phase,key);
}
(async()=>{const browser=await chromium.launch({headless:true});try{
 for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:width===390?844:960},deviceScaleFactor:1,reducedMotion:'reduce'});const page=await context.newPage();
  page.on('pageerror',error=>result.errors.push(error.message));page.on('console',m=>{if(m.type()==='error')result.consoleErrors.push(m.text());});
  for(const [name,route]of routes){
   const response=await page.goto(base+route,{waitUntil:'networkidle'});check(`${width} ${name}: HTTP200`,response.status(),200);
   if(phase==='after'){
    if(await page.getByRole('button',{name:'한국어로 전환',exact:true}).count())await page.getByRole('button',{name:'한국어로 전환',exact:true}).click();
    await expect(page.locator('main')).toHaveAttribute('lang','ko');
   }
   await capture(page,`${width}-${name}-ko`);
   if(phase==='after'){
    await page.getByRole('button',{name:'Switch to English',exact:true}).click();await expect(page.locator('main')).toHaveAttribute('lang','en');
    await capture(page,`${width}-${name}-en`);
    check(`${width} ${name}: English selection persisted`,await page.evaluate(()=>localStorage.getItem('gameprobe:locale')),'en');
    const ko=result.states[`${width}-${name}-ko`],en=result.states[`${width}-${name}-en`];assert.notEqual(ko.text,en.text);result.checks.push(`${width} ${name}: translated text differs`);
    if(['connect','privacy','terms'].includes(name))check(`${width} ${name}: no untranslated Korean content`,/[가-힣]/.test(en.contentText),false);
    if(name==='connect'){check(`${width}: English connect remains disabled`,await page.locator('main button:disabled').count(),1);}
   }
  }
  await context.close();
 }
 check('no page errors',result.errors,[]);check('no console errors',result.consoleErrors,[]);result.status='PASS';
}catch(error){result.status='FAIL';result.failure=error.stack;throw error;}finally{fs.writeFileSync(path.join(__dirname,`language-${phase}-results.json`),JSON.stringify(result,null,2));await browser.close();console.log(JSON.stringify({phase,status:result.status,checks:result.checks.length,captures:result.captures.length,errors:result.errors,consoleErrors:result.consoleErrors}));}})().catch(error=>{console.error(error);process.exitCode=1;});
