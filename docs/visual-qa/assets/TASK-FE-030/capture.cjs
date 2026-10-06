const {chromium}=require(process.env.PLAYWRIGHT_MODULE || '/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');const path=require('path');
const phase=process.argv[2]||'before',dir=__dirname;
const fixture={id:'theme-qa-lineup',title:'A 사이트 진입 리콘 볼트',description:'상세 화면과 편집 동작을 확인하는 테스트 자료입니다.',mapId:'ascent',side:'ATTACK',agentId:'sova',difficulty:'MEDIUM',skillMarkers:[{abilityId:'sova-recon-bolt',position:{x:.72,y:.42},youtubeUrl:'https://www.youtube.com/watch?v=fe030first1'},{abilityId:'sova-shock-bolt',position:{x:.62,y:.52},youtubeUrl:'https://youtu.be/fe030second'}],agentMarkers:[{position:{x:.28,y:.66}}],pathPoints:[{x:.28,y:.66},{x:.46,y:.54},{x:.72,y:.42}],sovaSettings:{chargeLevel:2,bounceCount:1},status:'REVIEW',authorId:'qa-fixture'};
const cases=[
['lineup','/lineups/ascent-killjoy-b-site-molly-003','fallback','.lineup-detail-header'],
['lineup-api','/lineups/theme-qa-lineup','success','.lineup-detail-header'],
['lineup-no-video','/lineups/theme-qa-lineup','no-video','.lineup-video-empty'],
['lineup-loading','/lineups/theme-qa-lineup','loading','.lineup-detail-state'],
['lineup-error','/lineups/theme-qa-missing','fallback','.lineup-detail-state-error'],
['match','/matches/mock-match-ascent-001','fallback','#match-rounds-heading'],
['404','/theme-qa-unknown','fallback','h1'],
['connect','/connect','fallback','h1'],
['admin-login','/admin','fallback','#admin-token'],
['admin-gate','/admin/lineups/new','fallback','.admin-login-card'],
['admin-list','/admin/lineups','admin','.admin-lineup-card'],
['admin-empty','/admin/lineups','admin-empty','.admin-review-state'],
['admin-error','/admin/lineups','admin-error','.admin-review-state-error'],
['admin-new','/admin/lineups/new','admin','.lineup-editor-map'],
['admin-edit','/admin/lineups/theme-qa-lineup/edit','admin','.lineup-editor-skill-marker'],
['admin-edit-error','/admin/lineups/theme-qa-lineup/edit','admin-error','.admin-login-card'],
['home','/','fallback','h1'],['profile','/players/ied-agent-allen','fallback','[class*=profile]']
];
async function setup(ctx,mode){
 if(mode.startsWith('admin'))await ctx.addInitScript(()=>sessionStorage.setItem('lineup-admin-token','isolated-qa-token-not-a-credential'));
 await ctx.route('**/api/**',async r=>{
  if(mode==='loading')return; // pending request is discarded with isolated context
  if(mode==='success'||mode==='admin')return r.fulfill({json:r.request().url().endsWith('/api/admin/lineups')?[fixture,{...fixture,id:'theme-qa-draft',status:'DRAFT'}]:fixture});
  if(mode==='no-video')return r.fulfill({json:{...fixture,skillMarkers:fixture.skillMarkers.map(({youtubeUrl,...s})=>s)}});
  if(mode==='admin-empty')return r.fulfill({json:[]});
  return r.fulfill({status:503,json:{message:'Controlled QA unavailable'}});
 });
 await ctx.route(/https:\/\/(www\.)?(youtube\.com|youtu\.be)\//,r=>r.fulfill({contentType:'text/html; charset=utf-8',body:'<html><head><meta charset="utf-8"></head><body style="margin:0;background:#111d26;color:#b4c2cf;font:14px Arial;display:grid;place-items:center;height:100vh">영상 프레임 · QA</body></html>'}));
}
async function metrics(p){return p.evaluate(()=>({headings:[...document.querySelectorAll('h1,h2')].map(x=>x.textContent),overflow:document.documentElement.scrollWidth>innerWidth,mainCount:document.querySelectorAll('main').length,nav:[...document.querySelectorAll('nav a')].filter(n=>n.getBoundingClientRect().height>0).map(n=>({text:n.textContent,href:n.getAttribute('href')})),pins:[...document.querySelectorAll('.lineup-agent-marker,.lineup-skill-marker,.lineup-editor-agent-marker,.lineup-editor-skill-marker')].map(n=>({left:n.style.left,top:n.style.top})),paths:[...document.querySelectorAll('.lineup-path-overlay polyline')].map(n=>n.getAttribute('points')),iframe:document.querySelector('iframe')?.getAttribute('src'),difficulty:(()=>{const n=document.querySelector('.lineup-difficulty');return n?{position:getComputedStyle(n).position,top:n.getBoundingClientRect().top}:null})()}));}
async function main(){
 const b=await chromium.launch({headless:true});const results=[];
 for(const width of [1440,390,820])for(const [name,url,mode,ready]of cases){
  if(width===820&&!['lineup','match','admin-list','admin-new'].includes(name))continue;
  if(width===390&&['home','profile'].includes(name))continue;
  const c=await b.newContext({viewport:{width,height:960},deviceScaleFactor:1});await setup(c,mode);const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
  try{const resp=await p.goto('http://localhost:3000'+url,{waitUntil:'domcontentloaded'});await p.locator(ready).first().waitFor({timeout:15000});
   await p.evaluate(()=>Promise.all([document.fonts.ready,...[...document.images].map(i=>Promise.race([i.decode().catch(()=>{}),new Promise(r=>setTimeout(r,2000))]))]));
   if(name==='admin-edit')await p.getByLabel('제목',{exact:true}).waitFor();
   const file=`${phase}-${width}-${name}.png`;await p.screenshot({path:path.join(dir,file),fullPage:true});
   const m=await metrics(p);results.push({width,name,url,file,status:resp.status(),...m,errors});console.log(`${phase} ${width} ${name}: overflow=${m.overflow} errors=${errors.length}`);
  }catch(e){results.push({width,name,error:e.message});console.error(name,e.message)}await c.close();
 }
 await b.close();fs.writeFileSync(path.join(dir,phase+'.json'),JSON.stringify(results,null,2));if(results.some(r=>r.error))process.exitCode=1;
}
module.exports={fixture,setup,metrics};if(require.main===module)main();
