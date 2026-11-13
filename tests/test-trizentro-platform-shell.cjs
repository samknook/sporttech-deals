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
console.log('PASS: '+files.length+' public TriZentro pages use one platform shell without duplicate assets');
