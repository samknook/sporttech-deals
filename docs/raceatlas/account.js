(() => {
'use strict';
// Disabled by default. Enable only after Supabase Auth, SMTP, RLS and privacy flows are tested.
const cfg=window.RACEATLAS_ACCOUNT_CONFIG||{};
if(cfg.enabled!==true)return;
const validUrl=u=>{try{const x=new URL(u);return x.protocol==='https:'}catch{return false}};
if(!validUrl(cfg.supabaseUrl)||!/^sb_publishable_|^eyJ/.test(cfg.publishableKey||''))return;
const savedApi=()=>window.RaceAtlasSaved;
const el=(tag,txt)=>{const n=document.createElement(tag);if(txt!==undefined)n.textContent=txt;return n};
const status=el('p',''),wrapper=el('section'),title=el('h2','Mijn RaceAtlas-account'),content=el('div');
wrapper.id='raAccount';wrapper.className='raAccount';
wrapper.append(title,content,status);
const where=document.querySelector('#savedPage .sectionHeading');
if(!where)return;
where.insertAdjacentElement('afterend',wrapper);
let client=null,user=null,mode='local',saving=false;
const pending=new Map();
let authVersion=0;
let cloudEvents=[];
const setStatus=text=>{status.textContent=text;status.setAttribute('role','status')};
const button=(label,action)=>{const b=el('button',label);b.type='button';b.addEventListener('click',action);return b};
function appendNotice(text){content.append(el('p',text))}
function showAuth(){
 content.replaceChildren();
 appendNotice('Bewaar je wedstrijdseizoen op verschillende apparaten. Zonder account blijven je favorieten op dit apparaat staan.');
 const form=el('form'),email=el('input'),submit=el('button','Stuur inloglink');
 email.type='email';email.required=true;email.autocomplete='email';email.placeholder='E-mailadres';email.setAttribute('aria-label','E-mailadres');
 submit.type='submit';
 form.append(email,submit);
 form.addEventListener('submit',async event=>{
  event.preventDefault();submit.disabled=true;
  setStatus('Inloglink aanvragen…');
  try{
   const result=await client.auth.signInWithOtp({email:email.value.trim(),options:{emailRedirectTo:location.origin+location.pathname}});
   if(result.error)throw result.error;
   setStatus('Controleer je inbox voor de eenmalige inloglink.');email.value='';
  }catch{setStatus('Inloggen is niet gelukt. Probeer opnieuw.')}
  finally{submit.disabled=false}
 });
 content.append(form);
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
     if(!active)cloudEvents=cloudEvents.filter(item=>item.event_id!==id);
     showSignedIn();
    }
   }catch{
    // Keep the latest pending value. Never silently drop a failed change.
    if(!pending.has(id))pending.set(id,active);
    setStatus('Synchronisatie mislukt. Je favorieten staan op dit apparaat; probeer opnieuw.');
    break;
   }
  }
 }finally{saving=false}
}
async function chooseCloud(){
 if(!user)return;
 if(pending.size||saving){setStatus('Er worden nog wijzigingen gesynchroniseerd. Probeer eerst opnieuw.');return}
 const owner=user.id,version=authVersion;
 try{
  const cloud=await readCloud();
  if(owner!==user?.id||version!==authVersion)return;
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
 const {error}=await client.from('raceatlas_saved_events').update({season_status:statusValue,updated_at:new Date().toISOString()}).eq('user_id',currentUser).eq('event_id',eventId);
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
async function disconnect(){
 if((saving||pending.size)&&!window.confirm('Niet alle wijzigingen zijn gesynchroniseerd. Als je nu uitlogt, kunnen ze verloren gaan. Toch uitloggen?'))return;
 const {error}=await client.auth.signOut();
 if(error){setStatus('Uitloggen is mislukt. Probeer opnieuw.');return}
 authVersion++;pending.clear();cloudEvents=[];user=null;mode='local';savedApi().useGuest();showAuth();setStatus('Uitgelogd. Je persoonlijke seizoen is verborgen; de favorieten van dit apparaat zijn hersteld.');
}
function showSignedIn(){
 content.replaceChildren();
 appendNotice('Ingelogd als '+(user.email||'RaceAtlas-gebruiker')+'.');
 if(mode==='cloud'){
  appendNotice('Je wedstrijdseizoen wordt veilig gesynchroniseerd.');
  content.append(button('Seizoen verversen',chooseCloud));
  renderStatusControls();
  content.append(button('Synchronisatie opnieuw proberen',()=>{void flushPending()}));
 }else{
  appendNotice('Je kunt jouw lokale favorieten toevoegen aan je account of uitsluitend het al opgeslagen cloudseizoen gebruiken. Er wordt niets automatisch overschreven.');
  content.append(button('Lokale favorieten toevoegen aan account',importLocal));
  content.append(button('Alleen cloudseizoen gebruiken',chooseCloud));
 }
 content.append(button('Uitloggen',disconnect));
}
async function onAuth(){
 try{
  const {data,error}=await client.auth.getUser();if(error)throw error;
  user=data?.user||null;mode='local';authVersion++;pending.clear();cloudEvents=[];savedApi().useGuest();
  if(!user){showAuth();return}
  showSignedIn();
 }catch{authVersion++;pending.clear();cloudEvents=[];user=null;mode='local';savedApi().useGuest();showAuth();setStatus('Accountstatus kon niet worden gecontroleerd.')}
}
window.addEventListener('raceatlas:saved-change',e=>{
 if(e.detail&&typeof e.detail.id==='string')writeOne(e.detail.id,!!e.detail.saved);
});
const style=el('style');
style.textContent='.raAccount{background:#fff;border:1px solid #dce7de;border-radius:16px;padding:18px;margin:16px 0 22px}.raAccount h2{font-size:19px;margin:0 0 10px}.raAccount p{font-size:13px;line-height:1.5;color:#506558}.raAccount form{display:flex;flex-wrap:wrap;gap:8px}.raAccount input{min-height:44px;min-width:210px;flex:1;border-radius:9px;border:1px solid #a9bfb0;padding:10px}.raAccount button{border:1px solid #b7ceb9;border-radius:9px;background:#eaf9db;color:#1a3b29;font-weight:750;padding:11px;min-height:44px;margin:4px 7px 4px 0;cursor:pointer}.raAccountStatuses{margin:14px 0}.raAccountStatuses label{display:flex;align-items:center;justify-content:space-between;gap:10px;border-bottom:1px solid #edf1ed;padding:8px 0;font-size:13px}.raAccountStatuses select{min-height:44px;max-width:180px;width:48%;border:1px solid #b7ceb9;border-radius:8px;padding:8px;background:#fff}@media(max-width:520px){.raAccountStatuses label{align-items:stretch;flex-direction:column}.raAccountStatuses select{max-width:none;width:100%}}';
document.head.append(style);
const script=el('script');
script.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
script.onload=async()=>{
 if(!window.supabase?.createClient){setStatus('Accountdienst niet beschikbaar.');return}
 client=window.supabase.createClient(cfg.supabaseUrl,cfg.publishableKey,{auth:{detectSessionInUrl:true,persistSession:true,autoRefreshToken:true}});
 client.auth.onAuthStateChange((_event,session)=>{
  const id=session?.user?.id||null;
  if(id!==user?.id){authVersion++;pending.clear();cloudEvents=[];savedApi().useGuest();user=session?.user||null;mode='local';if(user)showSignedIn();else showAuth()}
 });
 await onAuth();
};
script.onerror=()=>setStatus('Accountdienst niet beschikbaar.');
document.head.append(script);
})();
