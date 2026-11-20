'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'docs/raceatlas/index.html'),'utf8');
const src=fs.readFileSync(path.join(root,'scripts/build-trizentro-seo-hubs.cjs'),'utf8');
const a=html.indexOf('const EVENTS=')+'const EVENTS='.length,b=html.indexOf('];',a)+1;
const events=JSON.parse(html.slice(a,b));
test('filter combines Fietsen and Wielrennen without breaking existing links',()=>{
 assert.match(html,/<option value="Fietsen">Fietsen en wielrennen<\/option>/);
 assert.match(html,/sport==='Fietsen'\?\(e\.sport==='Fietsen'\|\|e\.sport==='Wielrennen'\)/);
 assert.match(html,/value==='Wielrennen'\?'Fietsen':value/);
 assert.match(html,/some\(o=>o.value===normalized\)/);
 assert.ok(events.some(e=>e.sport==='Fietsen'));
 assert.ok(events.some(e=>e.sport==='Wielrennen'));
});
test('SEO calendars include both cycling sport values and the West-Friesland region',()=>{
 assert.match(src,/\['Wielrennen','Fietsen'\]\.includes\(e\.sport\)/);
 assert.match(src,/e\.region==='Waterland & West-Friesland'/);
 assert.match(src,/c\.sport==='Wielrennen'\?'Fietsen':c\.sport/);
 cp.execFileSync(process.execPath,[path.join(root,'scripts/build-trizentro-seo-hubs.cjs')],{cwd:root,encoding:'utf8'});
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'docs/ontdek/manifest.json'),'utf8'));
 for(const slug of ['wielertochten-2027','gravel-evenementen-2027']){
  assert.ok(manifest.some(x=>x.slug===slug),'Missing '+slug);
  const html=fs.readFileSync(path.join(root,'docs/ontdek',slug,'index.html'),'utf8');
  assert.match(html,/ra_sport=Fietsen/);
  assert.doesNotMatch(html,/ra_sport=Wielrennen/);
 }
 const nh=fs.readFileSync(path.join(root,'docs/ontdek/hardloopwedstrijden-noord-holland-2027/index.html'),'utf8');
 assert.match(nh,/ra_region=Noord-Holland/);
});
test('site generator preserves valid deep links and main event route',()=>{
 cp.execFileSync(process.execPath,[path.join(root,'scripts/build-trizentro-event-pages.cjs')],{cwd:root,encoding:'utf8',env:{...process.env,TRIZENTRO_DOMAIN_CONFIRMED:'true'}});
 cp.execFileSync(process.execPath,[path.join(root,'scripts/build-trizentro-platform-shell.cjs')],{cwd:root,encoding:'utf8'});
 const live=fs.readFileSync(path.join(root,'docs/events/index.html'),'utf8');
 assert.match(live,/Fietsen en wielrennen/);
 assert.match(live,/id="region"/);
 assert.match(fs.readFileSync(path.join(root,'docs/sitemap.xml'),'utf8'),/\/ontdek\/gravel-evenementen-2027\//);
});
