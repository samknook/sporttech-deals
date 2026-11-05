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
 const matches=[...navigation.matchAll(/\[tr\('[^']+','[^']+'\),'([^']+\.html)'\]/g)];
 const extra=[...navigation.matchAll(/\[\['[^']+','([^']+\.html)'\]\]/g)];
 const names=matches.map(m=>m[1]).concat(extra.map(m=>m[1]));
 assert.ok(names.length>=16,'unexpected number of menu destinations');
 for(const href of names)assert.ok(fs.existsSync(path.join(docs,href)),href+' does not exist');
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

test('mobile categories collapse and expand without exposing every page at once',()=>{
 assert.match(navigation,/details class="tz-mobile-group"/);
 assert.match(navigation,/summary class="tz-mobile-heading"/);
 assert.match(navigation,/g\.items\.some\(item=>item\[1\]===path\)/);
 assert.match(navigation,/mobileGroups\.forEach/);
 assert.match(siteCss,/tz-mobile-group\[open\]/);
});

test('homepage has one clear three-step onboarding path on mobile',()=>{
 const html=fs.readFileSync(path.join(docs,'index.html'),'utf8');
 const match=html.match(/<section class="section tz-onboarding"[\s\S]*?<\/section>/);
 assert.ok(match,'three-step onboarding section not found');
 const onboarding=match[0];
 assert.equal((onboarding.match(/<article>/g)||[]).length,3,'expected three clear entry steps');
 for(const href of ['70-3-readiness-check.html','race-dashboard.html','race-pack-preview.html','first-70-3-race-week-checklist.html','products.html']){
  assert.ok(onboarding.includes('href="'+href+'"'),href+' missing from focused onboarding');
 }
 assert.match(siteCss,/\.tz-journey/);
 assert.match(siteCss,/@media\(max-width:800px\)/);
});
