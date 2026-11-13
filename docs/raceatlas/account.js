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
wrapper.append(title,status,content);
const where=document.querySelector('#savedPage .sectionHeading');
if(!where)return;
where.insertAdjacentElement('afterend',wrapper);
// The old season panel stays available to the sync engine, not as account UI.
wrapper.hidden=true;
let client=null,user=null,mode='local',saving=false;
const pending=new Map();
let authVersion=0;
let cloudEvents=[];
let alertPrefs=new Map();
let alertBusy=false;
let marketingPref={email_opt_in:false,consented_at:null,revoked_at:null};
let marketingBusy=false;
let marketingReady=false;
const setStatus=text=>{status.textContent=text;status.setAttribute('role','status')};
const formatAuthError=(error,action='login')=>{
 const code=String(error?.code||'').toLowerCase(),message=String(error?.message||'').toLowerCase();
 if(code==='over_email_send_rate_limit'||/email rate limit exceeded/.test(message))return 'De e-maildienst van RaceAtlas heeft de verzendlimiet bereikt. Nieuwe inlog- en herstelmails worden voorlopig door Supabase geweigerd. Probeer niet steeds opnieuw; voor meer capaciteit moet de beheerder een eigen SMTP-verzender instellen.';
 if(/over_request_rate_limit|too_many_requests/.test(code)||error?.status===429)return 'Te veel aanvragen achter elkaar. Probeer later opnieuw, zonder steeds opnieuw op de knop te drukken.';
 if(code==='otp_disabled'||/signups not allowed for otp/.test(message))return 'Inloglinks zijn momenteel uitgeschakeld in de accountinstellingen. Gebruik je wachtwoord of neem contact op met RaceAtlas.';
 if(code==='invalid_credentials'||/invalid login credentials/.test(message))return 'E-mailadres of wachtwoord klopt niet. Gebruik het wachtwoord dat je eerder hebt ingesteld. Heb je alleen met een e-maillink ingelogd? Stel dan eerst vanuit een bestaande ingelogde sessie een wachtwoord in.';
 if(code==='email_not_confirmed')return 'Bevestig eerst je e-mailadres via de bevestigingsmail. Vraag niet onnodig meerdere e-mails aan.';
 if(code==='user_already_exists'||/already registered/.test(message))return 'Voor dit e-mailadres bestaat al een account. Kies Inloggen in plaats van Registreren.';
 if(code==='weak_password')return 'Het gekozen wachtwoord voldoet niet aan de veiligheidseisen. Gebruik minimaal 12 tekens en kies een uniek wachtwoord.';
 if(/email|smtp|mailer|sending/.test(code))return 'De e-maildienst is niet beschikbaar. Probeer niet herhaaldelijk opnieuw; neem contact op met RaceAtlas.';
 if(/redirect|validation/.test(code))return 'De aanmeldlink verwijst naar een niet-toegestaan terugkeeradres. RaceAtlas moet de Auth-redirectinstellingen controleren.';
 return action==='login'?'Inloggen is mislukt. Controleer je gegevens en probeer één keer opnieuw.':'De accountaanvraag is mislukt. Probeer later opnieuw of neem contact op.';
};
let mailBlockUntil=0;
const checkMailBlock=()=>{if(Date.now()<mailBlockUntil){setStatus('E-mailaanvragen zijn tijdelijk geblokkeerd na een verzendlimiet. Vermijd herhaalde pogingen; je kunt gewoon met je bestaande wachtwoord inloggen.');return true}return false};
const registerMailError=error=>{if(String(error?.code||'').toLowerCase()==='over_email_send_rate_limit'||/email rate limit exceeded/i.test(error?.message||''))mailBlockUntil=Date.now()+10*60*1000;};
const accountNav=el('button','Mijn account');
accountNav.id='raAccountNav';accountNav.type='button';accountNav.className='raAccountNav';
accountNav.addEventListener('click',()=>{document.getElementById('navSaved')?.click();wrapper.scrollIntoView({behavior:'smooth',block:'start'})});
const accountLinks=document.querySelector('.navright');
// The public account destination is now a dedicated page in shared-ui.js.
// Do not inject a second account button into the season navigation.
const recoveryRequested=new URLSearchParams(location.search).get('ra_password_reset')==='1';
const callbackParams=new URLSearchParams(location.hash.slice(1));
if(recoveryRequested||callbackParams.has('access_token')||callbackParams.has('error')||new URLSearchParams(location.search).has('code'))accountNav.click();
const button=(label,action)=>{const b=el('button',label);b.type='button';b.addEventListener('click',action);return b};
function appendNotice(text){content.append(el('p',text))}
function callbackUrl(recovery=false){
 // Keep the historically configured Supabase callback path for email links.
 // The public legacy route redirects back to /events/, retaining query and hash.
 const source=document.currentScript?.src||Array.from(document.scripts).find(x=>/\/raceatlas\/account\.js(?:\?|$)/.test(x.src))?.src;
 const url=source?new URL('./',source):new URL(location.pathname,location.origin);
 if(previewActive)url.searchParams.set('ra_account_preview','1');
 if(recovery)url.searchParams.set('ra_password_reset','1');
 return url.toString();
}
function makePasswordInput(autocomplete){
 const input=el('input');
 input.type='password';input.required=true;input.minLength=autocomplete==='current-password'?1:12;input.maxLength=256;input.autocomplete=autocomplete;input.placeholder='Wachtwoord (minimaal 12 tekens)';
 input.setAttribute('aria-label','Wachtwoord');
 return input;
}
function addPasswordToggle(input,form){
 const label=el('label'),toggle=el('input'),text=el('span','Toon wachtwoord');
 label.className='raPasswordToggle';toggle.type='checkbox';
 toggle.addEventListener('change',()=>{input.type=toggle.checked?'text':'password'});
 label.append(toggle,text);form.append(label);
}
function showAuth(){
 content.replaceChildren();
 appendNotice('Log in om je wedstrijdseizoen op meerdere apparaten te openen. Heb je nog geen account? Kies Registreren.');
 const tabs=el('div');tabs.className='raAuthTabs';tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Inlogmethode');
 const fields=el('div');
 let enteredEmail='';
 for(const [kind,title] of [['login','Inloggen'],['signup','Registreren'],['magic','Inloglink']]){
  const b=button(title,()=>renderMethod(kind));b.dataset.raAuthMode=kind;tabs.append(b);
 }
 content.append(tabs,fields);
 function renderMethod(kind){
  fields.replaceChildren();
  for(const b of tabs.querySelectorAll('button')){const active=b.dataset.raAuthMode===kind;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active))}
  const form=el('form'),email=el('input'),submit=el('button',kind==='signup'?'Maak gratis account':kind==='magic'?'Stuur inloglink':kind==='recovery'?'Stuur herstelmail':'Inloggen');
  form.className='raAuthForm';email.type='email';email.required=true;email.autocomplete='email';email.placeholder='E-mailadres';email.setAttribute('aria-label','E-mailadres');
  email.value=enteredEmail;email.addEventListener('input',()=>{enteredEmail=email.value});
  form.append(email);
  let password=null;
  if(kind==='login'||kind==='signup'){password=makePasswordInput(kind==='signup'?'new-password':'current-password');form.append(password);addPasswordToggle(password,form)}
  if(kind==='signup'){const help=el('p','Alleen voor een nieuw account. Heb je eerder een e-maillink gebruikt, kies Inloggen; maak geen tweede account. Nieuwe registraties kunnen een bevestigingsmail vereisen.');form.append(help)}
  submit.type='submit';form.append(submit);
  form.addEventListener('submit',async event=>{
   event.preventDefault();
   if(!client){setStatus('De accountdienst wordt nog geladen. Probeer het opnieuw zodra deze beschikbaar is.');return}
   if(kind==='signup'&&password&&password.value.length<12){setStatus('Gebruik voor nieuwe accounts een wachtwoord van minimaal 12 tekens.');return}
   if(kind!=='login'&&checkMailBlock())return;
   submit.disabled=true;setStatus(kind==='recovery'?'Herstelmail aanvragen…':'Accountaanvraag verwerken…');
   try{
    const address=email.value.trim();
    let result;
    if(kind==='recovery')result=await client.auth.resetPasswordForEmail(address,{redirectTo:callbackUrl(true)});
    else if(kind==='signup')result=await client.auth.signUp({email:address,password:password.value,options:{emailRedirectTo:callbackUrl()}});
    else if(kind==='login')result=await client.auth.signInWithPassword({email:address,password:password.value});
    else result=await client.auth.signInWithOtp({email:address,options:{emailRedirectTo:callbackUrl(),shouldCreateUser:false}});
    if(result.error)throw result.error;
    if(kind==='recovery')setStatus('Als het e-mailadres bekend is, ontvang je een link om een nieuw wachtwoord in te stellen.');
    else if(kind==='signup')setStatus(result.data?.session?'Je account is aangemaakt en je bent ingelogd.':'Controleer je e-mail om je registratie te bevestigen. Gebruik daarna Inloggen.');
    else if(kind==='login')setStatus('Je bent ingelogd. Je kunt nu je wedstrijdseizoen openen.');
    else setStatus('Als er een account bestaat, ontvang je een inloglink. Controleer je inbox en spam.');
    if(password)password.value='';
   }catch(error){registerMailError(error);setStatus(formatAuthError(error,kind))}
   finally{submit.disabled=false}
  });
  fields.append(form);
  if(kind==='login'){
   const forgot=button('Wachtwoord vergeten?',()=>{renderMethod('recovery');fields.querySelector('input[type=email]')?.focus()});
   forgot.className='raForgot';fields.append(forgot);
  }
  if(kind==='recovery'){
   form.prepend(el('p','Vul het e-mailadres van je account in. Je ontvangt een link om een nieuw wachtwoord te kiezen.'));
   fields.append(button('Terug naar inloggen',()=>{setStatus('');renderMethod('login')}));
  }
 }
 renderMethod(new URLSearchParams(location.search).get('ra_password_reset')==='1'?'recovery':'login');
 const privacy=el('p'),link=el('a','Privacy en e-mailvoorkeuren');link.href='privacy.html';
 privacy.append('Geen marketingmails zonder aparte toestemming. ',link);content.append(privacy);
}
function renderPasswordSettings(){
 if(!user)return;
 const section=el('section');section.className='raPasswordSettings';
 const heading=el('h3',new URLSearchParams(location.search).get('ra_password_reset')==='1'?'Nieuw wachtwoord instellen':'Wachtwoord instellen of wijzigen');
 const help=el('p','Ook als je eerder met een inloglink bent begonnen, kun je hier een wachtwoord instellen voor hetzelfde account.');
 const form=el('form'),password=makePasswordInput('new-password'),confirm=makePasswordInput('new-password'),submit=el('button','Wachtwoord opslaan');
 confirm.placeholder='Herhaal je nieuwe wachtwoord';confirm.setAttribute('aria-label','Herhaal wachtwoord');
 form.className='raAuthForm';form.append(password,confirm);addPasswordToggle(password,form);submit.type='submit';form.append(submit);
 form.addEventListener('submit',async event=>{
  event.preventDefault();
  if(password.value!==confirm.value){setStatus('De wachtwoorden zijn niet gelijk.');return}
  if(password.value.length<12){setStatus('Gebruik minimaal 12 tekens.');return}
  submit.disabled=true;
  try{
   const {error}=await client.auth.updateUser({password:password.value});if(error)throw error;
   password.value='';confirm.value='';
   const url=new URL(location.href);url.searchParams.delete('ra_password_reset');
   history.replaceState(history.state,'',url.pathname+url.search+url.hash);
   showSignedIn();
   setStatus('Wachtwoord veilig opgeslagen. Je kunt voortaan met e-mailadres en wachtwoord inloggen.');
  }catch(err){setStatus(formatAuthError(err))}finally{submit.disabled=false}
 });
 section.append(heading,help,form);content.append(section);
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
  marketingPref=marketing;marketingReady=true;
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
 authVersion++;pending.clear();cloudEvents=[];alertPrefs.clear();user=null;mode='local';marketingPref={email_opt_in:false,consented_at:null,revoked_at:null};marketingReady=false;savedApi().useGuest();showAuth();setStatus('Uitgelogd. Je persoonlijke seizoen is verborgen; de favorieten van dit apparaat zijn hersteld.');
}

