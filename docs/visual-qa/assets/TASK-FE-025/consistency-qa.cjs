const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const modules = process.env.PLAYWRIGHT_MODULES;
const { chromium } = modules ? require(path.basename(modules) === 'playwright' ? modules : path.join(modules, 'playwright')) : require('playwright');
const phase = process.argv[2];
assert.ok(['before', 'after'].includes(phase));
const base = process.env.BASE_URL || 'http://localhost:3000';
const result = { phase, states: {}, buttons: {}, checks: [], captures: [], errors: [], consoleErrors: [] };
const check = (name, value, expected) => { assert.deepEqual(value, expected, name); result.checks.push(name); };
const tabs = ['Overview', 'Matches', 'Performance', 'Agents', 'Maps', 'Weapons'];
const shortTabs = ['Agents', 'Maps', 'Weapons'];
const shotTabs = ['Overview', ...shortTabs];
const support = [['connect','/connect'], ['privacy','/privacy'], ['terms','/terms'], ['missing','/matches/demo-match-missing']];
async function settle(page) {
  await page.evaluate(async () => { await document.fonts.ready; for (const image of document.images) image.loading = 'eager'; await Promise.all([...document.images].map(image => image.decode().catch(() => {}))); });
  await page.mouse.move(0,0);
  await page.waitForTimeout(160);
}
async function paint(page, key, screenshot = true) {
  await settle(page); await page.evaluate(() => scrollTo(0,0));
  const state = await page.locator('main').evaluate(root => {
    const text = el => el.textContent.replace(/\s+/g,' ').trim();
    const aside = root.querySelector('aside[aria-label="Player statistics"]');
    return { mainCount: document.querySelectorAll('main').length, overflow: Math.max(0,document.documentElement.scrollWidth-innerWidth),
      height: document.documentElement.scrollHeight, tables: [...root.querySelectorAll('table')].map(text),
      rows: [...root.querySelectorAll('button[aria-controls^="details-"]')].map(el => ({ id: el.getAttribute('aria-controls'), text: text(el) })),
      selected: [...root.querySelectorAll('select')].map(el => ({ label: el.getAttribute('aria-label'), value: el.value })),
      sidebarText: aside?.innerText || null, sidebarHeight: aside?.getBoundingClientRect().height || null,
      blocks: [...root.querySelectorAll('h1,h2,h3,p,li,button:disabled')].map(el => ({ tag:el.tagName,text:text(el) })),
      bodyText: root.innerText };
  });
  check(`${key}: one main`,state.mainCount,1); check(`${key}: no page overflow`,state.overflow,0);
  result.states[key] = state;
  if (screenshot) { const file = `consistency-${phase}-${key}.png`; await page.screenshot({path:path.join(__dirname,file),fullPage:true,animations:'disabled'}); result.captures.push(file); }
  console.log(phase,key);
}
async function buttonStyles(page,key,locator) {
  async function read() { return locator.evaluate(el => { const s=getComputedStyle(el); return Object.fromEntries(['background-color','color','border-color','font-size','font-weight','filter','box-shadow','outline-color','outline-style','outline-width'].map(p=>[p,s.getPropertyValue(p)])); }); }
  await page.mouse.move(0,0); const normal=await read(); await locator.hover(); await page.waitForTimeout(200); const hover=await read();
  await page.mouse.move(0,0); await locator.focus(); const focus=await read(); await locator.evaluate(el=>el.blur());
  result.buttons[key]={normal,hover,focus};
}
(async()=>{
  const browser=await chromium.launch({headless:true});
  try {
    for(const width of [1440,820,390]) {
      const context=await browser.newContext({viewport:{width,height:width===390?844:960},deviceScaleFactor:1,reducedMotion:'reduce'});
      const page=await context.newPage();
      page.on('pageerror',error=>result.errors.push(error.message));
      page.on('console',message=>{if(message.type()==='error')result.consoleErrors.push(message.text());});
      async function go(route) { const response=await page.goto(base+route,{waitUntil:'networkidle'}); check(`${width} ${route}: HTTP200`,response.status(),200); }
      await go('/'); await paint(page,`${width}-home`);
      await buttonStyles(page,`${width}-home-account`,page.locator('[class*="accountLink"]'));
      await buttonStyles(page,`${width}-home-demo`,page.getByRole('button',{name:'데모 보기',exact:true}));
      for(const [name,id] of [['legacy','ied-agent-allen'],['new','demo-player-01']]) {
        await go(`/players/${id}`);
        const nav=page.getByRole('navigation',{name:'Profile sections'});
        for(const tab of tabs) {
          await nav.getByRole('button',{name:tab,exact:true}).click();
          check(`${width} ${name} ${tab}: active`,await nav.getByRole('button',{name:tab,exact:true}).getAttribute('aria-current'),'page');
          const key=`${width}-${name}-${tab.toLowerCase()}`; await paint(page,key,shotTabs.includes(tab));
          if(phase==='after') {
            const aside=page.getByRole('complementary',{name:'Player statistics'});
            const text=await aside.innerText();
            check(`${key}: rank retained`,text.includes('CURRENT RATING'),true);
            for(const heading of ['ACCURACY','ROLES','TOP WEAPONS','TOP MAPS']) check(`${key}: ${heading} scope`,text.includes(heading),!shortTabs.includes(tab));
            if(shortTabs.includes(tab)) {
              const back=aside.getByRole('button',{name:/Overview/});
              check(`${key}: compact Overview control`,await back.count(),1);
              await back.click();
              check(`${key}: compact control returns Overview`,await nav.getByRole('button',{name:'Overview',exact:true}).getAttribute('aria-current'),'page');
              check(`${key}: full sidebar restored`,(await aside.innerText()).includes('ACCURACY'),true);
            }
          }
        }
        await nav.getByRole('button',{name:'Overview',exact:true}).click();
        await buttonStyles(page,`${width}-${name}-account`,page.locator('[class*="accountLink"]'));
        await buttonStyles(page,`${width}-${name}-save`,page.locator('[class*="saveButton"]'));
      }
      for(const [name,route]of support) {
        await go(route);await paint(page,`${width}-${name}`);
        if(name==='connect') {
          await buttonStyles(page,`${width}-support-account`,page.locator('[class*="accountLink"]'));
          check(`${width} connect: disabled remains`,await page.getByRole('button',{name:'Riot 계정 연결 준비 중'}).isDisabled(),true);
        }
        if(phase==='after'&&['connect','privacy','terms'].includes(name)) {
          const text=await page.locator('main').innerText();
          check(`${width} ${name}: developer labels removed`,/TASK-\d|Phase\s*\d|VALORANT Platform/.test(text),false);
          if(name!=='connect') check(`${width} ${name}: draft retained`,text.includes('초안'),true);
        }
      }
      await context.close();
    }
    check('no uncaught browser errors',result.errors,[]);
    check('no console errors',result.consoleErrors,[]);
    if(phase==='after') {
      const before=JSON.parse(fs.readFileSync(path.join(__dirname,'consistency-before-results.json'),'utf8'));
      for(const [key,state]of Object.entries(result.states)) if(/-(legacy|new)-/.test(key)) {
        for(const field of ['tables','rows','selected']) check(`${key}: ${field} unchanged`,state[field],before.states[key][field]);
      }
      for(const width of [1440,820,390]) {
        const reference=result.buttons[`${width}-home-account`];
        for(const target of ['legacy-account','new-account','support-account','home-demo','legacy-save','new-save']) {
          const actual=result.buttons[`${width}-${target}`];
          for(const state of ['normal','hover'])for(const prop of ['background-color','color'])check(`${width} ${target}: ${state} ${prop} unified`,actual[state][prop],reference[state][prop]);
        }
      }
    }
    result.status='PASS';
  }catch(error){result.status='FAIL';result.failure=error.stack;throw error;}
  finally{fs.writeFileSync(path.join(__dirname,`consistency-${phase}-results.json`),JSON.stringify(result,null,2));await browser.close();console.log(JSON.stringify({phase,status:result.status,captures:result.captures.length,checks:result.checks.length,errors:result.errors,consoleErrors:result.consoleErrors}));}
})().catch(error=>{console.error(error);process.exitCode=1;});
