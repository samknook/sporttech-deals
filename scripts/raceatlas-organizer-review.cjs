#!/usr/bin/env node
/* RaceAtlas organizer-first research queue. Read-only, no guessed official URLs. */
'use strict';
const fs=require('node:fs');
const BASE='https://lpzndnxloykcthbsqcet.supabase.co/rest/v1/raceatlas_organizer_research_queue';
const KEY='sb_publishable_AE_Qr8VLmWb2020QCOEAKQ_Nl5mZ5Sw';
function clean(value){return String(value??'').replace(/[\r\n\t]+/g,' ').trim()}
function csvCell(value){const raw=clean(value);const safe=/^[=+@-]/.test(raw)?"'"+raw:raw;return '"'+safe.replace(/"/g,'""')+'"'}
function researchQuery(event){
 return [event.event_name,event.city,event.country_code,'organisator officiële website inschrijven'].filter(Boolean).join(' ');
}
function priority(event){
 const n=Number(event.research_priority);
 return Number.isFinite(n)&&n>=1&&n<=5?n:5;
}
function organize(rows){
 if(!Array.isArray(rows))throw Error('Expected array');
 const seen=new Set();
 return rows.filter(row=>row&&/^ra-\d{1,8}$/.test(row.event_id||'')&&!seen.has(row.event_id)&&seen.add(row.event_id))
 .sort((a,b)=>priority(a)-priority(b)||String(a.listed_date||'9999').localeCompare(String(b.listed_date||'9999'))||a.event_name.localeCompare(b.event_name));
}
function build(rows){
 const ordered=organize(rows);
 const labels=['event_id','event_name','sport','city','country_code','listed_date','date_confidence','organizer_link_status','official_event_url','discovery_source_url','research_priority','research_query'];
 const csv=[labels.map(csvCell).join(',')];
 for(const e of ordered){
  const data={...e,research_query:researchQuery(e)};
  csv.push(labels.map(k=>csvCell(data[k])).join(','));
 }
 const counts={total:ordered.length,missing:ordered.filter(e=>e.organizer_link_status==='missing').length,candidate:ordered.filter(e=>e.organizer_link_status==='candidate').length,verified:ordered.filter(e=>e.organizer_link_status==='verified').length,other:ordered.filter(e=>!['missing','candidate','verified'].includes(e.organizer_link_status)).length};
 const high=ordered.filter(e=>priority(e)<=2).slice(0,30);
 const markdown=['# RaceAtlas organizer-first review queue','',
 'All status labels are database classifications, not live verification. No competitor calendar is accepted as an organizer source.','',
 'Total: '+counts.total+' · Missing: '+counts.missing+' · Candidates: '+counts.candidate+' · Verified link evidence: '+counts.verified,'',
 '## Highest priority','',
 '| Event | Listed date | Status | Search |','|---|---|---|---|',
 ...high.map(e=>'| '+clean(e.event_name).replace(/\|/g,'/')+' | '+clean(e.listed_date||'Unknown')+' | '+clean(e.organizer_link_status)+' | [Find organizer](https://www.google.com/search?q='+encodeURIComponent(researchQuery(e))+') |'),
 '','Do not automatically change date_confidence, registration_status or price. Confirm on an event-specific official page before publishing.',''].join('\n');
 return {counts,csv:csv.join('\n')+'\n',markdown,items:ordered};
}
async function run(fetchImpl=fetch){
 const response=await fetchImpl(BASE+'?select=event_id,event_name,sport,city,country_code,listed_date,date_confidence,organizer_link_status,official_event_url,discovery_source_url,research_priority&order=research_priority.asc,event_id.asc&limit=1000',{headers:{apikey:KEY,Accept:'application/json'},signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw Error('Review queue HTTP '+response.status);
 return build(await response.json());
}
if(require.main===module)run().then(data=>{
 fs.mkdirSync('out',{recursive:true});
 fs.writeFileSync('out/raceatlas-organizer-review.csv',data.csv);
 fs.writeFileSync('out/raceatlas-organizer-review.md',data.markdown);
 if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,data.markdown);
 console.log(JSON.stringify(data.counts));
}).catch(e=>{console.error(e.message);process.exitCode=1});
module.exports={build,organize,researchQuery,priority,run};
