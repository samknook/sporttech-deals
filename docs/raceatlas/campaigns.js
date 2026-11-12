/* RaceAtlas sponsorship placements — disabled until an approved campaign exists.
 * Separate from organic event results. Show maximum 2 clearly labeled placements.
 * Never accept a campaign-supplied outbound URL or track impressions as people.
 */
(()=>{
'use strict';
const FILENAME='campaigns.json';
const dateOK=s=>/^20\d{2}-\d{2}-\d{2}$/.test(s||'');
const validId=s=>/^ra-\d{1,8}$/.test(s||'');
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const https=s=>{try{const u=new URL(s);return u.protocol==='https:'&&!u.username&&!u.password}catch{return false}};
function chooseCampaigns(config,events,today=new Date().toISOString().slice(0,10)){
 if(config?.version!==1||!Array.isArray(config.campaigns)||!Array.isArray(events))return [];
 const byId=new Map(events.map(e=>[e.id,e]));
 const seen=new Set();
 return config.campaigns.filter(c=>{
  if(!c||c.status!=='active'||!validId(c.eventId)||!dateOK(c.start)||!dateOK(c.end))return false;
  if(c.start>today||c.end<today||c.start>c.end||seen.has(c.eventId))return false;
  const event=byId.get(c.eventId);
  if(!event||!https(event.officialEventUrl)||!event.name||!event.place)return false;
  seen.add(c.eventId);
  return true;
 }).slice(0,2).map(c=>({campaign:c,event:byId.get(c.eventId)}));
}
function render(entries,slot){
 if(!slot)return;
 if(!entries.length){slot.hidden=true;slot.replaceChildren();return}
 const english=document.documentElement.lang==='en';
 slot.hidden=false;
 const title=english?'Featured race partners':'Uitgelichte wedstrijden';
 const disclosure=english?'Sponsored · Paid placement':'Gesponsord · Betaalde plaatsing';
 const action=english?'Official event website ↗':'Officiële evenementwebsite ↗';
 const intro=english?'Promotions are separate from the regular race rankings.':'Betaalde promoties beïnvloeden de gewone zoekresultaten niet.';
 slot.innerHTML='<div class="raCampaignHeading"><div><small>'+safe(disclosure)+'</small><h2>'+safe(title)+'</h2></div><p>'+safe(intro)+'</p></div>'+
  '<div class="raCampaignGrid">'+entries.map(({event})=>'<article class="raCampaignCard">'+
   '<span class="raCampaignLabel">'+safe(disclosure)+'</span>'+
   '<h3>'+safe(event.name)+'</h3><p>'+safe(event.place)+' · '+safe(event.country||'')+'</p>'+
   '<a href="'+safe(event.officialEventUrl)+'" data-ra-event="'+safe(event.id)+'" data-ra-outbound="promotion" target="_blank" rel="noopener noreferrer">'+safe(action)+'</a></article>').join('')+'</div>';
}
async function start(){
 const slot=document.getElementById('raCampaignSlot');
 if(!slot)return;
 let entries=[];
 try{
  const r=await fetch(FILENAME,{cache:'no-store',signal:AbortSignal.timeout(8000)});
  if(!r.ok)throw Error('config');
  entries=chooseCampaigns(await r.json(),window.RACEATLAS_EVENTS);
 }catch{entries=[]}
 render(entries,slot);
 window.addEventListener('raceatlas:languagechange',()=>render(entries,slot));
}
window.RaceAtlasCampaigns={chooseCampaigns,render};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
})();