#!/usr/bin/env node
/* RaceAtlas official-source discovery + safe structured-date refresh.
 * Trust boundary: only explicitly allowlisted organizers; only JSON-LD Event
 * with a real future YYYY-MM-DD and named Place; never guess ticket availability.
 * Public auto-events are generated as static JSON. No Supabase secret or write.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const net=require('node:net');
const SITE='docs/raceatlas';
const INPUT='scripts/raceatlas-official-source-seeds.json';
const OUTPUT=SITE+'/auto-events.json';
const STATE='scripts/raceatlas-official-source-state.json';
const MAX_PAGES=85;
const LINKS_PER_SOURCE=3;
const TIMEOUT_MS=9500;
const MAX_BYTES=350000;
const MIN_NAME=5;
const acceptLink=/(event|wedstrijd|race|run|loop|marathon|triathlon|duathlon|mtb|gravel|toer|cross|kalender|agenda|202[6-9])/i;
const clean=s=>String(s||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const normalize=s=>clean(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
function safeUrl(value,host){
 try{
  const u=new URL(value);
  if(u.protocol!=='https:'||u.username||u.password||u.port&&u.port!=='443')return null;
  if(net.isIP(u.hostname)||!u.hostname.includes('.')||/\.(?:local|internal|test|localhost)$/i.test(u.hostname))return null;
  if(host&&u.hostname.toLowerCase()!==host.toLowerCase())return null;
  if(/\.(?:pdf|jpg|png|gif|css|js|xml|zip|webp|svg)$/i.test(u.pathname))return null;
  u.hash='';u.search='';
  return u.toString();
 }catch{return null}
}
const normalizedUrl=u=>{try{return new URL(u).toString().replace(/\/$/,'').toLowerCase()}catch{return ''}};
function readCatalog(html){
 const a=html.indexOf('const EVENTS=');
 if(a<0)throw Error('Cannot find catalog');
 const start=a+'const EVENTS='.length,end=html.indexOf(';\n',start);
 if(end<0)throw Error('Cannot find catalog end');
 return JSON.parse(html.slice(start,end));
}
function walkJsonLd(node,result=[]){
 if(Array.isArray(node)){for(const v of node)walkJsonLd(v,result);return result}
 if(!node||typeof node!=='object')return result;
 if(node['@graph'])walkJsonLd(node['@graph'],result);
 const kinds=[node['@type']].flat().filter(Boolean).map(String);
 if(kinds.some(k=>/^(?:Event|SportsEvent|Festival|Marathon)$/i.test(k)))result.push(node);
 return result;
}
function fingerprint(html){
 const visible=String(html).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ')
  .replace(/<[^>]*>/g,' ').replace(/&(?:nbsp|amp|quot|lt|gt);/gi,' ')
  .replace(/\s+/g,' ').trim().slice(0,150000);
 return crypto.createHash('sha256').update(visible).digest('hex');
}
function htmlEvents(html){
 const items=[];
 const scripts=html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
 for(const match of scripts){
  try{walkJsonLd(JSON.parse(match[1].replace(/^\s*<!--|-->\s*$/g,'')),items)}catch{}
 }
 return items;
}
function linkScore(url){
 let pathname;
 try{pathname=decodeURIComponent(new URL(url).pathname).toLowerCase()}catch{return -100}
 if(/(?:sponsor|uitslag|results?|recreanten|start-to-run|race-app|raceshirt|shirt|foto|gallery|shop|blog|nieuws|news|privacy|cookie|terugblik|topatleten|parcoursrecord|belangstelling|eindklassement|dagzege|debuut)/i.test(pathname))return -100;
 let score=0;
 if(/(?:^|\/)(?:event|events|evenementen|wedstrijden|kalender|agenda)(?:\/|$)/i.test(pathname))score+=8;
 if(/2027|2028/i.test(pathname))score+=5;
 if(/(?:inschrijf|registr|triathlon|duathlon|marathon|cross|toertocht|gravel|mtb|sportive|trail|run|loop|race)/i.test(pathname))score+=4;
 if(pathname.split('/').filter(Boolean).length>4)score-=2;
 return score;
}
function links(html,base,host){
 const result=[];
 for(const m of html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"'<>]+)["'][^>]*>/gi)){
  const v=m[1].replace(/&amp;/gi,'&');
  let u;
  try{u=safeUrl(new URL(v,base).toString(),host)}catch{continue}
  if(u&&acceptLink.test(new URL(u).pathname)&&linkScore(u)>0&&!result.includes(u))result.push(u);
 }
 return result.sort((a,b)=>linkScore(b)-linkScore(a));
}
function eventDate(raw,today){
 const day=String(raw||'').match(/^(20\d{2}-\d{2}-\d{2})(?:$|T)/)?.[1];
 if(!day||!Number.isFinite(Date.parse(day+'T12:00:00Z')))return null;
 if(new Date(day+'T12:00:00Z').toISOString().slice(0,10)!==day)return null;
 const ms=Date.parse(day+'T12:00:00Z'),now=Date.parse(today+'T12:00:00Z');
 if(ms<now-86400000||ms>now+730*86400000)return null;
 return day;
}
function raceLike(name){
 const n=normalize(name);
 if(/\b(cursus|training|clubrit|jaarvergadering|vergadering|workshop|reanimatie|nieuws|uitslagen|webinar|infoavond|informatiebijeenkomst|proefrijden|clinic|open dag|vrijwilligersavond|ledenavond|presentatie|feestavond)\b/i.test(n))return false;
 return /(?:marathon|halve|run|loop|trail|cross|triathlon|triatlon|duathlon|duatlon|gravel|mtb|mountainbike|toer(?:tocht)?|tocht|sportive|ironman|zwemloop|swimrun|strade bianche|ronde van|race|wedstrijd|ultra|cyclo|fondo|velo|gran fondo|sprint|tijdrit|5k|10k|kilometer|\bkm\b)/i.test(n);
}
function parseEvent(item,page,source,today){
 const name=clean(item.name);
 if(name.length<MIN_NAME||name.length>145||!raceLike(name))return null;
 const date=eventDate(item.startDate,today);
 if(!date)return null;
 const loc=[item.location].flat().find(v=>v&&typeof v==='object'&&v['@type']!=='VirtualLocation');
 const address=loc?.address;
 const place=clean((typeof address==='object'?address.addressLocality:null)||loc?.name||(typeof address==='string'?address:null));
 if(place.length<2||place.length>95)return null;
 const origin=new URL(page);
 const own=safeUrl(item.url||page,origin.hostname);
 if(!own)return null;
 const locationName=typeof loc?.name==='string'?clean(loc.name):'';
 const addressCountry=typeof address==='object'?clean(address.addressCountry?.name||address.addressCountry):'';
 const key=normalizedUrl(own)+'|'+normalize(name)+'|'+date.slice(0,4);
 const n=crypto.createHash('sha256').update(key).digest().readUInt32BE(0)%10000000;
 return {
  id:'ra-'+String(80000000+n),name,date,place,sport:source.sport,
  discipline:source.sport==='Fietsen'?'Toertocht':source.sport==='Triatlon'?'Triatlon':'Weg',
  distance:'Afstanden bij organisator',
  country:source.country||addressCountry||'Nederland',
  officialEventUrl:own,source:page,verifiedOn:today,dateEvidence:'official',
  registrationStatus:'check',status:'source',major:false,sourceType:'organizer',
  sourceMethod:'official_jsonld_event',locationName
 };
}
function sameRace(a,b){
 const n1=normalize(a.name),n2=normalize(b.name);
 if(n1!==n2)return false;
 if(String(a.date||'').slice(0,4)!==String(b.date||'').slice(0,4))return false;
 const city1=normalize(a.place),city2=normalize(b.place);
 return !city1||!city2||city1===city2||city1.includes(city2)||city2.includes(city1);
}
function sourceMatch(a,b){
 const url=normalizedUrl(a.officialEventUrl);
 if(!url||url.endsWith('://'))return false;
 const pathPart=new URL(url).pathname.replace(/\/$/,'');
 if(pathPart.length<4)return false; // root page never identifies one event
 return url===normalizedUrl(b.officialEventUrl)&&normalize(a.name)===normalize(b.name)
   &&String(a.date||'').slice(0,4)===b.date.slice(0,4);
}
function choose(observed,catalog,previous,today){
 const seenIds=new Set(catalog.map(e=>e.id));
 const oldEvents=(previous.events||[]).filter(e=>e&&/^ra-8\d{7}$/.test(e.id||'')&&e.date>=today.slice(0,4)+'-01-01');
 const auto=new Map(oldEvents.map(e=>[e.id,e]));
 const oldUpdates=(previous.updates||[]).filter(e=>e&&/^ra-\d+$/.test(e.id||''));
 const updates=new Map(oldUpdates.map(e=>[e.id,e]));
 const review=[],newEvents=[],changed=[];
 for(const race of observed){
  const already=catalog.find(e=>sameRace(e,race));
  if(already&&already.date===race.date)continue;
  const update=catalog.filter(e=>sourceMatch(e,race));
  if(update.length===1){
   const old=update[0];
   if(old.date!==race.date){
    const item={id:old.id,name:old.name,date:race.date,officialEventUrl:race.officialEventUrl,source:race.source,verifiedOn:today};
    if(updates.get(old.id)?.date!==race.date){updates.set(old.id,item);changed.push(item)}
   }
   continue;
  }
  if(update.length>1){review.push({name:race.name,date:race.date,reason:'ambiguous_catalog_match',url:race.officialEventUrl});continue}
  const urlMatches=catalog.filter(e=>String(e.date||'').slice(0,4)===race.date.slice(0,4)
   &&normalizedUrl(e.officialEventUrl)===normalizedUrl(race.officialEventUrl)
   &&new URL(race.officialEventUrl).pathname.replace(/\/$/,'').length>=4);
  if(urlMatches.length){
   review.push({name:race.name,date:race.date,reason:'organizer_url_matches_existing_different_name',url:race.officialEventUrl,
    matchingIds:urlMatches.map(e=>e.id)});
   continue;
  }
  if(already){review.push({name:race.name,date:race.date,reason:'existing_race_same_year_date_conflict',url:race.officialEventUrl});continue}
  const other=[...auto.values()].find(e=>sameRace(e,race));
  if(other){
   if(other.date===race.date){continue}
   if(normalizedUrl(other.officialEventUrl)===normalizedUrl(race.officialEventUrl)){
    auto.set(other.id,{...other,...race,id:other.id,verifiedOn:today});
    changed.push({id:other.id,name:race.name,date:race.date,officialEventUrl:race.officialEventUrl});
   }else review.push({name:race.name,date:race.date,reason:'auto_event_date_conflict',url:race.officialEventUrl});
   continue;
  }
  if(seenIds.has(race.id)||auto.has(race.id)&&!sameRace(auto.get(race.id),race)){
   review.push({name:race.name,date:race.date,reason:'generated_id_collision',url:race.officialEventUrl});continue;
  }
  const oldAuto=auto.get(race.id);
  auto.set(race.id,{...oldAuto,...race,verifiedOn:today});
  if(!oldAuto)newEvents.push(race);
 }
 const events=[...auto.values()].filter(e=>e.date>=today).sort((a,b)=>a.date.localeCompare(b.date)||a.name.localeCompare(b.name)).slice(0,500);
 const keptUpdates=[...updates.values()].filter(e=>e.date>=today).slice(0,300);
 return {data:{version:1,generatedAt:today,events,updates:keptUpdates},review,newEvents,changed};
}
async function boundedFetch(url,fetchImpl){
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),TIMEOUT_MS);
 try{
  const response=await fetchImpl(url,{redirect:'manual',headers:{Accept:'text/html', 'User-Agent':'RaceAtlasOfficialDiscovery/1.0 (+https://samknook.github.io/sporttech-deals/raceatlas/)'},signal:controller.signal});
  if(!response.ok||response.status>=300)return null;
  const type=response.headers.get('content-type')||'';
  if(!type.includes('html'))return null;
  const len=Number(response.headers.get('content-length')||0);
  if(len>MAX_BYTES)return null;
  const reader=response.body?.getReader();
  if(!reader)return (await response.text()).slice(0,MAX_BYTES);
  let length=0;const chunks=[];
  try{
   while(true){
    const {done,value}=await reader.read();
    if(done)break;
    const size=Math.min(value.length,MAX_BYTES-length);
    if(size>0)chunks.push(value.subarray(0,size));
    length+=size;
    if(length>=MAX_BYTES)break;
   }
  }finally{await reader.cancel().catch(()=>{})}
  return Buffer.concat(chunks).toString('utf8');
 }catch{return null}finally{clearTimeout(timer)}
}
async function discover(config,catalog,previous,opts={}){
 const fetchImpl=opts.fetchImpl||fetch;
 const today=opts.today||new Date().toISOString().slice(0,10);
 const sources=config.sources.filter(s=>safeUrl(s.url)&&['Hardlopen','Fietsen','Triatlon'].includes(s.sport)).slice(0,65);
 let pageCount=0;
 const seenPages=new Set(),events=[],sourceResults=[],contentChanges=[];
 const fingerprints={...(opts.sourceState?.sources||{})};
 for(const source of sources){
  const host=new URL(source.url).hostname;
  const queue=[source.url],site={url:source.url,checked:0,parsed:0,failed:0};
  while(queue.length&&site.checked<LINKS_PER_SOURCE+1&&pageCount<MAX_PAGES){
   const next=queue.shift(),url=safeUrl(next,host);
   if(!url||seenPages.has(url))continue;
   seenPages.add(url);pageCount++;site.checked++;
   const html=await boundedFetch(url,fetchImpl);
   if(!html){site.failed++;continue}
   const hash=fingerprint(html);
   const previousHash=fingerprints[url];
   if(previousHash&&previousHash!==hash)contentChanges.push({url,reason:'official_page_content_changed',source:source.url});
   fingerprints[url]=hash;
   const found=htmlEvents(html);
   for(const item of found){const race=parseEvent(item,url,source,today);if(race){events.push(race);site.parsed++}}
   if(source.discover!==false && site.checked===1)queue.push(...links(html,url,host).slice(0,LINKS_PER_SOURCE*3));
  }
  sourceResults.push(site);
 }
 const unique=[...new Map(events.map(e=>[e.id,e])).values()];
 const result=choose(unique,catalog,previous,today);
 return {...result,sourceResults,pagesChecked:pageCount,structuredEvents:unique.length,contentChanges,sourceState:{version:1,sources:fingerprints}};
}
function monitorExisting(catalog,today){
 const skip=/^(?:www\.)?(?:fietssport\.nl|hardloopkalendernederland\.nl|triathlonplan\.nl|worldsmarathons\.com)$/i;
 const rows=catalog.filter(e=>e.dateEvidence==='official'&&e.sourceType==='organizer'&&e.date>=today&&safeUrl(e.officialEventUrl)
   &&!skip.test(new URL(e.officialEventUrl).hostname));
 const uniq=[...new Map(rows.map(e=>[normalizedUrl(e.officialEventUrl),e])).values()];
 // Check imminent races every day; rotate the rest so established sources are revisited regularly.
 const soon=uniq.filter(e=>e.date<=new Date(Date.parse(today+'T12:00:00Z')+45*86400000).toISOString().slice(0,10)).slice(0,6);
 const rest=uniq.filter(e=>!soon.includes(e)).sort((a,b)=>normalizedUrl(a.officialEventUrl).localeCompare(normalizedUrl(b.officialEventUrl)));
 const day=Math.floor(Date.parse(today+'T12:00:00Z')/86400000);
 const rotated=rest.length?Array.from({length:Math.min(12,rest.length)},(_,i)=>rest[(day*12+i)%rest.length]):[];
 return [...new Set([...soon,...rotated])].map(e=>({url:e.officialEventUrl,sport:e.sport,country:e.country,discover:false}));
}
async function verifiedOrganizerSources(fetchImpl=fetch){
 const base='https://lpzndnxloykcthbsqcet.supabase.co/rest/v1/raceatlas_organizer_research_queue';
 const apiKey='sb_publishable_AE_Qr8VLmWb2020QCOEAKQ_Nl5mZ5Sw';
 try{
  const r=await fetchImpl(base+'?select=event_id,event_name,sport,country_code,official_event_url,organizer_link_status&organizer_link_status=eq.verified&limit=500',{
   headers:{apikey:apiKey,Accept:'application/json'},signal:AbortSignal.timeout(9000)
  });
  if(!r.ok)return [];
  const rows=await r.json();
  if(!Array.isArray(rows))return [];
  return rows.filter(e=>e.organizer_link_status==='verified'&&safeUrl(e.official_event_url)
    &&['Hardlopen','Fietsen','Triatlon'].includes(e.sport))
   .map(e=>({url:e.official_event_url,sport:e.sport,
    country:e.country_code==='BE'?'België':e.country_code==='DE'?'Duitsland':'Nederland',
    discover:false}));
 }catch{return []}
}
async function main(){
 const config=JSON.parse(fs.readFileSync(INPUT,'utf8'));
 const catalog=readCatalog(fs.readFileSync(SITE+'/index.html','utf8'));
 const today=new Date().toISOString().slice(0,10);
 config.sources.push(...await verifiedOrganizerSources());
 config.sources.push(...monitorExisting(catalog,today));
 let previous={version:1,events:[],updates:[]};
 try{previous=JSON.parse(fs.readFileSync(OUTPUT,'utf8'))}catch{}
 let state={version:1,sources:{}};
 try{state=JSON.parse(fs.readFileSync(STATE,'utf8'))}catch{}
 const result=await discover(config,catalog,previous,{sourceState:state});
 // No overwrite if no organizer pages were fetched successfully.
 const success=result.sourceResults.some(s=>s.checked>s.failed);
 fs.mkdirSync('out',{recursive:true});
 const report={generatedAt:new Date().toISOString(),pagesChecked:result.pagesChecked,
   structuredEvents:result.structuredEvents,newEvents:result.newEvents,changed:result.changed,
   needsReview:result.review,contentChanges:result.contentChanges,sourceResults:result.sourceResults,autoPublished:success};
 fs.writeFileSync('out/raceatlas-discovery-report.json',JSON.stringify(report,null,2)+'\n');
 fs.writeFileSync('out/raceatlas-discovery-report.md',
   '# RaceAtlas official-source discovery\n\nOfficial organizers only. Published changes require structured event date and place. No prices or registration availability inferred.\n\n'+
   '- Pages checked: '+result.pagesChecked+'\n- Structured events: '+result.structuredEvents+'\n- Newly qualified events: '+result.newEvents.length+
   '\n- Existing date revisions: '+result.changed.length+'\n- First-party source page changes: '+result.contentChanges.length+'\n- Ambiguities needing review: '+result.review.length+
   '\n- Published: '+success+'\n\n'+result.newEvents.map(e=>'- NEW '+e.name+' ('+e.date+') — '+e.officialEventUrl).join('\n')+
   '\n'+result.changed.map(e=>'- UPDATED '+e.id+' — '+e.date).join('\n')+'\n'+result.contentChanges.map(c=>'- PAGE CHANGED '+c.url).join('\n')+'\n');
 if(!success){console.log('No first-party source responded; public JSON preserved');return}
 if(JSON.stringify(state.sources||{})!==JSON.stringify(result.sourceState.sources))fs.writeFileSync(STATE,JSON.stringify(result.sourceState,null,2)+'\n');
 const pruned=(previous.events||[]).length!==result.data.events.length||(previous.updates||[]).length!==result.data.updates.length;
 const materiallyChanged=result.newEvents.length||result.changed.length||pruned;
 if(materiallyChanged)fs.writeFileSync(OUTPUT,JSON.stringify(result.data,null,2)+'\n');
 console.log(JSON.stringify({pagesChecked:result.pagesChecked,structuredEvents:result.structuredEvents,newEvents:result.newEvents.length,updated:result.changed.length,review:result.review.length,pageChanges:result.contentChanges.length,feedChanged:Boolean(materiallyChanged)}));
}
if(require.main===module)main().catch(e=>{console.error(e.message);process.exitCode=1});
module.exports={safeUrl,htmlEvents,links,linkScore,eventDate,parseEvent,raceLike,choose,discover,readCatalog,monitorExisting,verifiedOrganizerSources,fingerprint};
