#!/usr/bin/env node
'use strict';
/**
 * TriZentro organizer reporting from aggregate daily tracking exports.
 * Usage: node scripts/build-trizentro-organizer-report.cjs input.json output-dir
 * No visitor IDs, cookies, emails, raw browsing history or secret credentials.
 */
const fs=require('node:fs'),path=require('node:path');
const DATE=/^\d{4}-\d{2}-\d{2}$/;
const ID=/^ra-\d{1,8}$/;
const TYPES=['card_view','detail_view','organizer','registration','source','promotion','site_view'];
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Protect spreadsheet recipients from CSV formula injection in event names.
const csvValue=value=>{
 const raw=String(value??'');
 const safe=/^[\s]*[=+@-]/.test(raw)?"'"+raw:raw;
 return '"'+safe.replace(/"/g,'""')+'"';
};
const safeNumber=value=>Number.isFinite(Number(value))?Math.max(0,Math.trunc(Number(value))):0;
const parse=data=>{
 if(!DATE.test(data.periodStart)||!DATE.test(data.periodEnd)||data.periodEnd<data.periodStart)
  throw Error('Provide valid periodStart and periodEnd (YYYY-MM-DD)');
 if(!Array.isArray(data.events)||!Array.isArray(data.daily))throw Error('events and daily must be arrays');
 const events=data.events.filter(e=>ID.test(e.event_id)).map(e=>({
  id:e.event_id,name:String(e.event_name||e.event_id).slice(0,200),
  card:safeNumber(e.card_views),detail:safeNumber(e.detail_views),
  organizer:safeNumber(e.organizer_clicks),registration:safeNumber(e.registration_clicks),
  sponsored:safeNumber(e.sponsored_clicks)
 }));
 const daily=data.daily.filter(row=>ID.test(row.event_id)&&DATE.test(row.day)&&row.day>=data.periodStart&&row.day<=data.periodEnd&&TYPES.includes(row.kind))
  .map(row=>({id:row.event_id,day:row.day,kind:row.kind,clicks:safeNumber(row.clicks)}));
 return {periodStart:data.periodStart,periodEnd:data.periodEnd,events,daily};
};
function render(data){
 const d=parse(data),byEvent=new Map(d.events.map(e=>[e.id,e])),totals={card:0,detail:0,organizer:0,registration:0,sponsored:0};
 for(const e of d.events)for(const key of Object.keys(totals))totals[key]+=e[key];
 const pct=(clicks,views)=>views?((100*clicks/views).toFixed(1)+'%'):'n.v.t.';
 const csv=[['evenement_id','evenement','periode_van','periode_tot','kaartweergaven','detailweergaven','klikken_organisator','klikken_inschrijven','klikken_promotie','klikratio_organisator_per_detailweergave']];
 const reports=[];
 for(const e of d.events){
  csv.push([e.id,e.name,d.periodStart,d.periodEnd,e.card,e.detail,e.organizer,e.registration,e.sponsored,pct(e.organizer,e.detail)]);
  const trend=d.daily.filter(day=>day.id===e.id).sort((a,b)=>a.day.localeCompare(b.day)||a.kind.localeCompare(b.kind));
  const dailyHtml=trend.length?trend.map(day=>'<tr><td>'+day.day+'</td><td>'+escapeHtml(day.kind)+'</td><td>'+day.clicks+'</td></tr>').join(''):'<tr><td colspan="3">Nog geen geregistreerde dagmetingen voor deze periode.</td></tr>';
  const page='<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TriZentro evenementenrapport · '+escapeHtml(e.name)+'</title><style>'
   +'body{font:16px/1.5 system-ui,sans-serif;color:#183127;background:#f4f8f4;margin:0}.wrap{max-width:940px;margin:auto;padding:36px 22px}.top{background:#153b30;color:white;padding:24px 28px;border-radius:16px}h1{font-size:28px;margin:6px 0}h2{margin-top:30px}.muted{color:#586e63}.top .muted{color:#cee9d4}.metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin:22px 0}.metric{background:white;padding:19px;border:1px solid #d5e5d9;border-radius:12px}.metric b{display:block;font-size:30px}.metric span{font-size:12px}table{border-collapse:collapse;width:100%;background:white}td,th{border-bottom:1px solid #d5e5d9;text-align:left;padding:10px}.notes{background:white;padding:18px;border-radius:12px}.print{border:0;padding:12px 18px;border-radius:8px;background:#c6ff46;cursor:pointer}@media print{body{background:white}.print{display:none}.wrap{max-width:none}}</style></head><body><main class="wrap"><header class="top"><strong>TRIZENTRO · ORGANISATORENRAPPORT</strong><h1>'+escapeHtml(e.name)+'</h1><p class="muted">Rapportageperiode: '+d.periodStart+' t/m '+d.periodEnd+'</p></header>'
   +'<div class="metrics"><div class="metric"><b>'+e.card+'</b><span>Kaartweergaven</span></div><div class="metric"><b>'+e.detail+'</b><span>Detailpaginaweergaven</span></div><div class="metric"><b>'+e.organizer+'</b><span>Klikken officiële website</span></div><div class="metric"><b>'+e.registration+'</b><span>Klikken inschrijflink</span></div><div class="metric"><b>'+e.sponsored+'</b><span>Klikken promotie</span></div></div>'
   +'<h2>Dagelijkse activiteit</h2><table><thead><tr><th>Datum</th><th>Meettype</th><th>Aantal</th></tr></thead><tbody>'+dailyHtml+'</tbody></table>'
   +'<section class="notes"><h2>Hoe lees je deze cijfers?</h2><p>Kaartweergaven: keren dat een wedstrijdkaart zichtbaar werd. Detailweergaven: geregistreerde openingen van de wedstrijdinformatie. Klikken officiële website en inschrijflink: geregistreerde uitgaande klikacties. Een klik is geen bevestigde inschrijving.</p><p><strong>Geen unieke bezoekers:</strong> deze tellingen zijn geaggregeerde acties. Dezelfde persoon kan meerdere acties uitvoeren. De verhouding tussen klikken en detailweergaven is geen betrouwbare conversieratio en wordt daarom niet als conversie gepresenteerd.</p><p>Metingen kunnen lager uitvallen door privacyinstellingen, verbinding of adblockers. Er worden geen persoonsgebonden bezoekersgegevens in dit rapport gedeeld.</p></section><p><button class="print" onclick="print()">Print of bewaar als pdf</button></p><p class="muted">TriZentro · Find. Prepare. Perform.</p></main></body></html>';
  reports.push({filename:'trizentro-rapport-'+e.id+'.html',html:page});
 }
 return {reports,csv:csv.map(row=>row.map(csvValue).join(',')).join('\r\n')+'\r\n',summary:totals};
}
if(require.main===module){
 const [input,dir]=process.argv.slice(2);
 if(!input||!dir){console.error('Usage: node scripts/build-trizentro-organizer-report.cjs input.json output-dir');process.exit(2)}
 try{
  const result=render(JSON.parse(fs.readFileSync(input,'utf8')));
  fs.mkdirSync(dir,{recursive:true});
  for(const report of result.reports)fs.writeFileSync(path.join(dir,report.filename),report.html);
  fs.writeFileSync(path.join(dir,'trizentro-organisatoren-overzicht.csv'),'\uFEFF'+result.csv);
  const {buildDashboard}=require('./build-trizentro-organizer-dashboard.cjs');
  fs.writeFileSync(path.join(dir,'trizentro-intern-dashboard.html'),buildDashboard(JSON.parse(fs.readFileSync(input,'utf8'))));
  console.log('Organizer reports generated: '+result.reports.length);
 }catch(error){console.error(error.message);process.exitCode=1}
}
module.exports={render,parse};
