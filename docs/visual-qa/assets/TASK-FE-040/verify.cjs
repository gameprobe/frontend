const { chromium } = require(process.env.PLAYWRIGHT_MODULE);
const fs = require('node:fs');
const path = require('node:path');
const mode = process.argv[2] || 'before';
(async () => {
 const browser = await chromium.launch();
 const results=[];
 for (const width of [1440,390]) {
  const page=await browser.newPage({viewport:{width,height:1000}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/api/admin/lineups**',r=>r.fulfill({json:[]}));
  await page.route('**/api/lineups**',r=>r.fulfill({json:[]}));
  await page.route('**/www.youtube.com/**',r=>r.abort());
  for (const [name,url] of [['login','/admin'],['list','/admin/lineups'],['editor','/admin/lineups/new'],['public','/lineups'],['preview','/admin/preview']]) {
   if (name==='list') await page.addInitScript(()=>sessionStorage.setItem('lineup-admin-token','visual-fixture-token'));
   await page.goto((process.env.FRONTEND_URL || 'http://localhost:3000')+url);
   await page.waitForTimeout(700);
   await page.screenshot({path:path.join(__dirname,`${mode}-${width}-${name}.png`),fullPage:true});
   results.push({width,name,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),errors:[...errors]});
  }
  await page.close();
 }
 await browser.close();
 fs.writeFileSync(path.join(__dirname,`${mode}-results.json`),JSON.stringify(results,null,2));
 console.log(results);
})().catch(e=>{console.error(e);process.exit(1)});
