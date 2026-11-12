'use strict';
// RaceAtlas pre-launch static smoke test. No external dependencies or credentials.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(process.cwd(),'docs/raceatlas');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const index=read('index.html'),organizers=read('organisatoren.html'),quality=read('gegevenskwaliteit.html'),about=read('over.html');
const pages=[['index.html',index],['organisatoren.html',organizers],['gegevenskwaliteit.html',quality],['over.html',about]];
const errors=[];
const check=(ok,msg)=>{if(!ok)errors.push(msg)};
const start=index.indexOf('const EVENTS=');
check(start>=0,'Missing event dataset');
let events=[];
if(start>=0){
 const p=start+'const EVENTS='.length,e=index.indexOf(';\n',p);
 check(e>p,'Event dataset must terminate');
 if(e>p){try{events=JSON.parse(index.slice(p,e))}catch(error){errors.push('Invalid events JSON: '+error.message)}}
}
check(events.length>=400,'Expect at least 400 real event entries');
const ids=new Set(events.map(e=>e.id));
check(ids.size===events.length,'Duplicate event IDs');
check(events.every(e=>/^ra-\d+$/.test(e.id)&&e.name&&e.place&&e.sport),'Missing essential event data');
check(!events.some(e=>e.dateEvidence==='official'&&!/^20\d{2}-\d{2}-\d{2}$/.test(e.date||'')),'Officially dated event missing valid ISO date');
const nav=index.match(/<div class="navright">([\s\S]+?)<\/div><\/nav>/)?.[1]||'';
check(nav.indexOf('navExplore')>=0&&nav.indexOf('navSaved')>nav.indexOf('navExplore')&&nav.indexOf('organizerNav')>nav.indexOf('navSaved'),'Main navigation must put visitor actions before organizer link');
check(index.includes('id="cards"')&&index.includes('id="more"'),'Discover result cards missing');
check(index.indexOf('id="cards"')<index.indexOf('id="more"')&&index.indexOf('id="more"')<index.indexOf('class="raSeasonPreview"'),'Event results must be above season preview');
check(read('intelligence.js').includes('resultsMore.after(panel)'),'Registration radar must appear below results');
check(!index.includes('id="raQualitySummary"')&&!index.includes('<strong>Transparantie:</strong>'),'Hide internal audit blocks from public homepage');
check(read('account-config.js').includes('enabled:false'),'Account feature must remain disabled until ready');
for(const [filename,html] of pages){
 const assetMatches=[...html.matchAll(/<(?:script|link)\b[^>]*?\b(?:src|href)="([^"]+)"/g)].map(m=>m[1]);
 for(const asset of assetMatches){
  if(!/^(?:[\w.-]+\.(?:js|css|svg))(?:\?[^#]*)?$/.test(asset))continue;
  const file=asset.split('?')[0];
  check(fs.existsSync(path.join(root,file)),filename+' references missing asset '+file);
 }
 check(html.includes('i18n.js?v='),filename+' missing language script');
 check(html.includes('brand.css'),filename+' missing shared brand CSS');
}
check(organizers.includes('id="eventForm"')&&organizers.includes('id="contactForm"'),'Organizer forms missing');
check(organizers.includes('formsubmit.co/ajax/'),'Organizer contact delivery endpoint missing');
const i18n=read('i18n.js');
check(i18n.includes("nav.insertBefore(group,organizer)"),'NL/EN switch must precede organizer destination');
check(i18n.includes('raceatlas-language-v1'),'Language selection must persist');
const scripts=['i18n.js','intelligence.js','details.js','alerts.js','organizer-sync.js'];
for(const file of scripts){try{new Function(read(file))}catch(err){errors.push(file+' syntax error: '+err.message)}}
const body=index.match(/<script>([\s\S]*?)<\/script>/)?.[1];
check(Boolean(body),'Homepage inline JS missing');
if(body){try{new Function(body)}catch(err){errors.push('Homepage inline JS syntax error: '+err.message)}}
if(errors.length){for(const e of errors)console.error('FAIL: '+e);process.exitCode=1}
else console.log('PASS: RaceAtlas static launch smoke test — '+events.length+' unique events, '+pages.length+' pages, essential workflows, assets and JS syntax.');
