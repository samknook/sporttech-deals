'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
test('SEO landing page generator succeeds using actual TriZentro public races',()=>{
 const output=cp.execFileSync(process.execPath,[path.join(root,'scripts/build-trizentro-seo-hubs.cjs')],{cwd:root,encoding:'utf8'});
 assert.match(output,/Generated [4-9] search landing pages/);
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'docs/ontdek/manifest.json'),'utf8'));
 assert.ok(manifest.length>=4);
 for(const hub of manifest){
  assert.ok(hub.count>=3,hub.slug+' has thin content');
  const html=fs.readFileSync(path.join(root,'docs/ontdek',hub.slug,'index.html'),'utf8');
  assert.match(html,/rel="canonical" href="https:\/\/trizentro\.com\/ontdek\//);
  assert.match(html,/application\/ld\+json/);
  assert.match(html,/https:\/\/trizentro\.com\/social/);
  assert.match(html,/Officiële organisator/);
  assert.match(html,/events\/wedstrijden\//);
  assert.doesNotMatch(html,/samknook\.github\.io/);
 }
});
test('Event list and sitemap integration include actual generated pages',()=>{
 cp.execFileSync(process.execPath,[path.join(root,'scripts/build-trizentro-event-pages.cjs')],{cwd:root,encoding:'utf8',env:{...process.env,TRIZENTRO_DOMAIN_CONFIRMED:'true'}});
 cp.execFileSync(process.execPath,[path.join(root,'scripts/build-trizentro-platform-shell.cjs')],{cwd:root,encoding:'utf8'});
 const sitemap=fs.readFileSync(path.join(root,'docs/sitemap.xml'),'utf8');
 const events=fs.readFileSync(path.join(root,'docs/events/index.html'),'utf8');
 for(const hub of JSON.parse(fs.readFileSync(path.join(root,'docs/ontdek/manifest.json'),'utf8'))){
  assert.ok(sitemap.includes('https://trizentro.com/ontdek/'+hub.slug+'/'),hub.slug);
  assert.ok(events.includes('href="/ontdek/'+hub.slug+'/"'),hub.slug);
 }
});
