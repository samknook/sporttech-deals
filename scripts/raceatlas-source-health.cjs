#!/usr/bin/env node
/* RaceAtlas source health — automated reachability and content-change triage.
 * No race date, registration availability, or verified_at field is modified here.
 * Only GET HTTPS public URLs. Never follow redirects to private/internal hosts.
 */
'use strict';
const fs=require('node:fs');
const crypto=require('node:crypto');
const net=require('node:net');
const API='https://lpzndnxloykcthbsqcet.supabase.co/rest/v1/raceatlas_quality_overview';
const PUBLISHABLE_KEY='sb_publishable_AE_Qr8VLmWb2020QCOEAKQ_Nl5mZ5Sw';
const MAX_URLS=22;
const MAX_BYTES=220000;
const TIMEOUT_MS=12000;
function safeUrl(input) {
 try {
  const u=new URL(input);
  if(u.protocol!=='https:'||u.username||u.password||u.port&&u.port!=='443')return null;
  const host=u.hostname.toLowerCase();
  if(net.isIP(host)||host==='localhost'||host.endsWith('.localhost')||host.endsWith('.local')||host.endsWith('.internal')||host.endsWith('.test')||host==='metadata.google.internal'||host.includes('..'))return null;
  return u.toString();
 } catch{return null}
}
function classify(result) {
 if(result.error)return 'error';
 if(result.status>=300&&result.status<400)return 'redirect_needs_review';
 if(result.status===403||result.status===429)return 'blocked_or_rate_limited';
 if(result.status>=400)return 'http_error';
 if(result.contentType&&!(/html|text|pdf/i).test(result.contentType))return 'unexpected_content_type';
 return 'reachable_unverified';
}
async function fetchLimited(url,fetchImpl=fetch) {
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),TIMEOUT_MS);
 try {
  const response=await fetchImpl(url,{method:'GET',redirect:'manual',signal:controller.signal,
    headers:{'User-Agent':'RaceAtlasSourceQuality/1.0 (+https://samknook.github.io/sporttech-deals/raceatlas/gegevenskwaliteit.html)','Accept':'text/html,application/pdf,text/plain;q=0.8,*/*;q=0.3'}});
  const location=response.headers.get('location');
  const contentType=response.headers.get('content-type')||'';
  if(response.status>=300&&response.status<400) {
   return {status:response.status,contentType,redirectLocation:safeUrl(location||'')||null,note:'Redirect not followed automatically'};
  }
  if(!response.ok)return {status:response.status,contentType};
  const reader=response.body?.getReader();
  if(!reader)return {status:response.status,contentType,note:'No readable body'};
  const hash=crypto.createHash('sha256');let bytes=0,cut=false;
  try {
   while(true){
    const {done,value}=await reader.read();
    if(done)break;
    if(bytes+value.length>MAX_BYTES){const allowed=value.subarray(0,MAX_BYTES-bytes);hash.update(allowed);bytes+=allowed.length;cut=true;break}
    bytes+=value.length;hash.update(value);
   }
  } finally {await reader.cancel().catch(()=>{})}
  return {status:response.status,contentType,bytes,partial:cut,contentHash:hash.digest('hex')};
 } catch(e){return {error:e.name==='AbortError'?'timeout':'network_error'}}
 finally{clearTimeout(timer)}
}
async function run(opts={}){
 const fetchImpl=opts.fetchImpl||fetch;
 const listUrl=API+'?select=event_id,event_name,review_bucket,review_priority,verification_source_url,official_event_url&review_bucket=eq.urgent&order=event_id.asc&limit=100';
 const response=await fetchImpl(listUrl,{headers:{apikey:PUBLISHABLE_KEY,Accept:'application/json'},signal:AbortSignal.timeout(TIMEOUT_MS)});
 if(!response.ok)throw Error('Public quality API returned HTTP '+response.status);
 const items=await response.json();
 if(!Array.isArray(items))throw Error('Expected array of quality records');
 const selected=items.filter(x=>x.review_bucket==='urgent').sort((a,b)=>String(a.event_id).localeCompare(String(b.event_id))).slice(0,MAX_URLS);
 const cache=new Map(), results=[];
 const sourceUsage=new Map();
 for(const event of selected){const u=safeUrl(event.official_event_url);if(u)sourceUsage.set(u,(sourceUsage.get(u)||0)+1)}
 for(const event of selected){
  const raw=event.official_event_url;
  const url=safeUrl(raw);
  let outcome;
  if(!url)outcome={error:'official_organizer_source_missing'};
  else if(cache.has(url))outcome=cache.get(url);
  else {outcome=await fetchLimited(url,fetchImpl);cache.set(url,outcome)}
  results.push({event_id:event.event_id,event_name:event.event_name,source_url:url,source_specificity:!url?'missing':sourceUsage.get(url)>1?'shared_catalog_page':'individual_source_page',status:classify(outcome),...outcome});
 }
 return {generated_at:new Date().toISOString(),scope:'urgent_unverified_events',events_scanned:results.length,unique_sources_checked:cache.size,disclaimer:'A successful HTTP response does not verify event dates, registration status, prices or ticket availability.',results};
}
function summary(report){
 const counts={};for(const row of report.results)counts[row.status]=(counts[row.status]||0)+1;
 return ['## RaceAtlas source health review','',`Events scanned: ${report.events_scanned}`,`Unique HTTPS sources checked: ${report.unique_sources_checked}`,'',...Object.entries(counts).map(([k,v])=>'- '+k+': '+v),'','Reachability alone never confirms a race date or registration availability.','','### Events requiring manual attention',...report.results.filter(r=>r.status!=='reachable_unverified'||r.source_specificity==='shared_catalog_page').map(r=>'- '+r.event_id+' — '+r.event_name+': '+r.status+' ('+r.source_specificity+')'),''];
}
if(require.main===module){
 run().then(report=>{
  fs.mkdirSync('out',{recursive:true});
  fs.writeFileSync('out/raceatlas-source-health.json',JSON.stringify(report,null,2)+'\n');
  fs.writeFileSync('out/raceatlas-source-health.md',summary(report));
  if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,summary(report));
  process.stdout.write(summary(report));
 }).catch(error=>{console.error('Source health failed:',error.message);process.exitCode=1});
}
module.exports={safeUrl,classify,fetchLimited,run,summary};
