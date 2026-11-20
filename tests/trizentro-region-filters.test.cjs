'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'docs/raceatlas/index.html'),'utf8');
const i18n=fs.readFileSync(path.join(root,'docs/raceatlas/i18n.js'),'utf8');
const a=html.indexOf('const EVENTS=')+'const EVENTS='.length,b=html.indexOf('];',a)+1;
const events=JSON.parse(html.slice(a,b));
test('region selector is wired to filtering, URL persistence, reset and removable chips',()=>{
 assert.match(html,/<label for="region">Regio<\/label><select id="region"/);
 assert.match(html,/region=\$\('region'\)\.value/);
 assert.match(html,/!region\|\|e\.region===region/);
 assert.match(html,/region==='Noord-Holland'&&e\.region==='Waterland & West-Friesland'/);
 assert.match(html,/\['q','sport','country','region','year'/);
 assert.match(html,/\['country','Land'\],\['region','Regio'\]/);
 assert.match(html,/\$\('region'\)\.append\(o\)/);
 assert.match(html,/function restoreSearchFromUrl/);
 assert.match(html,/function searchUrl/);
 assert.match(i18n,/'Regio':'Region'/);
 assert.match(i18n,/'Alle regio’s':'All regions'/);
});
test('real regions in catalogue, including West-Friesland, can be found',()=>{
 assert.ok(events.some(e=>e.region==='Noord-Holland'));
 assert.ok(events.some(e=>e.region==='Waterland & West-Friesland'));
 assert.ok(events.some(e=>e.region==='Zuid-Holland'));
 assert.ok(events.some(e=>e.region==='Limburg'));
});
test('regional SEO pages send visitors to actual prefiltered calendar and sitemap',()=>{
 cp.execFileSync(process.execPath,[path.join(root,'scripts/build-trizentro-seo-hubs.cjs')],{cwd:root,encoding:'utf8'});
 const hubs=JSON.parse(fs.readFileSync(path.join(root,'docs/ontdek/manifest.json'),'utf8'));
 for(const hub of hubs){
  const body=fs.readFileSync(path.join(root,'docs/ontdek',hub.slug,'index.html'),'utf8');
  const match=body.match(/href="(\/events\/\?ra_sport=[^"]+)"/);
  assert.ok(match,'missing prefiltered link for '+hub.slug);
  const link=new URL(match[1].replaceAll('&amp;','&'),'https://trizentro.com');
  assert.equal(link.searchParams.get('ra_year'),hub.slug==='winterlopen-2026'?'2026':'2027');
  assert.equal(link.searchParams.get('ra_onlyVerified'),'1');
  if(hub.slug.includes('noord-holland'))assert.equal(link.searchParams.get('ra_region'),'Noord-Holland');
  if(hub.slug.includes('zuid-holland'))assert.equal(link.searchParams.get('ra_region'),'Zuid-Holland');
  if(hub.slug==='gravel-evenementen-2027')assert.equal(link.searchParams.get('ra_distanceCategory'),'gravel');
 }
});
test('public page generation preserves relevant SEO links',()=>{
 cp.execFileSync(process.execPath,[path.join(root,'scripts/build-trizentro-event-pages.cjs')],{cwd:root,encoding:'utf8',env:{...process.env,TRIZENTRO_DOMAIN_CONFIRMED:'true'}});
 cp.execFileSync(process.execPath,[path.join(root,'scripts/build-trizentro-platform-shell.cjs')],{cwd:root,encoding:'utf8'});
 const landing=fs.readFileSync(path.join(root,'docs/events/index.html'),'utf8');
 assert.match(landing,/id="region"/);
 const hub=fs.readFileSync(path.join(root,'docs/ontdek/hardloopwedstrijden-noord-holland-2027/index.html'),'utf8');
 assert.match(hub,/ra_region=Noord-Holland/);
 assert.match(hub,/ra_sport=Hardlopen/);
});
