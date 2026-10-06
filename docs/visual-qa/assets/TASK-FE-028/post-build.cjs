const fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULES||'/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({headless:true});const checks=[];const errors=[];
 try{
  const p=await b.newPage({viewport:{width:390,height:844}});
  await p.route('**/api/lineups',r=>r.fulfill({status:503,contentType:'application/json',body:'{}',headers:{'access-control-allow-origin':'*'}}));
  p.on('pageerror',e=>errors.push(e.message));
  for(const [url,current] of [['/','Home'],['/players/ied-agent-allen','Overview'],['/lineups','Lineups'],['/smokes','Smokes']]){
   const response=await p.goto('http://localhost:3000'+url,{waitUntil:'networkidle'});assert.equal(response.status(),200);
   const n=p.getByRole('navigation',{name:'Valorant navigation',exact:true});
   const facts=await n.evaluate(e=>({items:[...e.children[1].children].map(x=>x.textContent),current:[...e.querySelectorAll('[aria-current]')].map(x=>x.textContent),overflow:document.documentElement.scrollWidth-innerWidth}));
   assert.deepEqual(facts.items.slice(-2),['Lineups','Smokes']);assert.deepEqual(facts.current,[current]);assert.equal(facts.overflow,0);
   checks.push({url,http:response.status(),...facts});
  }
  assert.deepEqual(errors,[]);
  fs.writeFileSync('docs/visual-qa/assets/TASK-FE-028/post-build.json',JSON.stringify({status:'PASS',checks,errors},null,2)+'\n');
  console.log('PASS: restored dev server, four mobile routes/menus, no overflow or page errors.');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
