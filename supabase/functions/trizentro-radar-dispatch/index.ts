/* TriZentro daily verified-change email dispatcher.
 * Requires RADAR_CRON_SECRET and verified RESEND_FROM; all writes service-role only.
 * Trigger from scheduled workflow, never from untrusted browser traffic.
 */
const project=Deno.env.get('SUPABASE_URL')||'https://lpzndnxloykcthbsqcet.supabase.co';
const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const resend=Deno.env.get('RESEND_API_KEY')||'';
const sender=Deno.env.get('RESEND_FROM')||'';
const secret=Deno.env.get('RADAR_CRON_SECRET')||'';
const live=Deno.env.get('RADAR_EMAIL_LIVE')==='true'&&!!key&&!!resend&&!!sender&&!!secret;
const api=(table:string,init:RequestInit={})=>fetch(project+'/rest/v1/'+table,{...init,headers:{'apikey':key,'Authorization':'Bearer '+key,'Content-Type':'application/json',...(init.headers||{})},signal:AbortSignal.timeout(8000)});
function text(v:unknown){return String(v??'')}
async function hash(v:string){const h=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v));return Array.from(new Uint8Array(h),n=>n.toString(16).padStart(2,'0')).join('')}
function reply(status:number,data:Record<string,unknown>){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}})}
async function jsonRows(query:string){const r=await api(query);if(!r.ok)throw Error('db_read_'+r.status);return await r.json()}
async function write(table:string,body:unknown){const r=await api(table,{method:'POST',headers:{Prefer:'resolution=merge-duplicates'},body:JSON.stringify(body)});if(!r.ok)throw Error('db_write_'+r.status)}
const manage=t=>'https://trizentro.com/raceatlas/alerts-beheren.html?action=unsubscribe&token='+encodeURIComponent(t);
async function signedUnsubscribe(id:string){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);const sig=await crypto.subtle.sign('HMAC',k,new TextEncoder().encode('unsubscribe|'+id));return id+'.'+Array.from(new Uint8Array(sig),v=>v.toString(16).padStart(2,'0')).join('')}
async function send(to:string,subject:string,content:string){
 const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+resend,'Content-Type':'application/json'},body:JSON.stringify({from:sender,to:[to],subject,text:content}),signal:AbortSignal.timeout(10000)});
 return r.ok;
}
Deno.serve(async req=>{
 if(req.method!=='POST')return reply(405,{ok:false});
 const supplied=req.headers.get('x-radar-secret')||'';
 if(!secret||supplied.length!==secret.length||!(await hash(supplied)===await hash(secret)))return reply(403,{ok:false});
 if(!live)return reply(503,{ok:false,error:'radar_not_configured'});
 let seeded=0,changes=0,emails=0,failures=0;
 try{
  // Current facts from the curated, published race intelligence table.
  const races=await jsonRows('raceatlas_event_intelligence?publish_status=eq.published&select=event_id,event_name,registration_status,registration_opens_at,start_date,date_confidence,last_verified_at,evidence_kind&limit=1000');
  const previous=await jsonRows('trizentro_radar_snapshots?select=*&limit=1000');
  const byId=new Map(previous.map((x:any)=>[x.event_id,x]));
  for(const race of races){
   const state={event_id:race.event_id,registration_status:race.registration_status||'unknown',registration_opens_at:race.registration_opens_at||null,race_date:race.date_confidence==='official'?race.start_date:null,verified_at:race.last_verified_at||null,updated_at:new Date().toISOString()};
   const prior=byId.get(race.event_id);
   if(!prior){await write('trizentro_radar_snapshots?on_conflict=event_id',state);seeded++;continue}
   const trustedEvidence=new Set(['organizer_event_page','organizer_calendar','official_public_notice','official_partner_event_page']);
   const eligible=trustedEvidence.has(race.evidence_kind)&&!!race.last_verified_at&&(!prior.verified_at||Date.parse(race.last_verified_at)>Date.parse(prior.verified_at));
   const notes:string[]=[];
   // Never infer an opening merely from a link; only notify after a fresh source verification.
   if(eligible&&race.registration_status==='open'&&prior.registration_status!=='open')notes.push('Inschrijving als geopend bevestigd');
   if(eligible&&race.registration_opens_at&&race.registration_opens_at!==prior.registration_opens_at)notes.push('Nieuw bevestigd inschrijfmoment: '+new Date(race.registration_opens_at).toLocaleDateString('nl-NL'));
   if(eligible&&race.date_confidence==='official'&&race.start_date&&race.start_date!==prior.race_date)notes.push('Wedstrijddatum bevestigd of gewijzigd: '+race.start_date);
   if(!notes.length){
    // Update the baseline even when nothing relevant changed.
    await write('trizentro_radar_snapshots?on_conflict=event_id',state);continue;
   }
   changes++;
   const signature=await hash(race.event_id+'|'+race.last_verified_at+'|'+notes.join('|'));
   const targets=await jsonRows('trizentro_email_alerts?event_id=eq.'+race.event_id+'&state=eq.confirmed&select=id,email&limit=5000');
   let allSent=true;
   for(const target of targets){
    const priorSent=await jsonRows('trizentro_radar_deliveries?alert_id=eq.'+target.id+'&signature=eq.'+signature+'&select=sent_at');
    if(priorSent.length)continue;
    // Stable authenticated opt-out: previously emailed unsubscribe links never expire on the next delivery.
    const unsubscribe=await signedUnsubscribe(target.id);
    const body='Nieuws over jouw opgeslagen wedstrijd bij TriZentro:\n\n'+text(race.event_name)+'\n'+notes.join('\n')+'\n\nControleer de laatste informatie en officiële links bij de organisator via TriZentro.\n\nAfmelden voor deze wedstrijd: '+manage(unsubscribe)+'\n';
    if(await send(target.email,'TriZentro Inschrijfradar: '+text(race.event_name),body)){
     await write('trizentro_radar_deliveries?on_conflict=alert_id,signature',{alert_id:target.id,signature});
     emails++;
    }else{failures++;allSent=false}
   }
   if(allSent)await write('trizentro_radar_snapshots?on_conflict=event_id',state);
  }
  // Daily pseudonyms and expired unconfirmed subscription requests are not retained indefinitely.
  await api('trizentro_email_signup_limits?day=lt.'+new Date(Date.now()-2*86400000).toISOString().slice(0,10),{method:'DELETE'});
  await api('trizentro_email_alerts?state=eq.pending&requested_at=lt.'+new Date(Date.now()-7*86400000).toISOString(),{method:'DELETE'});
  return reply(failures?207:200,{ok:failures===0,seeded,changes,emails,failures});
 }catch{return reply(503,{ok:false,error:'dispatch_failed'})}
});