async function updateMarketingConsent(enabled){
 if(!user||marketingBusy||!marketingReady)return;
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
  marketingPref=await readMarketingPreference(owner);
  if(owner!==user?.id||version!==authVersion)return;
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
 check.type='checkbox';check.checked=marketingPref.email_opt_in===true;check.disabled=!marketingReady;
 const span=el('span','Ja, ik wil commerciële RaceAtlas-mails ontvangen.');
 label.append(check,span);
 const save=button('E-mailvoorkeur opslaan',async()=>{save.disabled=true;try{await updateMarketingConsent(check.checked)}finally{save.disabled=false}});
 save.disabled=!marketingReady;
 const privacy=el('a','Privacy en afmelden');privacy.href='privacy.html';
 panel.append(helper,label,save,privacy);
 content.append(panel);
}

function showSignedIn(){
 content.replaceChildren();
 if(new URLSearchParams(location.search).get('ra_password_reset')==='1'){
  renderPasswordSettings();
  return;
 }
 appendNotice('Ingelogd als '+(user.email||'RaceAtlas-gebruiker')+'.');
 if(mode==='cloud'){
  appendNotice('Je wedstrijdseizoen wordt veilig gesynchroniseerd.');
  appendNotice('Wil je een e-mail over een inschrijfdatum? Open Meldingen bij de wedstrijd en bevestig je e-mailadres.');
  content.append(button('Seizoen verversen',chooseCloud));
  renderStatusControls();

  content.append(button('Synchronisatie opnieuw proberen',()=>{void flushPending()}));
  content.append(button('Download mijn seizoensgegevens',exportSeason));
  content.append(button('Verwijder cloudseizoen',eraseCloudSeason));
 }else{
  appendNotice('Je kunt jouw lokale favorieten toevoegen aan je account of uitsluitend het al opgeslagen cloudseizoen gebruiken. Er wordt niets automatisch overschreven.');
  content.append(button('Lokale favorieten toevoegen aan account',importLocal));
  content.append(button('Alleen cloudseizoen gebruiken',chooseCloud));
 }
 renderMarketingControls();
 renderPasswordSettings();
 content.append(button('Uitloggen',disconnect));
 content.append(button('Verwijder mijn account definitief',deleteAccount));
}
async function onAuth(){
 try{
  const {data,error}=await client.auth.getUser();if(error)throw error;
  user=data?.user||null;mode='local';authVersion++;pending.clear();cloudEvents=[];alertPrefs.clear();marketingReady=false;savedApi().useGuest();
  if(!user){showAuth();return}
  const owner=user.id,version=authVersion;
  showSignedIn();
  try{
   const latest=await readMarketingPreference(owner);
   if(owner!==user?.id||version!==authVersion)return;
   marketingPref=latest;marketingReady=true;showSignedIn();
  }catch{if(owner===user?.id&&version===authVersion)setStatus('E-mailvoorkeuren ophalen mislukt. Controleer je voorkeur voordat je deze wijzigt.')}
  if(owner===user?.id&&version===authVersion&&!savedApi().guest().length)await chooseCloud();
 }catch{authVersion++;pending.clear();cloudEvents=[];alertPrefs.clear();user=null;mode='local';marketingPref={email_opt_in:false,consented_at:null,revoked_at:null};savedApi().useGuest();showAuth();setStatus('Accountstatus kon niet worden gecontroleerd.')}
}
window.addEventListener('raceatlas:saved-change',e=>{
 if(e.detail&&typeof e.detail.id==='string')writeOne(e.detail.id,!!e.detail.saved);
});
const style=el('style');
style.textContent='.raAccount{background:#fff;border:1px solid #dce7de;border-radius:16px;padding:18px;margin:16px 0 22px}.raAccount h2{font-size:19px;margin:0 0 10px}.raAccount p{font-size:13px;line-height:1.5;color:#506558}.raAccount form{display:flex;flex-wrap:wrap;gap:8px}.raAccount input{min-height:44px;min-width:210px;flex:1;border-radius:9px;border:1px solid #a9bfb0;padding:10px}.raAccount button{border:1px solid #b7ceb9;border-radius:9px;background:#eaf9db;color:#1a3b29;font-weight:750;padding:11px;min-height:44px;margin:4px 7px 4px 0;cursor:pointer}.raAccountStatuses{margin:14px 0}.raAccountStatuses label{display:flex;align-items:center;justify-content:space-between;gap:10px;border-bottom:1px solid #edf1ed;padding:8px 0;font-size:13px}.raAccountStatuses select{min-height:44px;max-width:180px;width:48%;border:1px solid #b7ceb9;border-radius:8px;padding:8px;background:#fff}@media(max-width:520px){.raAccountStatuses label{align-items:stretch;flex-direction:column}.raAccountStatuses select{max-width:none;width:100%}}';
style.textContent+='.raAccount>p[role=status]{min-height:18px;margin:10px 0;font-size:13px;color:#a23b20;font-weight:700}.raAuthTabs{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 15px}.raAuthTabs button{background:#f2f6f0}.raAuthTabs button.selected{background:#c6ff46;border-color:#8bbf48}.raAuthForm{display:flex;flex-direction:column;align-items:stretch;max-width:460px;gap:9px}.raAuthForm input{width:100%;min-width:0}.raAuthForm button{align-self:start}.raPasswordToggle{display:flex;align-items:center;gap:8px;font-size:12px}.raPasswordToggle input{width:18px!important;min-width:18px;min-height:18px;flex:none}.raForgot{background:transparent!important;text-decoration:underline;border:0!important;padding:8px!important}.raPasswordSettings{margin:18px 0;border-top:1px solid #e3e9e3;padding-top:14px}.raMarketing{border-top:1px solid #dde9dd;margin:16px 0;padding-top:14px}.raMarketing label{display:flex;align-items:center;gap:9px;font-size:13px;font-weight:650}.raMarketing label input{width:18px;height:18px;min-width:18px;flex:none;accent-color:#317845}.raMarketing a{display:inline-block;margin:10px 0;font-size:12px}.raAccount form button{background:#c6ff46;color:#14251e;border:0;padding:11px 18px}.raAccountNav{margin-left:5px}.raAccount{scroll-margin-top:24px}@media(max-width:660px){.raAccountNav{display:none}}.raAccountAlerts{margin:20px 0}.raAccountAlerts h3{font-size:17px;margin:0 0 8px}.raAlertItem{border:1px solid #dde9dd;border-radius:10px;margin:10px 0;padding:12px}.raAlertOptions{display:grid;gap:8px;margin-top:10px}.raAlertOptions label{display:flex;gap:9px;align-items:center;font-size:13px}.raAlertOptions input{width:18px;height:18px;accent-color:#317845}';
document.head.append(style);
// Render the email form immediately; an unavailable CDN must never leave a blank account screen.
showAuth();
const script=el('script');
script.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
script.onload=async()=>{
 if(!window.supabase?.createClient){setStatus('Accountdienst niet beschikbaar.');return}
 client=window.supabase.createClient(cfg.supabaseUrl,cfg.publishableKey,{auth:{detectSessionInUrl:true,persistSession:true,autoRefreshToken:true}});
 const authErrorParams=new URLSearchParams(location.hash.slice(1));
 const callbackError=authErrorParams.get('error_description')||new URLSearchParams(location.search).get('error_description');
 client.auth.onAuthStateChange((event,session)=>{
  if(event==='PASSWORD_RECOVERY'){setStatus('Je bent geverifieerd. Stel hieronder je nieuwe wachtwoord in.');}
  const id=session?.user?.id||null;
  if(id!==user?.id){authVersion++;pending.clear();cloudEvents=[];alertPrefs.clear();marketingPref={email_opt_in:false,consented_at:null,revoked_at:null};marketingReady=false;savedApi().useGuest();user=session?.user||null;mode='local';if(user){showSignedIn();setTimeout(()=>{if(user?.id===id)void onAuth()},0)}else showAuth()}
 });
 await onAuth();
 if(callbackError)setStatus('Deze e-maillink is ongeldig of verlopen. Vraag een nieuwe link aan.');
 else if(recoveryRequested&&!user)setStatus('Open de nieuwste herstelmail om een nieuw wachtwoord in te stellen. Is de link verlopen? Vraag hieronder een nieuwe aan.');
};
script.onerror=()=>{const fallback=el('script');fallback.src='https://unpkg.com/@supabase/supabase-js@2';fallback.onload=script.onload;fallback.onerror=()=>setStatus('Accountdienst niet beschikbaar. Controleer je verbinding of schakel scriptblokkering uit voor deze site.');document.head.append(fallback)};
document.head.append(script);
})();
