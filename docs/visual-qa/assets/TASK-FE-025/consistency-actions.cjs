const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const modules=process.env.PLAYWRIGHT_MODULES;
const {chromium}=modules?require(path.basename(modules)==='playwright'?modules:path.join(modules,'playwright')):require('playwright');
const {expect}=modules?require(path.join(path.basename(modules)==='playwright'?modules:path.join(modules,'playwright'),'test')):require('playwright/test');
const base=process.env.BASE_URL||'http://localhost:3000';
const result={checks:[],toasts:[],styles:[],errors:[],consoleErrors:[]};
const check=(label,actual,expected)=>{assert.deepEqual(actual,expected,label);result.checks.push(label);};
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const width of [1440,390]){
   const context=await browser.newContext({viewport:{width,height:width===390?844:960},reducedMotion:'reduce'});
   await context.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.__qaCopied=value;}}}));
   const page=await context.newPage();page.on('pageerror',e=>result.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')result.consoleErrors.push(m.text());});
   for(const [name,id,count,jettCount]of [['legacy','ied-agent-allen',20,9],['new','demo-player-01',4,2]]){
    const key=`${width}-${name}`,route=`/players/${id}`;
    await page.goto(base+route,{waitUntil:'networkidle'});
    const rows=page.locator('button[aria-controls^="details-"]'),nav=page.getByRole('navigation',{name:'Profile sections'});
    await expect(rows).toHaveCount(count);
    const initial=await rows.allTextContents();
    const saved=page.locator('[class*="saveButton"]');const toast=page.locator('[class*="toast"][role="status"]');
    async function toastKorean(action){await expect(toast).toBeVisible();const text=await toast.innerText();assert.ok(/[가-힣]/.test(text),`${key} ${action}: Korean feedback`);result.toasts.push({key,action,text});result.checks.push(`${key} ${action}: Korean feedback`);}
    await page.keyboard.press('Tab');await saved.focus();
    check(`${key}: save receives keyboard focus`,await saved.evaluate(el=>el===document.activeElement),true);
    const focus=await saved.evaluate(el=>({outline:getComputedStyle(el).outlineStyle,width:getComputedStyle(el).outlineWidth}));
    assert.notEqual(focus.outline,'none');assert.notEqual(focus.width,'0px');result.checks.push(`${key}: focus outline visible`);
    await page.keyboard.press('Space');await expect(saved).toHaveAttribute('aria-pressed','true');await toastKorean('save');
    check(`${key}: per-player save persisted`,await page.evaluate(player=>localStorage.getItem(`gameprobe:profile:${player}:saved`),id),'true');
    const savedColor=await saved.evaluate(el=>getComputedStyle(el).backgroundColor);const accountColor=await page.locator('[class*="accountLink"]').evaluate(el=>getComputedStyle(el).backgroundColor);
    assert.notEqual(savedColor,accountColor);result.styles.push({key,savedColor,accountColor});result.checks.push(`${key}: saved state keeps distinct color`);
    await page.reload({waitUntil:'networkidle'});await expect(saved).toHaveAttribute('aria-pressed','true');result.checks.push(`${key}: saved survives reload`);
    await saved.click();await expect(saved).toHaveAttribute('aria-pressed','false');await toastKorean('unsave');
    check(`${key}: unsave persisted`,await page.evaluate(player=>localStorage.getItem(`gameprobe:profile:${player}:saved`),id),'false');
    await page.locator('[class*="shareButton"]').click();await toastKorean('share');check(`${key}: copy current profile URL`,await page.evaluate(()=>window.__qaCopied),base+route);
    const search=page.getByRole('textbox',{name:'Search Riot ID'});await search.fill('qa-no-real-account#TEST');await search.press('Enter');await toastKorean('search');check(`${key}: search remains demo`,new URL(page.url()).pathname,route);
    await page.locator('[class*="updateButton"]').click();await expect(rows).toHaveCount(count);
    if(name==='legacy')await toastKorean('refresh');else await expect(page.getByRole('heading',{name:/DemoPlayer01/})).toBeVisible();
    check(`${key}: refresh preserves sample rows`,await rows.allTextContents(),initial);
    await nav.getByRole('button',{name:'Matches',exact:true}).click();
    if(name==='legacy'){await page.getByRole('button',{name:'Load more matches',exact:true}).click();await expect(rows).toHaveCount(23);result.checks.push(`${key}: load more 23 rows`);}
    await page.getByLabel('Agent',{exact:true}).selectOption({label:'Jett'});await expect(rows).toHaveCount(jettCount);result.checks.push(`${key}: Jett filter ${jettCount} rows`);
    await page.getByRole('region',{name:'Match history'}).getByRole('button',{name:'Reset filters',exact:true}).click();await expect(rows).toHaveCount(count);result.checks.push(`${key}: filter reset restores ${count}`);
    await rows.first().click();const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();await expect(dialog.getByRole('tab')).toHaveCount(5);await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);result.checks.push(`${key}: details five tabs and Escape preserved`);
    await nav.getByRole('button',{name:'Agents',exact:true}).click();await page.locator('main table tbody button').first().click();await expect(nav.getByRole('button',{name:'Matches',exact:true})).toHaveAttribute('aria-current','page');await expect(rows).toHaveCount(jettCount);result.checks.push(`${key}: agent table still opens filtered matches`);
   }
   await page.goto(base+'/',{waitUntil:'networkidle'});await page.getByRole('button',{name:'데모 보기',exact:true}).click();await page.waitForURL(base+'/players/ied-agent-allen');result.checks.push(`${width}: default demo still legacy`);
   await page.goto(base+'/',{waitUntil:'networkidle'});await page.locator('[class*="demoLinks"] a[href="/players/demo-player-01"]').click();await page.waitForURL(base+'/players/demo-player-01');result.checks.push(`${width}: named new demo still synthetic`);
   for(const [scenario,label,count]of [['partial','일부 예시 기록만 표시됩니다.',3],['empty','선택한 조건에 해당하는 예시 경기가 없습니다.',0],['error','예시 경기를 불러오지 못했습니다.',0]]){
    await page.goto(base+'/players/demo-player-01?scenario='+scenario,{waitUntil:'networkidle'});
    const status=page.locator('section[role="status"]');const rows=page.locator('button[aria-controls^="details-"]');
    await expect(status.locator('strong')).toHaveText(label);await expect(rows).toHaveCount(count);
    check(`${width} ${scenario}: no overflow`,await page.evaluate(()=>Math.max(0,document.documentElement.scrollWidth-innerWidth)),0);
    result.checks.push(`${width} ${scenario}: Korean status and ${count} rows`);
    if(scenario!=='empty'){
     await page.getByRole('button',{name:'예시 기록 다시 불러오기',exact:true}).click();
     await expect(status.locator('strong')).toHaveText(label);await expect(rows).toHaveCount(count);
     check(`${width} ${scenario}: retry retains scenario`,new URL(page.url()).searchParams.get('scenario'),scenario);
    }
    await page.getByRole('link',{name:'기본 데모로 돌아가기',exact:true}).click();await page.waitForURL(base+'/players/demo-player-01');await expect(rows).toHaveCount(4);
    result.checks.push(`${width} ${scenario}: default return restores 4 rows`);
   }
   await page.getByRole('button',{name:'Console',exact:true}).click();await expect(page.locator('section[role="status"] strong')).toHaveText('이 데모는 PC Competitive 기록만 제공합니다.');await expect(page.locator('button[aria-controls^="details-"]')).toHaveCount(0);
   check(`${width} unsupported Console: no overflow`,await page.evaluate(()=>Math.max(0,document.documentElement.scrollWidth-innerWidth)),0);result.checks.push(`${width}: unsupported Console preserves Korean unavailable state`);
   await context.close();
  }
  check('no page errors',result.errors,[]);check('no console errors',result.consoleErrors,[]);result.status='PASS';
 }catch(error){result.status='FAIL';result.failure=error.stack;throw error;}
 finally{fs.writeFileSync(path.join(__dirname,'consistency-actions-results.json'),JSON.stringify(result,null,2));await browser.close();console.log(JSON.stringify({status:result.status,checks:result.checks.length,errors:result.errors,consoleErrors:result.consoleErrors}));}
})().catch(error=>{console.error(error);process.exitCode=1;});
