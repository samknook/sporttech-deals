// End-to-end mobile QA for the public docs site.
// Run locally: npm install --no-save playwright@1.56.1
//              npx playwright install chromium
//              node tests/mobile-smoke.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');

const ROOT=path.resolve(__dirname,'../docs');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'};
const server=http.createServer((request,response)=>{
 const u=new URL(request.url,'http://localhost');
 const requested=decodeURIComponent(u.pathname);
 const filename=path.resolve(ROOT,'.'+(requested==='/'?'/index.html':requested));
 if(!filename.startsWith(ROOT+path.sep)){response.writeHead(403);response.end();return;}
 fs.readFile(filename,(err,bytes)=>{
  if(err){response.writeHead(404);response.end('Not found: '+requested);return;}
  response.writeHead(200,{'Content-Type':mime[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-store'});
  response.end(bytes);
 });
});

async function test(){
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 const page=await context.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(base+'/?lang=nl',{waitUntil:'load'});
  await page.locator('.tz-lang-switch button[aria-pressed="true"]').waitFor();
  assert.equal(await page.locator('html').getAttribute('lang'),'nl');
  assert.equal(await page.locator('.tz-mobile-menu').isVisible(),true);
  assert.equal(await page.locator('.tz-nav-desktop').isVisible(),false);
  await page.locator('.tz-mobile-menu > summary').click();
  await page.locator('.tz-mobile-group > summary').filter({hasText:'Tools'}).click();
  await page.locator('.tz-mobile-group-links a[href^="race-dashboard.html"]').click();
  await page.waitForURL(/race-dashboard\.html.*lang=nl/);
  assert.equal(await page.locator('html').getAttribute('lang'),'nl');

  // Raw mobile numeric entry is accepted before blur and formats on blur.
  const target=page.locator('#goal');
  await target.fill('530');
  await target.dispatchEvent('input');
  assert.equal(await page.locator('#error').isVisible(),false,'530 should calculate without validation error');
  await target.blur();
  assert.equal(await target.inputValue(),'05:30');

  // A brand/home click on a subpage must navigate home (regression).
  await page.locator('a.brand').first().click();
  await page.waitForURL(url=>url.pathname==='/'&&url.searchParams.get('lang')==='nl');
  assert.equal(await page.locator('html').getAttribute('lang'),'nl');

  await page.locator('.tz-lang-switch button[lang="en"]').click();
  await page.waitForURL(url=>url.pathname==='/'&&url.searchParams.get('lang')==='en');
  assert.equal(await page.locator('html').getAttribute('lang'),'en');
  assert.equal(await page.locator('.tz-lang-switch button[lang="en"]').getAttribute('aria-pressed'),'true');
  await page.locator('.tz-mobile-menu > summary').click();
  await page.locator('.tz-mobile-group > summary').filter({hasText:'Preparation'}).click();
  await page.locator('.tz-mobile-group-links a[href^="70-3-readiness-check.html"]').click();
  await page.waitForURL(/70-3-readiness-check\.html.*lang=en/);
  assert.equal(await page.locator('html').getAttribute('lang'),'en');

  // English and Dutch product pages remain accessible and correctly labeled.
  await page.goto(base+'/products.html?lang=nl');
  assert.equal(await page.locator('html').getAttribute('lang'),'nl');
  assert.match(await page.locator('h1').first().innerText(),/Leer slimmer/);
  await page.goto(base+'/products.html?lang=en');
  assert.match(await page.locator('h1').first().innerText(),/Learn smarter/);

  // Explicit draft persistence: user chooses to save, restore and remove.
  await page.goto(base+'/race-pack-preview.html?lang=nl');
  await page.locator('#race-name').fill('Mijn 70.3 test');
  await page.locator('#save-draft').click();
  assert.match(await page.locator('#draft-status').innerText(),/opgeslagen/i);
  await page.reload();
  await page.locator('#load-draft').click();
  assert.equal(await page.locator('#race-name').inputValue(),'Mijn 70.3 test');
  await page.locator('#delete-draft').click();
  await page.reload();
  await page.locator('#load-draft').click();
  assert.match(await page.locator('#draft-status').innerText(),/geen opgeslagen concept/i);

  // No unhandled JavaScript errors throughout navigation and calculations.
  assert.deepEqual(errors,[],'uncaught browser errors');
  console.log('PASS: 390px mobile menu, localized navigation, brand homepage, 530 goal and NL/EN product pages');
 }catch(error){
  try{await page.screenshot({path:'mobile-smoke-failure.png',fullPage:true});}catch(e){}
  throw error;
 }finally{
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
 }
}
test().catch(err=>{console.error(err);process.exitCode=1;});
