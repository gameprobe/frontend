const {chromium}=require('/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const out={routes:[],errors:[]};
 try {
  const context=await browser.newContext({viewport:{width:390,height:844}});
  await context.route('**/api/lineups',route=>route.fulfill({status:503,contentType:'application/json',body:'{}',headers:{'access-control-allow-origin':'*'}}));
  const page=await context.newPage();page.on('pageerror',e=>out.errors.push(e.message));
  for(const route of ['/lineups','/smokes','/','/players/ied-agent-allen']){
   const response=await page.goto('http://localhost:3000'+route,{waitUntil:'networkidle'});
   assert.equal(response.status(),200);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);assert.equal(overflow,0);
   let notice=null;
   if(route==='/lineups'||route==='/smokes'){
    notice=await page.getByRole('status',{name:'자료 상태',exact:true}).innerText();
    assert.ok(notice.includes(route==='/lineups'?'예시 라인업을 보고 있어요':'예시 스모크 가이드'));
   }
   out.routes.push({route,http:response.status(),overflow,notice});
  }
  assert.deepEqual(out.errors,[]);out.status='PASS';
 }catch(e){out.status='FAIL';out.failure=e.stack;throw e;}
 finally{fs.writeFileSync('docs/visual-qa/assets/TASK-FE-029/post-build.json',JSON.stringify(out,null,2)+'\n');await browser.close();console.log(JSON.stringify(out));}
})().catch(e=>{console.error(e);process.exitCode=1;});
