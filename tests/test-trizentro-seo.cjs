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
const sharedNav=fs.readFileSync(base+'shared-ui.js','utf8');
for(const canonical of ["routePath('events/')","routePath('seizoen/')","routePath('account/')","routePath('performance/')","routePath('organisatoren/')"])
 assert.ok(sharedNav.includes(canonical),'Shared nav must use central canonical route '+canonical);
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
 assert.ok(page.includes('/events/?ra_alert='),'Detail page missing direct Inschrijfradar signup: '+name);
 assert.ok(page.includes('href="/events/?event='),'Race detail must open canonical Events calendar: '+name);
 assert.ok(page.includes('href="/performance/"'),'Race detail must open canonical Performance: '+name);
 assert.ok(page.includes('href="/organisatoren/?onderwerp='),'Claim event form must use canonical organizer route: '+name);
 assert.ok(!page.includes('href="../../performance.html"'),'Race detail must not promote legacy Performance URL: '+name);
 assert.ok(!page.includes('href="../?event='),'Race detail must not link to legacy calendar: '+name);

 const ld=[...page.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
 for(const match of ld){
  const item=JSON.parse(match[1]);
  if(item['@type']!=='SportsEvent')continue;
  richResultEvents++;
  assert.match(item.startDate||'',/^\d{4}-\d{2}-\d{2}$/,'Missing startDate in '+name);
  assert.ok(item.description,'Missing structured description in '+name);
  assert.ok(item.url==='https://trizentro.com/events/wedstrijden/'+name,'SportsEvent schema must use canonical race URL: '+name);
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
const radar=fs.readFileSync(base+'raceatlas/alerts.js','utf8');
assert.ok(radar.includes("params.get('ra_alert')"),'Radar deep-link handling missing');
assert.ok(radar.includes('/^ra-[0-9]{1,8}$/'),'Radar must validate linked event IDs');
assert.ok(radar.includes('dialog.append(form,notice,emailBox,actions)'),'Radar signup should be shown after instructions');
assert.ok(radar.includes("event.key==='Escape'"),'Radar should close with Escape');
assert.ok(radar.includes('aria-labelledby'),'Radar dialog must expose its heading to screen readers');
assert.ok(radar.includes('getClientRects().length>0'),'Radar keyboard focus trap must ignore hidden controls');
const registrationRadar=fs.readFileSync(base+'raceatlas/intelligence.js','utf8');
assert.ok(registrationRadar.includes('window.RaceAtlasSaved'),'Radar must reflect cloud-backed saved events');
assert.ok(registrationRadar.includes('raceatlas:season-source-change'),'Radar must refresh after login/logout');
assert.ok(registrationRadar.includes('RaceAtlasAlerts.openForEvent'),'Radar must link to per-event signup');
assert.ok(registrationRadar.includes('raIntelPendingList'),'Radar must support saved events with unknown registration dates');
assert.ok(registrationRadar.includes('pendingExpanded'),'Radar must allow viewing beyond the initial 8 saved races');
assert.ok(registrationRadar.includes('pendingMore.addEventListener'),'Show-more control must be interactive');
assert.ok(registrationRadar.includes('candidates.slice(0,8)'),'Radar should keep the initial saved race list concise');
assert.ok(events.includes('.raIntelList,.raIntelPendingList'),'Saved race cards must share the responsive radar grid');

assert.ok(registrationRadar.includes('window.RACEATLAS_EVENTS'),'Pending event follows must use the shared catalogue');
assert.ok(registrationRadar.includes('Inschrijfdatum nog niet bevestigd'),'Radar must not imply unknown opening is confirmed');

assert.ok(!registrationRadar.includes('E-mailmeldingen worden voorbereid'),'Radar must not claim email service is unavailable');
assert.ok(registrationRadar.includes('new Intl.DateTimeFormat'),'Radar should display officially supplied local opening times');
const liveCatalog=fs.readFileSync(base+'raceatlas/index.html','utf8');
assert.ok(liveCatalog.includes('"registrationDate":"2026-11-19"'),'Maastricht registration date missing from catalog');
assert.ok(liveCatalog.includes('Algemene inschrijving opent donderdag 19 november 2026 om 14:00'),'Maastricht registration opening time missing');
console.log('Structured events validated: '+richResultEvents+' rich results, '+ordinaryEventPages+' ordinary pages');
console.log('SEO PASS: canonical brand identity, robots, sitemap and '+detailFiles.length+' race pages');
