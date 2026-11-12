/* RaceAtlas verified event editions from approved organizer metadata.
 * Source of truth is auto-events.json, generated daily by GitHub Actions.
 * Candidate/disputed results are NEVER displayed automatically.
 */
(()=>{
 'use strict';
 const FILE='auto-events.json';
 const isHttps=value=>{
  try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password}catch{return false}
 };
 const validDate=value=>/^20\d{2}-\d{2}-\d{2}$/.test(value||'');
 const clean=value=>typeof value==='string'?value.trim():'';
 const admitted=new Set(['Hardlopen','Fietsen','Triatlon']);
 function apply(payload,list=window.RACEATLAS_EVENTS){
  if(!list||!Array.isArray(list)||!payload||payload.version!==1)return {added:0,updated:0};
  const byId=new Map(list.map(e=>[e.id,e]));
  let added=0,updated=0;
  const today=new Date().toISOString().slice(0,10);
  for(const record of Array.isArray(payload.updates)?payload.updates:[]){
   const e=byId.get(record?.id);
   if(!e||!validDate(record.date)||!isHttps(record.officialEventUrl)||!isHttps(record.source))continue;
   if(clean(e.name)!==clean(record.name))continue;
   if(record.date.slice(0,4)!==String(e.date||'').slice(0,4))continue;
   if(e.date!==record.date){
    e.date=record.date;
    e.dateEvidence='official';
    e.sourceCheckedOn=record.verifiedOn;
    e.officialEventUrl=record.officialEventUrl;
    e.source=record.source;
    e.autoEventVerifiedOn=record.verifiedOn;
    updated++;
   }
  }
  for(const row of Array.isArray(payload.events)?payload.events:[]){
   if(!row||!/^ra-8\d{7}$/.test(row.id)||byId.has(row.id))continue;
   if(!validDate(row.date)||row.date<today||!isHttps(row.officialEventUrl)||!isHttps(row.source))continue;
   if(!admitted.has(row.sport)||!clean(row.name)||!clean(row.place)||!clean(row.country))continue;
   if(row.sourceMethod!=='official_jsonld_event'||row.dateEvidence!=='official')continue;
   // No registration/price claims are derived from structured event metadata.
   const event={
    id:row.id,date:row.date,name:clean(row.name).slice(0,145),
    place:clean(row.place).slice(0,95),sport:row.sport,
    discipline:clean(row.discipline)||'Weg',distance:'Afstanden bij organisator',
    country:row.country,major:false,
    officialEventUrl:row.officialEventUrl,source:row.source,
    dateEvidence:'official',sourceCheckedOn:row.verifiedOn,
    registrationStatus:'check',status:'source',sourceType:'organizer',
    autoDiscovered:true,autoEventVerifiedOn:row.verifiedOn
   };
   list.push(event);byId.set(event.id,event);added++;
  }
  return {added,updated};
 }
 async function start(){
  try{
   const r=await fetch(FILE,{cache:'no-cache',signal:AbortSignal.timeout(8000)});
   if(!r.ok)return;
   const result=apply(await r.json());
   window.RaceAtlasAutoEventsStatus=result;
   if((result.added||result.updated)&&typeof window.RaceAtlasRefresh==='function')window.RaceAtlasRefresh();
  }catch{window.RaceAtlasAutoEventsStatus={added:0,updated:0,offline:true}}
 }
 window.RaceAtlasAutoEventsApply=apply;
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
