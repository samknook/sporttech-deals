'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const base='docs/';
const events=fs.readFileSync(base+'events/index.html','utf8');
const robots=fs.readFileSync(base+'robots.txt','utf8');
const sitemap=fs.readFileSync(base+'sitemap.xml','utf8');
assert.ok(events.includes('TriZentro | Hardloopwedstrijden, triatlons en wielerevenementen 2027'),'Search title missing');
assert.ok(events.includes('https://trizentro.com/events/'),'Missing canonical Events URL');
assert.ok(events.includes('"@type":"WebSite"'),'Structured WebSite identity missing');
assert.ok(events.includes('"@type":"Organization"'),'Organization schema missing');
assert.ok(!events.includes('meta name="robots" content="noindex'),'Events must be indexable');
assert.ok(robots.includes('Sitemap: https://trizentro.com/sitemap.xml'),'Incorrect sitemap URL');
assert.ok(!robots.includes('samknook.github.io'),'Old domain must not be promoted');
assert.ok(!sitemap.includes('samknook.github.io'),'Old sitemap URL found');
assert.ok(!sitemap.includes('/raceatlas/wedstrijden/'),'Old race detail URLs found');
const detailFiles=fs.readdirSync(base+'events/wedstrijden').filter(n=>n.endsWith('.html'));
assert.ok(detailFiles.length>=400,'Some races missing from canonical index');
for(const name of detailFiles)assert.ok(sitemap.includes('<loc>https://trizentro.com/events/wedstrijden/'+name+'</loc>'),'Sitemap missing '+name);
for(const name of ['seizoen','account'])assert.ok(!sitemap.includes('<loc>https://trizentro.com/'+name+'/</loc>'),'Private route must be excluded: '+name);
for(const [oldName,canonical] of [
 ['raceatlas/index.html','events/'],['performance.html','performance/'],
 ['raceatlas/organisatoren.html','organisatoren/']]){
 const old=fs.readFileSync(base+oldName,'utf8');
 assert.ok(old.includes('<meta name="robots" content="noindex,follow">'),'Legacy route must not be indexed: '+oldName);
 assert.ok(old.includes('https://trizentro.com/'+canonical),'Legacy route must point to canonical: '+oldName);
}
for(const oldName of detailFiles.slice(0,5)){
 const legacy=fs.readFileSync(base+'raceatlas/wedstrijden/'+oldName,'utf8');
 assert.ok(legacy.includes('noindex,follow'),'Legacy race page must be noindex: '+oldName);
}
// Every published SportsEvent must have valid startDate; unknown dates stay regular pages.
let richResultEvents=0,ordinaryEventPages=0;
for(const name of detailFiles){
 const page=fs.readFileSync(base+'events/wedstrijden/'+name,'utf8');
 assert.ok(page.includes('event-save.js?v=20261117-cloudseason'),'Detail page must use shared account-aware season: '+name);
 assert.ok(page.includes('account-config.js'),'Detail page missing account configuration: '+name);
 assert.ok(page.includes('TriZentroEventSaveId'),'Detail page missing save event identity: '+name);
 const ld=[...page.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
 for(const match of ld){
  const item=JSON.parse(match[1]);
  if(item['@type']!=='SportsEvent')continue;
  richResultEvents++;
  assert.match(item.startDate||'',/^\d{4}-\d{2}-\d{2}$/,'Missing startDate in '+name);
  assert.ok(item.description,'Missing structured description in '+name);
  if(item.location)assert.ok(item.location.address?.addressLocality,'Location address missing for '+name);
 }
 if(ld.length===0)ordinaryEventPages++;
 assert.ok(page.includes('https://trizentro.com/events/wedstrijden/'+name),'Canonical public page mismatch: '+name);
}
assert.ok(richResultEvents>0,'No structured dated events');
assert.ok(ordinaryEventPages>0,'Unknown-date pages should omit Event structured data');
const eventSave=fs.readFileSync(base+'raceatlas/event-save.js','utf8');
assert.ok(eventSave.includes("raceatlas_saved_events"),'Account detail save must use the shared season table');
assert.ok(eventSave.includes("raceatlas-saved-v2"),'Guest detail save must keep legacy local season support');
assert.ok(eventSave.includes("client.auth.getUser()"),'Detail save must resolve authenticated user');
console.log('Structured events validated: '+richResultEvents+' rich results, '+ordinaryEventPages+' ordinary pages');
console.log('SEO PASS: canonical brand identity, robots, sitemap and '+detailFiles.length+' race pages');
