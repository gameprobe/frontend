const { chromium }=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs');const assert=require('node:assert/strict');
const result={screens:[],errors:[],checks:[]};
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:1000}});
  await page.addInitScript(()=>localStorage.setItem('gameprobe:locale','ko'));
  page.on('pageerror',e=>result.errors.push(e.message));
  const routes=width===1440?[['admin','/admin'],['home','/'],['insights','/insights'],['lineups','/lineups'],['smokes','/smokes']]:[['admin','/admin']];
  for(const [name,route] of routes){
   await page.goto('http://127.0.0.1:3000'+route);
   if(name==='admin'){
    await page.getByRole('heading',{name:'관리자 인증',exact:true}).waitFor();
    assert.equal(await page.getByRole('link',{name:'예시 코드로 관리자 화면 체험하기 →'}).getAttribute('href'),'/admin/preview');
   }
   await page.evaluate(()=>document.fonts.ready);
   await page.waitForFunction(()=>[...document.images].filter(i=>{const r=i.getBoundingClientRect();return r.width&&r.height&&r.bottom>0&&r.top<innerHeight;}).every(i=>i.complete));
   await page.evaluate(async()=>{window.scrollTo({top:0,behavior:'instant'});await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);});
   const file=`destination-after-${width}-${name}.png`;await page.screenshot({path:`${__dirname}/${file}`,fullPage:name==='admin',animations:'disabled'});result.screens.push(file);
  }
  if(width===390){
   const external=[];page.on('request',r=>{if(r.url().includes('example.com')||r.url().includes('/api/'))external.push(r.url());});
   await page.goto('http://127.0.0.1:3000/admin/preview');await page.getByLabel('예시 입장 코드',{exact:true}).fill('DEMO1234');await page.getByRole('button',{name:'예시 화면 들어가기'}).click();await page.getByRole('button',{name:'미리보기',exact:true}).click();
   assert.deepEqual(external,[]);assert.equal(await page.evaluate(()=>sessionStorage.getItem('lineup-admin-token')),null);
   result.checks.push('No external media/API request or real admin token stored');
  }
  await page.close();
 }
 assert.deepEqual(result.errors,[]);
}finally{await browser.close();fs.writeFileSync(`${__dirname}/destination-regression.json`,JSON.stringify(result,null,2)+'\n');}
console.log(JSON.stringify(result));})().catch(e=>{console.error(e);process.exitCode=1;});
