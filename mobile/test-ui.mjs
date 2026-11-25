import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
const root=path.resolve('www');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=new URL(req.url,'http://localhost').pathname;
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep))throw Error('bad path');
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(await readFile(file));
 }catch{res.writeHead(404);res.end()}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const page=await context.newPage();
 const base='http://127.0.0.1:'+server.address().port;
 const feed=JSON.parse(await readFile('www/catalogue.json','utf8'));
 assert.ok(feed.events.find(e=>e.id==='ra-219'),'RBR Almere must be in bundle');
 let response={...feed,schemaVersion:999};
 await page.route('https://trizentro.com/app-catalogue.json',route=>route.fulfill({status:200,headers:{'Access-Control-Allow-Origin':'*','Content-Type':'application/json'},body:JSON.stringify(response)}));
 await page.goto(base);
 await page.locator('article').first().waitFor();
 await page.locator('[data-sport="Triatlon"]').click();
 await page.locator('#search').fill('RBR Almere');
 const card=page.locator('article').filter({hasText:'RBR Almere 2027'});
 await card.waitFor();
 await card.locator('button.save').click();
 await card.locator('button.save[aria-pressed="true"]').waitFor();
 await page.locator('[data-tab="season"]').click();
 assert.match(await page.locator('#races').innerText(),/RBR Almere 2027/);
 assert.equal(await page.locator('#seasonCount').innerText(),'1 bewaarde wedstrijd');
 assert.equal(await page.locator('#shareSeason').isVisible(),true);
 assert.equal(await page.locator('#nextRace').isVisible(),true);
 assert.match(await page.locator('#nextRaceName').innerText(),/RBR Almere 2027/);
 await page.reload();
 await page.locator('article').first().waitFor();
 await page.locator('[data-tab="season"]').click();
 assert.match(await page.locator('#races').innerText(),/RBR Almere 2027/);
 await page.locator('#refresh').click();
 await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Geen nieuwe kalender'));
 assert.match(await page.locator('#races').innerText(),/RBR Almere 2027/);
 response={...feed,events:feed.events.map(e=>e.id==='ra-219'?{...e,name:e.name+' (test)'}:e)};
 await page.locator('#refresh').click();
 await page.waitForFunction(()=>document.getElementById('status').textContent.includes('bijgewerkt.'));
 assert.match(await page.locator('#races').innerText(),/RBR Almere 2027 \(test\)/);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2));
 await page.reload();await page.locator('article').first().waitFor();
 await page.locator('[data-tab="season"]').click();
 assert.match(await page.locator('#races').innerText(),/RBR Almere 2027 \(test\)/);
 console.log('PASS: native web bundle, search, persistent local season, validated refresh, cached update, mobile layout');
 await page.screenshot({path:'trizentro-native-preview.png',fullPage:true});
}finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
