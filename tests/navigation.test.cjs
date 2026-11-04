const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const docs=path.join(__dirname,'../docs');
const navigation=fs.readFileSync(path.join(docs,'navigation.js'),'utf8');
const siteCss=fs.readFileSync(path.join(docs,'site.css'),'utf8');
test('every sitemap HTML page loads universal menu once',()=>{
 const sitemap=fs.readFileSync(path.join(docs,'sitemap.xml'),'utf8');
 const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
 assert.ok(urls.length>=18);
 for(const url of urls){
  const u=new URL(url);
  const page=u.pathname.split('/').at(-1)||'index.html';
  const html=fs.readFileSync(path.join(docs,page),'utf8');
  assert.equal((html.match(/src="navigation\.js"/g)||[]).length,1,page+' missing or duplicates menu');
  assert.match(html,/<div class="nav">/,page+' missing expected header');
 }
});
test('every navigation destination has a real page',()=>{
 const matches=[...navigation.matchAll(/\['[^']+','([^']+\.html)'\]/g)];
 assert.ok(matches.length>=15);
 for(const [,href] of matches)assert.ok(fs.existsSync(path.join(docs,href)),href+' does not exist');
 const names=matches.map(m=>m[1]);
 assert.equal(new Set(names).size,names.length,'navigation has duplicate destinations');
});
test('mobile menu supports keyboard and touch screen sizing',()=>{
 assert.match(navigation,/tz-mobile-menu/);
 assert.match(navigation,/aria-current="page"/);
 assert.match(navigation,/Escape/);
 assert.match(navigation,/event\.target/);
 assert.match(siteCss,/@media\(max-width:1050px\)/);
 assert.match(siteCss,/max-height:min\(74dvh,690px\)/);
 assert.match(siteCss,/min-height:44px/);
 assert.match(siteCss,/:focus-visible/);
});

test('home page has four obvious destination cards for mobile visitors',()=>{
 const html=fs.readFileSync(path.join(docs,'index.html'),'utf8');
 const links=['race-dashboard.html','70-3-readiness-check.html','products.html','koopgids.html'];
 const section=html.match(/<section class="tz-shortcuts"[\s\S]*?<\/section>/);
 assert.ok(section,'home shortcuts section missing');
 for(const dest of links)assert.ok(section[0].includes('href="'+dest+'"'),dest+' missing from quick access');
 assert.match(siteCss,/\.tz-shortcuts-grid/);
 assert.match(siteCss,/@media\(max-width:500px\)/);
});
