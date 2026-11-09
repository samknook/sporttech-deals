/* RaceAtlas privacy-first outbound analytics (not live until Worker URL is configured).
 * Stores no visitor identifiers, IPs, email addresses or cookies in RaceAtlas.
 * Server-side logs of a hosting provider are subject to that provider's controls.
 */
(() => {
  'use strict';
  // Leave empty until the Worker, D1 and privacy information have been verified.
  const ENDPOINT = '';
  const kinds = new Set(['registration','organizer','source']);
  function enabled(){return /^https:\/\//.test(ENDPOINT)}
  function track(eventId,kind){
    if(!enabled()||!/^ra-\d{1,6}$/.test(eventId)||!kinds.has(kind))return false;
    const url = ENDPOINT.replace(/\/$/,'')+'/track';
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
