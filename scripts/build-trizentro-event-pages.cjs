#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../docs'),dir=path.join(root,'raceatlas');
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const i=html.indexOf('const EVENTS=');if(i<0)throw Error('EVENTS missing');
const st=i+'const EVENTS='.length,en=html.indexOf(';\n',st);if(en<0)throw Error('EVENTS end missing');
const list=JSON.parse(html.slice(st,en));
const vm=require('node:vm');
const catalogue={window:{RACEATLAS_EVENTS:list}};
for(const match of html.matchAll(/<script src="((?:official-sources|organizer-first)[\w-]*\.js)(?:\?[^\"]*)?" defer>/g)){
 const script=match[1];
 vm.runInNewContext(fs.readFileSync(path.join(dir,script),'utf8'),catalogue,{filename:script});
}
const feed=JSON.parse(fs.readFileSync(path.join(dir,'auto-events.json'),'utf8'));
const updates=new Map((feed.updates||[]).map(e=>[e.id,e]));
for(const e of list){const u=updates.get(e.id);if(u&&u.date&&u.officialEventUrl&&u.source){e.date=u.date;e.dateEvidence='official';e.officialEventUrl=u.officialEventUrl;e.source=u.source}}
const ids=new Set(list.map(e=>e.id));
const eventSpecificOfficial=url=>{
 try{
  const u=new URL(url);
  if(u.protocol!=='https:'||u.username||u.password)return false;
  if(u.hostname==='www.ironman.com'&&/^\/races\/?$/.test(u.pathname))return false;
  if(/championship-calendar/.test(u.pathname))return false;
  return true;
 }catch{return false}
};
for(const e of feed.events||[]){
 if(!ids.has(e.id)&&e.reviewedByTriZentro===true&&e.name&&e.date&&eventSpecificOfficial(e.officialEventUrl)){
  list.push(e);ids.add(e.id);
 }
}
for(const e of list)if(!eventSpecificOfficial(e.officialEventUrl))
 throw Error('Race lacks a specific official event or registration link: '+e.id);
