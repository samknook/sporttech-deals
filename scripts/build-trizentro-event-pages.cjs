#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../docs'),dir=path.join(root,'raceatlas');
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const i=html.indexOf('const EVENTS=');if(i<0)throw Error('EVENTS missing');
const st=i+'const EVENTS='.length,en=html.indexOf(';\n',st);if(en<0)throw Error('EVENTS end missing');
const list=JSON.parse(html.slice(st,en));
const feed=JSON.parse(fs.readFileSync(path.join(dir,'auto-events.json'),'utf8'));
const updates=new Map((feed.updates||[]).map(e=>[e.id,e]));
for(const e of list){const u=updates.get(e.id);if(u&&u.date&&u.officialEventUrl&&u.source){e.date=u.date;e.dateEvidence='official';e.officialEventUrl=u.officialEventUrl;e.source=u.source}}
const ids=new Set(list.map(e=>e.id));for(const e of feed.events||[]){if(!ids.has(e.id)&&e.name&&e.date&&e.officialEventUrl){list.push(e);ids.add(e.id)}}
const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,75)||'wedstrijd';
const filename=e=>slug(e.name)+'-'+e.id+'.html';
const valid=v=>{try{const u=new URL(v);return u.protocol==='https:'?u.toString():null}catch{return null}};
const date=e=>e.date&&/^\d{4}-\d{2}-\d{2}$/.test(e.date)?new Date(e.date+'T12:00:00').toLocaleDateString('nl-NL',{day:'numeric',month:'long',year:'numeric'}):e.expectedMonth?new Date(Number(e.expectedYear)||2027,Number(e.expectedMonth)-1,1).toLocaleDateString('nl-NL',{month:'long',year:'numeric'})+' (verwacht, niet bevestigd)':'Datum nog onbekend';
const base=(process.env.TRIZENTRO_CANONICAL_ORIGIN||'https://samknook.github.io/sporttech-deals').replace(/\/+$/,'');
const output=path.join(dir,'wedstrijden');fs.mkdirSync(output,{recursive:true});
const style=':root{font-family:Inter,system-ui,sans-serif;color:#102432;background:#f5f8fa}*{box-sizing:border-box}body{margin:0}a{color:inherit}header{background:#071925;color:#fff}header .inner{max-width:1080px;margin:auto;display:flex;justify-content:space-between;align-items:center;padding:14px 20px;gap:12px}nav{display:flex;gap:16px}header a{font-size:13px;text-decoration:none;font-weight:800}header img{width:52px;height:39px}main{max-width:1000px;margin:auto;padding:25px 20px 80px}.back{font-size:13px;color:#486778;text-decoration:none}h1{font-size:clamp(28px,5vw,49px);line-height:1.12;letter-spacing:-.045em;margin:13px 0}.sub{color:#577184}.hero{background:#071925;color:#fff;border-radius:16px;overflow:hidden;margin:24px 0}.hero img{display:block;width:100%;height:245px;object-fit:cover}.hero div{padding:20px}.hero strong{font-size:21px}.hero p{font-size:12px;color:#cddfe4}.facts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.fact{background:#fff;border:1px solid #dbe5ea;border-radius:12px;padding:15px;display:flex;flex-direction:column;gap:7px}.fact span{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#63818b;font-weight:800}.fact strong{font-size:14px;line-height:1.4;overflow-wrap:anywhere}.actions{display:flex;flex-wrap:wrap;gap:8px;margin:20px 0}.actions>*{padding:14px 18px;border-radius:10px;background:white;color:#153f34;border:1px solid #d6e2dc;min-height:49px;font-size:14px;font-weight:850;display:inline-flex;align-items:center;justify-content:center;text-decoration:none;cursor:pointer}.actions .primary{background:#c7ff37;border-color:#c7ff37;color:#0b2619}.note{padding:16px;background:#fff;border:1px solid #dbe5ea;border-radius:12px;color:#5b7280;font-size:13px;line-height:1.65}.source{font-size:13px}.source a{color:#116146;font-weight:800}.foot{padding-top:20px;border-top:1px solid #dce6e9;margin-top:30px;color:#667e88;font-size:12px}@media(max-width:700px){.facts{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.fact{padding:11px}.fact strong{font-size:12px}.hero img{height:160px}.actions{display:grid;grid-template-columns:1fr 1fr}.actions .primary{grid-column:1/-1}nav{gap:9px}main{padding:22px 15px 80px}}';
let total=0;
for(const e of list){
 if(!/^ra-\d{1,8}$/.test(e.id)||!e.name)continue;
 const file=filename(e),url=base+'/raceatlas/wedstrijden/'+file;
 const desc=[e.name,e.place,e.country,e.sport,e.distance,date(e)].filter(Boolean).join(' · ').slice(0,190);
 const official=valid(e.officialEventUrl||e.source),registration=valid(e.registrationUrl),link=registration||official;
 const confirmed=e.dateEvidence==='official';
 const status=confirmed?'Officieel bevestigde datum':'Datum nog niet officieel bevestigd';
 const fields=[['Wedstrijddatum',date(e)],['Locatie',[e.place,e.country].filter(Boolean).join(', ')],['Afstand',e.distance||'Onbekend'],['Sport',e.sport||'Sportevenement'],['Inschrijfstatus',e.registrationStatusNote||'Controleer actuele status bij organisator'],['Prijs',typeof e.priceEur==='number'?'€ '+e.priceEur.toFixed(2).replace('.',','):e.priceNote||'Niet bevestigd']];
 const facts=fields.map(x=>'<div class="fact"><span>'+safe(x[0])+'</span><strong>'+safe(x[1])+'</strong></div>').join('');
 const image=e.major&&/^ra-\d+$/.test(e.id)?'<img src="../images/featured/'+e.id+'.webp" alt="TriZentro sfeerbeeld '+safe(e.name)+'" onerror="this.remove()">':'';
 const cta=link?'<a class="primary" href="'+safe(link)+'" target="_blank" rel="noopener noreferrer" data-ra-event="'+safe(e.id)+'" data-ra-outbound="'+(registration?'registration':'organizer')+'">'+(registration?'Bekijk inschrijving':'Officiële website')+' ↗</a>':'';
 const json={'@context':'https://schema.org','@type':'SportsEvent',name:e.name,url,eventStatus:'https://schema.org/EventScheduled'};
 if(confirmed&&e.date)json.startDate=e.date;
 if(e.place)json.location={'@type':'Place',name:e.place};
 if(official)json.sameAs=official;
 const document=['<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#071925">',
 '<title>'+safe(e.name)+' | TriZentro</title><meta name="description" content="'+safe(desc)+'">',
 '<link rel="canonical" href="'+safe(url)+'"><meta property="og:site_name" content="TriZentro"><meta property="og:title" content="'+safe(e.name)+' | TriZentro"><meta property="og:description" content="'+safe(desc)+'"><meta property="og:url" content="'+safe(url)+'">',
 '<script type="application/ld+json">'+JSON.stringify(json).replace(/</g,'\\u003c')+'</script><style>'+style+'</style></head>',
 '<body><header><div class="inner"><a href="../" aria-label="TriZentro"><img src="../../trizentro-mark.svg" alt="TriZentro"></a><nav><a href="../">Events</a><a href="../#mijn-seizoen">Mijn seizoen</a><a href="../../performance.html">Performance</a></nav></div></header>',
 '<main><a class="back" href="../">← Alle evenementen</a><h1>'+safe(e.name)+'</h1><p class="sub">'+safe([e.place,e.country,e.distance].filter(Boolean).join(' · '))+'</p>',
 '<section class="hero">'+image+'<div><strong>'+safe(date(e))+'</strong><p>'+safe(status)+'</p></div></section>',
 '<section class="facts" aria-label="Wedstrijdinformatie">'+facts+'</section>',
 '<div class="actions">'+cta+'<button id="saveRace" type="button" aria-pressed="false">☆ Bewaar in mijn seizoen</button><a href="../?event='+encodeURIComponent(e.id)+'">Meer details</a></div>',
 '<p class="note">TriZentro verzamelt beschikbare wedstrijdinformatie. Datums, prijzen en inschrijfstatussen kunnen veranderen. Controleer de actuele informatie altijd bij de organisator.</p>',
 official?'<p class="source">Bron: <a href="'+safe(official)+'" target="_blank" rel="noopener noreferrer">Organisator ↗</a></p>':'',
 '<div class="foot">TriZentro · Find. Prepare. Perform.</div></main>',
 '<script>(function(){const k="raceatlas-saved-v2",id='+JSON.stringify(e.id)+',b=document.getElementById("saveRace");function read(){try{const v=JSON.parse(localStorage.getItem(k)||"[]");return Array.isArray(v)?v:[]}catch{return []}}function render(){const on=read().includes(id);b.textContent=on?"✓ Bewaard in mijn seizoen":"☆ Bewaar in mijn seizoen";b.setAttribute("aria-pressed",String(on))}b.addEventListener("click",()=>{const v=read(),n=v.includes(id)?v.filter(x=>x!==id):[...v,id];try{localStorage.setItem(k,JSON.stringify(n))}catch{}render()});render()})()</script>',
 '<script src="../tracking.js?v=20261112-domain1" defer></script></body></html>'].join('\n');
 fs.writeFileSync(path.join(output,file),document);total++;
}
const sitemapPath=path.join(root,'sitemap.xml');
let sitemap=fs.readFileSync(sitemapPath,'utf8');
const links=list.filter(e=>/^ra-\d{1,8}$/.test(e.id)&&e.name).map(e=>'  <url><loc>'+safe(base+'/raceatlas/wedstrijden/'+filename(e))+'</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>').join('\n');
sitemap=sitemap.replace('</urlset>',links+'\n</urlset>');
fs.writeFileSync(sitemapPath,sitemap);
console.log('Generated '+total+' crawlable TriZentro race pages');
