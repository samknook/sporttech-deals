/* RaceAtlas privacy-first aggregate outbound analytics via Supabase Edge.
 * Stores no visitor identifiers, IPs, email addresses or cookies in RaceAtlas.
 * Server-side logs of a hosting provider are subject to that provider's controls.
 */
(() => {
  'use strict';
  // Sends only event ID + link type. No identity, cookies, email, or IP in stored rows.
  const ENDPOINT = 'https://lpzndnxloykcthbsqcet.supabase.co/functions/v1/raceatlas-track-outbound';
  const kinds = new Set(['registration','organizer','source']);
  function enabled(){return /^https:\/\//.test(ENDPOINT)}
  function track(eventId,kind){
    if(!enabled()||!/^ra-\d{1,8}$/.test(eventId)||!kinds.has(kind))return false;
    const url = ENDPOINT;
    const payload = JSON.stringify({eventId,kind});
    try{
      if(navigator.sendBeacon) {
        const blob=new Blob([payload],{type:'text/plain;charset=UTF-8'});
        return navigator.sendBeacon(url,blob);
      }
      fetch(url,{method:'POST',mode:'cors',keepalive:true,headers:{'Content-Type':'text/plain'},body:payload}).catch(()=>{});
      return true;
    }catch{return false}
  }
  document.addEventListener('click',event=>{
    const anchor=event.target.closest('a[data-ra-outbound]');
    if(!anchor)return;
    track(anchor.dataset.raEvent,anchor.dataset.raOutbound);
  },{capture:true});
  window.RaceAtlasTracking={track,enabled};
})();
