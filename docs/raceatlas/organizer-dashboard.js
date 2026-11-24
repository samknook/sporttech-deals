(()=>{'use strict';
const cfg=window.RACEATLAS_ACCOUNT_CONFIG||{};
const $=id=>document.getElementById(id);
const msg=$('message'),content=$('content'),guest=$('guest'),races=$('races');
const format=n=>new Intl.NumberFormat('nl-NL').format(Number(n)||0);
const metricKeys=['card_views','detail_views','organizer_clicks','registration_clicks'];
const rate=(part,whole)=>whole>0?new Intl.NumberFormat('nl-NL',{maximumFractionDigits:1}).format(part/whole*100)+'%':'—';
const selectedEvents=()=>report?.events?.filter(e=>$('eventFilter').value==='all'||e.event_id===$('eventFilter').value)||[];
const filteredTotals=()=>selectedEvents().reduce((acc,e)=>{for(const key of metricKeys)acc[key]+=Math.max(0,Number(e[key])||0);return acc},{card_views:0,detail_views:0,organizer_clicks:0,registration_clicks:0});
function renderInsights(){
 const totals=filteredTotals();
 $('cards').textContent=format(totals.card_views);$('details').textContent=format(totals.detail_views);
 $('outbound').textContent=format(totals.organizer_clicks);$('registration').textContent=format(totals.registration_clicks);
 const checked=new Set(selectedEvents().map(e=>e.event_id));
 const summary=$('insightSummary'),chart=$('insightChart');
 summary.replaceChildren();chart.replaceChildren();
 const p=document.createElement('span');
 p.textContent='Inschrijfklikken per detailopening: ';
 const strong=document.createElement('strong');strong.textContent=rate(totals.registration_clicks,totals.detail_views);
 summary.append(p,strong);
 if(!checked.size){chart.setAttribute('aria-label','Geen geverifieerde evenementdata beschikbaar');return}
 const days=Number(report?.days)||30;
 const bucketsCount=days<=7?7:days<=30?10:13;
 const now=report?.asOf?new Date(report.asOf):new Date();
 const today=Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate());
 const start=today-(days-1)*86400000;
 const daily=new Map();
 for(const r of report?.trend||[]){
  if(!checked.has(r.event_id)||typeof r.day!=='string')continue;
  const timestamp=Date.parse(r.day+'T00:00:00Z');
  if(!Number.isFinite(timestamp)||timestamp<start||timestamp>today)continue;
  daily.set(r.day,(daily.get(r.day)||0)+Math.max(0,Number(r.registration_clicks)||0));
 }
 const buckets=Array.from({length:bucketsCount},(_,i)=>({
  from:Math.floor(i*days/bucketsCount),to:Math.floor((i+1)*days/bucketsCount)-1,value:0
 }));
 const formatDay=timestamp=>new Date(timestamp).toLocaleDateString('nl-NL',{day:'numeric',month:'short',timeZone:'UTC'});
 for(const b of buckets){
  for(let k=b.from;k<=b.to;k++){
   const day=new Date(start+k*86400000).toISOString().slice(0,10);
   b.value+=daily.get(day)||0;
  }
 }
 const max=Math.max(1,...buckets.map(b=>b.value));
 chart.setAttribute('aria-label','Gemeten inschrijfklikken per periode voor '+($('eventFilter').selectedOptions[0]?.textContent||'alle evenementen'));
 for(const b of buckets){
  const label=formatDay(start+b.from*86400000);
  const ending=formatDay(start+b.to*86400000);
  const col=document.createElement('div');col.className='insight-bucket';
  const track=document.createElement('div');track.className='insight-bar-track';
  const bar=document.createElement('div');bar.className='insight-bar';bar.style.height=(b.value/max*100)+'%';
  track.append(bar);
  const x=document.createElement('span');x.textContent=label;
  col.title=label+(b.to>b.from?' – '+ending:'')+': '+format(b.value)+' inschrijfklikken';
  col.setAttribute('aria-label',col.title);col.append(track,x);chart.append(col);
 }
}
function rankedOrganizerEvents(events,metric){
 const key=metricKeys.includes(metric)?metric:'registration_clicks';
 const count=e=>{const n=Number(e[key]);return Number.isFinite(n)&&n>0?n:0};
 return [...events].sort((a,b)=>count(b)-count(a)||String(a.event_name||a.event_id||'').localeCompare(String(b.event_name||b.event_id||''),'nl'));
}
function renderComparison(){
 const body=$('comparisonRows');body.replaceChildren();
 const events=rankedOrganizerEvents(Array.isArray(report?.events)?report.events:[],$('comparisonSort').value);
 if(!events.length){
  const tr=document.createElement('tr'),td=document.createElement('td');
  td.colSpan=5;td.className='empty-comparison';td.textContent='Nog geen geverifieerde evenementgegevens beschikbaar.';
  tr.append(td);body.append(tr);return;
 }
 for(const event of events){
  const tr=document.createElement('tr'),name=document.createElement('th');name.scope='row';
  name.textContent=event.event_name||event.event_id;tr.append(name);
  for(const key of metricKeys){
   const td=document.createElement('td'),n=Number(event[key]);
   td.textContent=format(Number.isFinite(n)&&n>0?n:0);tr.append(td);
  }
  body.append(tr);
 }
}
function populateEventFilter(){
 const filter=$('eventFilter'),previous=filter.value;
 filter.replaceChildren();
 const all=document.createElement('option');all.value='all';all.textContent='Alle geverifieerde evenementen';filter.append(all);
 for(const e of report?.events||[]){const option=document.createElement('option');option.value=e.event_id;option.textContent=e.event_name||e.event_id;filter.append(option)}
 filter.value=[...filter.options].some(o=>o.value===previous)?previous:'all';
 renderInsights();
}
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
function dailyCsvRows(data,events){
 const allowed=new Map(events.map(e=>[e.event_id,e.event_name||e.event_id]));
 const days=[7,30,90].includes(Number(data?.days))?Number(data.days):30;
 const stamp=Date.parse(String(data?.asOf||new Date().toISOString()).slice(0,10)+'T00:00:00Z');
 const last=Number.isFinite(stamp)?stamp:Date.now();
 const end=Date.UTC(new Date(last).getUTCFullYear(),new Date(last).getUTCMonth(),new Date(last).getUTCDate());
 const first=end-(days-1)*86400000;
 const values=new Map();
 for(const r of data?.trend||[]){
  if(!allowed.has(r.event_id)||!/^20\d{2}-\d{2}-\d{2}$/.test(r.day||''))continue;
  const date=Date.parse(r.day+'T00:00:00Z');
  if(!Number.isFinite(date)||date<first||date>end)continue;
  const count=Number(r.registration_clicks);
  if(!Number.isFinite(count)||count<0)continue;
  const key=r.day+'|'+r.event_id;
  values.set(key,(values.get(key)||0)+count);
 }
 const rows=[['Datum','Evenement-ID','Evenement','Gemeten inschrijfklikken']];
 for(const key of [...values.keys()].sort()){
  const split=key.indexOf('|'),day=key.slice(0,split),id=key.slice(split+1);
  rows.push([day,id,allowed.get(id),values.get(key)]);
 }
 return rows.map(row=>row.map(csvValue).join(','));
}
function render(data){
 report=data;
 populateEventFilter();
 renderComparison();
 races.replaceChildren();
 if(!Array.isArray(data.events)||!data.events.length){
  const p=document.createElement('p');
  p.textContent='Er zijn nog geen geverifieerde evenementen gekoppeld. Claim je evenement via de organisatorenpagina; TriZentro controleert je aanvraag.';
  races.append(p);$('export').disabled=true;$('exportDaily').disabled=true;return;
 }
 $('export').disabled=false;
 $('exportDaily').disabled=!Array.isArray(data.trend)||!data.trend.length;
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
 $('refresh').disabled=true;$('export').disabled=true;$('exportDaily').disabled=true;setMessage('Rapportages ophalen…');
 try{
  const {data:session,error:sErr}=await client.auth.getSession();
  if(sErr||!session.session||session.session.user.id!==activeUser)throw Error('session');
  const period=$('period').value;
  const response=await fetch(cfg.supabaseUrl+'/functions/v1/trizentro-organizer-dashboard?days='+encodeURIComponent(period),{method:'GET',headers:{apikey:cfg.publishableKey,Authorization:'Bearer '+session.session.access_token,Accept:'application/json'},cache:'no-store'});
  if(!response.ok)throw Error('HTTP '+response.status);
  const data=await response.json();
  if(data?.error)throw Error(data.error);
  render(data);setMessage('Rapportages bijgewerkt. Alleen jouw geverifieerde evenementen zijn zichtbaar.');
 }catch(err){report=null;races.replaceChildren();$('export').disabled=true;$('exportDaily').disabled=true;setMessage('Rapportages konden niet veilig worden opgehaald. Meld je opnieuw aan of probeer later opnieuw.');}
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
$('eventFilter').addEventListener('change',renderInsights);
$('comparisonSort').addEventListener('change',renderComparison);
$('exportDaily').addEventListener('click',()=>{
 if(!report?.events?.length||!Array.isArray(report.trend)||!report.trend.length)return;
 const rows=dailyCsvRows(report,selectedEvents());
 if(rows.length<=1)return;
 const csv='\uFEFF'+rows.join('\r\n')+'\r\n';
 const file=new Blob([csv],{type:'text/csv;charset=utf-8'});
 const url=URL.createObjectURL(file),a=document.createElement('a');
 a.href=url;a.download='trizentro-inschrijfklikken-per-dag-'+$('period').value+'-dagen.csv';a.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
});
$('export').addEventListener('click',()=>{
 if(!report?.events?.length)return;
 const cols=['event_id','event_name','card_views','detail_views','organizer_clicks','registration_clicks'];
 const rows=[cols.join(','),...selectedEvents().map(e=>cols.map(c=>csvValue(e[c])).join(','))];
 const csv='\uFEFF'+rows.join('\r\n')+'\r\n';
 const file=new Blob([csv],{type:'text/csv;charset=utf-8'});
 const url=URL.createObjectURL(file);const a=document.createElement('a');
 a.href=url;a.download='trizentro-evenementrapport-'+$('period').value+'-dagen.csv';a.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
});
void init();
})();