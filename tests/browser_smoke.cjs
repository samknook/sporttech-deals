'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const viewport of [{width:1366,height:900},{width:390,height:844}]){
   const page=await browser.newPage({viewport,acceptDownloads:true});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8765/race-planner.html');
   assert.notEqual(await page.locator('#time-total').innerText(),'—');
   assert.equal(await page.locator('#timeline tr').count(),12);
   await page.locator('[data-distance="sprint"]').click();
   assert.match(await page.locator('#race-legs').innerText(),/750 m/);
   await page.locator('[data-distance="custom"]').click();
   await page.locator('#swim-meters').fill('850');
   await page.locator('#bike-km').fill('37.5');
   await page.locator('#run-km').fill('7.5');
   await page.locator('#target-time').fill('02:00');
   assert.ok(await page.locator('#goal-analysis').isVisible());
   await page.locator('[data-goal-apply="bike"]').click();
   assert.ok(Number(await page.locator('#bike-speed').inputValue())>33);
   await page.locator('.check-item').first().check();
   assert.match(await page.locator('#check-progress').innerText(),/1 van/);
   const d=page.waitForEvent('download');
   await page.locator('#download-plan').click();
   assert.equal((await d).suggestedFilename(),'mijn-triathlon-raceplan.txt');
   await page.goto('http://127.0.0.1:8765/triathlon-calculator.html');
   await page.locator('[data-distance="sprint"]').click();
   await page.locator('#target-time').fill('01:20');
   await page.locator('[data-goal-apply="run"]').click();
   assert.match(await page.locator('#goal-status').innerText(),/Binnen doel/);
   await page.locator('[data-distance="full"]').click();
   assert.equal(await page.locator('#goal-analysis').isVisible(),false);
   assert.equal(errors.length,0,errors.join('; '));
   if(viewport.width<500){
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    assert.ok(overflow<=2,'Mobile horizontal overflow: '+overflow);
   }
   console.log('PASS '+viewport.width+'px: planner, custom, goal, export, calculator');
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
