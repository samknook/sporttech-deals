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
  assert.equal(await page.locator('#raMobileExplore').isVisible(),true,'Mobile discovery navigation should be visible');
  assert.equal(await page.locator('#raMobileSaved').isVisible(),true,'Mobile season navigation should be visible');
  assert.ok((await page.locator('#cards .card').count())>0,'Discovery must show available races');
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
  await page.locator('#raMobileSaved').click();
  assert.match(await page.locator('#savedSummary').innerText(),/[1-9] wedstrijden opgeslagen/);
  assert.equal(await page.locator('#raShareSeason').isVisible(),true);
  assert.equal(await page.locator('#raSeasonBackup').isVisible(),true);
  console.log('PASS: mobile event discovery, no-results reset, filter feedback, card actions and saved season');
 }catch(err){
  try{await page.screenshot({path:'mobile-smoke-failure.png',fullPage:true})}catch{}
  throw err;
 }finally{
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
 }
}
test().catch(err=>{console.error(err);process.exitCode=1});
