/* RaceAtlas bilingual interface. Data names and dates are kept as source records. */
(()=>{
'use strict';
const KEY='raceatlas-language-v1';
const strings={
'Ontdek':'Discover','Voor organisatoren':'For organizers','Mijn seizoen':'My season',
'Jouw wedstrijdkalender':'YOUR RACE CALENDAR','Vind jouw volgende':'Find your next',
'uitdaging.':'challenge.','Vind jouw volgende uitdaging.':'Find your next challenge.',
'Ontdek hardloop-, wieler- en triatlonevenementen in Nederland en daarbuiten. Van lokale klassiekers tot grote internationale races.':'Explore running, cycling and triathlon events across the Netherlands and beyond. From local favorites to iconic international races.',
'☆ Plan mijn wedstrijdseizoen':'☆ Build my race season',
'geselecteerde evenementen':'curated events','sportdisciplines':'sports','wedstrijdseizoen':'race season',
'Hardlopen':'Running','Fietsen':'Cycling','Triatlon':'Triathlon','Triatlons':'Triathlons','Duatlon':'Duathlon',
'Zoek een evenement':'Find an event','Zoek op wedstrijd, plaats of afstand':'Search by event, location or distance','Sport':'Sport',
'Alle sporten':'All sports','Maand':'Month','Alle maanden':'All months','Sorteren':'Sort by','Datum: eerstvolgende':'Date: soonest first','Naam: A-Z':'Name: A-Z','Afstand: dichtbij eerst':'Distance: nearest first',
'⚙ Meer filters':'⚙ More filters','Land, jaar, afstand en inschrijving':'Country, year, distance and registration',
'Land':'Country','Alle landen':'All countries','Jaar':'Year','Alle jaren':'All years',
'Afstand / racevorm':'Distance / event type','Alle afstanden':'All distances',
'5 km of korter':'5 km or shorter','Halve marathon':'Half marathon','Marathon / langer':'Marathon / longer',
'70.3 / middenafstand':'70.3 / middle distance','Hele triatlon':'Full-distance triathlon',
'Duatlon / run-bike-run':'Duathlon / run-bike-run','Inschrijfstatus':'Registration status','Alle inschrijfstatussen':'All registration statuses',
'Directe inschrijflink beschikbaar':'Direct registration link available','Startdatum/inschrijfperiode bekend':'Opening date / registration window known',
'Inschrijving opent later':'Registration opens later','Deadline binnen 30 dagen':'Deadline within 30 days',
'Uitverkocht / gesloten volgens bron':'Sold out / closed according to source','Startdatum onbekend':'Opening date unknown',
'Prijs bekend':'Price known','Prijs onduidelijk':'Price unclear','Wanneer?':'When?','Alle datums':'All dates',
'Komende 30 dagen':'Next 30 days','Komende 90 dagen':'Next 90 days','Komend weekend':'This weekend',
'Datumstatus':'Date confidence','Alle datumstatussen':'All date statuses',
'Officieel bevestigd':'Officially confirmed','Datum vermeld (controleer)':'Date listed (verify)',
'Verwachte maand':'Expected month','Datum onbekend':'Date unknown',
'Alle evenementen':'All events','★ Grote evenementen':'★ Major events','☆ Mijn opgeslagen':'☆ My saved races',
'Marathons':'Marathons','Evenementen':'Events','Deel selectie':'Share selection','Wis filters':'Clear filters',
'Alleen aankomende evenementen':'Upcoming events only','Alleen officieel bevestigde datums':'Officially confirmed dates only',
'▦ Kaarten':'▦ Cards','☷ Lijst':'☷ List',
'▣ Mijn wedstrijdseizoen':'▣ My race season','Bekijk mijn seizoen →':'View my season →',
'Plan je seizoen gratis':'Plan your season for free',
'Bewaar wedstrijden zonder account op dit apparaat. Exporteer bevestigde datums naar je agenda.':'Save races on this device without an account. Export confirmed race dates to your calendar.',
'✦ VOOR ORGANISATOREN':'✦ FOR ORGANIZERS','Organiseer jij een sportevenement?':'Organizing a sports event?',
'Voeg jouw evenement gratis toe, werk informatie bij of neem contact met ons op over RaceAtlas.':'List your event for free, update its details or get in touch with RaceAtlas.',
'Voor organisatoren ↗':'For organizers ↗',
'Mijn wedstrijdseizoen':'My race season','Jouw opgeslagen wedstrijden op dit apparaat':'Your saved races on this device',
'Agenda-export (.ics) ↓':'Export calendar (.ics) ↓','Inschrijfdatums (.ics) ↓':'Registration dates (.ics) ↓',
'Bewaar back-up ↓':'Download backup ↓','Importeer seizoen ↑':'Import season ↑',
'Je seizoen staat op dit apparaat. Met een back-upbestand kun je het zonder account op een ander apparaat overzetten. Bevestigde datums zijn apart naar je agenda te exporteren.':'Your season is stored on this device. A backup file lets you transfer it to another device without an account. Confirmed dates can be exported to your calendar.',
'Mijn seizoensdoel':'My season goal','Kies hoeveel wedstrijden je wilt plannen. Dit doel blijft op dit apparaat bewaard.':'Choose how many races you want to plan. This goal stays saved on this device.',
'Doel':'Goal','Bewaar evenementen om je doel te bereiken.':'Save events to reach your goal.',
'Mijn seizoen per maand':'My season by month','Bevestigde wedstrijddatums en voorlopige maanden staan apart aangegeven.':'Confirmed race dates and provisional months are shown separately.',
'Inschrijfmonitor':'Registration tracker','Actuele status blijft afhankelijk van de organisator. RaceAtlas toont alleen eerder geverifieerde gegevens en deadlines.':'Current availability is determined by organizers. RaceAtlas shows previously verified information and deadlines.',
'Seizoenscheck':'Season health check','Controleer wedstrijdspreiding en datumbetrouwbaarheid.':'Review your race spacing and date reliability.',
'Misschien ook interessant':'You may also like','Aanbevolen wedstrijden met bevestigde datums.':'Recommended races with confirmed dates.',
'Hoe betrouwbaar zijn onze wedstrijdgegevens?':'How reliable is our race data?',
'Bekijk welke datums nog bevestiging nodig hebben en help informatie actueel te houden.':'See which dates still need confirmation and help keep event details up to date.',
'Bekijk gegevenskwaliteit en meld een correctie →':'Review data quality and submit a correction →',
'Organiseer jij een wedstrijd?':'Organizing a race?','Gratis aanmelden, gegevens aanpassen of contact opnemen.':'List your event for free, update details or contact us.',
'Transparantie:':'Transparency:',
'⌕':'⌕','Mijn wedstrijdkalender':'My race calendar','Filters':'Filters',
'INSCHRIJFRADAR':'REGISTRATION RADAR','Mis geen belangrijke inschrijfdatum':'Never miss an important registration date',
'We tonen alleen bekende inschrijfdatums uit gepubliceerde brongegevens. Dit is geen live controle van vrije startbewijzen.':'We show known registration dates from published sources. This is not a live check of available places.',
'Gebaseerd op eerder gepubliceerde informatie van organisatoren. Een verstreken openingsdatum betekent niet dat er nog startbewijzen beschikbaar zijn.':'Based on previously published organizer information. A past opening date does not mean places are still available.',
'Alleen mijn opgeslagen wedstrijden':'Only my saved races','Wedstrijddetails':'Race details','Controleer bron ↗':'Check source ↗',
'INSCHRIJVEN':'REGISTER',
'Gegevenskwaliteit en correcties':'Data quality and corrections',
'← Wedstrijden':'← Events','OPEN GEGEVENSKWALITEIT':'OPEN DATA QUALITY',
'Help de wedstrijdkalender actueel te houden.':'Help keep the race calendar up to date.',
'RaceAtlas toont welke gegevens nog bevestiging of een nieuwe broncontrole nodig hebben. Een vermelde datum zonder officiële bevestiging is geen toezegging van de organisator. Een controledatum zegt niets over de actuele beschikbaarheid van startbewijzen.':'RaceAtlas shows which information still needs confirmation or a fresh source check. An unconfirmed date is not a promise by the organizer. A review date does not indicate live availability.',
'Kwaliteitsstatus':'Data quality','Evenementen in de database':'Events in the database','Officieel gemarkeerde datums':'Dates marked as official',
'Nog te bevestigen datums':'Dates awaiting confirmation','Alleen maand of datum onbekend':'Month only or unknown date',
'Directe organisatielinks':'Direct organizer links',
'We onderscheiden links die nog gevonden moeten worden, mogelijke organisatorsites en links met vastgelegde verificatie. Een kandidaat is niet automatisch gecontroleerd.':'We distinguish missing links, possible organizer websites and links with recorded verification. A candidate is not yet verified.',
'Organisatielinks laden…':'Loading organizer links…',
'Controleer eerst de wedstrijden die binnenkort plaatsvinden':'Review upcoming races first',
'De prioriteit is automatisch berekend met voorlopige wedstrijddatums. Datums en inschrijfmogelijkheden worden niet automatisch bevestigd. Open de bron en geef een correctie door als de organisator nieuwe informatie heeft gepubliceerd.':'Priority is calculated from provisional race dates. Race dates and registration availability are not automatically verified. Open the source and submit an update when an organizer publishes new information.',
'Zoek een wedstrijd voor correctie':'Find an event to correct','Naam of plaats':'Name or location',
'Controlebehoefte':'Review needed','Alle kwaliteitsstatussen':'All quality statuses',
'Datum niet bevestigd':'Date unconfirmed','Alleen verwachte maand':'Expected month only','Datum onbekend':'Date unknown',
'Broncontrole ouder dan 30 dagen':'Source check older than 30 days','Geen controledatum':'No review date',
'Recent gecontroleerd':'Recently checked','Prioriteit':'Priority','Alle prioriteiten':'All priorities',
'Mogelijk binnen 30 dagen':'Possibly within 30 days','Mogelijk binnen 31–90 dagen':'Possibly within 31–90 days',
'Datum ontbreekt':'Date missing','Officiële datum opnieuw controleren':'Recheck official date',
'Overige voorlopige datums':'Other provisional dates','Gegevens laden…':'Loading data…',
'Meer wedstrijden tonen':'Show more races','Bron bekijken ↗':'View source ↗','Correctie melden ↗':'Report correction ↗',
'Correcties worden via het bestaande organisatorenformulier doorgestuurd voor menselijke beoordeling. Er worden geen gegevens zonder controle gepubliceerd.':'Corrections are sent to the organizer form for human review. Changes are never published without verification.',
'Rechtstreeks contact opnemen':'Contact us directly',
'Voor organisatoren — RaceAtlas':'For organizers — RaceAtlas',
'← Terug naar evenementen':'← Back to events','RaceAtlas voor organisatoren':'RaceAtlas for organizers',
'Samen brengen we sporters aan de start.':'Bringing athletes to the start line.',
'Organiseer je een hardloopwedstrijd, fietstocht, duatlon of triatlon? RaceAtlas helpt sporters om wedstrijden te ontdekken, belangrijke datums te volgen en hun seizoen te plannen. Je evenement aanmelden is gratis. Heb je vragen of wil je samenwerken? Neem contact met ons op.':'Organizing a running, cycling, duathlon or triathlon event? RaceAtlas helps athletes discover races, follow important dates and plan their season. Listing your event is free. Have questions or want to collaborate? Get in touch.',
'Evenement aanmelden ↓':'List an event ↓','Contact opnemen ↓':'Contact us ↓',
'Wat RaceAtlas biedt':'What RaceAtlas offers','Vindbaar voor sporters':'Get discovered by athletes','Jouw wedstrijd op één centrale kalender, met sport, locatie en afstanden.':'Your event in one central calendar with sport, location and distances.',
'Actuele wedstrijdinformatie':'Up-to-date race information','Ruimte voor officiële links, inschrijfdatums en wijzigingen.':'Official links, registration dates and updates in one place.',
'Direct naar de organisator':'Direct to the organizer','Bezoekers kunnen doorklikken naar de officiële evenement- of inschrijfpagina.':'Visitors can go straight to the official event or registration page.',
'Contact':'Contact','Stel ons een vraag.':'Ask us a question.',
'Wil je meer weten over RaceAtlas, een samenwerking bespreken of gegevens laten corrigeren? Laat hieronder weten waarover je contact zoekt. Je kunt ook rechtstreeks mailen naar':'Want to learn more, discuss a partnership or correct event information? Get in touch below. You can also email',
'Naam / organisatie *':'Name / organization *','Zakelijk e-mailadres *':'Business email *','Onderwerp *':'Subject *',
'Kies een onderwerp':'Choose a topic','Algemene vraag':'General inquiry','Evenementgegevens aanpassen':'Update event details',
'Samenwerken':'Partnerships','Anders':'Other','Naam evenement / website (optioneel)':'Event name / website (optional)',
'Gegevens van je wijziging':'Your correction details','Vul alleen de onderdelen in die wijzigen. Lege velden worden niet geïnterpreteerd als een nieuwe datum of prijs. We publiceren wijzigingen pas na controle.':'Only enter fields that need changing. Empty fields do not imply a new date or price. Changes are reviewed before publication.',
'RaceAtlas evenement-ID (optioneel)':'RaceAtlas event ID (optional)','Wat wil je corrigeren? *':'What would you like to correct? *',
'Kies een onderwerp':'Choose a topic','Wedstrijddatum':'Race date','Inschrijfopening':'Registration opening',
'Inschrijfdeadline':'Registration deadline','Inschrijfstatus / uitverkocht':'Registration status / sold out',
'Inschrijfprijs':'Entry fee','Afstanden / onderdelen':'Distances / disciplines',
'Officiële website / inschrijflink':'Official website / registration link','Overige informatie':'Other details',
'Nieuwe datum (indien van toepassing)':'New date (if applicable)','Inschrijfstatus':'Registration status',
'Niet van toepassing / onbekend':'Not applicable / unknown','Nog niet geopend':'Not open yet',
'Inschrijven mogelijk volgens bron':'Registration available according to source','Verschilt per afstand':'Varies by distance',
'Uitverkocht':'Sold out','Gesloten':'Closed','Officiële bronlink voor deze wijziging *':'Official source link for this change *',
'Wat is gewijzigd? *':'What has changed? *','Jouw bericht *':'Your message *',
'Bericht versturen ↗':'Send message ↗','Kopieer bericht':'Copy message',
'Evenement aanmelden':'List an event','Jouw wedstrijd op de kalender.':'Your race in the calendar.',
'Geef de officiële evenementgegevens door. We controleren inzendingen voordat ze worden toegevoegd. Een vermelding is gratis.':'Send us official event information. Submissions are reviewed before being published. Listing is free.',
'Naam evenement':'Event name','E-mailadres contactpersoon':'Contact email',
'Vermeld de naam van de organisator':'Please enter the organizer name',
'Gegevens corrigeren':'Correct details','Voorlopige datum':'Provisional date',
'Bekijk organisator ↗':'Official website ↗','Bekijk kalenderbron ↗':'View source calendar ↗',
'Officiële website ↗':'Official website ↗','Inschrijfpagina ↗':'Registration page ↗',
'Details':'Details','🔔 Meldingen':'🔔 Alerts','✓ Bewaard':'✓ Saved','+ Bewaar':'+ Save',
'Bekijk wedstrijd':'View race','Controleer details altijd bij de organisator.':'Always verify details with the organizer.'
};
const placeholders={
'Bijv. Egmond, gravel, marathon…':'E.g. Egmond, gravel, marathon…',
'Zoek op wedstrijd of plaats':'Search by event or location',
'Bijv. Stadsloop, https://...':'E.g. City Run, https://...',
'Naam organisatie':'Organization name',
'naam@organisatie.nl':'name@organization.com',
'Waar kunnen we je mee helpen?':'How can we help?',
'Bijvoorbeeld: de inschrijving voor 21,1 km is gesloten; 10 km is nog beschikbaar.':'For example: registration for 21.1 km is closed; 10 km is still available.'
};
const translations=new Map(Object.entries(strings));
const attrTranslations=new Map(Object.entries(placeholders));
const monthNames=[['januari','January'],['februari','February'],['maart','March'],['april','April'],['mei','May'],['juni','June'],['juli','July'],['augustus','August'],['september','September'],['oktober','October'],['november','November'],['december','December']];
const partials=[
[/^(\d+) evenementen gevonden · (\d+) zichtbaar$/,'$1 events found · $2 shown'],
[/^(\d+) evenementen gevonden · (\d+) zichtbaar$/,'$1 events found · $2 shown'],
[/^(\d+) evenementen gevonden · (\d+) zichtbaar$/,'$1 events found · $2 shown'],
[/^(\d+) wedstrijden opgeslagen/,'$1 races saved'],
[/^(\d+) evenementen opgeslagen/,'$1 events saved'],
[/^(\d+) wedstrijden in de catalogus/,'$1 events in the catalog'],
[/^(\d+) wedstrijden in database/,'$1 events in the database'],
[/^(\d+) wedstrijden met officieel bevestigde datum/,'$1 races with officially confirmed dates'],
[/^(\d+) gecontroleerd · (\d+) kandidaten · (\d+) nog zonder organisatielink$/,'$1 verified · $2 candidates · $3 without an organizer link'],
[/^Toon (\d+) meer evenementen ↓$/,'Show $1 more events ↓'],
[/^Wedstrijd (.+)$/,'Race $1'],
[/^Opening was op (.+)$/,'Opened on $1'],
[/^Verwachte opening · (.+)$/,'Expected opening · $1'],
[/^Bron vastgelegd op (.+)$/,'Source recorded on $1'],
[/^Bron laatst vastgelegd: (.+)$/,'Source last recorded: $1'],
[/^Datum vermeld — check bij organisator$/,'Date listed — verify with organizer'],
[/^Datum controleren bij organisator$/,'Verify date with organizer'],
[/^✓ Bevestigd op organisatorsite$/,'✓ Confirmed by organizer'],
[/^Inschrijving gesloten volgens bron$/,'Registration closed according to source'],
[/^Uitverkocht volgens bron$/,'Sold out according to source']
];
let lang='nl';
const originals=new WeakMap();
const attrs=new WeakMap();
let observer=null,queued=false;
function translation(text){
 if(translations.has(text))return translations.get(text);
 let result=text;
 for(const [pattern,replacement] of partials)result=result.replace(pattern,replacement);
 for(const [nl,en] of monthNames)result=result.replace(new RegExp('\\b'+nl+'\\b','gi'),en);
 return result;
}
function skip(node){
 const parent=node.parentElement;
 return !parent||parent.closest('script,style,noscript,code,pre,svg,[data-no-translate],input,textarea');
}
function visitText(node){
 if(!node||node.nodeType!==3||skip(node))return;
 const current=node.nodeValue||'';
 const option=node.parentElement?.closest('option');
 if(option&&!option.hasAttribute('value')){
   // Preserve semantic form values when translating visible labels.
   const original=originals.get(node)?.nl||current;
   option.setAttribute('value',original.trim());
 }
 let saved=originals.get(node);
 if(!saved||current!==saved.nl&&current!==saved.en){saved={nl:current,en:null};originals.set(node,saved)}
 if(saved.en===null)saved.en=translation(saved.nl);
 const next=lang==='en'?saved.en:saved.nl;
 if(current!==next)node.nodeValue=next;
}
function visitAttributes(elem){
 if(!elem||elem.nodeType!==1)return;
 for(const attribute of ['placeholder','title','aria-label']){
  if(!elem.hasAttribute(attribute))continue;
  const current=elem.getAttribute(attribute);
  let all=attrs.get(elem);
  if(!all){all={};attrs.set(elem,all)}
  let saved=all[attribute];
  if(!saved||current!==saved.nl&&current!==saved.en){
    saved={nl:current,en:attrTranslations.get(current)||translation(current)};
    all[attribute]=saved;
  }
  const next=lang==='en'?saved.en:saved.nl;
  if(current!==next)elem.setAttribute(attribute,next);
 }
}
function walk(root){
 if(root.nodeType===3){visitText(root);return}
 if(root.nodeType!==1&&root.nodeType!==9)return;
 if(root.nodeType===1)visitAttributes(root);
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
 while(walker.nextNode()){
   const node=walker.currentNode;
   if(node.nodeType===3)visitText(node);
   else if(node.nodeType===1)visitAttributes(node);
 }
}
function preserveLinks(){
 for(const a of document.querySelectorAll('a[href]')){
  const raw=a.getAttribute('href');
  if(!raw||raw.startsWith('#')||raw.startsWith('mailto:')||raw.startsWith('tel:'))continue;
  try{
   const u=new URL(raw,location.href);
   if(u.origin!==location.origin||!u.pathname.includes('/raceatlas/'))continue;
   if(lang==='en')u.searchParams.set('lang','en');else u.searchParams.delete('lang');
   a.href=u.toString();
  }catch{}
 }
}
function buttons(){
 let nav=document.querySelector('.navright')||document.querySelector('header');
 if(!nav||document.getElementById('raLanguageSwitch'))return;
 const group=document.createElement('div');
 group.id='raLanguageSwitch';group.className='raLanguageSwitch';
 group.setAttribute('role','group');group.setAttribute('aria-label','Language / Taal');
 for(const code of ['nl','en']){
  const btn=document.createElement('button');
  btn.type='button';btn.textContent=code.toUpperCase();
  btn.dataset.language=code;
  btn.setAttribute('aria-label',code==='nl'?'Nederlands':'English');
  btn.addEventListener('click',()=>setLanguage(code));
  group.append(btn);
 }
 nav.append(group);
}
function updateButtons(){
 for(const btn of document.querySelectorAll('#raLanguageSwitch button')){
  const active=btn.dataset.language===lang;
  btn.setAttribute('aria-pressed',String(active));
  btn.classList.toggle('active',active);
 }
}
function setLanguage(next,updateUrl=true){
 if(next!=='en'&&next!=='nl')next='nl';
 lang=next;
 try{localStorage.setItem(KEY,next)}catch{}
 document.documentElement.lang=next;
 if(updateUrl){
  const u=new URL(location.href);
  if(next==='en')u.searchParams.set('lang','en');else u.searchParams.delete('lang');
  history.replaceState(history.state,'',u.pathname+u.search+u.hash);
 }
 if(observer)observer.disconnect();
 walk(document.body);
 preserveLinks();
 updateButtons();
 if(observer)observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','title','aria-label']});
 window.dispatchEvent(new CustomEvent('raceatlas:languagechange',{detail:{language:next}}));
}
function schedule(){
 if(queued)return;
 queued=true;
 queueMicrotask(()=>{
  queued=false;
  if(observer)observer.disconnect();
  walk(document.body);
  preserveLinks();
  if(observer)observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','title','aria-label']});
 });
}
function start(){
 buttons();
 observer=new MutationObserver(schedule);
 const param=new URL(location.href).searchParams.get('lang');
 let stored;
 try{stored=localStorage.getItem(KEY)}catch{}
 setLanguage(param==='en'||param==='nl'?param:stored==='en'?'en':'nl',false);
}
window.RaceAtlasI18n={getLanguage:()=>lang,setLanguage,translate:translation};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
})();