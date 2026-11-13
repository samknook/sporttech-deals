(() => {
'use strict';
const config=window.RACEATLAS_ACCOUNT_CONFIG||{};
const byId=id=>document.getElementById(id);
const feedback=(message,error=false)=>{const el=byId('accountFeedback');el.textContent=message;el.dataset.error=String(error)};
const guest=byId('accountGuest'),signed=byId('accountSignedIn'),loading=byId('accountLoading');
const authForm=byId('accountAuthForm'),profileForm=byId('accountProfileForm');
const email=byId('accountEmail'),password=byId('accountPassword');
const authButton=byId('accountAuthSubmit'),passwordRow=byId('accountPasswordRow');
let authMode='login',client=null,user=null,recovery=false,marketingLoaded=false;
async function loadMarketing(){
 marketingLoaded=false;byId('accountMarketing').disabled=true;byId('accountMarketingSave').disabled=true;
 if(!client||!user)return;
 const uid=user.id;
 try{
  const {data,error}=await client.from('raceatlas_marketing_preferences')
   .select('email_opt_in').eq('user_id',uid).maybeSingle();
  if(error)throw error;
  if(!user||uid!==user.id)return;
  byId('accountMarketing').checked=data?.email_opt_in===true;
  marketingLoaded=true;byId('accountMarketing').disabled=false;byId('accountMarketingSave').disabled=false;
 }catch{feedback('Je e-mailvoorkeuren konden niet worden opgehaald. Er is niets gewijzigd.',true)}
}
byId('accountMarketingSave').addEventListener('click',async()=>{
 if(!user||!client||!marketingLoaded)return;
 const save=byId('accountMarketingSave'),enabled=byId('accountMarketing').checked,owner=user.id;
 save.disabled=true;
 try{
  const {data:existing,error:readError}=await client.from('raceatlas_marketing_preferences')
   .select('consented_at').eq('user_id',owner).maybeSingle();
  if(readError)throw readError;
  const time=new Date().toISOString();
  const {error}=await client.from('raceatlas_marketing_preferences').upsert({
   user_id:owner,email_opt_in:enabled,consent_version:'2026-11',
   consented_at:enabled?(existing?.consented_at||time):existing?.consented_at||null,
   revoked_at:enabled?null:time,updated_at:time
  },{onConflict:'user_id'});
  if(error)throw error;
  feedback(enabled?'Je toestemming voor optionele e-mails is opgeslagen.':'Je bent afgemeld voor commerciële e-mails.');
 }catch{feedback('E-mailvoorkeur opslaan mislukt. Je eerdere voorkeur blijft gelden.',true)}
 finally{save.disabled=false}
});
byId('accountDelete').addEventListener('click',async()=>{
 if(!client||!user)return;
 if(window.prompt('Definitief verwijderen? Typ VERWIJDER MIJN ACCOUNT om te bevestigen:')!=='VERWIJDER MIJN ACCOUNT')return;
 const button=byId('accountDelete');button.disabled=true;
 try{
  const {data:auth,error:sessionError}=await client.auth.getSession();
  if(sessionError||!auth?.session?.access_token)throw new Error('Session missing');
  const {data,error}=await client.functions.invoke('raceatlas-delete-account',{
   body:{confirm:'VERWIJDER MIJN ACCOUNT'},
   headers:{Authorization:'Bearer '+auth.session.access_token}
  });
  if(error||data?.deleted!==true)throw new Error('Account deletion failed');
  try{await client.auth.signOut({scope:'local'})}catch{}
  user=null;show(false);feedback('Je account is verwijderd.');
 }catch{feedback('Account verwijderen is mislukt. Je account is behouden.',true)}
 finally{button.disabled=false}
});
const show=(logged)=>{loading.hidden=true;guest.hidden=logged;signed.hidden=!logged};
const validBirth=value=>{
 if(!value)return true;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const d=new Date(value+'T12:00:00');
 return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===value&&d<=new Date()&&d.getFullYear()>=1900;
};
const ageFor=value=>{
 if(!validBirth(value)||!value)return null;
 const today=new Date(),dob=new Date(value+'T12:00:00');
 let age=today.getFullYear()-dob.getFullYear();
 if(today.getMonth()<dob.getMonth()||(today.getMonth()===dob.getMonth()&&today.getDate()<dob.getDate()))age--;
 return age>=0?age:null;
};
const updateAge=()=>{const age=ageFor(byId('profileBirth').value);byId('profileAge').textContent=age===null?'':'Leeftijd: '+age+' jaar (automatisch berekend)'};
byId('profileBirth').addEventListener('change',updateAge);
function selectMode(mode){
 authMode=mode;
 for(const b of document.querySelectorAll('[data-auth]'))b.classList.toggle('active',b.dataset.auth===mode);
 passwordRow.hidden=mode==='recovery';
 password.required=mode!=='recovery';
 password.minLength=mode==='signup'?12:1;
 password.autocomplete=mode==='signup'?'new-password':'current-password';
 authButton.textContent=mode==='signup'?'Gratis account maken':mode==='recovery'?'Herstelmail versturen':'Inloggen';
 feedback('');
}
document.querySelectorAll('[data-auth]').forEach(b=>b.addEventListener('click',()=>selectMode(b.dataset.auth)));
function fillProfile(){
 const m=user?.user_metadata||{};
 byId('accountSignedEmail').textContent=user?.email||'';
 byId('profileFirst').value=typeof m.first_name==='string'?m.first_name:'';
 byId('profileLast').value=typeof m.last_name==='string'?m.last_name:'';
 byId('profileBirth').value=validBirth(m.birth_date)?(m.birth_date||''):'';
 byId('profileCity').value=typeof m.city==='string'?m.city:'';
 const sports=Array.isArray(m.sports)?m.sports:[];
 for(const box of profileForm.querySelectorAll('input[name=sport]'))box.checked=sports.includes(box.value);
 updateAge();
}
async function refresh(){
 if(!client)return;
 try{
  const {data,error}=await client.auth.getUser();
  if(error)throw error;
  user=data?.user||null;
  show(!!user);
  if(user){fillProfile();void loadMarketing();}
 }catch{user=null;show(false);feedback('Accountstatus kon niet worden gecontroleerd. Controleer je verbinding.',true)}
}
const friendlyError=error=>{
 const msg=String(error?.message||'').toLowerCase();
 if(error?.status===429||/rate limit/.test(msg))return 'Te veel aanvragen. Probeer later opnieuw; herhaald klikken helpt niet.';
 if(/invalid login credentials/.test(msg))return 'E-mailadres of wachtwoord onjuist.';
 if(/email not confirmed/.test(msg))return 'Bevestig eerst je e-mailadres via de mail.';
 return 'De aanvraag is mislukt. Controleer de gegevens en probeer het later opnieuw.';
};
authForm.addEventListener('submit',async e=>{
 e.preventDefault();if(!client)return feedback('Accountdienst wordt nog geladen.',true);
 const address=email.value.trim();if(!address)return;
 authButton.disabled=true;
 try{
  let result;
  if(authMode==='login')result=await client.auth.signInWithPassword({email:address,password:password.value});
  else if(authMode==='signup')result=await client.auth.signUp({email:address,password:password.value,options:{emailRedirectTo:new URL('../raceatlas/',location.href).href}});
  else result=await client.auth.resetPasswordForEmail(address,{redirectTo:new URL('../raceatlas/?ra_password_reset=1',location.href).href});
  if(result.error)throw result.error;
  if(authMode==='recovery')feedback('Als dit e-mailadres bekend is, krijg je een herstelmail.');
  else if(authMode==='signup'&&!result.data?.session)feedback('Controleer je e-mail om je registratie te bevestigen.');
  else{feedback('Je bent ingelogd.');await refresh()}
  password.value='';
 }catch(error){feedback(friendlyError(error),true)}
 finally{authButton.disabled=false}
});
profileForm.addEventListener('submit',async e=>{
 e.preventDefault();if(!client||!user)return;
 const birth=byId('profileBirth').value;
 if(!validBirth(birth))return feedback('Vul een geldige geboortedatum in, of laat dit veld leeg.',true);
 const metadata={
  first_name:byId('profileFirst').value.trim(),
  last_name:byId('profileLast').value.trim(),
  birth_date:birth||null,
  city:byId('profileCity').value.trim(),
  sports:[...profileForm.querySelectorAll('input[name=sport]:checked')].map(x=>x.value)
 };
 const save=byId('profileSave');save.disabled=true;
 try{
  const {data,error}=await client.auth.updateUser({data:metadata});
  if(error)throw error;
  user=data?.user||user;fillProfile();
  feedback('Je profiel is opgeslagen en beschikbaar wanneer je op een ander apparaat inlogt.');
 }catch{feedback('Profiel opslaan is mislukt. Je wijzigingen zijn mogelijk niet opgeslagen.',true)}
 finally{save.disabled=false}
});
byId('accountNewPassword').addEventListener('submit',async e=>{
 e.preventDefault();if(!user||!client)return;
 const field=byId('profileNewPassword');if(field.value.length<12)return feedback('Kies minimaal 12 tekens.',true);
 try{const {error}=await client.auth.updateUser({password:field.value});if(error)throw error;field.value='';feedback('Je wachtwoord is gewijzigd.')}
 catch(error){feedback(friendlyError(error),true)}
});
byId('accountSignOut').addEventListener('click',async()=>{
 if(!client)return;
 const {error}=await client.auth.signOut();
 if(error)return feedback('Uitloggen is mislukt.',true);
 user=null;show(false);feedback('Je bent uitgelogd.');
});
function init(){
 if(!config.enabled||!/^https:\/\//.test(config.supabaseUrl||'')||!config.publishableKey){
  loading.textContent='Accountdienst is nog niet geconfigureerd.';return;
 }
 if(!window.supabase?.createClient){loading.textContent='Accountdienst kon niet worden geladen.';return}
 client=window.supabase.createClient(config.supabaseUrl,config.publishableKey,{auth:{detectSessionInUrl:true,persistSession:true,autoRefreshToken:true}});
 client.auth.onAuthStateChange((event,session)=>{
  if(event==='PASSWORD_RECOVERY')recovery=true;
  if(event==='SIGNED_IN'||event==='SIGNED_OUT'||event==='USER_UPDATED')setTimeout(()=>void refresh(),0);
 });
 selectMode('login');
 refresh().then(()=>{
  if(recovery||new URLSearchParams(location.search).get('ra_password_reset')==='1')feedback(user?'Stel hieronder je nieuwe wachtwoord in.':'Log in via de nieuwste herstelmail.');
 });
}
const script=document.createElement('script');
script.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
script.onload=init;script.onerror=()=>{
 const second=document.createElement('script');
 second.src='https://unpkg.com/@supabase/supabase-js@2';second.onload=init;
 second.onerror=()=>{loading.textContent='Accountdienst tijdelijk niet beschikbaar.'};document.head.append(second)
};
document.head.append(script);
})();
