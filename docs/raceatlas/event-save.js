/* TriZentro event page: shared cross-device account season, guest local fallback.
   Uses the same Supabase table and auth storage as raceatlas/account.js. */
(()=>{'use strict';
const button=document.getElementById('saveRace');
const id=window.TriZentroEventSaveId;
if(!button||!/^ra-\d{1,8}$/.test(id))return;
const store='raceatlas-saved-v2',config=window.RACEATLAS_ACCOUNT_CONFIG||{};
let client=null,user=null,cloud=false,saved=false,busy=true;
const note=document.createElement('p');
note.className='event-save-note';
note.setAttribute('role','status');
note.style.cssText='font-size:12px;line-height:1.5;color:#647384;margin:8px 0 0';
button.insertAdjacentElement('afterend',note);
function localRead(){
 try{const data=JSON.parse(localStorage.getItem(store)||'[]');return Array.isArray(data)?data.filter(x=>typeof x==='string'&&/^ra-\d{1,8}$/.test(x)):[]}
 catch{return []}
}
function localWrite(active){
 const current=localRead();
 const next=active?[...new Set([...current,id])]:current.filter(x=>x!==id);
 localStorage.setItem(store,JSON.stringify(next));
}
function render(message){
 button.disabled=busy;
 button.setAttribute('aria-pressed',String(saved));
 button.textContent=busy?'Moment…':saved?'✓ Bewaard in mijn seizoen':'☆ Bewaar in mijn seizoen';
 note.textContent=message|| (cloud?'Je seizoen wordt met je account gesynchroniseerd.':'Opgeslagen op dit apparaat. Log in om je seizoen op andere apparaten te zien.');
}
async function refresh(){
 busy=true;render('Seizoensstatus ophalen…');
 try{
  if(client){
   const response=await client.auth.getUser();
   if(response.error&&response.error.message!=='Auth session missing!')throw response.error;
   user=response.data?.user||null;
   if(user){
    const data=await client.from('raceatlas_saved_events').select('event_id').eq('user_id',user.id).eq('event_id',id).maybeSingle();
    if(data.error)throw data.error;
    cloud=true;saved=!!data.data;busy=false;render();return;
   }
  }
  cloud=false;saved=localRead().includes(id);busy=false;render();
 }catch(error){
  // If an account could be signed in, do not write local data and falsely promise cloud sync.
  const session=client?await client.auth.getSession().catch(()=>({data:{session:null}})):null;
  if(session?.data?.session){busy=true;render('Accountopslag tijdelijk niet bereikbaar. Probeer het opnieuw.');return}
  cloud=false;user=null;saved=localRead().includes(id);busy=false;render();
 }
}
button.addEventListener('click',async()=>{
 if(busy)return;
 busy=true;render('Wijziging opslaan…');
 const target=!saved;
 try{
  if(cloud&&user&&client){
   if(target){
    // Insert only when absent: never reset 'registered' or 'completed'
    // when another tab already has this race in the account.
    const {error}=await client.from('raceatlas_saved_events').upsert(
     {user_id:user.id,event_id:id,season_status:'interested'},
     {onConflict:'user_id,event_id',ignoreDuplicates:true});
    if(error)throw error;
   }else{
    const {error}=await client.from('raceatlas_saved_events').delete().eq('user_id',user.id).eq('event_id',id);
    if(error)throw error;
   }
  }else localWrite(target);
  saved=target;busy=false;render(target?'Wedstrijd opgeslagen.':'Wedstrijd verwijderd uit je seizoen.');
 }catch(error){
  busy=false;render('Opslaan mislukt. Je seizoen is niet gewijzigd. Probeer opnieuw.');
 }
});
window.addEventListener('storage',event=>{if(!cloud&&event.key===store)void refresh()});
async function init(){
 if(config.enabled===true&&/^https:\/\//.test(config.supabaseUrl||'')&&config.publishableKey){
  let factory=window.supabase?.createClient;
  if(!factory){
   for(const url of ['https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2','https://unpkg.com/@supabase/supabase-js@2']){
    try{await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=url;s.onload=resolve;s.onerror=reject;document.head.append(s)});factory=window.supabase?.createClient;if(factory)break}catch{}
   }
  }
  if(factory){
   client=factory(config.supabaseUrl,config.publishableKey,{auth:{detectSessionInUrl:false,persistSession:true,autoRefreshToken:true}});
   client.auth.onAuthStateChange(()=>{setTimeout(()=>void refresh(),0)});
  }
 }
 await refresh();
}
void init();
})();