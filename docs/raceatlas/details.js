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
   const caption=el('figcaption',isAi?'Bron: RaceAtlas · AI-gegenereerd sfeerbeeld, geen officiële evenementfoto':(e.imageCredit||'Evenementfoto'));
   if(!isAi&&e.imageRights==='licensed'&&isValidUrl(e.imageSourceUrl)){
    const source=el('a',' · Fotobron');source.href=e.imageSourceUrl;source.rel='noopener noreferrer';source.target='_blank';caption.append(source);
    if(isValidUrl(e.imageLicenseUrl)){const license=el('a',' · Licentie');license.href=e.imageLicenseUrl;license.rel='noopener noreferrer';license.target='_blank';caption.append(license)}
   }
   if(!isAi&&e.imageRights==='licensed'&&/^ra-\d+$/.test(e.id)){
    image.addEventListener('error',()=>{
     image.onerror=null;
     image.src='images/featured/'+e.id+'.jpg';
     image.alt='AI-gegenereerd reserve-sfeerbeeld bij '+e.name;
     caption.textContent='Bron: RaceAtlas · AI-gegenereerd reservebeeld, geen officiële evenementfoto';
    },{once:true});
   }
   hero.append(image,caption);
   dlg.append(hero);
  }
 }
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
 const url=e.officialEventUrl||e.registrationUrl||null;
 if(isValidUrl(url)){const a=el('a',e.officialEventUrl?'Officiële website ↗':'Inschrijfpagina ↗','ra-detail-primary');a.href=url;a.rel='noopener noreferrer';a.target='_blank';a.dataset.raEvent=e.id;a.dataset.raOutbound=e.officialEventUrl?'organizer':'registration';actions.append(a)}
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
const style=document.createElement('style');style.textContent=
'.ra-detail-btn{padding:10px 12px;background:#f2f7ef;border:1px solid #cbdcca;border-radius:9px;color:#1b4e36;font-weight:800;font-size:12px;cursor:pointer}.ra-detail-overlay{position:fixed;inset:0;z-index:110;background:#061318c4;display:flex;align-items:center;justify-content:center;padding:16px}.ra-detail-dialog{width:min(650px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:20px;padding:25px;color:#122b23;box-shadow:0 25px 80px #0006}.ra-detail-heading{position:relative;padding-right:35px}.ra-detail-heading h2{font-size:clamp(25px,4vw,34px);letter-spacing:-.05em;margin:5px 0 17px;line-height:1.1}.ra-detail-kicker{font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:#416b54;font-weight:850}.ra-detail-close{position:absolute;right:0;top:0;border:1px solid #d6e3d6;border-radius:8px;background:#fff;padding:7px 11px}.ra-detail-facts{display:grid;grid-template-columns:1fr 1fr;gap:10px}.ra-detail-facts>div{background:#f2f6f0;padding:13px;border-radius:10px;display:flex;flex-direction:column;gap:5px}.ra-detail-facts span{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#718579;font-weight:750}.ra-detail-facts strong{font-size:14px}.ra-detail-warning{line-height:1.6;font-size:12px;color:#68776d}.ra-detail-actions{display:flex;flex-wrap:wrap;gap:9px;margin-top:17px}.ra-detail-actions button,.ra-detail-actions a{display:inline-flex;align-items:center;justify-content:center;border-radius:9px;padding:12px 15px;text-decoration:none;font:inherit;font-size:12px;font-weight:800;cursor:pointer}.ra-detail-primary{background:#b9fa83;border:1px solid #b9fa83;color:#13251b}.ra-detail-secondary{background:#fff;border:1px solid #cddccd;color:#214c36}@media(max-width:580px){.ra-detail-dialog{padding:18px}.ra-detail-facts{grid-template-columns:1fr}.ra-detail-actions>*{flex:1 1 100%}}';
style.textContent += '.ra-detail-registration-source{font-size:12px;margin:12px 0;color:#4c6876}.ra-detail-registration-source a{font-weight:800;color:#1d7453;text-underline-offset:3px}.ra-detail-facts>div:nth-child(4),.ra-detail-facts>div:nth-child(5),.ra-detail-facts>div:nth-child(6){background:#f0f8ea}';style.textContent+='.ra-detail-artwork{margin:0 0 14px;position:relative}.ra-detail-artwork img{width:100%;height:190px;object-fit:cover;display:block;border-radius:12px}.ra-detail-artwork figcaption{font-size:11px;color:#637a80;padding:6px 2px}@media(max-width:600px){.ra-detail-artwork img{height:145px}}';
document.head.append(style);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initFromUrl);else initFromUrl();
})();