(() => {
'use strict';
const $=id=>document.getElementById(id);
const EVENTS=()=>window.RACEATLAS_EVENTS||[];
const getEvent=id=>EVENTS().find(e=>e.id===id);
const isValidUrl=u=>{try{const x=new URL(u);return x.protocol==='https:'||x.protocol==='http:'}catch{return false}};
const formatDate=e=>e.date?new Date(e.date+'T12:00:00').toLocaleDateString('nl-NL',{weekday:'long',day:'numeric',month:'long',year:'numeric'}):e.expectedMonth?new Date(2027,Number(e.expectedMonth)-1,1).toLocaleDateString('nl-NL',{month:'long',year:'numeric'})+' (verwacht)':'Datum nog onbekend';
const category=e=>e.dateEvidence==='official'?'Bevestigd via organisator':e.date?'Datum vermeld — check bij organisator':e.expectedMonth?'Alleen historische maand bekend':'Datum nog onbekend';
const el=(tag,text,className)=>{const x=document.createElement(tag);if(text!=null)x.textContent=text;if(className)x.className=className;return x};
function copyFallback(text){const t=document.createElement('textarea');t.value=text;t.style.position='fixed';t.style.opacity='0';document.body.append(t);t.select();let ok=false;try{ok=document.execCommand('copy')}catch{}t.remove();return ok}
async function copy(text){try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);return true}}catch{}return copyFallback(text)}
const eventLink=e=>{const url=new URL(location.href);url.searchParams.set('event',e.id);url.hash='';return url.toString()};
function closeDialog(){const d=$('raceatlasDetails');if(!d)return;const previous=d.dataset.returnfocus;d.remove();const url=new URL(location.href);if(url.searchParams.has('event')){url.searchParams.delete('event');history.replaceState(null,'',url.pathname+url.search+url.hash)}if(previous){const b=document.querySelector('[data-ra-detail="'+previous+'"]');if(b)b.focus()}}
function detail(e,fromLink=false){
 if(!e)return;const old=$('raceatlasDetails');if(old)old.remove();
 const overlay=el('div',null,'ra-detail-overlay');overlay.id='raceatlasDetails';overlay.setAttribute('role','presentation');overlay.dataset.returnfocus=fromLink?'':e.id;overlay.dataset.raEvent=e.id;window.RaceAtlasTracking?.detailView(e.id);
 const dlg=el('section',null,'ra-detail-dialog');dlg.setAttribute('role','dialog');dlg.setAttribute('aria-modal','true');dlg.setAttribute('aria-label',e.name);
 const heading=el('div',null,'ra-detail-heading');
 heading.append(el('div',e.sport+' · '+e.discipline,'ra-detail-kicker'),el('h2',e.name));
 const close=el('button','✕','ra-detail-close');close.type='button';close.setAttribute('aria-label','Sluiten');close.onclick=closeDialog;heading.append(close);dlg.append(heading);
 if(e.major&&typeof window.RaceAtlasArtwork==='function'){
  const artwork=window.RaceAtlasArtwork(e);
  if(artwork){
   const hero=el('figure',null,'ra-detail-artwork');
   const isAi=e.imageRights==='generated';
   const image=el('img');
   image.src=artwork;
   image.alt=isAi?'AI-gegenereerd sfeerbeeld bij '+e.name+' (geen echte opname)':'Evenementfoto bij '+e.name;
   image.loading='lazy';image.decoding='async';
   const caption=el('figcaption',isAi?'Bron: TriZentro · AI-gegenereerd sfeerbeeld, geen officiële evenementfoto':(e.imageCredit||'Evenementfoto'));
   if(!isAi&&e.imageRights==='licensed'&&isValidUrl(e.imageSourceUrl)){
    const source=el('a',' · Fotobron');source.href=e.imageSourceUrl;source.rel='noopener noreferrer';source.target='_blank';caption.append(source);
    if(isValidUrl(e.imageLicenseUrl)){const license=el('a',' · Licentie');license.href=e.imageLicenseUrl;license.rel='noopener noreferrer';license.target='_blank';caption.append(license)}
   }
   if(!isAi&&e.imageRights==='licensed'&&/^ra-\d+$/.test(e.id)){
    image.addEventListener('error',()=>{
     image.onerror=null;
     image.src='images/featured/'+e.id+'.jpg';
     image.alt='AI-gegenereerd reserve-sfeerbeeld bij '+e.name;
     caption.textContent='Bron: TriZentro · AI-gegenereerd reservebeeld, geen officiële evenementfoto';
    },{once:true});
   }
   hero.append(image,caption);
   dlg.append(hero);
  }
 }
 const highlight=el('div',null,'tz-detail-highlight');
 const summaryEntries=[
  ['📅',e.date?formatDate(e):(e.expectedMonth?'Verwachte maand: '+formatDate(e):'Datum onbekend')],
  ['📍',e.place+(e.country?' · '+e.country:'')],
  ['🏁',e.distance||'Afstand nog niet bevestigd']
 ];
 for(const [icon,text] of summaryEntries){
  const item=el('div',null,'tz-detail-highlight-item');
  item.append(el('span',icon,'tz-detail-highlight-icon'),el('strong',text));
  highlight.append(item);
 }
 dlg.append(highlight);
 const quickActions=el('div',null,'tz-detail-quick-actions');
 const primaryRegistration=isValidUrl(e.registrationUrl)?e.registrationUrl:isValidUrl(e.officialEventUrl)?e.officialEventUrl:null;
 if(primaryRegistration){
  const a=el('a',isValidUrl(e.registrationUrl)?'Bekijk inschrijving ↗':'Officiële website ↗','tz-quick-registration');
  a.href=primaryRegistration;a.target='_blank';a.rel='noopener noreferrer';
  a.dataset.raEvent=e.id;a.dataset.raOutbound=isValidUrl(e.registrationUrl)?'registration':'organizer';quickActions.append(a);
 }
 const quickSave=el('button',null,'tz-quick-save');quickSave.type='button';
 const renderQuickSave=()=>{const isSaved=!!window.TriZentroSeason?.isSaved(e.id);quickSave.textContent=isSaved?'✓ Bewaard':'+ Bewaar';quickSave.setAttribute('aria-pressed',String(isSaved))};
 renderQuickSave();quickSave.onclick=()=>{if(window.TriZentroSeason?.toggle){window.TriZentroSeason.toggle(e.id);renderQuickSave();overlay.dispatchEvent(new Event('tz:refresh-saved'))}};
 quickActions.append(quickSave);
 overlay.addEventListener('tz:refresh-saved',renderQuickSave);
 dlg.append(quickActions);
 const facts=el('div',null,'ra-detail-facts');
 const fmtDate=s=>{if(!s)return '';const day=String(s).slice(0,10);return /^\d{4}-\d{2}-\d{2}$/.test(day)?new Date(day+'T12:00:00').toLocaleDateString('nl-NL',{day:'numeric',month:'long',year:'numeric'}):String(s)};
 const priceText=typeof e.priceEur==='number'?'€ '+e.priceEur.toFixed(2).replace('.',','):typeof e.priceAmount==='number'?(e.priceCurrency==='USD'?'$ ':e.priceCurrency==='AUD'?'A$ ':e.priceCurrency+' ')+e.priceAmount.toLocaleString('nl-NL',{minimumFractionDigits:0,maximumFractionDigits:2}):null;
 const fee=e.priceStatus==='conflicting'?(e.priceNote||'Tegenstrijdige prijzen op organisatorwebsite — controleer bij organisator'):priceText?(e.priceNote?priceText+' · '+e.priceNote:priceText):e.priceNote||'Nog niet gepubliceerd';
 const when=e.registrationOpenAt?fmtDate(e.registrationOpenAt):e.registrationDate?fmtDate(e.registrationDate):e.registrationWindow?'Verwacht: '+e.registrationWindow+' (exacte dag onbekend)':'Openingsdatum nog niet gepubliceerd';
 const statuses={not_open:'Inschrijving nog niet geopend (volgens organisator)',sold_out:'Bij laatst gecontroleerde bron: reguliere startbewijzen uitverkocht',closed:'Reguliere inschrijfperiode gesloten (alternatieven mogelijk)',mixed:'Verschilt per onderdeel; zie aanvullende informatie',upcoming:'Inschrijving opent later volgens bron',on_site:'Alleen op locatie inschrijven',late_bird:'Late-bird-inschrijving vermeld',link_available:'Inschrijfpagina beschikbaar; controleer actuele status',window:'Verwachte openingsperiode bekend',unknown:'Openingsdatum of actuele status niet bevestigd'};
 const status=statuses[e.registrationStatus]||'Actuele beschikbaarheid controleren bij organisator';
 const eventDate=e.eventStartDate&&e.eventStartDate!==e.date?fmtDate(e.eventStartDate)+' t/m '+fmtDate(e.date):formatDate(e);
 const factsData=[['Wedstrijddatum',eventDate],['Locatie',e.place+' · '+e.country],['Afstanden',e.distance],['Inschrijfprijs',fee],['Opening inschrijving',when],['Inschrijfstatus',status],['Datumstatus',category(e)]];
 if(e.sourceCheckedOn||e.verifiedOn)factsData.push(['Laatst gecontroleerd',fmtDate(e.sourceCheckedOn||e.verifiedOn)]);
 if(e.priceStatus==='conflicting')factsData.push(['Prijsstatus','Tegenstrijdige informatie op officiële bron — niet bevestigd']);
 if(e.registrationEndDate)factsData.push(['Einde inschrijfperiode',fmtDate(e.registrationEndDate)]);
 if(e.dateNote)factsData.push(['Programma/datumtoelichting',e.dateNote]);
 if(e.preregistrationDate)factsData.push(['Pre-registratie vanaf',fmtDate(e.preregistrationDate)]);
 if(e.registrationOpenInfo)factsData.push(['Verdere openingsinformatie',e.registrationOpenInfo]);
 if(e.registrationStatusNote)factsData.push(['Extra informatie',e.registrationStatusNote]);
 for(const [label,value] of factsData){const item=el('div');item.append(el('span',label),el('strong',value));facts.append(item)}
 dlg.append(facts);
 const note=el('p',(e.officialEventUrl||e.source?'Prijs en inschrijfdatum zijn alleen ingevuld wanneer er broninformatie beschikbaar is. Controleer wijzigingen, verschillende tarieven en beschikbaarheid altijd bij de organisator. Een maand zonder specifieke dag is geen bevestigde openingsdatum.':'Voor dit evenement ontbreekt nog een specifieke bronlink. De vermelde wedstrijddatum en gegevens moeten nog gecontroleerd worden bij de organisator. Je kunt via Gegevens corrigeren een officiële bron doorgeven.'),'ra-detail-warning');dlg.append(note);
 if((typeof e.priceEur==='number'||e.priceStatus==='conflicting')&&isValidUrl(e.priceSource)){const priceSource=el('p',null,'ra-detail-registration-source');priceSource.append(el('strong','Bron prijs: '));const a=el('a','Bekijk prijs bij organisator ↗');a.href=e.priceSource;a.target='_blank';a.rel='noopener noreferrer';priceSource.append(a);dlg.append(priceSource)}
 if(isValidUrl(e.registrationInfoUrl)){
   const source=el('p',null,'ra-detail-registration-source');
   source.append(el('strong','Bron inschrijfgegevens: '));
   const link=el('a','Bekijk inschrijfbron ↗');link.href=e.registrationInfoUrl;link.target='_blank';link.rel='noopener noreferrer';source.append(link);dlg.append(source);
 }
 const actions=el('div',null,'ra-detail-actions');
 const registrationUrl=isValidUrl(e.registrationUrl)?e.registrationUrl:null;
 const officialUrl=isValidUrl(e.officialEventUrl)?e.officialEventUrl:null;
 if(registrationUrl){
  const register=el('a','Bekijk inschrijving ↗','ra-detail-primary');
  register.href=registrationUrl;register.rel='noopener noreferrer';register.target='_blank';
  register.dataset.raEvent=e.id;register.dataset.raOutbound='registration';
  actions.append(register);
 }else if(officialUrl){
  const official=el('a','Bekijk organisator ↗','ra-detail-primary');
  official.href=officialUrl;official.rel='noopener noreferrer';official.target='_blank';
  official.dataset.raEvent=e.id;official.dataset.raOutbound='organizer';
  actions.append(official);
 }
 const season=el('button',null,'ra-detail-secondary tz-detail-save');
 season.type='button';
 const updateSeason=()=>{const active=!!window.TriZentroSeason?.isSaved(e.id);season.textContent=active?'✓ Bewaard in mijn seizoen':'+ Bewaar in mijn seizoen';season.setAttribute('aria-pressed',String(active))};
 updateSeason();
 season.onclick=()=>{if(window.TriZentroSeason?.toggle){window.TriZentroSeason.toggle(e.id);updateSeason();overlay.dispatchEvent(new Event('tz:refresh-saved'))}};
 actions.append(season);
 overlay.addEventListener('tz:refresh-saved',updateSeason);
 if(registrationUrl&&officialUrl&&registrationUrl!==officialUrl){
  const official=el('a','Officiële website ↗','ra-detail-secondary tz-detail-official');
  official.href=officialUrl;official.rel='noopener noreferrer';official.target='_blank';
  official.dataset.raEvent=e.id;official.dataset.raOutbound='organizer';
  actions.append(official);
 }
 const notify=el('button','🔔 Meldingen instellen','ra-detail-secondary');notify.onclick=()=>{closeDialog();if(window.RaceAtlasAlerts?.openForEvent)window.RaceAtlasAlerts.openForEvent(e.id);};actions.append(notify);
 const share=el('button','Deel evenement','ra-detail-secondary');share.onclick=async()=>{const u=eventLink(e);if(navigator.share){try{await navigator.share({title:e.name,url:u});return}catch{}}share.textContent=await copy(u)?'Link gekopieerd ✓':'Kopiëren niet gelukt';};actions.append(share);
 const report=el('button','Gegevens corrigeren','ra-detail-secondary');report.onclick=()=>{
 const link=new URL('organisatoren.html',location.href);
 link.hash='contact';
 link.searchParams.set('onderwerp','Evenementgegevens aanpassen');
 link.searchParams.set('event',e.name);
 link.searchParams.set('eventId',e.id);
 if(isValidUrl(e.officialEventUrl||e.registrationInfoUrl||e.source))link.searchParams.set('bron',e.officialEventUrl||e.registrationInfoUrl||e.source);
 window.location.href=link.toString();
 };actions.append(report);
 dlg.append(actions);overlay.append(dlg);overlay.addEventListener('click',ev=>{if(ev.target===overlay)closeDialog()});document.body.append(overlay);close.focus();
 const urlObj=new URL(location.href);if(urlObj.searchParams.get('event')!==e.id){urlObj.searchParams.set('event',e.id);history.replaceState(null,'',urlObj.pathname+urlObj.search+urlObj.hash)}
}
function initFromUrl(){const id=new URL(location.href).searchParams.get('event');if(id){const e=getEvent(id);if(e)detail(e,true)}}
document.addEventListener('click',ev=>{const button=ev.target.closest('[data-ra-detail]');if(!button)return;const e=getEvent(button.dataset.raDetail);if(e)detail(e)});
document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&$('raceatlasDetails'))closeDialog()});
window.addEventListener('popstate',()=>{const id=new URL(location.href).searchParams.get('event');if(id){const e=getEvent(id);if(e)detail(e,true)}else{const d=$('raceatlasDetails');if(d)d.remove()}});
const mobileStyle=document.createElement('style');
mobileStyle.textContent=`
.ra-detail-dialog .tz-detail-highlight{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:12px 0 16px}
.ra-detail-dialog .tz-detail-highlight-item{display:flex;gap:9px;align-items:center;background:#eef5f0;border:1px solid #deebe2;border-radius:12px;padding:13px 11px;min-width:0}
.ra-detail-dialog .tz-detail-highlight-item strong{font-size:13px;line-height:1.4;overflow-wrap:anywhere;color:#17352d}
.ra-detail-dialog .tz-detail-highlight-icon{flex:0 0 auto;font-size:18px}
.ra-detail-dialog .tz-detail-save[aria-pressed="true"]{background:#e5f4dc;border-color:#8dc779;color:#1b4a32}
@media(max-width:700px){
 .ra-detail-overlay{align-items:flex-end!important;justify-content:center!important;padding:0!important;z-index:120!important}
 .ra-detail-dialog{position:relative;width:100%!important;max-width:100%!important;max-height:calc(100dvh - env(safe-area-inset-top) - 8px)!important;overflow:auto!important;overscroll-behavior:contain;border-radius:22px 22px 0 0!important;padding:18px 16px calc(24px + env(safe-area-inset-bottom))!important;-webkit-overflow-scrolling:touch}
 .ra-detail-heading{padding-right:40px!important}
 .ra-detail-heading h2{font-size:clamp(23px,6.4vw,30px)!important;margin-bottom:12px!important}
 .ra-detail-close{top:0;right:0;min-width:42px;min-height:42px;display:flex;align-items:center;justify-content:center}
 .ra-detail-dialog .tz-detail-highlight{grid-template-columns:1fr!important;gap:7px!important;margin:9px 0 12px!important}
 .ra-detail-dialog .tz-detail-highlight-item{padding:10px 12px!important;min-height:43px!important}
 .ra-detail-dialog .tz-detail-highlight-item strong{font-size:13px!important}
 .ra-detail-artwork img{height:115px!important}
 .ra-detail-facts{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:7px!important}
 .ra-detail-facts>div{padding:10px!important;min-width:0!important}
 .ra-detail-facts strong{font-size:12px!important;line-height:1.4!important;overflow-wrap:anywhere}
 .ra-detail-facts span{font-size:10px!important}
 .ra-detail-actions{position:sticky;bottom:calc(-24px - env(safe-area-inset-bottom));z-index:5;padding:12px 0 calc(12px + env(safe-area-inset-bottom));margin-top:13px!important;background:linear-gradient(#fffdfb,#fff 16%);display:grid!important;grid-template-columns:1fr 1fr;gap:7px!important;border-top:1px solid #e1e8ed}
 .ra-detail-actions>*{min-width:0!important;min-height:46px!important;flex:initial!important;padding:11px 8px!important;text-align:center;font-size:12px!important}
 .ra-detail-actions>.ra-detail-primary{grid-column:1/-1;background:#c7ff37!important;color:#0d251b!important;border-color:#c7ff37!important;min-height:49px!important;font-size:14px!important}
 .ra-detail-actions>.tz-detail-save{grid-column:1/-1;background:#eef7ea}
 .ra-detail-actions>.tz-detail-official{grid-column:1/-1}
}
`;
mobileStyle.textContent+=`
.ra-detail-dialog .tz-detail-quick-actions{display:flex;gap:9px;margin:4px 0 14px}
.ra-detail-dialog .tz-detail-quick-actions>*{flex:1 1 0;min-width:0;display:flex;align-items:center;justify-content:center;border-radius:10px;min-height:46px;text-decoration:none;text-align:center;padding:10px;font:850 13px/1.3 Inter,system-ui,sans-serif;cursor:pointer}
.ra-detail-dialog .tz-quick-registration{background:#c7ff37;color:#13251b;border:1px solid #c7ff37}
.ra-detail-dialog .tz-quick-save{background:#eff6e9;color:#234f38;border:1px solid #badab3}
.ra-detail-dialog .tz-quick-save[aria-pressed="true"]{background:#ddf4d0;border-color:#7bbf6d}
@media(max-width:700px){.ra-detail-dialog .tz-detail-quick-actions{position:sticky;top:-18px;z-index:8;margin:0 -16px 12px;padding:9px 16px;background:#fff;border-bottom:1px solid #e7ecea;box-shadow:0 6px 14px #122b2310}.ra-detail-dialog .tz-detail-quick-actions>*{min-height:45px}}
`;
document.head.append(mobileStyle);
const style=document.createElement('style');style.textContent=
'.ra-detail-btn{padding:10px 12px;background:#f2f7ef;border:1px solid #cbdcca;border-radius:9px;color:#1b4e36;font-weight:800;font-size:12px;cursor:pointer}.ra-detail-overlay{position:fixed;inset:0;z-index:110;background:#061318c4;display:flex;align-items:center;justify-content:center;padding:16px}.ra-detail-dialog{width:min(650px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:20px;padding:25px;color:#122b23;box-shadow:0 25px 80px #0006}.ra-detail-heading{position:relative;padding-right:35px}.ra-detail-heading h2{font-size:clamp(25px,4vw,34px);letter-spacing:-.05em;margin:5px 0 17px;line-height:1.1}.ra-detail-kicker{font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:#416b54;font-weight:850}.ra-detail-close{position:absolute;right:0;top:0;border:1px solid #d6e3d6;border-radius:8px;background:#fff;padding:7px 11px}.ra-detail-facts{display:grid;grid-template-columns:1fr 1fr;gap:10px}.ra-detail-facts>div{background:#f2f6f0;padding:13px;border-radius:10px;display:flex;flex-direction:column;gap:5px}.ra-detail-facts span{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#718579;font-weight:750}.ra-detail-facts strong{font-size:14px}.ra-detail-warning{line-height:1.6;font-size:12px;color:#68776d}.ra-detail-actions{display:flex;flex-wrap:wrap;gap:9px;margin-top:17px}.ra-detail-actions button,.ra-detail-actions a{display:inline-flex;align-items:center;justify-content:center;border-radius:9px;padding:12px 15px;text-decoration:none;font:inherit;font-size:12px;font-weight:800;cursor:pointer}.ra-detail-primary{background:#b9fa83;border:1px solid #b9fa83;color:#13251b}.ra-detail-secondary{background:#fff;border:1px solid #cddccd;color:#214c36}@media(max-width:580px){.ra-detail-dialog{padding:18px}.ra-detail-facts{grid-template-columns:1fr}.ra-detail-actions>*{flex:1 1 100%}}';
style.textContent += '.ra-detail-registration-source{font-size:12px;margin:12px 0;color:#4c6876}.ra-detail-registration-source a{font-weight:800;color:#1d7453;text-underline-offset:3px}.ra-detail-facts>div:nth-child(4),.ra-detail-facts>div:nth-child(5),.ra-detail-facts>div:nth-child(6){background:#f0f8ea}';style.textContent+='.ra-detail-artwork{margin:0 0 14px;position:relative}.ra-detail-artwork img{width:100%;height:190px;object-fit:cover;display:block;border-radius:12px}.ra-detail-artwork figcaption{font-size:11px;color:#637a80;padding:6px 2px}@media(max-width:600px){.ra-detail-artwork img{height:145px}}';
document.head.append(style);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initFromUrl);else initFromUrl();
})();