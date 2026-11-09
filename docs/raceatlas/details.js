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
 const overlay=el('div',null,'ra-detail-overlay');overlay.id='raceatlasDetails';overlay.setAttribute('role','presentation');overlay.dataset.returnfocus=fromLink?'':e.id;
 const dlg=el('section',null,'ra-detail-dialog');dlg.setAttribute('role','dialog');dlg.setAttribute('aria-modal','true');dlg.setAttribute('aria-label',e.name);
 const heading=el('div',null,'ra-detail-heading');
 heading.append(el('div',e.sport+' · '+e.discipline,'ra-detail-kicker'),el('h2',e.name));
 const close=el('button','✕','ra-detail-close');close.type='button';close.setAttribute('aria-label','Sluiten');close.onclick=closeDialog;heading.append(close);dlg.append(heading);
 const facts=el('div',null,'ra-detail-facts');
 const fmtDate=s=>{if(!s)return '';const day=String(s).slice(0,10);return /^\d{4}-\d{2}-\d{2}$/.test(day)?new Date(day+'T12:00:00').toLocaleDateString('nl-NL',{day:'numeric',month:'long',year:'numeric'}):String(s)};
 const fee=typeof e.priceEur==='number'?'€ '+e.priceEur.toFixed(2).replace('.',',')+(e.priceNote?' · '+e.priceNote:''):'Nog niet gepubliceerd';
 const when=e.registrationOpenAt?fmtDate(e.registrationOpenAt):e.registrationDate?fmtDate(e.registrationDate):e.registrationWindow?'Verwacht: '+e.registrationWindow+' (exacte dag onbekend)':'Openingsdatum nog niet gepubliceerd';
 const status=e.registrationStatus==='sold_out'?'Uitverkocht / geen reguliere startbewijzen':e.registrationStatus==='late_bird'?'Late-bird-inschrijving vermeld':e.registrationStatus==='link_available'?'Inschrijfpagina beschikbaar':e.registrationStatus==='window'?'Verwachte openingsperiode bekend':'Actuele beschikbaarheid controleren bij organisator';
 const factsData=[['Wedstrijddatum',formatDate(e)],['Locatie',e.place+' · '+e.country],['Afstanden',e.distance],['Inschrijfprijs',fee],['Opening inschrijving',when],['Inschrijfstatus',status],['Datumstatus',category(e)]];
 if(e.preregistrationDate)factsData.push(['Pre-registratie vanaf',fmtDate(e.preregistrationDate)]);
 if(e.registrationOpenInfo)factsData.push(['Verdere openingsinformatie',e.registrationOpenInfo]);
 if(e.registrationStatusNote)factsData.push(['Extra informatie',e.registrationStatusNote]);
 for(const [label,value] of factsData){const item=el('div');item.append(el('span',label),el('strong',value));facts.append(item)}
 dlg.append(facts);
 const note=el('p','Prijs en inschrijfdatum zijn alleen ingevuld wanneer er broninformatie beschikbaar is. Controleer wijzigingen, verschillende tarieven en beschikbaarheid altijd bij de organisator. Een maand zonder specifieke dag is geen bevestigde openingsdatum.','ra-detail-warning');dlg.append(note);
 if(typeof e.priceEur==='number'&&isValidUrl(e.priceSource)){const priceSource=el('p',null,'ra-detail-registration-source');priceSource.append(el('strong','Bron prijs: '));const a=el('a','Bekijk prijs bij organisator ↗');a.href=e.priceSource;a.target='_blank';a.rel='noopener noreferrer';priceSource.append(a);dlg.append(priceSource)}
 if(isValidUrl(e.registrationInfoUrl)){
   const source=el('p',null,'ra-detail-registration-source');
   source.append(el('strong','Bron inschrijfgegevens: '));
   const link=el('a','Bekijk informatie van de organisator ↗');link.href=e.registrationInfoUrl;link.target='_blank';link.rel='noopener noreferrer';source.append(link);dlg.append(source);
 }
 const actions=el('div',null,'ra-detail-actions');
 const url=e.registrationUrl||e.officialEventUrl||e.source;
 if(isValidUrl(url)){const a=el('a',e.registrationUrl?'Bekijk evenement / inschrijving ↗':e.officialEventUrl?'Bekijk organisator ↗':'Bekijk kalenderbron ↗','ra-detail-primary');a.href=url;a.rel='noopener noreferrer';a.target='_blank';actions.append(a)}
 const notify=el('button','🔔 Meldingen instellen','ra-detail-secondary');notify.onclick=()=>{closeDialog();if(window.RaceAtlasAlerts?.openForEvent)window.RaceAtlasAlerts.openForEvent(e.id);};actions.append(notify);
 const share=el('button','Deel evenement','ra-detail-secondary');share.onclick=async()=>{const u=eventLink(e);if(navigator.share){try{await navigator.share({title:e.name,url:u});return}catch{}}share.textContent=await copy(u)?'Link gekopieerd ✓':'Kopiëren niet gelukt';};actions.append(share);
 const report=el('button','Gegevens corrigeren','ra-detail-secondary');report.onclick=async()=>{
 const body='Evenement: '+e.name+'\nPlaats: '+e.place+'\nHuidige datum: '+(e.date||'onbekend')+'\nBron: '+(e.officialEventUrl||e.source||'niet opgegeven')+'\n\nWat klopt er niet?\n\n\nLink naar officiële bevestiging:\n';
 const title='RaceAtlas correctie: '+e.name;
 const reportUrl='https://github.com/samknook/sporttech-deals/issues/new?'+new URLSearchParams({title,body}).toString();
 const confirmed=window.confirm('Correctie melden via GitHub? Je opent een vooraf ingevuld voorstel in een nieuw tabblad. Hiervoor is een GitHub-account nodig. Neem geen persoonlijke gegevens op in een openbaar issue.');
 if(confirmed){window.open(reportUrl,'_blank','noopener,noreferrer');report.textContent='Correctieformulier geopend ↗'}
 else {const ok=await copy('RaceAtlas correctie\n'+title+'\n'+body);report.textContent=ok?'Correctietekst gekopieerd ✓':'Correctie niet gekopieerd'}
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
style.textContent += '.ra-detail-registration-source{font-size:12px;margin:12px 0;color:#4c6876}.ra-detail-registration-source a{font-weight:800;color:#1d7453;text-underline-offset:3px}.ra-detail-facts>div:nth-child(4),.ra-detail-facts>div:nth-child(5),.ra-detail-facts>div:nth-child(6){background:#f0f8ea}';document.head.append(style);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initFromUrl);else initFromUrl();
})();