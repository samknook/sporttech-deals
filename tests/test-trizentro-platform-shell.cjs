'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'../docs');
const files=JSON.parse(fs.readFileSync(path.join(__dirname,'../config/trizentro-public-pages.json'),'utf8')).pages.slice();
const raceDir=path.join(root,'raceatlas/wedstrijden');
assert.ok(fs.existsSync(raceDir),'generated race pages missing');
const eventFiles=fs.readdirSync(raceDir).filter(f=>f.endsWith('.html'));
assert.ok(eventFiles.length>=300,'event page generation regressed');
for(const file of eventFiles)files.push('raceatlas/wedstrijden/'+file);
for(const rel of files){
 const data=fs.readFileSync(path.join(root,rel),'utf8');
 assert.ok(data.includes('tz-site-header')||rel==='raceatlas/index.html','missing branded header on '+rel);
 assert.equal((data.match(/shared-ui\.js\?v=[0-9a-f]{12}/g)||[]).length,1,'shared runtime count '+rel);
 assert.equal((data.match(/shared-ui\.css\?v=[0-9a-f]{12}/g)||[]).length,1,'shared CSS count '+rel);
 assert.ok(data.includes('trizentro-mark.svg'),'shared logo absent '+rel);
 assert.ok(data.includes('Hoofdnavigatie'),'main navigation missing '+rel);
 assert.ok(/<header[^>]*class="[^"]*tz-site-header/.test(data),'same header shell missing '+rel);
 assert.ok(/<nav[^>]*class="[^"]*tz-site-nav/.test(data),'shared nav class missing '+rel);
 assert.ok(/class="[^"]*tz-site-links/.test(data),'shared nav destinations missing '+rel);
 if(rel.includes('/wedstrijden/'))assert.ok(data.includes('saveRace'),'event action lost '+rel);
 if(rel==='raceatlas/index.html'){
  assert.ok(data.includes('id="raMobileFilters"'),'Events filters lost');
  assert.ok(data.includes('id="navSaved"'),'season functionality lost');
  assert.ok(data.includes('account-config.js'),'account functionality lost');
 }
}
const routes=['events','seizoen','account','performance','organisatoren'];
for(const route of routes){
 const data=fs.readFileSync(path.join(root,route,'index.html'),'utf8');
 assert.ok(data.includes('<base href='),'clean route missing original asset base '+route);
 assert.ok(data.includes('https://trizentro.com/'+route+'/'),'missing canonical '+route);
 assert.equal((data.match(/shared-ui\.js\?v=[0-9a-f]{12}/g)||[]).length,1,'missing shared JS '+route);
 assert.equal((data.match(/shared-ui\.css\?v=[0-9a-f]{12}/g)||[]).length,1,'missing shared CSS '+route);
 assert.ok(data.includes('tz-site-header'),'missing central header '+route);
}
const sample=eventFiles[Math.floor(eventFiles.length/2)];
const cleanDetail=fs.readFileSync(path.join(root,'events/wedstrijden',sample),'utf8');
assert.ok(cleanDetail.includes('<base href="../../raceatlas/wedstrijden/">'),'clean event must reuse asset directory');
assert.ok(cleanDetail.includes('https://trizentro.com/events/wedstrijden/'+sample),'clean event canonical missing');
assert.ok(cleanDetail.includes('saveRace'),'clean event must preserve season save action');
assert.ok(fs.readFileSync(path.join(root,'raceatlas/wedstrijden',sample),'utf8').includes('location.replace('),'old event URL must redirect');
assert.ok(fs.readFileSync(path.join(root,'sitemap.xml'),'utf8').includes('/events/wedstrijden/'+sample),'event sitemap should use clean URL');
for(const rel of ['raceatlas/index.html','performance.html','raceatlas/organisatoren.html']){
 assert.ok(fs.readFileSync(path.join(root,rel),'utf8').includes('location.replace('),'legacy path must redirect: '+rel);
}
console.log('PASS: '+files.length+' public TriZentro pages use one platform shell without duplicate assets');
