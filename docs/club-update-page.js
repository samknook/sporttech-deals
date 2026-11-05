/* Static NL/EN participant update sheet generated offline. A downloaded snapshot is not automatically published. */
(function(root){
'use strict';
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
const names={
 event:['Evenement','Event'],date:['Wedstrijddatum','Race date'],venue:['Locatie','Venue'],guide:['Officiële bron','Official source'],
 checkin:['Registratie opent','Registration opens'],bikeClose:['Fietsincheck sluit','Bike check-in closes'],
 transitionClose:['Wisselzone sluit','Transition closes'],briefing:['Briefing','Briefing'],
 waveA:['Startgroep A','Wave A'],waveB:['Startgroep B','Wave B'],waveC:['Startgroep C','Wave C'],
 waveD:['Startgroep D','Wave D'],waveE:['Startgroep E','Wave E'],waveF:['Startgroep F','Wave F'],
 notes:['Bijzonderheden','Notes']
};
function html(previous,current,revision,core,templates,notices,options={}){
 if(options.organizerConfirmed!==true)throw Error('Organizer approval required.');
 const nl=notices.build(previous,current,revision,core,templates,'nl');
 const en=notices.build(previous,current,revision,core,templates,'en');
 if(nl.changes.length!==en.changes.length)throw Error('Language mismatch.');
 const v=core.validate(current);
 const source=new URL(v.guide);
 if(!['https:','http:'].includes(source.protocol))throw Error('Invalid official source.');
 const checkedOn=options.checkedOn;
 if(typeof checkedOn!=='string'||!/^20\d{2}-\d{2}-\d{2}$/.test(checkedOn))throw Error('Valid source review date required.');
 const [year,month,day]=checkedOn.split('-').map(Number);
 const date=new Date(Date.UTC(year,month-1,day));
 if(date.getUTCFullYear()!==year||date.getUTCMonth()+1!==month||date.getUTCDate()!==day)throw Error('Invalid review date.');
 const localized=(n,e)=>'<span class="nl">'+escapeHtml(n)+'</span><span class="en">'+escapeHtml(e)+'</span>';
 const rows=nl.changes.map(x=>{
  const name=names[x.key]||[x.label,x.label];
  return '<tr><th scope="row">'+localized(name[0],name[1])+'</th><td>'+escapeHtml(x.before||'—')+'</td><td>'+escapeHtml(x.after||'—')+'</td></tr>';
 }).join('');
 return [
 '<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
 '<meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"><title>'+escapeHtml(v.event)+' — TriZentro Update '+escapeHtml(revision)+'</title>',
 '<style>*{box-sizing:border-box}body{margin:0;background:#f2f7f4;color:#153d30;font-family:system-ui,Segoe UI,Arial,sans-serif;line-height:1.55}main{max-width:850px;margin:auto;padding:25px 17px 65px}',
 'header{background:#143e31;color:white;padding:26px;border-radius:18px}.kicker{font-size:12px;letter-spacing:.13em;text-transform:uppercase;color:#b4ead1;font-weight:800}h1{font-size:clamp(30px,6vw,46px);line-height:1.1;margin:10px 0}',
 '.panel{background:white;border:1px solid #d9e5dc;border-radius:15px;padding:23px;margin:20px 0}table{border-collapse:collapse;width:100%}td,th{padding:12px 8px;border-bottom:1px solid #dae9df;text-align:left;vertical-align:top}th{font-weight:780}td{font-variant-numeric:tabular-nums;overflow-wrap:anywhere}',
 '.notice{border-left:4px solid #b47e2e;background:#fff2df;padding:14px;border-radius:7px}a{color:#176a52;overflow-wrap:anywhere}.small{font-size:13px;color:#5f7166}',
 '.en{display:none}body.english .en{display:inline}body.english .nl{display:none}.controls{display:flex;gap:10px;margin:16px 0 0}button{min-height:44px;padding:8px 16px;border:1px solid #fff7;border-radius:9px;background:#315d50;color:white;font-weight:850;cursor:pointer}button[aria-pressed=true]{background:#b5f1d9;color:#153e32}',
 '@media(max-width:550px){main{padding:12px}.panel,header{padding:17px}td,th{padding:9px 6px;font-size:13px}}@media print{body{background:#fff}.controls{display:none}main{padding:0}.panel{break-inside:avoid}}',
 '</style></head><body><main><header><div class="kicker">TriZentro · '+localized('CONCEPT WIJZIGINGSBERICHT','DRAFT EVENT UPDATE')+'</div>',
 '<h1>'+escapeHtml(v.event)+'</h1><p>'+escapeHtml(v.date)+' · '+escapeHtml(revision)+'</p>',
 '<div class="controls"><button id="set-nl" aria-pressed="true" type="button">NL</button><button id="set-en" aria-pressed="false" type="button">EN</button><button type="button" id="print-page">'+localized('Print / PDF','Print / PDF')+'</button></div></header>',
 '<section class="panel"><h2>'+localized('Wat is er gewijzigd?','What changed?')+'</h2>',
 '<table><thead><tr><th>'+localized('Onderdeel','Item')+'</th><th>'+localized('Vorige versie','Previous version')+'</th><th>'+localized('Nieuwe versie','New version')+'</th></tr></thead><tbody>'+rows+'</tbody></table></section>',
 '<section class="panel"><h2>'+localized('Bron en controle','Source and review')+'</h2>',
 '<p>'+localized('Bron gecontroleerd op','Source checked on')+' <strong>'+escapeHtml(checkedOn)+'</strong></p>',
 '<p>'+localized('Officiële bron','Official source')+': <a href="'+escapeHtml(source.href)+'" rel="noopener noreferrer nofollow" target="_blank">'+escapeHtml(source.href)+'</a></p>',
 '<p class="notice">'+localized('CONCEPT: dit bericht is niet automatisch verstuurd of gepubliceerd. De organisator moet de tijden, inhoud en distributie goedkeuren. Controleer altijd eventuele latere wijzigingen bij de organisatie.','DRAFT: This notice has not been sent or published automatically. The organizer must approve the times, content and distribution. Always check for subsequent organizer updates.')+'</p></section>',
 '<p class="small">TriZentro · Static draft · No tracking or external scripts</p></main>',
 '<script>(function(){var n=document.getElementById("set-nl"),e=document.getElementById("set-en");function choose(lang){document.documentElement.lang=lang;document.body.classList.toggle("english",lang==="en");n.setAttribute("aria-pressed",String(lang==="nl"));e.setAttribute("aria-pressed",String(lang==="en"));}n.addEventListener("click",function(){choose("nl")});e.addEventListener("click",function(){choose("en")});document.getElementById("print-page").addEventListener("click",function(){window.print()});})();</script>',
 '</body></html>'
 ].join('');
}
const api={escapeHtml,html};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.TriZentroClubUpdatePage=api;
})(typeof window!=='undefined'?window:globalThis);