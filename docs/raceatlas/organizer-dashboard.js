(()=>{'use strict';
const cfg=window.RACEATLAS_ACCOUNT_CONFIG||{};
const $=id=>document.getElementById(id);
const msg=$('message'),content=$('content'),guest=$('guest'),races=$('races');
const format=n=>new Intl.NumberFormat('nl-NL').format(Number(n)||0);
let client=null,report=null,activeUser=null;
const editPanel=$('editPanel'),editForm=$('editForm'),editMessage=$('editMessage');
const fieldTitles={start_date:'Wedstrijddatum',registration_opens_at:'Inschrijving opent',registration_status:'Inschrijfstatus',official_event_url:'Officiële wedstrijdwebsite',official_registration_url:'Inschrijflink',distance_label:'Afstanden',price_eur:'Prijs',other:'Overige informatie'};
const validUpdate=(field,value)=>{
 if(field==='start_date'||field==='registration_opens_at')return /^20\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value)&&!Number.isNaN(Date.parse(value+'T12:00:00Z'));
 if(field==='official_event_url'||field==='official_registration_url')return !!safeWebsite(value);
 if(field==='registration_status')return ['open','closed','not_open','sold_out','unknown'].includes(value.toLowerCase());
 if(field==='price_eur')return /^\d{1,5}(?:[.,]\d{1,2})?$/.test(value);
 return !!fieldTitles[field] && value.trim().length>0;
};
async function showHistory(eventId){
 const ul=$('editHistory');ul.replaceChildren();
 const {data,error}=await client.from('raceatlas_organizer_change_requests').select('field_name,review_status,created_at,reviewer_note').eq('event_id',eventId).order('created_at',{ascending:false}).limit(20);
 if(error){const li=document.createElement('li');li.textContent='Status kon niet worden opgehaald.';ul.append(li);return}
 if(!data?.length){const li=document.createElement('li');li.textContent='Nog geen wijzigingen ingediend.';ul.append(li);return}
 const statusNames={pending:'In behandeling',approved:'Goedgekeurd',rejected:'Niet goedgekeurd'};
 for(const item of data){
  const li=document.createElement('li');
  const date=item.created_at?new Date(item.created_at).toLocaleDateString('nl-NL'):'';
  li.textContent=[fieldTitles[item.field_name]||item.field_name,statusNames[item.review_status]||'In behandeling',date,item.reviewer_note||''].filter(Boolean).join(' · ');
  ul.append(li);
 }
}
async function openEdit(e){
 if(!report?.events?.some(row=>row.event_id===e.event_id))return;
 editForm.reset();$('editEventId').value=e.event_id;$('editEvent').value=e.event_name;
 $('editSource').value=safeWebsite(e.official_event_url)||'';
 editMessage.textContent='';editPanel.hidden=false;
 editPanel.scrollIntoView({behavior:'smooth',block:'start'});
 await showHistory(e.event_id);
}
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
  claim.href='organisatoren.html?'+q.toString()+'#contact';claim.textContent='Algemeen correctieverzoek';actions.append(claim);
  const edit=document.createElement('button');edit.type='button';edit.textContent='Wijziging voorstellen';edit.addEventListener('click',()=>{void openEdit(e)});actions.prepend(edit);
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
$('cancelEdit').addEventListener('click',()=>{editPanel.hidden=true;editMessage.textContent=''});
editForm.addEventListener('submit',async ev=>{
 ev.preventDefault();
 if(!client||!activeUser||!editForm.reportValidity())return;
 const event_id=$('editEventId').value,field_name=$('editField').value,proposed_value=$('editValue').value.trim(),evidence_url=$('editSource').value.trim(),explanation=$('editReason').value.trim();
 if(!/^ra-\d{1,8}$/.test(event_id)||!report?.events?.some(row=>row.event_id===event_id)){editMessage.textContent='Deze wedstrijd is niet gekoppeld aan jouw account.';return}
 if(!validUpdate(field_name,proposed_value)||!safeWebsite(evidence_url)){editMessage.textContent='Controleer de waarde en de officiële HTTPS-bron.';return}
 const button=$('sendEdit');button.disabled=true;editMessage.textContent='Wijzigingsvoorstel veilig indienen…';
 try{
  const {data:auth,error:authError}=await client.auth.getUser();
  if(authError||auth.user?.id!==activeUser||!auth.user.email_confirmed_at)throw Error('account');
  const {error}=await client.from('raceatlas_organizer_change_requests').insert({user_id:activeUser,event_id,field_name,proposed_value,evidence_url,explanation});
  if(error)throw error;
  editMessage.textContent='Je voorstel is ontvangen en staat in behandeling. De publieke wedstrijdinformatie is niet gewijzigd.';
  $('editValue').value='';$('editReason').value='';
  await showHistory(event_id);
 }catch{editMessage.textContent='Indienen is niet gelukt. Controleer je account en probeer het opnieuw.'}
 finally{button.disabled=false}
});
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