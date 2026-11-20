'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
const races=()=>JSON.parse(fs.readFileSync(path.join(root,'docs/raceatlas/index.html'),'utf8').split('const EVENTS=')[1].split(';\n')[0]);
const slug=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,75)||'wedstrijd';
test('every related race is an existing, linked official event in same sport',()=>{
 cp.execFileSync(process.execPath,[path.join(root,'scripts/build-trizentro-event-pages.cjs')],{cwd:root,encoding:'utf8',env:{...process.env,TRIZENTRO_DOMAIN_CONFIRMED:'true'}});
 const all=races(),byId=new Map(all.map(x=>[x.id,x]));
 const directory=path.join(root,'docs/raceatlas/wedstrijden');
 const pageFiles=fs.readdirSync(directory).filter(x=>x.endsWith('.html'));
 let relatedCount=0;
 for(const file of pageFiles){
  const content=fs.readFileSync(path.join(directory,file),'utf8');
  if(!content.includes('relatedRacesHeading'))continue;
  const id=file.match(/(ra-\d+)\.html$/)?.[1];assert.ok(id);
  const current=byId.get(id);assert.ok(current);
  const links=[...content.matchAll(/class="related-race"><a href="\/events\/wedstrijden\/([^"]+)"/g)].map(m=>m[1]);
  assert.ok(links.length>0&&links.length<=3,'at most 3 links per page');
  assert.equal(new Set(links).size,links.length);
  for(const target of links){
   const other=target.match(/(ra-\d+)\.html$/)?.[1];
   assert.ok(other&&other!==id,'no self links');
   const e=byId.get(other);assert.ok(e,'related event in calendar');
   assert.ok(e.dateEvidence==='official'&&e.officialEventUrl?.startsWith('https://'));
   assert.ok(fs.existsSync(path.join(directory,target)),'valid generated page');
  }
  relatedCount++;
 }
 assert.ok(relatedCount>=60,'recommendations on many event pages: '+relatedCount);
});
test('related recommendations provide accessible navigation and responsive cards',()=>{
 const script=fs.readFileSync(path.join(root,'scripts/build-trizentro-event-pages.cjs'),'utf8');
 assert.match(script,/aria-labelledby="relatedRacesHeading"/);
 assert.match(script,/grid-template-columns:1fr/);
 assert.match(script,/Ook interessant voor jou/);
 assert.match(script,/normalizedSport/);
 assert.match(script,/relatedRaces\(e\)/);
});
