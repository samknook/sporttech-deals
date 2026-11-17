(()=>{'use strict';
const cfg=window.RACEATLAS_ACCOUNT_CONFIG||{};
const $=id=>document.getElementById(id);
const msg=$('message'),content=$('content'),guest=$('guest'),races=$('races');
const format=n=>new Intl.NumberFormat('nl-NL').format(Number(n)||0);
let client=null,report=null,activeUser=null;
const setMessage=s=>{msg.textContent=s};
const safeWebsite=url=>{try{const u=new URL(url);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null}catch{return null}};
const csvValue=x=>{let s=String(x??'');if(/^[\s]*[=+@\-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
function render(data){
 report=data;
 const t=data.totals||{};
 $('cards').textContent=format(t.card_views);$('details').textContent=format(t.detail_views);
 $('outbound').textContent=format(t.organizer_clicks);$('registration').textContent=format(t.registration_clicks);
 races.replaceChildren();
 if(!Array.isArray(data.events)||!data.events.length){
  const p=document.createElement('p');
  p.textContent='Er zijn nog geen geverifieerde evenementen gekoppeld. Claim je evenement via de organisatorenpagina; TriZentro controleert je aanvraag.';
  races.append(p);$('export').disabled=true;return;
 }
 $('export').disabled=false;
 for(const e of data.events){
  const section=document.createElement('section');section.className='race';
  const title=document.createElement('h3');title.textContent=e.event_name||e.event_id;
  const description=document.createElement('p');
  description.textContent=[e.event_id,e.start_date?'Officiële datum: '+e.start_date:'Wedstrijddatum nog niet bevestigd'].join(' · ');
  const stats=document.createElement('p');stats.textContent=
   'Kaartweergaven '+format(e.card_views)+' · Details '+format(e.detail_views)+
   ' · Websiteklikken '+format(e.organizer_clicks)+' · Inschrijfklikken '+format(e.registration_clicks);
  section.append(title,description,stats);
  const actions=document.createElement('div');actions.className='actions';
  const claim=document.createElement('a');claim.className='button';
  const q=new URLSearchParams({onderwerp:'Evenementgegevens aanpassen',event:e.event_name,eventId:e.event_id});
  const official=safeWebsite(e.official_event_url);if(official)q.set('bron',official);
  claim.href='organisatoren.html?'+q.toString()+'#contact';claim.textContent='Gegevens bijwerken';actions.append(claim);
  if(official){const link=document.createElement('a');link.className='button';link.href=official;link.rel='noopener noreferrer';link.target='_blank';link.textContent='Officiële website';actions.append(link)}
  section.append(actions);races.append(section);
 }
}
async function load(){
 if(!client||!activeUser)return;
 $('refresh').disabled=true;$('export').disabled=true;setMessage('Rapportages ophalen…');
 try{
  const {data:session,error:sErr}=await client.auth.getSession();
  if(sErr||!session.session||session.session.user.id!==activeUser)throw Error('session');
  const period=$('period').value;
  const response=await fetch(cfg.supabaseUrl+'/functions/v1/trizentro-organizer-dashboard?days='+encodeURIComponent(period),{method:'GET',headers:{apikey:cfg.publishableKey,Authorization:'Bearer '+session.session.access_token,Accept:'application/json'},cache:'no-store'});
  if(!response.ok)throw Error('HTTP '+response.status);
  const data=await response.json();
  if(data?.error)throw Error(data.error);
  render(data);setMessage('Rapportages bijgewerkt. Alleen jouw geverifieerde evenementen zijn zichtbaar.');
 }catch(err){report=null;races.replaceChildren();setMessage('Rapportages konden niet veilig worden opgehaald. Meld je opnieuw aan of probeer later opnieuw.');}
 finally{$('refresh').disabled=false}
}
async function init(){
 if(!window.supabase?.createClient||!cfg.supabaseUrl||!cfg.publishableKey){setMessage('Accountdienst is niet beschikbaar.');guest.hidden=false;return}
 client=window.supabase.createClient(cfg.supabaseUrl,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true}});
 const {data,error}=await client.auth.getUser();
 if(error||!data.user){setMessage('Log in om jouw evenementen te bekijken.');guest.hidden=false;return}
 if(!data.user.email_confirmed_at){setMessage('Bevestig eerst je accountadres.');guest.hidden=false;return}
 activeUser=data.user.id;content.hidden=false;await load();
}
$('period').addEventListener('change',()=>{void load()});
$('refresh').addEventListener('click',()=>{void load()});
$('export').addEventListener('click',()=>{
 if(!report?.events?.length)return;
 const cols=['event_id','event_name','card_views','detail_views','organizer_clicks','registration_clicks'];
 const rows=[cols.join(','),...report.events.map(e=>cols.map(c=>csvValue(e[c])).join(','))];
 const csv='\uFEFF'+rows.join('\r\n')+'\r\n';
 const file=new Blob([csv],{type:'text/csv;charset=utf-8'});
 const url=URL.createObjectURL(file);const a=document.createElement('a');
 a.href=url;a.download='trizentro-evenementrapport-'+$('period').value+'-dagen.csv';a.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
});
void init();
})();