const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const phase = process.argv[2];
assert.ok(['before','after'].includes(phase));
const result = { phase, screens:[], checks:[], errors:[], apiRequests:[] };
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:3000';
async function capture(page,name) {
  await page.evaluate(async()=>{await document.fonts.ready;window.scrollTo({top:0,behavior:'instant'});await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);});
  const file=`drag-${phase}-${name}.png`;
  await page.screenshot({path:`${__dirname}/${file}`,fullPage:true,animations:'disabled'});
  result.screens.push(file);
}
async function readPoint(locator) {
  return locator.evaluate(el=>({x:parseFloat(el.style.left)/100,y:parseFloat(el.style.top)/100}));
}
function near(actual,expected,label) {
  assert.ok(Math.abs(actual.x-expected.x)<.006 && Math.abs(actual.y-expected.y)<.006,`${label}: ${JSON.stringify(actual)} expected ${JSON.stringify(expected)}`);
}
async function checkDragging(page,width) {
 const touch=width===390;
 const cdp=touch ? await page.context().newCDPSession(page) : null;
 const canvas=page.locator('[class*="mapCanvas"]');
 const placement=page.getByRole('button',{name:'지도 위치 지정',exact:true});
 const origin=page.locator('[data-pin="시작"]');
 const destination=page.locator('[data-pin="도착"]');
 const waypoint=page.locator('[data-route-point="waypoint"][data-point-index="0"]');
 const bounce=page.locator('[data-route-point="bounce"][data-point-index="1"]');
 const route=()=>page.locator('[data-route="trajectory"]').getAttribute('points');
 const pinCount=()=>page.locator('[data-route-point]').count();
 const options=page.locator('summary').filter({hasText:'경유·벽 튕김 추가'});
 const save=()=>page.getByRole('button',{name:'예시 목록에 저장',exact:true}).click();
 const guide=id=>page.locator(`[data-guide-id="${id}"]`);
 async function settle(){await page.evaluate(async()=>{await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);});}
 async function pointerStart(locator,useTouch=touch) {
  await canvas.evaluate(el=>el.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'}));
  await settle();
  const b=await locator.boundingBox();assert.ok(b);
  const from={x:b.x+b.width/2,y:b.y+b.height/2};
  assert.equal(await locator.evaluate((el,position)=>el.contains(document.elementFromPoint(position.x,position.y)),from),true,'drag marker must not be covered by sticky header');
  if(useTouch) await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...from,id:1,radiusX:3,radiusY:3,force:1}]});
  else {await page.mouse.move(from.x,from.y);await page.mouse.down();}
  return from;
 }
 async function pointerMove(from,point,useTouch=touch) {
  const b=await canvas.boundingBox();assert.ok(b);
  const to={x:b.x+b.width*point.x,y:b.y+b.height*point.y};
  if(useTouch) {
   for(let i=1;i<=8;i++) await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:from.x+(to.x-from.x)*i/8,y:from.y+(to.y-from.y)*i/8,id:1,radiusX:3,radiusY:3,force:1}]});
  } else await page.mouse.move(to.x,to.y,{steps:8});
  await settle();
 }
 async function pointerEnd(useTouch=touch) {
  if(useTouch)await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  else await page.mouse.up();
  await settle();
 }
 async function drag(locator,point){const from=await pointerStart(locator);await pointerMove(from,point);await pointerEnd();}
 async function place(x,y) {
  await canvas.scrollIntoViewIfNeeded();const b=await placement.boundingBox();assert.ok(b);
  await placement.click({position:{x:b.width*x,y:b.height*y}});await settle();
 }
 const initialTarget=await readPoint(destination);
 const initialOrigin=await readPoint(origin);
 const initialRoute=await route();
 assert.equal(await destination.evaluate(el=>el.tagName),'SPAN','reused destination is not draggable');
 assert.equal(await origin.evaluate(el=>el.tagName),'BUTTON');
 await destination.click();assert.equal(await route(),initialRoute,'locked destination click must not place a new point');
 await options.click();await page.getByRole('button',{name:'벽 튕김',exact:true}).click();
 const initialCount=await pinCount();assert.equal(initialCount,2);
 const originalWaypoint=await readPoint(waypoint);const originalBounce=await readPoint(bounce);
 await drag(origin,{x:.2,y:.8});near(await readPoint(origin),{x:.2,y:.8},'origin drag');
 near(await readPoint(destination),initialTarget,'locked destination unchanged');
 near(await readPoint(waypoint),originalWaypoint,'waypoint isolation');near(await readPoint(bounce),originalBounce,'bounce isolation');
 assert.equal(await pinCount(),initialCount,'drag release must not add bounce');
 await drag(waypoint,{x:.34,y:.61});near(await readPoint(waypoint),{x:.34,y:.61},'waypoint drag');
 await drag(bounce,{x:.57,y:.42});near(await readPoint(bounce),{x:.57,y:.42},'bounce drag');
 assert.deepEqual(await page.locator('[data-route-point]').evaluateAll(nodes=>nodes.map(el=>[el.dataset.routePoint,el.dataset.pointIndex])),[['waypoint','0'],['bounce','1']]);
 assert.equal(await pinCount(),initialCount,'path order/count preserved');
 const originalForCancel=await readPoint(origin);
 const fromCancel=await pointerStart(origin,false);await pointerMove(fromCancel,{x:.46,y:.8},false);
 await page.keyboard.press('Escape');await pointerEnd(false);
 near(await readPoint(origin),originalForCancel,'Escape restores drag baseline');
 if(touch){
  const from=await pointerStart(origin,true);await pointerMove(from,{x:.36,y:.7},true);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await settle();
  near(await readPoint(origin),originalForCancel,'pointer cancel restores drag baseline');
 }
 await drag(origin,{x:-.06,y:.73});near(await readPoint(origin),{x:0,y:.73},'left edge clamp');
 await drag(origin,{x:.2,y:-.06});near(await readPoint(origin),{x:.2,y:0},'top edge clamp');
 await drag(origin,{x:.2,y:.8});near(await readPoint(origin),{x:.2,y:.8},'restore origin after clamp');
 await waypoint.focus();const beforeKey=await readPoint(waypoint);
 await waypoint.press('ArrowRight');near(await readPoint(waypoint),{x:beforeKey.x+.01,y:beforeKey.y},'keyboard changes existing waypoint');
 const countBeforeEnter=await pinCount();const routeBeforeEnter=await route();
 await waypoint.press('Enter');await waypoint.press('Space');assert.equal(await pinCount(),countBeforeEnter);assert.equal(await route(),routeBeforeEnter,'Enter/Space do not add or relocate a point');
 await save();const savedInitialRoute=await route();
 await capture(page,`${width}-dragged-existing`);
 await page.getByRole('button',{name:'미리보기',exact:true}).click();assert.equal(await route(),savedInitialRoute);
 assert.equal(await page.locator('button[data-pin],button[data-route-point]').count(),0,'readonly preview has no editable pins');
 await capture(page,`${width}-dragged-preview`);
 await page.getByRole('button',{name:'편집으로 돌아가기'}).click();
 await guide('preview-lineup-02').click();near(await readPoint(destination),initialTarget,'other guide target unchanged');
 await guide('preview-lineup-01').click();assert.equal(await route(),savedInitialRoute,'saved route restored');
 await page.getByRole('button',{name:'＋ 새 공략',exact:true}).click();
 await page.locator('#preview-title').fill('QA · 드래그 신규 공략');
 await page.locator('#preview-destination-name').fill('QA · 드래그 도착점');
 await page.locator('#preview-url').fill('https://example.com/drag-guide');
 await place(.74,.29);await place(.28,.79);
 assert.equal(await destination.evaluate(el=>el.tagName),'BUTTON','new destination is draggable');
 await options.click();await page.getByRole('button',{name:'경유점',exact:true}).click();await place(.37,.59);
 await page.getByRole('button',{name:'벽 튕김',exact:true}).click();await place(.54,.4);
 const priorOrigin=await readPoint(origin);const pathBeforeTarget=await page.locator('[data-route-point]').evaluateAll(nodes=>nodes.map(el=>el.getAttribute('style')));
 await drag(destination,{x:.82,y:.2});near(await readPoint(destination),{x:.82,y:.2},'new destination drag');
 near(await readPoint(origin),priorOrigin,'destination drag leaves origin intact');
 assert.deepEqual(await page.locator('[data-route-point]').evaluateAll(nodes=>nodes.map(el=>el.getAttribute('style'))),pathBeforeTarget,'destination drag leaves path intact');
 assert.equal(await pinCount(),2,'destination release does not create bounce');
 await capture(page,`${width}-unlocked-destination`);
 await save();assert.equal(await destination.evaluate(el=>el.tagName),'BUTTON','a destination used only by the saved guide remains editable');const newSavedRoute=await route();
 await page.getByRole('button',{name:'미리보기',exact:true}).click();assert.equal(await route(),newSavedRoute);
 await page.getByRole('button',{name:'편집으로 돌아가기'}).click();
 await page.getByRole('complementary',{name:'예시 자료 목록'}).getByRole('button',{name:/^스모크/}).click();
 await guide('preview-smoke-02').click();
 const wall=page.locator('[data-pin="벽 끝"]');
 assert.equal(await wall.evaluate(el=>el.tagName),'BUTTON');
 const oldWall=await readPoint(wall);const smokeStart=await readPoint(origin);const smokeTarget=await readPoint(destination);
 await drag(wall,{x:.7,y:.36});near(await readPoint(wall),{x:.7,y:.36},'wall endpoint drag');
 near(await readPoint(origin),smokeStart,'wall origin isolated');near(await readPoint(destination),smokeTarget,'wall destination isolated');assert.notDeepEqual(await readPoint(wall),oldWall);
 assert.equal(await page.locator('[data-wall-route]').count(),1);
 await save();const savedWall=await page.locator('[data-wall-route]').evaluate(el=>[el.getAttribute('x1'),el.getAttribute('y1'),el.getAttribute('x2'),el.getAttribute('y2')]);
 await page.getByRole('button',{name:'미리보기',exact:true}).click();
 assert.deepEqual(await page.locator('[data-wall-route]').evaluate(el=>[el.getAttribute('x1'),el.getAttribute('y1'),el.getAttribute('x2'),el.getAttribute('y2')]),savedWall);
 await capture(page,`${width}-wall-preview`);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false);
 const pointerTypes=await page.evaluate(()=>window.__dragPointerTypes||[]);
 assert.ok(pointerTypes.includes(touch?'touch':'mouse'),'expected real pointer type observed');
 result.checks.push({width,input:touch?'touch':'mouse',origin:'PASS',waypoint:'PASS',bounce:'PASS',destinationLock:'PASS',newDestination:'PASS',wallEnd:'PASS',edgeClamp:'PASS',escapeCancel:'PASS',pointerCancel:touch?'PASS':'not applicable',keyboard:'PASS',releaseNoExtraPoint:'PASS',savePreview:'PASS',overflow:false,pointerTypes:[...new Set(pointerTypes)]});
 if(cdp)await cdp.detach();
}
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try {
  for(const width of [1440,390]) {
   const page=await browser.newPage({viewport:{width,height:1000},hasTouch:width===390});
   await page.addInitScript(()=>{localStorage.setItem('gameprobe:locale','ko');window.__dragPointerTypes=[];document.addEventListener('pointerdown',event=>{if(event.target.closest('[data-pin],[data-route-point]'))window.__dragPointerTypes.push(event.pointerType);});});
   page.on('pageerror',e=>result.errors.push(e.message));
   page.on('request',r=>{if(r.url().includes('/api/'))result.apiRequests.push(r.url());});
   await page.goto(base+'/admin/preview');
   await page.getByLabel('예시 입장 코드',{exact:true}).fill('DEMO1234');
   await page.getByRole('button',{name:'예시 화면 들어가기'}).click();
   await page.getByRole('heading',{name:'전술 자료 관리',exact:true}).waitFor();
   await page.waitForFunction(()=>[...document.images].filter(i=>i.closest('[class*="mapCanvas"]')).every(i=>i.complete&&i.naturalWidth>0));
   await capture(page,`${width}-editor`);
   await page.getByRole('button',{name:'미리보기',exact:true}).click();
   await capture(page,`${width}-preview`);
   if(phase==='after') {await page.getByRole('button',{name:'편집으로 돌아가기'}).click();await checkDragging(page,width);}
   else result.checks.push({width,capture:'PASS'});
   await page.close();
  }
  assert.deepEqual(result.errors,[]);assert.deepEqual(result.apiRequests,[]);
 } catch(error){result.failure=String(error);throw error;}
 finally {fs.writeFileSync(`${__dirname}/drag-${phase}.json`,JSON.stringify(result,null,2)+'\n');await browser.close();}
 console.log(JSON.stringify(result));
})().catch(error=>{console.error(error);process.exitCode=1;});
