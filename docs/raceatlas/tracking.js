/* RaceAtlas aggregate analytics. No visitor IDs, cookies or per-visitor activity records.
 * These totals represent page loads, visible cards, detail openings and outbound actions.
 * They do NOT represent unique visitors or confirmed registrations.
 */
(() => {
  'use strict';
  const ENDPOINT='https://lpzndnxloykcthbsqcet.supabase.co/functions/v1/raceatlas-track-outbound';
  const KINDS=new Set(['registration','organizer','source','promotion','site_view','card_view','detail_view','season_save','radar_intent']);
  const CARD_ID=/^ra-\d{1,8}$/;
  const seenCards=new Set();
  let siteRecorded=false;
  let observer=null;
  function enabled(){
    return typeof location!=='undefined'&&['samknook.github.io','trizentro.com','www.trizentro.com'].includes(location.hostname)&&/^https:\/\//.test(ENDPOINT);
  }
  function valid(eventId,kind){
    return KINDS.has(kind)&&((eventId==='ra-site'&&kind==='site_view')||(CARD_ID.test(eventId)&&kind!=='site_view'));
  }
  // Store only broad sources. Never transmit a full referrer, query string,
  // IP address, device fingerprint or visitor identifier.
  const CHANNELS=new Set(['instagram','facebook','whatsapp','google','bing','search_other','social_other','email','referral','direct','campaign_other']);
  function acquisition(){
    let channel='direct',campaign='none';
    try{
      const params=new URLSearchParams(location.search);
      const tagged=(params.get('utm_source')||'').toLowerCase().trim();
      const sourceMap={ig:'instagram',instagram:'instagram',fb:'facebook',facebook:'facebook',wa:'whatsapp',whatsapp:'whatsapp',google:'google',bing:'bing',newsletter:'email',email:'email'};
      if(sourceMap[tagged])channel=sourceMap[tagged];
      else if(tagged)channel='campaign_other';
      else if(document.referrer){
        const host=new URL(document.referrer).hostname.toLowerCase();
        if(/(^|\\.)instagram\\.com$|(^|\\.)l\\.instagram\\.com$/.test(host))channel='instagram';
        else if(/(^|\\.)facebook\\.com$|(^|\\.)l\\.facebook\\.com$/.test(host))channel='facebook';
        else if(/(^|\\.)wa\\.me$|(^|\\.)whatsapp\\.com$/.test(host))channel='whatsapp';
        else if(/(^|\\.)google\\.[a-z.]+$/.test(host))channel='google';
        else if(/(^|\\.)bing\\.com$/.test(host))channel='bing';
        else if(/(^|\\.)(duckduckgo\\.com|ecosia\\.org|qwant\\.com)$/.test(host))channel='search_other';
        else if(/(^|\\.)(tiktok\\.com|linkedin\\.com|pinterest\\.com|threads\\.net)$/.test(host))channel='social_other';
        else if(!['trizentro.com','www.trizentro.com','samknook.github.io'].includes(host))channel='referral';
      }
      const taggedCampaign=(params.get('utm_campaign')||'').toLowerCase();
      if(/^[a-z0-9_-]{1,48}$/.test(taggedCampaign))campaign=taggedCampaign;
    }catch{}
    return {channel:CHANNELS.has(channel)?channel:'direct',campaign};
  }
  // Keep only an anonymous source label in this browser tab during navigation.
  // No user ID, IP, session token or referrer URL is stored or transmitted.
  const ATTRIBUTION_KEY='trizentro:source-tab-v1';
  function conversionSource(){
    const current=acquisition();
    try{
      const hasTag=new URLSearchParams(location.search).has('utm_source');
      if(hasTag&&current.channel!=='direct'){
        sessionStorage.setItem(ATTRIBUTION_KEY,JSON.stringify({...current,at:Date.now()}));
        return current;
      }
      const saved=JSON.parse(sessionStorage.getItem(ATTRIBUTION_KEY)||'null');
      if(saved&&Date.now()-saved.at<30*60*1000&&CHANNELS.has(saved.channel)&&/^[a-z0-9_-]{1,48}$/.test(saved.campaign))return {channel:saved.channel,campaign:saved.campaign};
      sessionStorage.removeItem(ATTRIBUTION_KEY);
    }catch{}
    return current;
  }
  function track(eventId,kind){
    if(!enabled()||!valid(eventId,kind))return false;
    const payload=JSON.stringify(kind==='site_view'?{eventId,kind,...conversionSource()}:(kind==='season_save'||kind==='radar_intent'||kind==='detail_view')?{eventId,kind,...conversionSource()}:{eventId,kind});
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
    const radar=event.target?.closest?.('a[data-ra-radar]');
    if(radar&&CARD_ID.test(radar.dataset.raRadar))track(radar.dataset.raRadar,'radar_intent');
  },{capture:true});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='hidden')siteView()});
  function start(){
    siteView();
    observeCards();
    const modal=document.getElementById?.('raceatlasDetails');
    if(modal?.dataset?.raEvent)detailView(modal.dataset.raEvent);
    // Canonical individual race pages have no modal; record their page load
    // once using the event ID already embedded by the page generator.
    const raceId=window.TriZentroEventSaveId;
    if(CARD_ID.test(raceId)&&document.visibilityState!=='hidden')detailView(raceId);
  }
  window.RaceAtlasTracking={track,enabled,siteView,detailView,observeCards};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();