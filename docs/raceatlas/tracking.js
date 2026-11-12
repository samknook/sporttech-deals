/* RaceAtlas aggregate analytics. No visitor IDs, cookies or per-visitor activity records.
 * These totals represent page loads, visible cards, detail openings and outbound actions.
 * They do NOT represent unique visitors or confirmed registrations.
 */
(() => {
  'use strict';
  const ENDPOINT='https://lpzndnxloykcthbsqcet.supabase.co/functions/v1/raceatlas-track-outbound';
  const KINDS=new Set(['registration','organizer','source','promotion','site_view','card_view','detail_view']);
  const CARD_ID=/^ra-\d{1,8}$/;
  const seenCards=new Set();
  let siteRecorded=false;
  let observer=null;
  function enabled(){
    return typeof location!=='undefined'&&location.hostname==='samknook.github.io'&&/^https:\/\//.test(ENDPOINT);
  }
  function valid(eventId,kind){
    return KINDS.has(kind)&&((eventId==='ra-site'&&kind==='site_view')||(CARD_ID.test(eventId)&&kind!=='site_view'));
  }
  function track(eventId,kind){
    if(!enabled()||!valid(eventId,kind))return false;
    const payload=JSON.stringify({eventId,kind});
    try{
      if(navigator.sendBeacon){
        const blob=new Blob([payload],{type:'text/plain;charset=UTF-8'});
        if(navigator.sendBeacon(ENDPOINT,blob))return true;
      }
      fetch(ENDPOINT,{method:'POST',mode:'cors',keepalive:true,headers:{'Content-Type':'text/plain'},body:payload}).catch(()=>{});
      return true;
    }catch{return false}
  }
  function siteView(){
    if(siteRecorded||document.visibilityState==='hidden')return;
    if(track('ra-site','site_view'))siteRecorded=true;
  }
  function detailView(eventId){
    return track(eventId,'detail_view');
  }
  function observeCards(root=document){
    if(typeof IntersectionObserver==='undefined'||!root||!root.querySelectorAll)return;
    if(!observer){
      observer=new IntersectionObserver(entries=>{
        for(const entry of entries){
          if(!entry.isIntersecting||entry.intersectionRatio<0.25||document.visibilityState==='hidden')continue;
          const eventId=entry.target?.dataset?.raEvent;
          if(CARD_ID.test(eventId)&&!seenCards.has(eventId)){
            if(track(eventId,'card_view'))seenCards.add(eventId);
          }
          observer.unobserve(entry.target);
        }
      },{threshold:[0,0.25,0.5]});
    }
    for(const card of root.querySelectorAll('article.card[data-ra-event]')){
      if(CARD_ID.test(card.dataset.raEvent)&&!seenCards.has(card.dataset.raEvent))observer.observe(card);
    }
  }
  document.addEventListener('click',event=>{
    const anchor=event.target?.closest?.('a[data-ra-outbound]');
    if(anchor)track(anchor.dataset.raEvent,anchor.dataset.raOutbound);
  },{capture:true});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='hidden')siteView()});
  function start(){
    siteView();
    observeCards();
    const modal=document.getElementById?.('raceatlasDetails');
    if(modal?.dataset?.raEvent)detailView(modal.dataset.raEvent);
  }
  window.RaceAtlasTracking={track,enabled,siteView,detailView,observeCards};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();