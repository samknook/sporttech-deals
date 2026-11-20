'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
test('winter running page is built from verified dated races and shares its canonical URL',()=>{
 const text=cp.execFileSync(process.execPath,[path.join(root,'scripts/build-trizentro-seo-hubs.cjs')],{cwd:root,encoding:'utf8'});
 assert.match(text,/winterlopen-2026/);
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'docs/ontdek/manifest.json'),'utf8'));
 const winter=manifest.find(x=>x.slug==='winterlopen-2026');
 assert.ok(winter&&winter.count>=3,'winter running events must be substantial');
 const html=fs.readFileSync(path.join(root,'docs/ontdek/winterlopen-2026/index.html'),'utf8');
 assert.match(html,/Kerstmannenrun Schoorl/);
 assert.match(html,/2026/);
 assert.match(html,/rel="canonical" href="https:\/\/trizentro\.com\/ontdek\/winterlopen-2026\/"/);
 assert.match(html,/https:\/\/wa\.me\/\?text=/);
 assert.match(html,/rel="noopener noreferrer"/);
 for(const page of manifest){
  const body=fs.readFileSync(path.join(root,'docs/ontdek',page.slug,'index.html'),'utf8');
  for(const match of body.matchAll(/href="\/ontdek\/([a-z0-9-]+)\/"/g)){
   assert.ok(manifest.some(x=>x.slug===match[1]),'broken related hub link '+match[1]);
  }
 }
});
test('winter calendar is included on main events page and public sitemap',()=>{
 cp.execFileSync(process.execPath,[path.join(root,'scripts/build-trizentro-event-pages.cjs')],{cwd:root,encoding:'utf8',env:{...process.env,TRIZENTRO_DOMAIN_CONFIRMED:'true'}});
 cp.execFileSync(process.execPath,[path.join(root,'scripts/build-trizentro-platform-shell.cjs')],{cwd:root,encoding:'utf8'});
 const sitemap=fs.readFileSync(path.join(root,'docs/sitemap.xml'),'utf8');
 const events=fs.readFileSync(path.join(root,'docs/events/index.html'),'utf8');
 assert.match(sitemap,/https:\/\/trizentro\.com\/ontdek\/winterlopen-2026\//);
 assert.match(events,/href="\/ontdek\/winterlopen-2026\/"/);
 assert.match(events,/Ontdek wedstrijden per sport en regio/);
});
