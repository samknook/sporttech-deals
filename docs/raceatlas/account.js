(() => {
'use strict';
// Public account UI; full mail delivery and callback verification remain a separate live smoke test.
const cfg=window.RACEATLAS_ACCOUNT_CONFIG||{};
const previewActive=cfg.previewEnabled===true&&new URLSearchParams(location.search).get('ra_account_preview')==='1';
if(cfg.enabled!==true&&!previewActive)return;
const validUrl=u=>{try{const x=new URL(u);return x.protocol==='https:'}catch{return false}};
if(!validUrl(cfg.supabaseUrl)||!/^sb_publishable_|^eyJ/.test(cfg.publishableKey||''))return;
const savedApi=()=>window.RaceAtlasSaved;
const el=(tag,txt)=>{const n=document.createElement(tag);if(txt!==undefined)n.textContent=txt;return n};
const status=el('p',''),wrapper=el('section'),title=el('h2',previewActive?'Mijn RaceAtlas-account · testversie':'Mijn RaceAtlas-account'),content=el('div');
wrapper.id='raAccount';wrapper.className='raAccount';
wrapper.append(title,content,status);
const where=document.querySelector('#savedPage .sectionHeading');
if(!where)return;
where.insertAdjacentElement('afterend',wrapper);
let client=null,user=null,mode='local',saving=false;
const pending=new Map();
let authVersion=0;
let cloudEvents=[];
let alertPrefs=new Map();
let alertBusy=false;
let marketingPref={email_opt_in:false,consented_at:null,revoked_at:null};
let marketingBusy=false;
const setStatus=text=>{status.textContent=text;status.setAttribute('role','status')};
const formatAuthError=error=>{const code=String(error?.code||'').toLowerCase();if(/rate.limit|over_email_send_rate_limit|email.rate/.test(code))return 'Je vraagt te snel een inloglink aan. Probeer over ongeveer een minuut opnieuw.';if(/email|smtp|mailer|sending/.test(code))return 'De inlogmail kon niet worden verzonden. Controleer de e-mailinstellingen in Supabase.';if(/redirect|validation/.test(code))return 'Het terugkeeradres van RaceAtlas is nog niet toegestaan in Supabase Auth.';return 'De inlogaanvraag is mislukt. Controleer de Supabase Auth-instellingen en probeer opnieuw.'};
const accountNav=el('button','Mijn account');
accountNav.id='raAccountNav';accountNav.type='button';accountNav.className='raAccountNav';
accountNav.addEventListener('click',()=>{document.getElementById('navSaved')?.click();wrapper.scrollIntoView({behavior:'smooth',block:'start'})});
document.querySelector('.navright')?.append(accountNav);
const button=(label,action)=>{const b=el('button',label);b.type='button';b.addEventListener('click',action);return b};
function appendNotice(text){content.append(el('p',text))}
function showAuth(){
 content.replaceChildren();
 appendNotice('Maak gratis een account met je e-mailadres en ontvang een veilige inloglink. Daarna kun je jouw wedstrijdseizoen op meerdere apparaten bewaren. Zonder account blijven favorieten op dit apparaat.');
 const form=el('form'),email=el('input'),submit=el('button','Maak account / log in');
 email.type='email';email.required=true;email.autocomplete='email';email.placeholder='E-mailadres';email.setAttribute('aria-label','E-mailadres');
 submit.type='submit';
 form.append(email,submit);
 form.addEventListener('submit',async event=>{
  event.preventDefault();submit.disabled=true;
  setStatus('Inloglink aanvragen…');
  try{
   const callback=new URL(location.pathname,location.origin);
   if(previewActive)callback.searchParams.set('ra_account_preview','1');
   const result=await client.auth.signInWithOtp({email:email.value.trim(),options:{emailRedirectTo:callback.toString()}});
   if(result.error)throw result.error;
   setStatus('Als de accountdienst je e-mail kan verzenden, ontvang je een eenmalige inloglink. Controleer je inbox en spam.');email.value='';
  }catch(error){setStatus(formatAuthError(error))}
  finally{submit.disabled=false}
 });
 content.append(form);
 const privacy=el('p');const link=el('a','Privacy en e-mailvoorkeuren');link.href='privacy.html';privacy.append('Commerciële e-mails zijn optioneel en staan standaard uit. ',link);content.append(privacy);
}
async function readCloud(){
 const {data,error}=await client.from('raceatlas_saved_events').select('event_id,season_status').eq('user_id',user.id);
 if(error)throw error;
 return (data||[]).filter(item=>/^ra-\d{1,8}$/.test(item.event_id));
}
// Keep a per-event queue so fast saves/unsaves cannot be lost while a request is in flight.
function writeOne(id,active){
 if(!user||mode!=='cloud'||!/^ra-\d{1,8}$/.test(id))return;
 pending.set(id,active);
 void flushPending();
}
async function flushPending(){
 if(saving||!user||mode!=='cloud'||!pending.size)return;
 saving=true;
 const version=authVersion,owner=user.id;
 try{
  while(pending.size&&version===authVersion&&user?.id===owner&&mode==='cloud'){
   const [id,active]=pending.entries().next().value;
   // Remove before sending so another click can enqueue a newer desired state.
   pending.delete(id);
   try{
    if(active){
     const {error}=await client.from('raceatlas_saved_events').upsert({user_id:owner,event_id:id},{onConflict:'user_id,event_id'});
     if(error)throw error;
    }else{
     const {error}=await client.from('raceatlas_saved_events').delete().eq('user_id',owner).eq('event_id',id);
     if(error)throw error;
    }
    if(version===authVersion&&user?.id===owner){
     if(active&&!cloudEvents.some(item=>item.event_id===id))cloudEvents.push({event_id:id,season_status:'interested'});
     if(!active){cloudEvents=cloudEvents.filter(item=>item.event_id!==id);alertPrefs.delete(id)}
     showSignedIn();
    }
   }catch{
    // Keep the latest pending value. Never silently drop a failed change.
    if(version===authVersion&&user?.id===owner&&mode==='cloud'){
     if(!pending.has(id))pending.set(id,active);
     setStatus('Synchronisatie mislukt. Deze wijziging staat alleen in dit tabblad. Herlaad de pagina niet voordat je opnieuw hebt gesynchroniseerd.');
    }
    break;
   }
  }
 }finally{saving=false}
}
window.addEventListener('beforeunload',event=>{
 if(mode==='cloud'&&(saving||pending.size)){
  event.preventDefault();event.returnValue='';
 }
});
async function readAlertPrefs(owner){
 const {data,error}=await client.from('raceatlas_alert_preferences').select('event_id,email_enabled,registration_open,date_change,race_reminder').eq('user_id',owner);
 if(error)throw error;
 return new Map((data||[]).filter(row=>/^ra-\d{1,8}$/.test(row.event_id)).map(row=>[row.event_id,row]));
}
async function readMarketingPreference(owner){
 const {data,error}=await client.from('raceatlas_marketing_preferences').select('email_opt_in,consented_at,revoked_at').eq('user_id',owner).maybeSingle();
 if(error)throw error;
 return data||{email_opt_in:false,consented_at:null,revoked_at:null};
}
async function chooseCloud(){
 if(!user)return;
 if(pending.size||saving){setStatus('Er worden nog wijzigingen gesynchroniseerd. Probeer eerst opnieuw.');return}
 const owner=user.id,version=authVersion;
 try{
  const cloud=await readCloud();
  const prefs=await readAlertPrefs(owner);
  const marketing=await readMarketingPreference(owner);
  if(owner!==user?.id||version!==authVersion)return;
  alertPrefs=prefs;
  marketingPref=marketing;
  cloudEvents=cloud;
  savedApi().useCloud(cloud.map(e=>e.event_id));
  mode='cloud';setStatus('Cloudseizoen geladen. Nieuwe wijzigingen synchroniseren automatisch.');showSignedIn();
 }catch{if(owner===user?.id&&version===authVersion)setStatus('Cloudseizoen ophalen mislukt. Je lokale gegevens zijn behouden.')}
}
async function importLocal(){
 if(!user)return;
 const owner=user.id,version=authVersion;
 const ids=savedApi().guest().filter(id=>/^ra-\d{1,8}$/.test(id));
 try{
  if(ids.length){
   const rows=ids.map(event_id=>({user_id:owner,event_id,season_status:'interested'}));
   const {error}=await client.from('raceatlas_saved_events').upsert(rows,{onConflict:'user_id,event_id',ignoreDuplicates:true});if(error)throw error;
  }
  if(owner===user?.id&&version===authVersion)await chooseCloud();
 }catch{if(owner===user?.id&&version===authVersion)setStatus('Importeren is mislukt. Je lokale favorieten zijn niet verwijderd.')}
}
async function setSeasonStatus(eventId,statusValue){
 if(!user||mode!=='cloud'||!['interested','registered','completed'].includes(statusValue))return;
 const currentUser=user.id,version=authVersion;
 let error;
 try{
  const result=await client.from('raceatlas_saved_events').update({season_status:statusValue,updated_at:new Date().toISOString()}).eq('user_id',currentUser).eq('event_id',eventId);
  error=result.error;
 }catch{error=new Error('Netwerkfout')}
 if(error){if(currentUser===user?.id&&version===authVersion)setStatus('Status opslaan is mislukt. Probeer het opnieuw.');return}
 if(currentUser!==user?.id||version!==authVersion)return;
 cloudEvents=cloudEvents.map(item=>item.event_id===eventId?{...item,season_status:statusValue}:item);
 showSignedIn();setStatus('Wedstrijdstatus opgeslagen.');
}
function renderStatusControls(){
 const container=el('div'),heading=el('h3','Mijn wedstrijdstatus');
 container.className='raAccountStatuses';
 container.append(heading);
 const known=new Map((window.RACEATLAS_EVENTS||[]).map(event=>[event.id,event.name]));
 for(const entry of cloudEvents.filter(item=>known.has(item.event_id))){
  const line=el('label'),name=el('span',known.get(entry.event_id)),select=el('select');
  select.setAttribute('aria-label','Status '+known.get(entry.event_id));
  for(const [value,label] of [['interested','Interesse'],['registered','Ingeschreven'],['completed','Voltooid']]){
   const option=el('option',label);option.value=value;select.append(option);
  }
  select.value=entry.season_status||'interested';
  select.addEventListener('change',async()=>{select.disabled=true;try{await setSeasonStatus(entry.event_id,select.value)}finally{select.disabled=false}});
  line.append(name,select);container.append(line);
 }
 if(cloudEvents.length)content.append(container);
}
function exportSeason(){
 if(!user||mode!=='cloud')return;
 const payload={
  format:'RaceAtlas season export',
  version:1,
  exportedAt:new Date().toISOString(),
  events:cloudEvents.map(item=>({eventId:item.event_id,status:item.season_status}))
 };
 const blob=new Blob([JSON.stringify(payload,null,2)+'\n'],{type:'application/json;charset=utf-8'});
 const url=URL.createObjectURL(blob);
 const link=el('a');link.href=url;link.download='raceatlas-mijn-seizoen.json';
 document.body.append(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1500);
 setStatus('Je seizoensgegevens zijn geëxporteerd. Het bestand bevat geen wachtwoorden of toegangstokens.');
}
async function eraseCloudSeason(){
 if(!user||mode!=='cloud')return;
 if(saving||pending.size){setStatus('Synchroniseer eerst alle wijzigingen voordat je jouw cloudseizoen wist.');return}
 if(!window.confirm('Wil je al jouw opgeslagen wedstrijden en meldingsvoorkeuren uit dit RaceAtlas-account verwijderen? Je account zelf blijft bestaan. Dit kan niet ongedaan worden gemaakt.'))return;
 const owner=user.id,version=authVersion;
 setStatus('Cloudseizoen verwijderen…');
 try{
  // Delete preferences first: do not retain notification choices for removed events.
  const a=await client.from('raceatlas_alert_preferences').delete().eq('user_id',owner);
  if(a.error)throw a.error;
  if(owner!==user?.id||version!==authVersion)return;
  const b=await client.from('raceatlas_saved_events').delete().eq('user_id',owner);
  if(b.error)throw b.error;
  if(owner!==user?.id||version!==authVersion)return;
  cloudEvents=[];alertPrefs.clear();savedApi().useCloud([]);showSignedIn();
  setStatus('Je cloudseizoen en meldingsvoorkeuren zijn verwijderd. Je account en apparaatfavorieten zijn behouden.');
 }catch{
  if(owner===user?.id&&version===authVersion)
   setStatus('Verwijderen is niet volledig gelukt. Controleer het cloudseizoen opnieuw en probeer het later opnieuw.');
 }
}
async function saveAlertPreference(eventId,preference){
 if(!user||mode!=='cloud'||alertBusy||!cloudEvents.some(e=>e.event_id===eventId))return;
 const owner=user.id,version=authVersion;
 const enabled=preference.email_enabled===true;
 const next={
  user_id:owner,event_id:eventId,
  email_enabled:enabled,
  registration_open:enabled&&preference.registration_open===true,
  date_change:enabled&&preference.date_change===true,
  race_reminder:enabled&&preference.race_reminder===true,
  consented_at:enabled?new Date().toISOString():null,
  updated_at:new Date().toISOString()
 };
 if(enabled&&!next.registration_open&&!next.date_change&&!next.race_reminder){
  setStatus('Kies minimaal één type melding.');return
 }
 alertBusy=true;
 try{
  const {error}=await client.from('raceatlas_alert_preferences').upsert(next,{onConflict:'user_id,event_id'});
  if(error)throw error;
  if(owner!==user?.id||version!==authVersion)return;
  alertPrefs.set(eventId,next);
  showSignedIn();
  setStatus(enabled?'Meldingsvoorkeur opgeslagen. E-mails worden nog niet verstuurd.':'E-mailmeldingen voor deze wedstrijd uitgezet.');
 }catch{
  if(owner===user?.id&&version===authVersion)setStatus('Meldingsvoorkeur opslaan is mislukt. Probeer opnieuw.');
 }finally{alertBusy=false}
}
function renderAlertControls(){
 const section=el('section'),heading=el('h3','E-mailmeldingen per wedstrijd'),help=el('p','Je kunt voorkeuren alvast instellen. Er worden nog geen automatische e-mails verstuurd. Je e-mailadres komt uit je geverifieerde account.');
 section.className='raAccountAlerts';section.append(heading,help);
 const known=new Map((window.RACEATLAS_EVENTS||[]).map(event=>[event.id,event.name]));
 for(const entry of cloudEvents.filter(item=>known.has(item.event_id))){
  const block=el('div'),name=el('strong',known.get(entry.event_id)),form=el('div'),previous=alertPrefs.get(entry.event_id)||{};
  block.className='raAlertItem';form.className='raAlertOptions';block.append(name,form);
  const inputs={};
  const choices=[
   ['email_enabled','Meldingen per e-mail ontvangen'],
   ['registration_open','Als de inschrijving opent'],
   ['date_change','Bij een wijziging van de datum'],
   ['race_reminder','Herinnering voor de wedstrijddag']
  ];
  for(const [field,label] of choices){
   const option=el('label'),checkbox=el('input'),text=el('span',label);
   checkbox.type='checkbox';checkbox.checked=previous[field]===true;
   if(field!=='email_enabled')checkbox.disabled=!previous.email_enabled;
   checkbox.addEventListener('change',()=>{
    if(field==='email_enabled'){
     for(const detail of ['registration_open','date_change','race_reminder']){
      inputs[detail].disabled=!checkbox.checked;
      if(!checkbox.checked)inputs[detail].checked=false;
     }
     if(checkbox.checked&&!['registration_open','date_change','race_reminder'].some(k=>inputs[k].checked))inputs.registration_open.checked=true;
    }
   });
   inputs[field]=checkbox;option.append(checkbox,text);form.append(option);
  }
  const save=button('Voorkeur opslaan',async()=>{
   save.disabled=true;
   try{await saveAlertPreference(entry.event_id,Object.fromEntries(Object.entries(inputs).map(([key,input])=>[key,input.checked])))}finally{save.disabled=false}
  });
  form.append(save);section.append(block);
 }
 if(cloudEvents.length)content.append(section);
}
async function deleteAccount(){
 if(!user)return;
 if(saving||pending.size){setStatus('Synchroniseer eerst alle wijzigingen voordat je jouw account verwijdert.');return}
 const answer=window.prompt('Account definitief verwijderen? Alle opgeslagen wedstrijden en meldingsvoorkeuren verdwijnen. Typ VERWIJDER MIJN ACCOUNT om te bevestigen:');
 if(answer!=='VERWIJDER MIJN ACCOUNT')return;
 const owner=user.id,version=authVersion;
 setStatus('Account veilig verwijderen…');
 try{
  const {data:auth,error:sessionError}=await client.auth.getSession();
  if(sessionError||!auth?.session?.access_token)throw new Error('No active session');
  const {data,error}=await client.functions.invoke('raceatlas-delete-account',{
   body:{confirm:'VERWIJDER MIJN ACCOUNT'},
   headers:{Authorization:'Bearer '+auth.session.access_token}
  });
  if(error||data?.deleted!==true)throw new Error('Delete failed');
  if(user?.id!==owner||authVersion!==version)return;
  // The server has removed the Auth user; clear any local credentials immediately.
  try{await client.auth.signOut({scope:'local'})}catch{}
  authVersion++;pending.clear();cloudEvents=[];alertPrefs.clear();user=null;mode='local';
  savedApi().useGuest();showAuth();
  setStatus('Je RaceAtlas-account is verwijderd. Je apparaatfavorieten zijn behouden.');
 }catch{
  if(user?.id===owner&&authVersion===version)setStatus('Account verwijderen is mislukt. Je account blijft actief; probeer later opnieuw.');
 }
}
async function disconnect(){
 if((saving||pending.size)&&!window.confirm('Niet alle wijzigingen zijn gesynchroniseerd. Als je nu uitlogt, kunnen ze verloren gaan. Toch uitloggen?'))return;
 const {error}=await client.auth.signOut();
 if(error){setStatus('Uitloggen is mislukt. Probeer opnieuw.');return}
 authVersion++;pending.clear();cloudEvents=[];alertPrefs.clear();user=null;mode='local';marketingPref={email_opt_in:false,consented_at:null,revoked_at:null};savedApi().useGuest();showAuth();setStatus('Uitgelogd. Je persoonlijke seizoen is verborgen; de favorieten van dit apparaat zijn hersteld.');
}

async function updateMarketingConsent(enabled){
 if(!user||marketingBusy)return;
 const owner=user.id,version=authVersion;
 marketingBusy=true;
 setStatus('E-mailvoorkeur opslaan…');
 try{
  const time=new Date().toISOString();
  const row={user_id:owner,email_opt_in:enabled,consent_version:'2026-11',
    consented_at:enabled?time:marketingPref.consented_at,
    revoked_at:enabled?null:time,updated_at:time};
  const {error}=await client.from('raceatlas_marketing_preferences').upsert(row,{onConflict:'user_id'});
  if(error)throw error;
  if(owner!==user?.id||version!==authVersion)return;
  marketingPref={email_opt_in:enabled,consented_at:row.consented_at,revoked_at:row.revoked_at};
  showSignedIn();
  setStatus(enabled?'Je hebt je aangemeld voor optionele RaceAtlas-updates en aanbiedingen.':'Je bent afgemeld voor commerciële RaceAtlas-mails.');
 }catch{
  if(owner===user?.id&&version===authVersion)setStatus('E-mailvoorkeur opslaan mislukt. Je vorige voorkeur blijft gelden.');
 }finally{marketingBusy=false}
}
function renderMarketingControls(){
 const panel=el('section'),heading=el('h3','E-mailvoorkeuren'),label=el('label'),check=el('input');
 panel.className='raMarketing';panel.append(heading);
 const helper=el('p','Optioneel: ontvang wedstrijdtips, nieuws en aanbiedingen van RaceAtlas en partners. Dit staat los van je account en wedstrijdmeldingen. Je kunt je op ieder moment afmelden.');
 check.type='checkbox';check.checked=marketingPref.email_opt_in===true;
 const span=el('span','Ja, ik wil commerciële RaceAtlas-mails ontvangen.');
 label.append(check,span);
 const save=button('E-mailvoorkeur opslaan',async()=>{save.disabled=true;try{await updateMarketingConsent(check.checked)}finally{save.disabled=false}});
 const privacy=el('a','Privacy en afmelden');privacy.href='privacy.html';
 panel.append(helper,label,save,privacy);
 content.append(panel);
}

function showSignedIn(){
 content.replaceChildren();
 appendNotice('Ingelogd als '+(user.email||'RaceAtlas-gebruiker')+'.');
 if(mode==='cloud'){
  appendNotice('Je wedstrijdseizoen wordt veilig gesynchroniseerd.');
  appendNotice('E-mailmeldingen zijn nog niet actief. Je krijgt pas e-mail na een aparte, expliciete aanmelding zodra de verzenddienst beschikbaar is.');
  content.append(button('Seizoen verversen',chooseCloud));
  renderStatusControls();
  renderAlertControls();
  content.append(button('Synchronisatie opnieuw proberen',()=>{void flushPending()}));
  content.append(button('Download mijn seizoensgegevens',exportSeason));
  content.append(button('Verwijder cloudseizoen',eraseCloudSeason));
 }else{
  appendNotice('Je kunt jouw lokale favorieten toevoegen aan je account of uitsluitend het al opgeslagen cloudseizoen gebruiken. Er wordt niets automatisch overschreven.');
  content.append(button('Lokale favorieten toevoegen aan account',importLocal));
  content.append(button('Alleen cloudseizoen gebruiken',chooseCloud));
 }
 renderMarketingControls();
 content.append(button('Uitloggen',disconnect));
 content.append(button('Verwijder mijn account definitief',deleteAccount));
}
async function onAuth(){
 try{
  const {data,error}=await client.auth.getUser();if(error)throw error;
  user=data?.user||null;mode='local';authVersion++;pending.clear();cloudEvents=[];alertPrefs.clear();savedApi().useGuest();
  if(!user){showAuth();return}
  const owner=user.id,version=authVersion;
  showSignedIn();
  try{
   const latest=await readMarketingPreference(owner);
   if(owner!==user?.id||version!==authVersion)return;
   marketingPref=latest;showSignedIn();
  }catch{if(owner===user?.id&&version===authVersion)setStatus('E-mailvoorkeuren ophalen mislukt. Controleer je voorkeur voordat je deze wijzigt.')}
  if(owner===user?.id&&version===authVersion&&!savedApi().guest().length)await chooseCloud();
 }catch{authVersion++;pending.clear();cloudEvents=[];alertPrefs.clear();user=null;mode='local';marketingPref={email_opt_in:false,consented_at:null,revoked_at:null};savedApi().useGuest();showAuth();setStatus('Accountstatus kon niet worden gecontroleerd.')}
}
window.addEventListener('raceatlas:saved-change',e=>{
 if(e.detail&&typeof e.detail.id==='string')writeOne(e.detail.id,!!e.detail.saved);
});
const style=el('style');
style.textContent='.raAccount{background:#fff;border:1px solid #dce7de;border-radius:16px;padding:18px;margin:16px 0 22px}.raAccount h2{font-size:19px;margin:0 0 10px}.raAccount p{font-size:13px;line-height:1.5;color:#506558}.raAccount form{display:flex;flex-wrap:wrap;gap:8px}.raAccount input{min-height:44px;min-width:210px;flex:1;border-radius:9px;border:1px solid #a9bfb0;padding:10px}.raAccount button{border:1px solid #b7ceb9;border-radius:9px;background:#eaf9db;color:#1a3b29;font-weight:750;padding:11px;min-height:44px;margin:4px 7px 4px 0;cursor:pointer}.raAccountStatuses{margin:14px 0}.raAccountStatuses label{display:flex;align-items:center;justify-content:space-between;gap:10px;border-bottom:1px solid #edf1ed;padding:8px 0;font-size:13px}.raAccountStatuses select{min-height:44px;max-width:180px;width:48%;border:1px solid #b7ceb9;border-radius:8px;padding:8px;background:#fff}@media(max-width:520px){.raAccountStatuses label{align-items:stretch;flex-direction:column}.raAccountStatuses select{max-width:none;width:100%}}';
style.textContent+='.raMarketing{border-top:1px solid #dde9dd;margin:16px 0;padding-top:14px}.raMarketing label{display:flex;align-items:center;gap:9px;font-size:13px;font-weight:650}.raMarketing label input{width:18px;height:18px;min-width:18px;flex:none;accent-color:#317845}.raMarketing a{display:inline-block;margin:10px 0;font-size:12px}.raAccount form button{background:#c6ff46;color:#14251e;border:0;padding:11px 18px}.raAccountNav{margin-left:5px}.raAccount{scroll-margin-top:24px}@media(max-width:660px){.raAccountNav{display:none}}.raAccountAlerts{margin:20px 0}.raAccountAlerts h3{font-size:17px;margin:0 0 8px}.raAlertItem{border:1px solid #dde9dd;border-radius:10px;margin:10px 0;padding:12px}.raAlertOptions{display:grid;gap:8px;margin-top:10px}.raAlertOptions label{display:flex;gap:9px;align-items:center;font-size:13px}.raAlertOptions input{width:18px;height:18px;accent-color:#317845}';
document.head.append(style);
const script=el('script');
script.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
script.onload=async()=>{
 if(!window.supabase?.createClient){setStatus('Accountdienst niet beschikbaar.');return}
 client=window.supabase.createClient(cfg.supabaseUrl,cfg.publishableKey,{auth:{detectSessionInUrl:true,persistSession:true,autoRefreshToken:true}});
 const authErrorParams=new URLSearchParams(location.hash.slice(1));
 const callbackError=authErrorParams.get('error_description')||new URLSearchParams(location.search).get('error_description');
 if(callbackError)setStatus('Inloggen via de e-maillink is niet gelukt: '+callbackError.slice(0,170));
 client.auth.onAuthStateChange((_event,session)=>{
  const id=session?.user?.id||null;
  if(id!==user?.id){authVersion++;pending.clear();cloudEvents=[];alertPrefs.clear();savedApi().useGuest();user=session?.user||null;mode='local';if(user)showSignedIn();else showAuth()}
 });
 await onAuth();
};
script.onerror=()=>{const fallback=el('script');fallback.src='https://unpkg.com/@supabase/supabase-js@2';fallback.onload=script.onload;fallback.onerror=()=>setStatus('Accountdienst niet beschikbaar. Controleer je verbinding of schakel scriptblokkering uit voor deze site.');document.head.append(fallback)};
document.head.append(script);
})();
