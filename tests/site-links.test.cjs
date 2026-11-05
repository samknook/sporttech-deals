const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const docs=path.join(__dirname,'..','docs');
test('local HTML links resolve to existing docs files',()=>{
 const missing=[];
 const files=fs.readdirSync(docs).filter(name=>name.endsWith('.html'));
 for(const name of files){
  const html=fs.readFileSync(path.join(docs,name),'utf8');
  for(const match of html.matchAll(/\bhref\s*=\s*["']([^"']+)["']/g)){
   const href=match[1].trim();
   if(!href||href.startsWith('#')||/^(https?:|mailto:|tel:|javascript:|data:)/i.test(href))continue;
   const plain=href.split(/[?#]/)[0];
   const dest=plain===''?'index.html':plain.endsWith('/')?path.join(plain,'index.html'):plain;
   if(!fs.existsSync(path.resolve(docs,dest)))missing.push(name+': '+href);
  }
 }
 assert.deepEqual(missing,[],'broken local page links');
});
test('race week guide is linked to homepage, Readiness Check and sitemap',()=>{
 const guide=fs.readFileSync(path.join(docs,'first-70-3-race-week-checklist.html'),'utf8');
 const home=fs.readFileSync(path.join(docs,'index.html'),'utf8');
 const readiness=fs.readFileSync(path.join(docs,'70-3-readiness-check.html'),'utf8');
 const sitemap=fs.readFileSync(path.join(docs,'sitemap.xml'),'utf8');
 assert.match(guide,/<title>First 70\.3 Race Week Checklist/);
 assert.match(home,/href="first-70-3-race-week-checklist.html"/);
 assert.match(readiness,/href="first-70-3-race-week-checklist.html"/);
 assert.match(sitemap,/first-70-3-race-week-checklist\.html/);
});

test('every local script, stylesheet, favicon and image in HTML exists',()=>{
 const missing=[];
 for(const name of fs.readdirSync(docs).filter(name=>name.endsWith('.html'))){
  const html=fs.readFileSync(path.join(docs,name),'utf8');
  const refs=[...html.matchAll(/<(?:script|img|link)\b[^>]*?\b(?:src|href)=["']([^"']+)["']/gi)];
  for(const match of refs){
   const href=match[1].trim();
   if(!href||href.startsWith('#')||/^(?:https?:|mailto:|tel:|javascript:|data:)/i.test(href))continue;
   const clean=href.split(/[?#]/)[0];
   if(!clean||clean.startsWith('/'))continue;
   const dest=path.resolve(docs,clean);
   if(!dest.startsWith(docs+path.sep)||!fs.existsSync(dest))missing.push(name+': '+href);
  }
 }
 assert.deepEqual(missing,[],'missing local page dependencies');
});
