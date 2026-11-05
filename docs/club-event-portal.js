/* Portable TriZentro participant page. Offline, static, no analytics or data uploads. */
(function(root){
'use strict';
function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function documentHtml(analysis,options){
 if(!analysis||!analysis.values||!Array.isArray(analysis.events)||!Array.isArray(analysis.warnings))throw Error('Invalid briefing.');
 if(analysis.warnings.length)throw Error('Resolve all review warnings first.');
 if(!options||options.organizerConfirmed!==true)throw Error('Review confirmation required.');
 const v=analysis.values;
 if(!v.guide)throw Error('Official source link is required.');
 const u=new URL(v.guide);
 if(!['https:','http:'].includes(u.protocol))throw Error('Invalid source URL.');
 const issued=options.issuedAt&&/^\d{4}-\d{2}-\d{2}$/.test(options.issuedAt)?options.issuedAt:new Date().toISOString().slice(0,10);
 const dual=(nl,en)=>'<span class="nl">'+esc(nl)+'</span><span class="en">'+esc(en)+'</span>';
 const rows=analysis.events.map(e=>'<tr><td class="time">'+esc(e.time)+'</td><td>'+dual(e.nl,e.en)+'</td></tr>').join('');
 return [
 '<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
 '<meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer">',
 '<title>'+esc(v.event)+' — TriZentro Participant Brief</title>',
 '<style>',
 ':root{font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#15382d;background:#eff6f1}*{box-sizing:border-box}body{margin:0}',
 'main{max-width:840px;margin:auto;padding:20px 16px 65px}header{background:#153d32;color:#fff;padding:26px;border-radius:18px}h1{font-size:clamp(30px,6vw,46px);line-height:1.1;margin:9px 0}h2{margin-top:0}',
 '.eyebrow{text-transform:uppercase;letter-spacing:.13em;color:#b9ead7;font-size:12px;font-weight:850}.meta{color:#d9ede5}',
 '.panel{margin:20px 0;padding:24px;background:#fff;border:1px solid #d7e7dc;border-radius:16px}',
 'table{width:100%;border-collapse:collapse}td,th{text-align:left;border-bottom:1px solid #dce9e0;padding:14px 8px;vertical-align:top}td.time{font-weight:850;font-variant-numeric:tabular-nums;white-space:nowrap}',
 'p{line-height:1.6}a{color:#12654e;overflow-wrap:anywhere}.en{display:none}body.english .en{display:inline}body.english .nl{display:none}',
 '.controls{display:flex;gap:10px;margin-top:18px}button{min-width:63px;min-height:44px;border-radius:10px;background:#285a4b;color:#fff;border:1px solid #ffffff77;font-weight:850;cursor:pointer}button[aria-pressed=true]{background:#a4efd1;color:#123b31}',
 '.notice{background:#fff2dc;border-left:4px solid #b88636;padding:15px;border-radius:8px}.small{font-size:13px;color:#62756d}',
 '@media(max-width:550px){main{padding:10px 11px 35px}.panel{padding:17px}header{padding:21px}}',
 '@media print{body{background:white}.controls{display:none}main{padding:0}.panel{break-inside:avoid}}',
 '</style></head><body><main>',
 '<header><div class="eyebrow">TriZentro · Event briefing snapshot</div><h1>'+esc(v.event)+'</h1>',
 '<p class="meta">'+esc(v.date)+' · '+esc(v.venue||'—')+'</p>',
 '<div class="controls" role="group" aria-label="Language"><button type="button" id="set-nl" aria-pressed="true">NL</button><button type="button" id="set-en" aria-pressed="false">EN</button></div></header>',
 '<section class="panel"><h2>'+dual('Wedstrijdschema','Event timeline')+'</h2>',
 '<p class="small">'+dual('Tijden overgenomen uit de informatie van de organisator. Controleer wijzigingen bij de organisatie.','Times entered from organizer information. Check updates with the organizer.')+'</p>',
 '<table><thead><tr><th>'+dual('Tijd','Time')+'</th><th>'+dual('Onderdeel','Activity')+'</th></tr></thead><tbody>'+rows+'</tbody></table></section>',
 '<section class="panel"><h2>'+dual('Praktische informatie','Practical information')+'</h2><p>'+esc(v.notes||'—')+'</p>',
 '<p><strong>'+dual('Officiële bron','Official source')+':</strong> <a href="'+esc(u.href)+'" rel="noopener noreferrer nofollow" target="_blank">'+esc(u.href)+'</a></p>',
 '<p class="small">'+dual('Document gemaakt op','Document generated on')+' '+esc(issued)+'</p>',
 '<div class="notice">'+dual('Let op: dit is een statische momentopname, gecontroleerd door de maker. Geen automatisch bijgewerkte officiële melding. De organisator blijft verantwoordelijk voor tijden, regels en wijzigingen. Raadpleeg de officiële bron.', 'Important: this is a static snapshot reviewed by its creator, not an automatically updated official notice. The organizer remains responsible for rules, times and updates. Consult the official source.')+'</div></section>',
 '<p class="small">Created using TriZentro · Independent prototype · No tracking</p></main>',
 '<script>(function(){var n=document.getElementById("set-nl"),e=document.getElementById("set-en");function set(l){document.body.classList.toggle("english",l==="en");document.documentElement.lang=l;n.setAttribute("aria-pressed",String(l==="nl"));e.setAttribute("aria-pressed",String(l==="en"));}n.addEventListener("click",function(){set("nl")});e.addEventListener("click",function(){set("en")});})();</script>',
 '</body></html>'
 ].join('');
}
function download(filename,content,doc=root.document){
 const url=URL.createObjectURL(new Blob([content],{type:'text/html;charset=utf-8'}));
 const link=doc.createElement('a');link.href=url;link.download=filename;
 doc.body.appendChild(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
const api={esc,documentHtml,download};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.TriZentroEventPortal=api;
})(typeof window!=='undefined'?window:globalThis);