#!/usr/bin/env node
'use strict';
// Mobile end-to-end smoke for the current public TriZentro journey.
// The old legacy product-site / language-switch assertions became obsolete
// when /events/ became the canonical landing experience.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'../docs');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.json':'application/json'};
const server=http.createServer((request,response)=>{
 let pathname;
 try{pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname)}catch{response.writeHead(400);response.end();return}
 const filename=path.resolve(ROOT,'.'+(pathname==='/'?'/index.html':pathname));
 if(!filename.startsWith(ROOT+path.sep)){response.writeHead(403);response.end();return}
 fs.stat(filename,(error,stat)=>{
  if(error){response.writeHead(404);response.end('Not found');return}
  const actual=stat.isDirectory()?path.join(filename,'index.html'):filename;
  fs.readFile(actual,(err,bytes)=>{
   if(err){response.writeHead(404);response.end('Not found');return}
   response.writeHead(200,{'Content-Type':mime[path.extname(actual)]||'application/octet-stream','Cache-Control':'no-store'});
   response.end(bytes);
  });
 });
});
async function test(){
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 const page=await context.newPage();
 const base='http://127.0.0.1:'+server.address().port;
 try{
  await page.goto(base+'/events/',{waitUntil:'domcontentloaded'});
  await page.locator('#cards .card').first().waitFor({state:'visible',timeout:15000});
  assert.equal(await page.locator('.tz-menu-toggle').isVisible(),true,'Unified mobile navigation should be visible');
  assert.equal(await page.locator('.tz-mobile-destinations [data-tz-destination="season"]').isVisible(),true,'Season navigation should be visible');
  assert.ok((await page.locator('#cards .card').count())>0,'Discovery must show available races');
  // The primary discovery CTA and sports shortcuts should be genuinely usable.
  await page.locator('.tzHeroDiscover').click();
  assert.equal(await page.locator('#q').evaluate(el=>el===document.activeElement),true);
  await page.locator('[data-tz-hero-sport="Hardlopen"]').click();
  assert.equal(await page.locator('#sport').inputValue(),'Hardlopen');
  assert.ok((await page.locator('#cards .card').count())>0);
  await page.locator('#reset').click();
  assert.equal(await page.locator('#sport').inputValue(),'');
  for(const slug of ['hardloopwedstrijden-2027','wielertochten-2027','triatlons-2027']){
   const a=page.locator('.tzDiscoveryGrid a[href="/ontdek/'+slug+'/"]');
   assert.equal(await a.count(),1);
   const response=await context.request.get(base+'/ontdek/'+slug+'/');
   assert.equal(response.status(),200,'Discovery landing page must exist: '+slug);
  }
  // Search and filter feedback. The empty-state recovery should reset upcoming events.
  await page.locator('#q').fill('zz-no-race-ever-999999');
  await page.locator('#cards .empty').waitFor({state:'visible'});
  await page.locator('#cards .empty button').click();
  await page.locator('#cards .card').first().waitFor({state:'visible'});
  assert.equal(await page.locator('#future').isChecked(),true,'Reset must restore upcoming races');
  // Advanced filters are discoverable, and their current selection is visible.
  await page.locator('#advanced > summary').click();
  await page.locator('#year').selectOption('2027');
  assert.match(await page.locator('#raAdvancedCount').innerText(),/1 actief/);
  await page.locator('#reset').click();
  await page.locator('#cards .card').first().waitFor({state:'visible'});
  // The newly simplified cards keep the main choices accessible on touch screens.
  const card=page.locator('#cards .card').first();
  assert.equal(await card.locator('.ra-card-save').isVisible(),true);
  assert.equal(await card.locator('.ra-detail-btn').isVisible(),true);
  await card.locator('.raCardMore > summary').click();
  assert.equal(await card.locator('.ra-alert-btn').isVisible(),true);
  assert.equal(await card.locator('.tz-race-share').isVisible(),true);
  // Saving a race is immediate and can be managed without an account.
  await card.locator('.ra-card-save').click();
  await page.locator('.tz-mobile-destinations [data-tz-destination="season"]').click();
  assert.match(await page.locator('#savedSummary').innerText(),/[1-9] wedstrijden opgeslagen/);
  assert.equal(await page.locator('#raShareSeason').isVisible(),true);
  assert.equal(await page.locator('#raSeasonBackup').isVisible(),true);
  // Check real detail page layout, disclosure and direct registration without visiting the organizer.
  await page.goto(base+'/events/wedstrijden/rbr-almere-2027-ra-219.html',{waitUntil:'domcontentloaded'});
  await page.locator('.race-action-panel').waitFor({state:'visible'});
  assert.equal(await page.locator('.race-primary-actions [data-ra-outbound="registration"]').isVisible(),true);
  assert.equal(await page.locator('#saveRace').isVisible(),true);
  assert.equal(await page.locator('.race-primary-actions [data-ra-radar]').isVisible(),true);
  assert.equal(await page.locator('#shareRace').isVisible(),false);
  await page.locator('.race-secondary summary').click();
  assert.equal(await page.locator('#shareRace').isVisible(),true);
  assert.equal(await page.locator('.race-secondary [data-ra-outbound="organizer"]').isVisible(),true);
  assert.equal(await page.locator('#shareRaceStatus').getAttribute('role'),'status');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),'Detail page should not overflow horizontally');
  console.log('PASS: mobile discovery, filters, save, season and focused race-detail actions');
 }catch(err){
  try{await page.screenshot({path:'mobile-smoke-failure.png',fullPage:true})}catch{}
  throw err;
 }finally{
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
 }
}
test().catch(err=>{console.error(err);process.exitCode=1});