const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,75)||'wedstrijd';
const filename=e=>slug(e.name)+'-'+e.id+'.html';
const valid=v=>{try{const u=new URL(v);return u.protocol==='https:'?u.toString():null}catch{return null}};
const date=e=>e.date&&/^\d{4}-\d{2}-\d{2}$/.test(e.date)?new Date(e.date+'T12:00:00').toLocaleDateString('nl-NL',{day:'numeric',month:'long',year:'numeric'}):e.expectedMonth?new Date(Number(e.expectedYear)||2027,Number(e.expectedMonth)-1,1).toLocaleDateString('nl-NL',{month:'long',year:'numeric'})+' (verwacht, niet bevestigd)':'Datum nog onbekend';
const customSettings=JSON.parse(fs.readFileSync(path.join(__dirname,'../.github/trizentro-domain.json'),'utf8'));
const customActive=customSettings.enabled===true&&customSettings.verifiedByOwner===true&&process.env.TRIZENTRO_DOMAIN_CONFIRMED==='true';
const base=(customActive?'https://trizentro.com':'https://samknook.github.io/sporttech-deals').replace(/\/+$/,'');
const output=path.join(dir,'wedstrijden');
// Remove previously generated pages: rejected events must not survive at old URLs.
fs.rmSync(output,{recursive:true,force:true});fs.mkdirSync(output,{recursive:true});
const style=':root{font-family:Inter,system-ui,sans-serif;color:#102432;background:#f5f8fa}*{box-sizing:border-box}body{margin:0}a{color:inherit}header{background:#071925;color:#fff}header .inner{max-width:1080px;margin:auto;display:flex;justify-content:space-between;align-items:center;padding:14px 20px;gap:12px}nav{display:flex;gap:16px}header a{font-size:13px;text-decoration:none;font-weight:800}header img{width:52px;height:39px}main{max-width:1000px;margin:auto;padding:25px 20px 80px}.back{font-size:13px;color:#486778;text-decoration:none}h1{font-size:clamp(28px,5vw,49px);line-height:1.12;letter-spacing:-.045em;margin:13px 0}.sub{color:#577184}.hero{background:#071925;color:#fff;border-radius:16px;overflow:hidden;margin:24px 0}.hero img{display:block;width:100%;height:245px;object-fit:cover}.hero div{padding:20px}.hero strong{font-size:21px}.hero p{font-size:12px;color:#cddfe4}.facts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.fact{background:#fff;border:1px solid #dbe5ea;border-radius:12px;padding:15px;display:flex;flex-direction:column;gap:7px}.fact span{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#63818b;font-weight:800}.fact strong{font-size:14px;line-height:1.4;overflow-wrap:anywhere}.actions{display:flex;flex-wrap:wrap;gap:8px;margin:20px 0}.actions>*{padding:14px 18px;border-radius:10px;background:white;color:#153f34;border:1px solid #d6e2dc;min-height:49px;font-size:14px;font-weight:850;display:inline-flex;align-items:center;justify-content:center;text-decoration:none;cursor:pointer}.actions .primary{background:#c7ff37;border-color:#c7ff37;color:#0b2619}.actions .tz-event-radar-link{background:#edf8e2;border-color:#b9dca6;color:#153f34}.actions .tz-event-radar-link:hover{background:#dff3cb;border-color:#a5cc8f}.note{padding:16px;background:#fff;border:1px solid #dbe5ea;border-radius:12px;color:#5b7280;font-size:13px;line-height:1.65}.source{font-size:13px}.source a{color:#116146;font-weight:800}.foot{padding-top:20px;border-top:1px solid #dce6e9;margin-top:30px;color:#667e88;font-size:12px}@media(max-width:700px){.facts{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.fact{padding:11px}.fact strong{font-size:12px}.hero img{height:160px}.actions{display:grid;grid-template-columns:1fr 1fr}.actions .primary{grid-column:1/-1}nav{gap:9px}main{padding:22px 15px 80px}}';
const routeExamples={
 'ra-9':{
  url:'https://www.amstel.nl/toerversie?lang=nl',
  label:'Parcoursinformatie bij de organisator',
  startLocation:'Shimano Experience Center, De Leeuwhof 2, Valkenburg',
 },
 'ra-265':{
  url:'https://www.challenge-roth.com/en/course-info.html',
  label:'Parcourskaarten bij de organisator',
  gpxUrl:'https://www.challenge-roth.com/files/downloads/Streckeninfo/DATEV%20Challenge%20Roth%20Bike%20Course.zip',
  gpxLabel:'Fietsroute (GPX in zipbestand)',
  conditions:'Het fietsparcours telt twee ronden en voert over de Solarer Berg.',
 },
 'ra-11':{
  url:'https://www.ironman.com/sites/default/files/2025-01/ironman_703_westfriesland_bike.pdf',
  label:'Fietsparcours 2025 (pdf)',
  elevationNote:'50 m hoogteverschil op de fietskaart van januari 2025.',
  conditions:'De kaart van 2025 toont open stukken langs het IJsselmeer. Houd daar rekening met wind. Controleer het parcours voor de komende editie bij IRONMAN.',
 },
};
const egmondRoute={
 url:'https://www.egmondhalvemarathon.nl/halve-marathon',
 label:'Parcours bij de organisator',
 mapImage:'https://do.occdn.net/p/75/f/20251229-parcourskaart-egmond-totaal-hr-v3-juiste-2.png',
 profileUrl:'https://www.nnegmondhalvemarathon.nl/uploads/hoogteprofiel-halve-hr-app.pdf',
 conditions:'De halve marathon voert over strand, duinen en verharde wegen. Wind en getij kunnen vooral het strandgedeelte beïnvloeden.',
};
const climateSource='https://cdn.knmi.nl/knmi/map/page/klimatologie/klimaatatlas/tabel/stationsdata/maand-en-seizoen-jaarsommen-en-gemiddelden_9120.pdf';
// Average daily maximum by month, KNMI station normals 1991–2020.
const climateStations={
 'De Bilt':[6.1,7,10.5,14.8,18.3,20.9,23.1,22.9,19.5,14.8,9.9,6.7],
 Berkhout:[5.9,6.5,9.5,13.7,17.3,19.7,22,21.9,18.8,14.4,9.7,6.7],
 'De Kooy':[6,6.2,8.7,12.4,15.8,18.5,20.8,21.1,18.3,14.3,10,7],
};
const months=['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];
const decimal=new Intl.NumberFormat('nl-NL',{maximumFractionDigits:1});
function courseAndWeather(event,official){
 const egmond=event.place==='Egmond aan Zee'&&/egmond halve marathon/i.test(event.name)&&/21[,.]1/.test(event.distance||'');
 const route=routeExamples[event.id]||(egmond?egmondRoute:null);
 const routeUrl=valid(event.routeUrl)||route?.url;
 const profileUrl=valid(event.elevationProfileUrl)||route?.profileUrl;
 const gpxUrl=valid(event.gpxUrl)||route?.gpxUrl;
 const startLocation=event.startLocation||route?.startLocation;
 const location=[startLocation||event.place,event.country].filter(Boolean).join(', ');
 const locationUrl=event.place||startLocation?'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(location):null;
 const link=(url,label)=>url?'<a href="'+safe(url)+'" target="_blank" rel="noopener noreferrer">'+safe(label)+' ↗</a>':'';
 const hasElevation=Number.isFinite(event.elevationGainM)&&event.elevationGainM>=0;
 const month=event.dateEvidence==='official'?Number(event.date?.slice(5,7)):Number(event.expectedMonth);
 const station=egmond?'De Kooy':event.id==='ra-11'?'Berkhout':'De Bilt';
 const climate=event.country==='Nederland'&&months[month-1]?
  '<p><strong>'+decimal.format(climateStations[station][month-1])+' °C</strong> gemiddeld dagmaximum in '+months[month-1]+' bij KNMI-station '+station+'.</p><p>Klimaatgemiddelde 1991–2020. '+link(climateSource,'KNMI-bron')+'</p>':
  '<p>Bekijk kort voor de wedstrijd het lokale weerbericht voor temperatuur, wind en neerslag.</p>';
 const weatherUrl=event.place?'https://www.google.com/search?q='+encodeURIComponent('weersverwachting '+[event.place,event.country].filter(Boolean).join(' ')):null;
 return '<div class="event-prep"><section class="prep-card"><h2>Parcours en hoogte</h2>'+
  (route?.mapImage?'<a href="'+safe(route.mapImage)+'" target="_blank" rel="noopener noreferrer"><img class="course-map" src="'+safe(route.mapImage)+'" alt="Parcourskaart Egmond Halve Marathon van de organisator" loading="lazy" onerror="this.remove()"></a>':'')+
  (routeUrl||gpxUrl?'':'<p>Er is nog geen parcourskaart toegevoegd.</p>')+
  (hasElevation?'<p><strong>'+decimal.format(event.elevationGainM)+' m totale stijging</strong></p>':route?.elevationNote?'<p>'+safe(route.elevationNote)+'</p>':'')+
  '<div class="prep-links">'+link(routeUrl,valid(event.routeUrl)?'Bekijk parcourskaart':route?.label||'Bekijk parcourskaart')+link(profileUrl,'Hoogteprofiel')+link(gpxUrl,valid(event.gpxUrl)?'GPX-route':route?.gpxLabel||'GPX-route')+
  link(locationUrl,startLocation?'Startlocatie op de kaart':'Plaats op de kaart')+(!routeUrl&&!gpxUrl?link(official,'Parcoursinfo bij organisator'):'')+'</div></section>'+
  '<section class="prep-card"><h2>Weer en omstandigheden</h2>'+climate+
  (route?.conditions?'<p>'+safe(route.conditions)+'</p>':'')+
  '<div class="prep-links">'+link(weatherUrl,'Lokaal weerbericht')+'</div></section></div>';
}
let total=0;
for(const e of list){
 if(!/^ra-\d{1,8}$/.test(e.id)||!e.name)continue;
 const file=filename(e),url='https://trizentro.com/events/wedstrijden/'+file;
 const desc=[e.name,e.place,e.country,e.sport,e.distance,date(e)].filter(Boolean).join(' · ').slice(0,190);
 const official=valid(e.officialEventUrl),link=official;
 const confirmed=e.dateEvidence==='official';
 const status=confirmed?'Officieel bevestigde datum':'Datum nog niet officieel bevestigd';
 const fields=[['Wedstrijddatum',date(e)],['Locatie',[e.place,e.country].filter(Boolean).join(', ')],['Afstand',e.distance||'Onbekend'],['Sport',e.sport||'Sportevenement'],['Inschrijfstatus',e.registrationStatusNote||'Controleer actuele status bij organisator'],['Prijs',typeof e.priceEur==='number'?'€ '+e.priceEur.toFixed(2).replace('.',','):e.priceNote||'Niet bevestigd']];
 const facts=fields.map(x=>'<div class="fact"><span>'+safe(x[0])+'</span><strong>'+safe(x[1])+'</strong></div>').join('');
 const hasLicensedImage=e.major&&e.imageRights==='licensed'&&valid(e.imageUrl);
 const image=hasLicensedImage?'<figure class="event-photo"><img src="'+safe(e.imageUrl)+'" alt="Locatiefoto bij '+safe(e.name)+'; geen opname van de wedstrijd" loading="lazy" onerror="this.parentElement.remove()"><figcaption>Foto: '+safe(e.imageCredit||'Wikimedia Commons')+' · <a target="_blank" rel="noopener noreferrer" href="'+safe(e.imageSourceUrl||'https://commons.wikimedia.org/')+'">Bron en licentie ↗</a></figcaption></figure>':
  e.major&&e.imageRights==='generated'?'<img src="../images/featured/'+e.id+'.webp" alt="AI-sfeerbeeld voor '+safe(e.name)+'; geen officiële foto" onerror="this.remove()">':'';
 const sport=[e.sport,e.discipline].filter(Boolean).filter((value,index,items)=>items.findIndex(item=>String(item).toLowerCase()===String(value).toLowerCase())===index).join(' · ')||'Sportevenement';
 const sportKey=/triat|duat|multisport/i.test(sport)?'multi':/fiets|wiel|gravel|mtb/i.test(sport)?'bike':/hardlop|trail|run|marathon/i.test(sport)?'run':'other';
 const illustration='<div class="event-illustration event-illustration--'+sportKey+'"><span>'+safe(sport)+'</span><strong>'+safe(e.distance||'Afstand nog onbekend')+'</strong><span class="event-place">'+safe(e.place||'Plaats nog onbekend')+'</span></div>';
 const claimParams=new URLSearchParams({onderwerp:'Claim je evenement',event:e.name,eventId:e.id});
 if(official&&official!=='https://www.ironman.com/races')claimParams.set('bron',official);
 const claimUrl='/organisatoren/?'+claimParams.toString()+'#contact';
 const directoryOnly=link==='https://www.ironman.com/races';
 const cta=link?'<a class="primary" href="'+safe(link)+'" target="_blank" rel="noopener noreferrer" data-ra-event="'+safe(e.id)+'" data-ra-outbound="organizer">'+(directoryOnly?'Zoek wedstrijd op IRONMAN ↗':'Officiële website ↗')+'</a>':'';
 // Report registration clicks separately only when a direct, verified-looking
 // HTTPS registration URL is explicitly present in the event catalogue.
 const registrationLink=valid(e.registrationUrl);
 const registrationCta=registrationLink&&registrationLink!==link?
  '<a class="primary" href="'+safe(registrationLink)+'" target="_blank" rel="noopener noreferrer" data-ra-event="'+safe(e.id)+'" data-ra-outbound="registration">Naar inschrijving ↗</a>':'';
 // Google requires startDate for a valid Event rich result. Unconfirmed race dates
 // remain discoverable as ordinary pages, without misleading Event markup.
 const json=confirmed&&/^\d{4}-\d{2}-\d{2}$/.test(e.date||'')?{
  '@context':'https://schema.org','@type':'SportsEvent',
  name:e.name,url,description:desc,startDate:e.date,
  eventStatus:'https://schema.org/EventScheduled'
 }:null;
 if(json&&e.place){
  const address={'@type':'PostalAddress',addressLocality:e.place};
  if(e.region)address.addressRegion=e.region;
  if(e.country)address.addressCountry=e.country;
  json.location={'@type':'Place',name:e.place,address};
 }
 if(json&&official)json.sameAs=official;
 if(json&&e.organizerName&&official)json.organizer={'@type':'Organization',name:e.organizerName,url:official};
 if(json&&e.endDate&&/^\d{4}-\d{2}-\d{2}$/.test(e.endDate)&&e.endDate>=e.date)json.endDate=e.endDate;
 const structuredData=json?'<script type="application/ld+json">'+JSON.stringify(json).replace(/</g,'\\u003c')+'</script>':'';
 const document=['<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#071925">',
 '<title>'+safe(e.name)+' | TriZentro</title><meta name="description" content="'+safe(desc)+'">',
 '<link rel="canonical" href="'+safe(url)+'"><meta property="og:site_name" content="TriZentro"><meta property="og:title" content="'+safe(e.name)+' | TriZentro"><meta property="og:description" content="'+safe(desc)+'"><meta property="og:url" content="'+safe(url)+'">',
 structuredData+'<style>'+style+'</style><link rel="stylesheet" href="../event-details.css"><link rel="stylesheet" href="../../shared-ui.css?v=20261113-unified"></head>',
 '<body><header class="tz-site-header"><nav class="tz-site-nav" aria-label="Hoofdnavigatie"><a class="tz-site-brand" href="/events/" aria-label="TriZentro"><img class="tz-logo-image" src="../../trizentro-mark.svg" alt="TriZentro"></a><div class="tz-site-links"><a href="/events/">Events</a><a href="/seizoen/">Mijn seizoen</a><a href="/performance/">Performance</a><a href="/account/">Mijn account</a><a href="/organisatoren/">Voor organisatoren</a></div></nav></header>',
 '<main><a class="back" href="/events/">← Alle evenementen</a><h1>'+safe(e.name)+'</h1><p class="sub">'+safe([e.place,e.country,e.distance].filter(Boolean).join(' · '))+'</p>',
 '<section class="hero">'+image+(e.major?'':illustration)+'<div class="event-date"><strong>'+safe(date(e))+'</strong><p>'+safe(status)+'</p></div></section>',
 '<section class="facts" aria-label="Wedstrijdinformatie">'+facts+'</section>',
 '<div class="actions">'+cta+registrationCta+'<a class="tz-event-radar-link" href="/events/?ra_alert='+encodeURIComponent(e.id)+'">🔔 Ontvang inschrijfmelding</a><button id="saveRace" type="button" aria-pressed="false">☆ Bewaar in mijn seizoen</button><a href="/events/?event='+encodeURIComponent(e.id)+'">Open in wedstrijdkalender</a><a href="/performance/">Bereid je voor ↗</a></div>',
 courseAndWeather(e,official),
 '<section class="prep-card event-claim" aria-labelledby="eventClaimHeading"><h2 id="eventClaimHeading">Organiseer je dit evenement?</h2><p>Vraag beheer aan om wedstrijddetails, inschrijfinformatie of het parcours door te geven. TriZentro controleert je aanvraag.</p><a href="'+safe(claimUrl)+'">Claim je evenement ↗</a></section>',
 '<p class="note">TriZentro verzamelt beschikbare wedstrijdinformatie. Datums, prijzen en inschrijfstatussen kunnen veranderen. Controleer de actuele informatie altijd bij de organisator.</p>',
 official?'<p class="source">Bron: <a href="'+safe(official)+'" target="_blank" rel="noopener noreferrer">Organisator ↗</a></p>':'',
 '<div class="foot">TriZentro · Find. Prepare. Perform.</div></main>',
 '<script>window.TriZentroEventSaveId='+JSON.stringify(e.id)+'</script>',
 '<script src="../account-config.js"></script><script src="../event-save.js?v=20261117-cloudseason" defer></script>',
 '<script src="../../shared-ui.js?v=20261113-unified" defer></script><script src="../tracking.js?v=20261112-domain1" defer></script></body></html>'].join('\n');
 fs.writeFileSync(path.join(output,file),document);total++;
}
const sitemapPath=path.join(root,'sitemap.xml');
let sitemap=fs.readFileSync(sitemapPath,'utf8');
const links=list.filter(e=>/^ra-\d{1,8}$/.test(e.id)&&e.name).map(e=>'  <url><loc>'+safe(base+'/raceatlas/wedstrijden/'+filename(e))+'</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>').join('\n');
sitemap=sitemap.replace('</urlset>',links+'\n</urlset>');
fs.writeFileSync(sitemapPath,sitemap);
console.log('Generated '+total+' crawlable TriZentro race pages');
