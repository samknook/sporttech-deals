#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../docs');
const source=fs.readFileSync(path.join(root,'raceatlas/index.html'),'utf8');
const start=source.indexOf('const EVENTS=')+'const EVENTS='.length;
const end=source.indexOf(';\n',start);
if(start<'const EVENTS='.length||end<start)throw Error('Canonical event list not found');
const all=JSON.parse(source.slice(start,end));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,75)||'wedstrijd';
const file=e=>slug(e.name)+'-'+e.id+'.html';
const configs=[
 {slug:'winterlopen-2026',year:2026,title:'Winterlopen, kerstlopen en crosswedstrijden 2026',description:'Ontdek kerstmannenruns, winterlopen en crosswedstrijden in november en december 2026, met actuele officiële wedstrijdlinks.',intro:'Nog een wedstrijd lopen in november of december? Bekijk winterlopen, kerstmannenruns en crossen waarvan de datum door de organisator is bevestigd.',sport:'Hardlopen'},
 {slug:'hardloopwedstrijden-2027',title:'Hardloopwedstrijden 2027 in Nederland',description:'Bekijk Nederlandse hardloopwedstrijden in 2027. Vergelijk officiële wedstrijddatums, locaties en afstanden en ga via TriZentro naar de organisator.',intro:'Van de eerste 5 kilometer tot de marathon: ontdek waar en wanneer je in 2027 kunt hardlopen. Elke genoemde wedstrijddatum is door de organisator bevestigd.',sport:'Hardlopen'},
 {slug:'hardloopwedstrijden-noord-holland-2027',title:'Hardloopwedstrijden Noord-Holland 2027',description:'Ontdek hardloopwedstrijden in Noord-Holland in 2027, met officiële links voor inschrijfinformatie en persoonlijke wedstrijdplanning.',intro:'Vind een loop in Noord-Holland, van de regio Amsterdam tot West-Friesland. Controleer altijd de inschrijfstatus op de officiële site.',sport:'Hardlopen',region:'noord-holland'},
 {slug:'hardloopwedstrijden-zuid-holland-2027',title:'Hardloopwedstrijden Zuid-Holland 2027',description:'Hardloopkalender 2027 voor Zuid-Holland met officiële links naar wedstrijden, afstanden en actuele inschrijvingen.',intro:'Plan je hardloopseizoen in Zuid-Holland. Hieronder staan wedstrijden met een bevestigde datum en een officiële organisatorlink.',sport:'Hardlopen',region:'zuid-holland'},
 {slug:'hardloopwedstrijden-noord-brabant-2027',title:'Hardloopwedstrijden Noord-Brabant 2027',description:'Zoek hardloopwedstrijden in Noord-Brabant voor 2027, met officiële evenementlinks en datums.',intro:'Kies je volgende wedstrijd in Noord-Brabant. We tonen alleen edities waarvan de datum bij een officiële bron staat.',sport:'Hardlopen',region:'noord-brabant'},
 {slug:'triatlons-2027',title:'Triatlons in Nederland 2027',description:'Bekijk de Nederlandse triatlonkalender 2027. Vind sprint-, olympische en middenafstandtriatlons via officiële wedstrijdlinks.',intro:'Een sprinttriatlon of een halve triatlon in 2027? Bekijk de geplande wedstrijden, vergelijk de afstanden en open de officiële organisatorinformatie.',sport:'Triatlon'},
 {slug:'gravel-evenementen-2027',title:'Gravel evenementen en graveltochten 2027',description:'Gravelkalender 2027 met Nederlandse gravelraces en graveltoertochten, officiële wedstrijddatums en informatie van organisatoren.',intro:'Gravelwedstrijden, toertochten en avonturen door Nederland: vind officiële 2027-edities en stel je gravelkalender samen.',sport:'Wielrennen',gravel:true},
 {slug:'wielertochten-2027',title:'Wielertochten en fietsevenementen 2027',description:'Vind officiële wielertochten en fietsevenementen in Nederland in 2027. Ontdek routes, afstanden en organisatoren.',intro:'Zoek een toertocht of fietsevenement voor 2027. De datum is officieel bevestigd; routes en inschrijvingen controleer je bij de organisatie.',sport:'Wielrennen'},
 {slug:'wielertochten-noord-holland-2027',title:'Wielertochten Noord-Holland 2027',description:'Wielerevenementen en fietstochten in Noord-Holland in 2027, met officiële organisatielinks en wedstrijddatums.',intro:'Ontdek de fietskalender van Noord-Holland. Vergelijk lokale tochten en ga door naar de officiële website voor de inschrijving.',sport:'Wielrennen',region:'noord-holland'}
];
const validOfficial=e=>{try{const u=new URL(e.officialEventUrl);return u.protocol==='https:'&&!u.username&&!u.password}catch{return false}};
const eligible=all.filter(e=>/^ra-\d{1,8}$/.test(e.id||'')&&e.dateEvidence==='official'&&/^202[67]-\d{2}-\d{2}$/.test(e.date||'')&&validOfficial(e));
const matchesFor=(e,c)=>e.date?.startsWith(String(c.year||2027)+'-')&&(!c.year||e.date>='2026-11-20')&&(c.sport==='Wielrennen'?['Wielrennen','Fietsen'].includes(e.sport):e.sport===c.sport)&&(!c.region||(c.region==='noord-holland'&&e.region==='Waterland & West-Friesland')||String(e.region||'').toLowerCase().includes(c.region))&&(!c.gravel||/gravel/i.test((e.discipline||'')+' '+(e.name||'')));
const availableConfigs=configs.filter(c=>eligible.filter(e=>matchesFor(e,c)).length>=3);
const dir=path.join(root,'ontdek');
fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
const pages=[];
for(const c of availableConfigs){
 const matches=eligible.filter(e=>matchesFor(e,c)).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,32);
 if(matches.length<3)continue;
 const canonical='https://trizentro.com/ontdek/'+c.slug+'/';
 const calendarFilters=new URLSearchParams({ra_sport:c.sport==='Wielrennen'?'Fietsen':c.sport,ra_year:String(c.year||2027),ra_onlyVerified:'1'});
 if(c.region)calendarFilters.set('ra_region',c.region.split('-').map(part=>part.charAt(0).toUpperCase()+part.slice(1)).join('-'));
 if(c.gravel)calendarFilters.set('ra_distanceCategory','gravel');
 const calendarUrl='/events/?'+calendarFilters.toString();

 const itemlist={'@context':'https://schema.org','@type':'ItemList',name:c.title,itemListElement:matches.map((e,i)=>({'@type':'ListItem',position:i+1,name:e.name,url:'https://trizentro.com/events/wedstrijden/'+file(e)}))};
 const cards=matches.map(e=>{
  const date=new Date(e.date+'T12:00:00Z').toLocaleDateString('nl-NL',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
  const href='/events/wedstrijden/'+file(e);
  return '<li class="race"><a class="race-title" href="'+esc(href)+'">'+esc(e.name)+'</a><p>'+esc(date)+' · '+esc(e.place||'Nederland')+' · '+esc(e.distance||e.discipline||e.sport)+'</p><a class="source" href="'+esc(e.officialEventUrl)+'" target="_blank" rel="noopener noreferrer">Officiële organisator</a></li>';
 }).join('\n');
 const links=availableConfigs.filter(x=>x.slug!==c.slug).map(x=>'<a href="/ontdek/'+esc(x.slug)+'/">'+esc(x.title)+'</a>').join(' · ');
 const document='<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
 '<title>'+esc(c.title)+' | TriZentro</title><meta name="description" content="'+esc(c.description)+'">'+
 '<link rel="canonical" href="'+esc(canonical)+'"><meta name="robots" content="index,follow"><meta property="og:type" content="website"><meta property="og:title" content="'+esc(c.title)+' | TriZentro"><meta property="og:description" content="'+esc(c.description)+'"><meta property="og:url" content="'+esc(canonical)+'"><meta property="og:image" content="https://trizentro.com/social/trizentro-live-instagram.png">'+
 '<script type="application/ld+json">'+JSON.stringify(itemlist).replace(/</g,'\\u003c')+'</script>'+
 '<style>:root{font-family:Inter,system-ui,-apple-system,sans-serif;color:#142d24;background:#f5f8f5}*{box-sizing:border-box}body{margin:0}a{color:#145d3b}header{background:#08281e;color:white;padding:20px max(20px,calc((100vw - 1100px)/2))}header a{color:white;text-decoration:none;font-weight:750;margin-right:20px}main{max-width:1100px;padding:32px 20px 80px;margin:auto}.eyebrow{font-size:13px;color:#39734c;font-weight:800;letter-spacing:.08em;text-transform:uppercase}h1{font-size:clamp(30px,5vw,54px);letter-spacing:-.04em;margin:12px 0}h2{font-size:23px;margin-top:34px}p{line-height:1.65}.lead{max-width:790px;color:#566e5e;font-size:18px}.races{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,310px),1fr));gap:15px;list-style:none;padding:0}.race{padding:21px;background:white;border:1px solid #dce7dd;border-radius:14px}.race-title{font-weight:800;font-size:19px;text-decoration:none}.race p{font-size:14px;color:#4e6555}.source{font-size:13px;font-weight:700}.other{line-height:2.3}.note{font-size:13px;color:#576f60;margin-top:28px}</style></head>'+
 '<body><header><nav aria-label="TriZentro navigatie"><a href="/events/">TRIZENTRO.</a><a href="/events/">Events</a><a href="/seizoen/">Mijn seizoen</a><a href="/performance/">Performance</a><a href="/organisatoren/">Voor organisatoren</a></nav></header>'+
 '<main><p class="eyebrow">Wedstrijdkalender · '+esc(c.year||2027)+'</p><h1>'+esc(c.title)+'</h1><p class="lead">'+esc(c.intro)+'</p><p><a href="'+esc(calendarUrl)+'">Zoek verder met deze filters in de volledige kalender</a> · <a href="https://wa.me/?text='+encodeURIComponent('Bekijk deze wedstrijdkalender op TriZentro: '+canonical)+'" target="_blank" rel="noopener noreferrer">Deel via WhatsApp</a></p>'+
 '<h2>Wedstrijden met bevestigde datum ('+matches.length+')</h2><ul class="races">'+cards+'</ul>'+
 '<p class="note">TriZentro is onafhankelijk. Een officiële datum is geen garantie dat inschrijving open is. Controleer prijs, starttijd, afstand en beschikbaarheid altijd bij de organisatie. Deze pagina toont wedstrijden die in de TriZentro-kalender staan.</p>'+
 '<h2>Ontdek meer wedstrijdkalenders</h2><p class="other">'+links+'</p><p><a href="'+esc(calendarUrl)+'">Alle passende wedstrijden in de kalender bekijken</a></p></main><script src="/raceatlas/tracking.js" defer></script></body></html>';
 const output=path.join(dir,c.slug);fs.mkdirSync(output,{recursive:true});
 fs.writeFileSync(path.join(output,'index.html'),document);
 pages.push({slug:c.slug,title:c.title,count:matches.length});
}
fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(pages,null,2)+'\n');
if(pages.length<4)throw Error('Too few substantial SEO categories: '+pages.length);
console.log('Generated '+pages.length+' search landing pages: '+pages.map(x=>x.slug+' ('+x.count+')').join(', '));
