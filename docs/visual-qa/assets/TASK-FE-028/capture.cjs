const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_MODULES || '/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const phase = process.argv[2];
if (!['before', 'after'].includes(phase)) throw new Error('Pass before or after');
const dir = path.resolve('docs/visual-qa/assets/TASK-FE-028');
const routes = {home:'/', profile:'/players/ied-agent-allen', lineups:'/lineups', smokes:'/smokes'};
(async () => {
 const browser = await chromium.launch({headless:true});
 const output = {phase, states:[], errors:[]};
 try {
  for (const width of [1440,820,390]) {
   const context = await browser.newContext({viewport:{width,height:960}, deviceScaleFactor:1, reducedMotion:'reduce'});
   await context.route('**/api/lineups', r => r.fulfill({status:503, contentType:'application/json', body:'{}', headers:{'access-control-allow-origin':'*'}}));
   const page = await context.newPage();
   page.on('pageerror', error => output.errors.push(error.message));
   for (const [name, route] of Object.entries(routes)) {
    await page.goto('http://localhost:3000' + route, {waitUntil:'networkidle'});
    await page.evaluate(async () => {await document.fonts.ready; await Promise.race([Promise.all([...document.images].filter(i=>i.getBoundingClientRect().top<innerHeight).map(i=>i.decode().catch(()=>{}))),new Promise(resolve=>setTimeout(resolve,4000))]);});
    const facts = await page.getByRole('navigation',{name:'Valorant navigation',exact:true}).evaluate(nav => {
     const items = nav.children[1];
     const box = e => {const r=e.getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height};};
     return {overflow:document.documentElement.scrollWidth-innerWidth, nav:box(nav), rail:box(items), railScrollWidth:items.scrollWidth, items:[...items.children].map(e=>({label:e.textContent,href:e.getAttribute('href'),current:e.getAttribute('aria-current'),display:getComputedStyle(e).display,...box(e)}))};
    });
    const file = `${phase}-${width}-${name}.png`;
    await page.screenshot({path:path.join(dir,file),animations:'disabled'});
    output.states.push({name,width,file,...facts}); console.log(file);
   }
   await context.close();
  }
 } finally {
  fs.writeFileSync(path.join(dir,`${phase}.json`),JSON.stringify(output,null,2)+'\n');
  await browser.close();
 }
 console.log(JSON.stringify({phase,screenshots:output.states.length,errors:output.errors}));
 if (output.errors.length) process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
