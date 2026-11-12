/* RaceAtlas organizer-first sync. Public read-only Supabase records.
   Fails open: static catalogue and saved season keep working offline. */
(() => {
  'use strict';
  const BASE='https://lpzndnxloykcthbsqcet.supabase.co/rest/v1/raceatlas_event_intelligence';
  const KEY='sb_publishable_AE_Qr8VLmWb2020QCOEAKQ_Nl5mZ5Sw';
  const HTTPS = value => {
    try {
      const u=new URL(value);
      return u.protocol==='https:'&&!u.username&&!u.password;
    } catch { return false; }
  };
  const DATE = value => /^20\d{2}-\d{2}-\d{2}$/.test(value||'');
  const fmtDate = value => String(value||'').slice(0,10);
  function update(records, events=window.RACEATLAS_EVENTS){
    if (!Array.isArray(events)||!Array.isArray(records))return {updated:0};
    const byId=new Map(events.map(e=>[e.id,e]));
    let updated=0;
    for(const r of records){
      const e=byId.get(r.event_id);
      if(!e)continue;
      let changed=false;
      const newerAutoDate=Boolean(e.autoEventVerifiedOn) && String(r.last_verified_at||'').slice(0,10)<=e.autoEventVerifiedOn;
      // A link identified as a candidate is not equivalent to verified event facts.
      if(!newerAutoDate && HTTPS(r.official_event_url) && ['candidate','verified'].includes(r.organizer_link_status)){
        if(e.officialEventUrl!==r.official_event_url){e.officialEventUrl=r.official_event_url;changed=true}
        e.organizerLinkStatus=r.organizer_link_status;
      }
      if(!newerAutoDate && r.date_confidence==='official' && DATE(r.start_date) && r.start_date!=='null'){
        if(e.date!==r.start_date || e.dateEvidence!=='official'){
          e.date=r.start_date;
          e.dateEvidence='official';
          changed=true;
        }
      }
      // Publish selected facts only if the underlying date has an official evidence flag.
      if(r.date_confidence==='official'){
        if(r.distance_label && r.distance_label.length<=150 && e.distance!==r.distance_label){
          e.distance=r.distance_label;changed=true;
        }
        if(['sold_out','closed'].includes(r.registration_status)&&r.last_verified_at){
          if(e.registrationStatus!==r.registration_status){
            e.registrationStatus=r.registration_status;changed=true;
          }
          e.registrationStatusNote='Status volgens laatst vastgelegde organisatorbron; controleer actuele beschikbaarheid op de officiële website.';
        }
        if(r.registration_closes_at && DATE(fmtDate(r.registration_closes_at))){
          const date=fmtDate(r.registration_closes_at);
          if(e.registrationEndDate!==date){e.registrationEndDate=date;changed=true}
        }
        if(typeof r.price_eur==='number'&&Number.isFinite(r.price_eur)&&r.price_eur>=0){
          if(e.priceEur!==r.price_eur){e.priceEur=r.price_eur;changed=true}
          e.priceStatus='known';
        }
        if(r.last_verified_at){
          const checked=fmtDate(r.last_verified_at);
          if(DATE(checked)&&!newerAutoDate){e.sourceCheckedOn=checked;changed=true}
        }
        if(!newerAutoDate && HTTPS(r.verification_source_url) && ['organizer','unclassified'].includes(r.source_category) && r.organizer_link_status==='verified'){
          e.source=r.verification_source_url;
          changed=true;
        }
      }
      if(changed)updated++;
    }
    return {updated};
  }
  async function load(){
    const events=window.RACEATLAS_EVENTS;
    if(!Array.isArray(events))return;
    const fields='event_id,official_event_url,organizer_link_status,date_confidence,start_date,registration_status,registration_closes_at,distance_label,price_eur,last_verified_at,verification_source_url,source_category';
    try{
      const response=await fetch(BASE+'?select='+fields+'&publish_status=eq.published&limit=600',{
        headers:{apikey:KEY,Accept:'application/json'},
        signal:AbortSignal.timeout(10000)
      });
      if(!response.ok)throw Error('HTTP '+response.status);
      const result=update(await response.json(),events);
      if(result.updated && typeof window.RaceAtlasRefresh==='function')window.RaceAtlasRefresh();
      window.RaceAtlasOrganizerSync={status:'ok',updated:result.updated};
    }catch{
      window.RaceAtlasOrganizerSync={status:'offline',updated:0};
    }
  }
  window.RaceAtlasOrganizerSyncUpdate=update;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});
  else load();
})();