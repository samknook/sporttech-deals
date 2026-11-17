#!/usr/bin/env node
'use strict';
/* Private, offline dashboard over aggregate TriZentro organizer export data.
 * This file is deliberately outside docs/ (the public GitHub Pages root).
 */
const fs=require('node:fs'),path=require('node:path');
const {parse}=require('./build-trizentro-organizer-report.cjs');
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const count=x=>Number.isFinite(Number(x))?Math.max(0,Math.trunc(Number(x))):0;
function buildDashboard(input){
 const data=parse(input);
 const rows=data.events.map(e=>({
  id:e.id,name:e.name,card:e.card,detail:e.detail,organizer:e.organizer,
  registration:e.registration,sponsored:e.sponsored,
  report:'trizentro-rapport-'+e.id+'.html'
 }));
 const totals=rows.reduce((a,r)=>{for(const k of ['card','detail','organizer','registration','sponsored'])a[k]+=count(r[k]);return a},{card:0,detail:0,organizer:0,registration:0,sponsored:0});
 const dailyByDate=new Map();
 for(const entry of data.daily){
  if(entry.kind!=='organizer'&&entry.kind!=='registration')continue;
  dailyByDate.set(entry.day,(dailyByDate.get(entry.day)||0)+count(entry.clicks));
 }
 const timeline=[...dailyByDate].sort((a,b)=>a[0].localeCompare(b[0]));
 const max=Math.max(1,...timeline.map(x=>x[1]));
 const barHtml=timeline.length?timeline.map(([day,n])=>'<div class="barcol" title="'+day+': '+n+' klikken"><span class="bar" style="height:'+Math.max(3,Math.round(n/max*100))+'%"></span><small>'+day.slice(5)+'</small></div>').join(''):'<p>Er zijn nog geen gemeten uitgaande klikken in deze periode.</p>';
 const table=rows.sort((a,b)=>(b.organizer+b.registration)-(a.organizer+a.registration)||b.card-a.card).map(r=>'<tr data-search="'+escapeHtml((r.name+' '+r.id).toLocaleLowerCase('nl-NL'))+'" data-card="'+r.card+'" data-detail="'+r.detail+'" data-organizer="'+r.organizer+'" data-registration="'+r.registration+'" data-sponsored="'+r.sponsored+'"><td><a href="'+r.report+'">'+escapeHtml(r.name)+'</a><small>'+r.id+'</small></td><td>'+r.card+'</td><td>'+r.detail+'</td><td>'+r.organizer+'</td><td>'+r.registration+'</td><td>'+r.sponsored+'</td></tr>').join('');
 const tile=(title,value)=>'<article class="metric"><b>'+value.toLocaleString('nl-NL')+'</b><span>'+title+'</span></article>';
 return '<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>TriZentro · Intern organisatorenoverzicht</title><style>'
 +'body{background:#f4f8f4;color:#1b392c;font:15px/1.5 system-ui,sans-serif;margin:0}main{max-width:1150px;margin:auto;padding:36px 20px}header{background:#133e32;color:#fff;padding:26px 30px;border-radius:16px}h1{margin:5px 0;font-size:28px}header p{margin:0;color:#cee8db}.metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin:20px 0}.metric{background:white;border:1px solid #d8e6d9;padding:19px;border-radius:12px}.metric b{display:block;font-size:29px}.metric span{color:#536b5d;font-size:12px}section{background:white;border:1px solid #d8e6d9;border-radius:13px;padding:20px;margin:16px 0}h2{font-size:19px;margin:0 0 14px}input,select{padding:11px;border:1px solid #b9d0c1;border-radius:8px;margin:0 12px 12px 5px}input{width:min(360px,100%)}table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #e2ece3;padding:12px;text-align:right}th:first-child,td:first-child{text-align:left}td small{display:block;color:#657b6b}a{color:#116a43;font-weight:650}.scroll{overflow-x:auto}.bars{height:146px;display:flex;align-items:end;gap:5px;padding:6px 0 0}.barcol{height:100%;min-width:20px;display:flex;flex:1;flex-direction:column;justify-content:flex-end;align-items:center}.bar{display:block;background:#3a8764;width:100%;min-height:2px;border-radius:5px 5px 0 0}.barcol small{font-size:9px;white-space:nowrap}.fine{color:#556d60;font-size:13px}.hide{display:none}@media(max-width:600px){main{padding:12px}table{min-width:650px}header{padding:20px}.metric b{font-size:24px}}@media print{.search{display:none}body{background:#fff}}'
 +'</style></head><body><main><header><strong>TRIZENTRO / INTERN</strong><h1>Prestaties per evenement</h1><p>Meetperiode: '+data.periodStart+' t/m '+data.periodEnd+' · '+rows.length+' evenementen met gegevens</p></header>'
 +'<div class="metrics">'+tile('Kaartweergaven',totals.card)+tile('Detailweergaven',totals.detail)+tile('Klikken officiële website',totals.organizer)+tile('Klikken inschrijving',totals.registration)+tile('Promotieklikken',totals.sponsored)+'</div>'
 +'<section><h2>Uitgaande klikken per dag</h2><div class="bars" role="img" aria-label="Dagelijkse geregistreerde klikken naar organisatoren en inschrijflinks">'+barHtml+'</div></section>'
 +'<section><h2>Evenementen vergelijken</h2><p class="fine">Gesorteerd op uitgaande klikacties. Klik op een evenement voor zijn afzonderlijke deelbare rapport.</p><label class="search">Zoek evenement <input id="filter" type="search" placeholder="Naam of event-ID" autocomplete="off"></label><label class="search"> Sorteer op <select id="sort"><option value="clicks">Uitgaande klikken</option><option value="card">Kaartweergaven</option><option value="detail">Detailweergaven</option><option value="organizer">Klikken website</option><option value="registration">Klikken inschrijving</option></select></label><div class="scroll"><table><thead><tr><th>Evenement</th><th>Kaart</th><th>Detail</th><th>Website</th><th>Inschrijven</th><th>Promotie</th></tr></thead><tbody id="races">'+table+'</tbody></table></div><p id="empty" class="fine hide">Geen evenementen gevonden.</p></section>'
 +'<section class="fine"><strong>Definities:</strong> dit zijn geaggregeerde browseracties, geen unieke bezoekers, inschrijvingen of omzet. Herhaald klikken telt mee. Privacyinstellingen en verbindingsproblemen kunnen tot ontbrekende metingen leiden. Dezelfde persoon kan meerdere acties uitvoeren. Het diagram combineert alleen uitgaande website- en inschrijfklikken. Dit is een intern offline rapport, niet bedoeld als publiek dashboard.</section>'
 +'</main><script>const filter=document.getElementById("filter"),sort=document.getElementById("sort"),tbody=document.getElementById("races");const update=()=>{const q=filter.value.trim().toLocaleLowerCase("nl-NL");let shown=0;const rows=[...tbody.querySelectorAll("tr")];for(const row of rows){const visible=row.dataset.search.includes(q);row.hidden=!visible;if(visible)shown++}rows.sort((a,b)=>{const value=r=>sort.value==="clicks"?Number(r.dataset.organizer)+Number(r.dataset.registration):Number(r.dataset[sort.value]);return value(b)-value(a)||Number(b.dataset.card)-Number(a.dataset.card)});tbody.replaceChildren(...rows);document.getElementById("empty").classList.toggle("hide",shown>0)};filter.addEventListener("input",update);sort.addEventListener("change",update);</script></body></html>';
}
if(require.main===module){
 const [input,dir]=process.argv.slice(2);
 if(!input||!dir){console.error('Usage: node scripts/build-trizentro-organizer-dashboard.cjs input.json output-dir');process.exit(2)}
 try{fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'trizentro-intern-dashboard.html'),buildDashboard(JSON.parse(fs.readFileSync(input,'utf8'))));console.log('Private organizer dashboard generated')}
 catch(error){console.error(error.message);process.exitCode=1}
}
module.exports={buildDashboard};
