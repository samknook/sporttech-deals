/* TriZentro Inschrijfradar: email double opt-in, event-specific and privacy by design.
 * No public access to subscriptions; sending requires verified Resend domain.
 * Activation is gated by RADAR_EMAIL_LIVE=true, RESEND_API_KEY and RESEND_FROM.
 */
const project=Deno.env.get('SUPABASE_URL')||'https://lpzndnxloykcthbsqcet.supabase.co';
const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const resend=Deno.env.get('RESEND_API_KEY')||'';
const sender=Deno.env.get('RESEND_FROM')||'';
const enabled=Deno.env.get('RADAR_EMAIL_LIVE')==='true'&&!!resend&&!!sender&&!!key&&!!Deno.env.get('RADAR_CRON_SECRET');
const origins=new Set(['https://trizentro.com','https://www.trizentro.com','https://samknook.github.io']);
function cors(origin:string|null){return {'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin',...(origin&&origins.has(origin)?{'Access-Control-Allow-Origin':origin}:{}),'Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'content-type'}}
function answer(origin:string|null,status:number,body:Record<string,unknown>){return new Response(JSON.stringify(body),{status,headers:cors(origin)})}
const encoder=new TextEncoder();
async function hash(s:string){const buffer=await crypto.subtle.digest('SHA-256',encoder.encode(s));return Array.from(new Uint8Array(buffer),b=>b.toString(16).padStart(2,'0')).join('')}
function token(){const bytes=crypto.getRandomValues(new Uint8Array(32));return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('')}
function header(){return {'apikey':key,'Authorization':'Bearer '+key,'Content-Type':'application/json'}}
async function db(path:string,init:RequestInit={}){return await fetch(project+'/rest/v1/'+path,{...init,headers:{...header(),...(init.headers||{})},signal:AbortSignal.timeout(6000)})}
async function send(to:string,subject:string,text:string){
 const res=await fetch('https://api.resend.com/emails',{method:'POST',headers:{'Authorization':'Bearer '+resend,'Content-Type':'application/json'},body:JSON.stringify({from:sender,to:[to],subject,text}),signal:AbortSignal.timeout(9000)});
 return res.ok;
}
function manageLink(action:string,value:string){return 'https://trizentro.com/raceatlas/alerts-beheren.html?action='+action+'&token='+encodeURIComponent(value)}
function cleanEmail(x:unknown){return typeof x==='string'?x.trim().toLowerCase():''}
function cleanEvent(x:unknown){return typeof x==='string'&&/^ra-\d{1,8}$/.test(x)?x:''}
Deno.serve(async request=>{
 const origin=request.headers.get('origin');
 if(!origin||!origins.has(origin))return answer(origin,403,{ok:false});
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors(origin)});
 if(request.method==='GET')return answer(origin,200,{enabled});
 if(request.method!=='POST')return answer(origin,405,{ok:false});
 if(!enabled)return answer(origin,503,{ok:false,error:'email_not_configured'});
 if(Number(request.headers.get('content-length')||0)>1024)return answer(origin,413,{ok:false});
 let body:Record<string,unknown>;try{const raw=await request.text();if(raw.length>1024)throw Error('too large');body=JSON.parse(raw)}catch{return answer(origin,400,{ok:false})}
 const action=String(body.action||'');
 if(action==='subscribe'){
  const email=cleanEmail(body.email),eventId=cleanEvent(body.eventId);
  if(!email||email.length>254||!/^([^@\s]+)@([^@\s]+\.[^@\s]+)$/.test(email)||!eventId)return answer(origin,400,{ok:false,error:'invalid_input'});
  // Basic persistent daily rate limit without storing IP, UA or any permanent visitor identifier.
  const ip=request.headers.get('cf-connecting-ip')||request.headers.get('x-forwarded-for')||'';
  if(!ip||ip.length>90)return answer(origin,429,{ok:false,error:'rate_limit'});
  const today=new Date().toISOString().slice(0,10);
  const rateHash=await hash(today+'|'+key+'|radar|'+ip);
  const exists=await db('trizentro_email_signup_limits?day=eq.'+today+'&digest=eq.'+rateHash+'&select=attempts');
  if(!exists.ok)return answer(origin,503,{ok:false});
  const limits=await exists.json();
  if(limits.length&&limits[0].attempts>=5)return answer(origin,429,{ok:false,error:'rate_limit'});
  const count=await db('trizentro_email_signup_limits?on_conflict=day,digest',{method:'POST',headers:{'Prefer':'resolution=merge-duplicates'},body:JSON.stringify({day:today,digest:rateHash,attempts:(limits[0]?.attempts||0)+1,last_attempt:new Date().toISOString()})});
  if(!count.ok)return answer(origin,503,{ok:false});
  // Reject unknown or unpublished events before sending email.
  const race=await db('raceatlas_event_intelligence?event_id=eq.'+eventId+'&publish_status=eq.published&select=event_name');
  if(!race.ok)return answer(origin,503,{ok:false});
  const races=await race.json();
  if(!races.length)return answer(origin,400,{ok:false,error:'unknown_event'});
  const prev=await db('trizentro_email_alerts?email=eq.'+encodeURIComponent(email)+'&event_id=eq.'+eventId+'&select=state,requested_at');
  if(!prev.ok)return answer(origin,503,{ok:false});
  const records=await prev.json();
  if(records[0]?.state==='confirmed')return answer(origin,202,{ok:true,message:'check_inbox'});
  if(records[0]?.requested_at&&Date.now()-Date.parse(records[0].requested_at)<15*60*1000)return answer(origin,202,{ok:true,message:'check_inbox'});
  const confirm=token(),unsub=token();
  const emailBody='Bevestig je TriZentro Inschrijfradar voor '+races[0].event_name+'.\n\nKlik op de link en kies Bevestigen om e-mailmeldingen voor deze wedstrijd te ontvangen:\n'+manageLink('confirm',confirm)+'\n\nNiet zelf aangevraagd? Negeer dit bericht. De aanvraag verloopt en zonder bevestiging sturen we geen updates.\n\nAfmelden of verzoek verwijderen: '+manageLink('unsubscribe',unsub)+'\n';
  const sent=await send(email,'Bevestig je Inschrijfradar | TriZentro',emailBody);
  if(!sent)return answer(origin,503,{ok:false,error:'mail_delivery_failed'});
  const write=await db('trizentro_email_alerts?on_conflict=email,event_id',{method:'POST',headers:{'Prefer':'resolution=merge-duplicates'},body:JSON.stringify({email,event_id:eventId,state:'pending',confirm_token_hash:await hash(confirm),unsubscribe_token_hash:await hash(unsub),requested_at:new Date().toISOString(),confirmed_at:null,unsubscribed_at:null})});
  if(!write.ok)return answer(origin,503,{ok:false});
  return answer(origin,202,{ok:true,message:'check_inbox'});
 }
 if(action==='confirm'||action==='unsubscribe'){
  const raw=typeof body.token==='string'?body.token:'';
  if(!/^[0-9a-f]{64}$/.test(raw))return answer(origin,400,{ok:false,error:'invalid_token'});
  const digest=await hash(raw);
  const col=action==='confirm'?'confirm_token_hash':'unsubscribe_token_hash';
  const query='trizentro_email_alerts?'+col+'=eq.'+digest+'&select=id,state,requested_at';
  const found=await db(query);
  if(!found.ok)return answer(origin,503,{ok:false});
  const rows=await found.json();
  if(rows.length!==1)return answer(origin,400,{ok:false,error:'invalid_token'});
  if(action==='confirm'&&(Date.now()-Date.parse(rows[0].requested_at)>48*3600*1000))return answer(origin,400,{ok:false,error:'expired_token'});
  const changes=action==='confirm'?{state:'confirmed',confirmed_at:new Date().toISOString(),confirm_token_hash:null}:{state:'unsubscribed',unsubscribed_at:new Date().toISOString(),confirm_token_hash:null,unsubscribe_token_hash:null};
  const update=await db('trizentro_email_alerts?id=eq.'+rows[0].id,{method:'PATCH',body:JSON.stringify(changes)});
  if(!update.ok)return answer(origin,503,{ok:false});
  return answer(origin,200,{ok:true,message:action==='confirm'?'confirmed':'unsubscribed'});
 }
 return answer(origin,400,{ok:false});
});