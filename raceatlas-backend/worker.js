/**
 * RaceAtlas email reminders prototype.
 * Not deployed until D1, Resend, verified sender domain and Turnstile are configured.
 * A source link being reachable does NOT confirm an event date.
 */
const enc=new TextEncoder();
const cors=(req,env)=>({'Access-Control-Allow-Origin':env.PUBLIC_ORIGIN,'Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'POST,OPTIONS','Vary':'Origin'});
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8',...headers}});
const b64=b=>btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
const unb64=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-s.length%4)%4)),x=>x.charCodeAt(0));
const timingSafeEqual=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
async function sign(payload,secret){const raw=b64(enc.encode(JSON.stringify(payload)));const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return raw+'.'+b64(await crypto.subtle.sign('HMAC',key,enc.encode(raw)))}
async function verify(token,secret){const parts=String(token).split('.');if(parts.length!==2)throw Error('bad token');const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);const expected=new Uint8Array(await crypto.subtle.sign('HMAC',key,enc.encode(parts[0])));if(!timingSafeEqual(expected,unb64(parts[1])))throw Error('bad signature');const data=JSON.parse(new TextDecoder().decode(unb64(parts[0])));if(!Number.isInteger(data.exp)||data.exp<Date.now())throw Error('expired');return data}
async function email(env,to,subject,html){
 const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:env.MAIL_FROM,to:[to],subject,html})});
 if(!r.ok)throw new Error('Email provider error: '+r.status);
}
const escape=s=>String(s||'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
async function turnstile(token,env){const body=new URLSearchParams({secret:env.TURNSTILE_SECRET,response:token});const r=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body});return r.ok&&(await r.json()).success===true}
async function loadEvents(env){const r=await fetch(env.EVENTS_URL,{headers:{'User-Agent':'RaceAtlasReminders/1.0'}});if(!r.ok)throw Error('Event catalog unavailable');const html=await r.text();const m=html.match(/const EVENTS=(\[[\s\S]*?\]);\s*window\.RACEATLAS_EVENTS/);if(!m)throw Error('Invalid event catalog');return JSON.parse(m[1])}
const dayDate=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Amsterdam',year:'numeric',month:'2-digit',day:'2-digit'});
function todayAmsterdam(){const parts=Object.fromEntries(dayDate.formatToParts(new Date()).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));return parts.year+'-'+parts.month+'-'+parts.day}
function deltaDays(from,to){return Math.round((Date.parse(to+'T12:00:00Z')-Date.parse(from+'T12:00:00Z'))/86400000)}
async function deliverOnce(env,sub,kind,target,subject,body,event){
 const marker=await env.DB.prepare('INSERT OR IGNORE INTO deliveries (subscription_id,kind,target,sent_at) VALUES (?,?,?,?)').bind(sub.id,kind,target,new Date().toISOString()).run();
 if(!marker.meta?.changes)return;
 try{
  const token=await sign({purpose:'unsubscribe',id:sub.id,exp:Date.now()+1000*60*60*24*365},env.TOKEN_SECRET);
  const unsubscribe=env.BASE_URL+'/unsubscribe?token='+encodeURIComponent(token);
  const html='<div style="font:16px/1.6 system-ui,sans-serif;max-width:560px;margin:auto"><h2>'+escape(subject)+'</h2><p>'+escape(body)+'</p><p><a href="'+escape(event.officialEventUrl||event.source||env.PUBLIC_ORIGIN)+'">Bekijk de wedstrijdinformatie</a></p><hr><small>RaceAtlas · <a href="'+escape(unsubscribe)+'">Afmelden voor deze wedstrijd</a></small></div>';
  await email(env,sub.email,subject,html);
 }catch(err){await env.DB.prepare('DELETE FROM deliveries WHERE subscription_id=? AND kind=? AND target=?').bind(sub.id,kind,target).run();throw err}
}
async function runScheduled(env){
 const events=await loadEvents(env),today=todayAmsterdam(),now=Date.now();
 const sent=[];
 for(const e of events){
  const subscribers=(await env.DB.prepare('SELECT * FROM subscriptions WHERE event_id=? AND verified=1').bind(e.id).all()).results;
  if(!subscribers.length)continue;
  const snap=await env.DB.prepare('SELECT * FROM event_snapshots WHERE event_id=?').bind(e.id).first();
  // Emails about new dates require an officially verified event source, not a calendar listing.
  const official=e.dateEvidence==='official';
  const eventDate=official&&/^\d{4}-\d{2}-\d{2}$/.test(e.date||'')?e.date:null;
  const registration=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/.test(e.registrationOpenAt||'')?e.registrationOpenAt:null;
  await env.DB.prepare('INSERT INTO event_snapshots(event_id,event_date,registration_open_at,date_evidence,checked_at) VALUES(?,?,?,?,?) ON CONFLICT(event_id) DO UPDATE SET event_date=excluded.event_date, registration_open_at=excluded.registration_open_at,date_evidence=excluded.date_evidence,checked_at=excluded.checked_at').bind(e.id,eventDate,registration,e.dateEvidence||'',new Date().toISOString()).run();
  for(const sub of subscribers){
   if(eventDate&&(!snap?.event_date||snap.event_date!==eventDate)&&sub.date_alert){
    await deliverOnce(env,sub,'date-confirmed',eventDate,'Wedstrijddatum bekend: '+e.name,'De officiële wedstrijddatum is '+eventDate+'.',e);sent.push('date');
   }
   if(registration&&(!snap?.registration_open_at||snap.registration_open_at!==registration)&&sub.registration_alert){
    await deliverOnce(env,sub,'registration-announced',registration,'Inschrijfdatum bekend: '+e.name,'De inschrijving staat gepland voor '+registration+'.',e);sent.push('announced');
   }
   if(eventDate&&sub.race_reminders){const d=deltaDays(today,eventDate);if([7,1,0].includes(d)){
    await deliverOnce(env,sub,'race-'+d,eventDate,'Wedstrijd '+(d===0?'vandaag':d===1?'morgen':'over 7 dagen')+': '+e.name,'Je wedstrijd in '+e.place+' is gepland op '+eventDate+'.',e);sent.push('race');
   }}
   if(registration&&sub.registration_alert){const date=registration.slice(0,10),d=deltaDays(today,date);
     if([7,1].includes(d)){await deliverOnce(env,sub,'signup-'+d,registration,'Inschrijving '+(d===1?'morgen':'over 7 dagen')+': '+e.name,'De inschrijving opent op '+registration+'.',e);sent.push('signup')}
     if(now>=Date.parse(registration)&&now-Date.parse(registration)<15*60*1000){await deliverOnce(env,sub,'signup-open',registration,'Inschrijving opent nu: '+e.name,'De inschrijving is volgens de organisator geopend.',e);sent.push('open')}
   }
  }
 }
 return {processed:events.length,notifications:sent.length};
}
export default {
 async fetch(req,env){
  const origin=req.headers.get('Origin')||'';
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors(req,env)});
  if(origin&&origin!==env.PUBLIC_ORIGIN)return json({error:'Origin not allowed'},403);
  const url=new URL(req.url);
  if(req.method==='POST'&&url.pathname==='/subscribe'){
   if(req.headers.get('Content-Type')?.split(';')[0]!=='application/json')return json({error:'Use JSON'},415,cors(req,env));
   const content=await req.text();if(content.length>2500)return json({error:'Payload too large'},413,cors(req,env));
   let input;try{input=JSON.parse(content)}catch{return json({error:'Invalid JSON'},400,cors(req,env))}
   const emailAddress=String(input.email||'').trim().toLowerCase(),eventId=String(input.eventId||''),prefs=input.preferences||{};
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)||emailAddress.length>254||!/^[a-z0-9-]{3,50}$/.test(eventId))return json({error:'Invalid email or event'},400,cors(req,env));
   if(!input.consent)return json({error:'Explicit consent required'},400,cors(req,env));
   if(!await turnstile(input.turnstileToken,env))return json({error:'Verification failed'},403,cors(req,env));
   const events=await loadEvents(env);if(!events.some(e=>e.id===eventId))return json({error:'Event not found'},404,cors(req,env));
   const old=await env.DB.prepare('SELECT * FROM subscriptions WHERE email=? AND event_id=?').bind(emailAddress,eventId).first();
   if(old?.verified)return json({ok:true,message:'If eligible, a confirmation email is sent.'},200,cors(req,env));
   if(old&&Date.now()-Date.parse(old.requested_at)<60*60*1000)return json({ok:true,message:'If eligible, a confirmation email is sent.'},200,cors(req,env));
   const id=old?.id||crypto.randomUUID(),nonce=crypto.randomUUID();
   const flags=[prefs.date!==false,prefs.registration!==false,prefs.race!==false].map(Number);
   await env.DB.prepare('INSERT INTO subscriptions(id,email,event_id,date_alert,registration_alert,race_reminders,verified,verify_nonce,requested_at) VALUES(?,?,?,?,?,?,0,?,?) ON CONFLICT(email,event_id) DO UPDATE SET verify_nonce=excluded.verify_nonce,requested_at=excluded.requested_at,date_alert=excluded.date_alert,registration_alert=excluded.registration_alert,race_reminders=excluded.race_reminders,verified=0').bind(id,emailAddress,eventId,...flags,nonce,new Date().toISOString()).run();
   const token=await sign({purpose:'verify',id,nonce,exp:Date.now()+24*60*60*1000},env.TOKEN_SECRET);
   await email(env,emailAddress,'Bevestig RaceAtlas-meldingen','<p>Je hebt je aangemeld voor wedstrijdmeldingen.</p><p><a href="'+escape(env.BASE_URL+'/verify?token='+encodeURIComponent(token))+'">Bevestig mijn e-mailadres</a></p><p>Niet aangevraagd? Negeer deze e-mail.</p>');
   return json({ok:true,message:'Check je e-mail om je aanmelding te bevestigen.'},200,cors(req,env));
  }
  if(req.method==='GET'&&(url.pathname==='/verify'||url.pathname==='/unsubscribe')){
   try{const token=await verify(url.searchParams.get('token'),env.TOKEN_SECRET),purpose=url.pathname==='/verify'?'verify':'unsubscribe';if(token.purpose!==purpose)throw Error('wrong purpose');
    if(purpose==='verify'){const r=await env.DB.prepare('UPDATE subscriptions SET verified=1,verified_at=? WHERE id=? AND verify_nonce=? AND verified=0').bind(new Date().toISOString(),token.id,token.nonce).run();return new Response(r.meta?.changes?'Je meldingen zijn bevestigd.':'Deze bevestigingslink is verlopen of al gebruikt.',{headers:{'Content-Type':'text/plain; charset=utf-8'}})}
    await env.DB.prepare('DELETE FROM subscriptions WHERE id=?').bind(token.id).run();return new Response('Je bent afgemeld voor deze wedstrijd.',{headers:{'Content-Type':'text/plain; charset=utf-8'}});
   }catch{return new Response('Deze link is ongeldig of verlopen.',{status:400})}
  }
  return json({service:'RaceAtlas mail alerts',active:false,message:'Standalone backend; activation requires provider configuration.'},200,cors(req,env));
 },
 async scheduled(controller,env,ctx){ctx.waitUntil(runScheduled(env).catch(err=>console.error('Scheduled reminders failed:',err.message)))}
};
