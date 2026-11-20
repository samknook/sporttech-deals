(()=>{'use strict';
const cfg=window.RACEATLAS_ACCOUNT_CONFIG||{};
const $=id=>document.getElementById(id);
const status=$('status'),list=$('requests'),app=$('app'),denied=$('denied');
let client=null,userId=null,busy=false;
const label={start_date:'Wedstrijddatum',registration_opens_at:'Inschrijfopening',registration_status:'Inschrijfstatus',official_event_url:'Officiële wedstrijdwebsite',official_registration_url:'Officiële inschrijflink',distance_label:'Afstanden',price_eur:'Prijs',other:'Overige wijziging'};
const trustedUrl=x=>{try{const u=new URL(x);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null}catch{return null}};
function el(tag,content,className){const n=document.createElement(tag);if(content!==undefined)n.textContent=content;if(className)n.className=className;return n}
async function api(method,params,body){
 const {data:session,error}=await client.auth.getSession();
 if(error||session.session?.user?.id!==userId||!session.session?.access_token)throw Error('session_expired');
 const endpoint=cfg.supabaseUrl+'/functions/v1/trizentro-organizer-review-admin'+(params?'?'+new URLSearchParams(params).toString():'');
 const response=await fetch(endpoint,{method,headers:{apikey:cfg.publishableKey,Authorization:'Bearer '+session.session.access_token,Accept:'application/json',...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,cache:'no-store'});
 if(response.status===401||response.status===403)throw Error('access_denied');
 if(!response.ok)throw Error('request_failed');
 const data=await response.json();
 if(data?.error)throw Error('request_failed');
 return data;
}
function render(rows){
 list.replaceChildren();
 if(!rows.length){list.append(el('p','Geen verzoeken voor deze status.'));return}
 for(const r of rows){
  const article=el('article',undefined,'item');
  article.append(el('h2',r.event_name||r.event_id));
  article.append(el('p',(r.event_id||'')+' · '+(label[r.field_name]||r.field_name)+' · '+new Date(r.created_at).toLocaleDateString('nl-NL'),'meta'));
  article.append(el('p','Voorgestelde waarde'));
  article.append(el('div',r.proposed_value,'value'));
  article.append(el('p','Toelichting: '+r.explanation,'hint'));
  const source=trustedUrl(r.evidence_url);
  if(source){const a=el('a','Officiële bron controleren ↗');a.href=source;a.target='_blank';a.rel='noopener noreferrer';article.append(a)}
  if(r.review_status==='pending'){
   const instructions=el('label','Beoordelingsnotitie (minimaal 10 tekens)');const note=el('textarea');note.required=true;note.minLength=10;note.maxLength=1200;note.placeholder='Wat is gecontroleerd en waarom keur je dit goed of af?';instructions.append(note);article.append(instructions);
   const buttons=el('div',undefined,'actions');
   const approve=el('button','Goedkeuren en publiceren','primary'),reject=el('button','Afwijzen','danger');
   const result=el('p','','hint');result.setAttribute('role','status');
   async function decide(decision){
    if(busy)return;
    const v=note.value.trim();if(v.length<10){result.textContent='Voeg eerst een inhoudelijke beoordelingsnotitie toe.';note.focus();return}
    if(decision==='approve'&&r.field_name==='other'){result.textContent='Overige wijzigingen vereisen handmatige verwerking; wijs af met uitleg en vraag om een specifiek veld.';return}
    const confirmed=window.confirm(decision==='approve'?'Wijziging na controle toepassen op dit evenement?':'Dit voorstel afwijzen?');
    if(!confirmed)return;
    busy=true;approve.disabled=true;reject.disabled=true;result.textContent='Verzoek verwerken…';
    try{await api('POST',null,{request_id:r.id,decision,note:v});await load()}
    catch(err){result.textContent=err.message==='access_denied'?'Geen beheerdersrechten.':'Opslaan mislukt of verzoek al behandeld. Vernieuw de lijst.'}
    finally{busy=false;approve.disabled=false;reject.disabled=false}
   }
   approve.addEventListener('click',()=>{void decide('approve')});
   reject.addEventListener('click',()=>{void decide('reject')});
   buttons.append(approve,reject);article.append(buttons,result);
  }else{article.append(el('p','Beoordeling: '+(r.reviewer_note||'Geen notitie'),'hint'))}
  list.append(article);
 }
}
const channelLabels={instagram:'Instagram',facebook:'Facebook',whatsapp:'WhatsApp',google:'Google',bing:'Bing',search_other:'Andere zoekmachines',social_other:'Andere sociale media',email:'E-mail',referral:'Verwijzende websites',direct:'Direct / onbekend',campaign_other:'Overige campagnes'};
async function loadAcquisition(){
 if(!client||!userId)return;
 const button=$('acquisitionRefresh');button.disabled=true;$('acquisitionStatus').textContent='Bereik ophalen…';
 try{
  const data=await api('GET',{view:'acquisition'});
  const channels=$('acquisitionChannels'),campaigns=$('acquisitionCampaigns');
  channels.replaceChildren();campaigns.replaceChildren();
  $('acquisitionTotal').textContent=new Intl.NumberFormat('nl-NL').format(data.total||0);
  $('acquisitionSaves').textContent=new Intl.NumberFormat('nl-NL').format(data.conversions?.saves||0);
  $('acquisitionRadar').textContent=new Intl.NumberFormat('nl-NL').format(data.conversions?.radarIntents||0);
  const conversionRows=$('acquisitionConversions');conversionRows.replaceChildren();
  for(const row of data.conversions?.channels||[]){
   const item=el('div',undefined,'bar');item.style.padding='8px 0';
   const label=el('span',(channelLabels[row.channel]||row.channel)+': '+new Intl.NumberFormat('nl-NL').format(row.saves||0)+' bewaard · '+new Intl.NumberFormat('nl-NL').format(row.radarIntents||0)+' radar geopend');
   item.append(label);conversionRows.append(item);
  }
  if(!conversionRows.childNodes.length)conversionRows.append(el('p','Nog geen geregistreerde acties.','hint'));
  const renderRows=(node,rows,labelFn)=>{
   if(!rows.length){node.append(el('p','Nog geen meetgegevens beschikbaar.','hint'));return}
   for(const item of rows){
    const row=el('div',undefined,'bar');row.style.borderBottom='1px solid #e4ebe4';row.style.padding='9px 0';
    const heading=el('span',labelFn(item));heading.style.flex='1';
    const total=el('strong',new Intl.NumberFormat('nl-NL').format(item.pageviews||0));
    row.append(heading,total);node.append(row);
   }
  };
  renderRows(channels,data.channels||[],item=>channelLabels[item.channel]||item.channel);
  renderRows(campaigns,data.campaigns||[],item=>item.campaign);
  $('acquisitionStatus').textContent='Bijgewerkt. Geaggregeerde paginaweergaven, geen unieke bezoekers.';
 }catch(err){$('acquisitionStatus').textContent=err.message==='access_denied'?'Alleen beheerders kunnen deze cijfers zien.':'Bereik kon niet worden opgehaald.'}
 finally{button.disabled=false}
}
async function load(){
 if(!client||!userId||busy)return;
 $('refresh').disabled=true;status.textContent='Verzoeken ophalen…';
 try{const data=await api('GET',{status:$('filter').value});render(Array.isArray(data.requests)?data.requests:[]);status.textContent='Beheercentrum geladen.';app.hidden=false;denied.hidden=true;void loadAcquisition()}
 catch(err){list.replaceChildren();status.textContent=err.message==='access_denied'?'Geen toegang tot het beheercentrum.':'Beheercentrum kon niet worden geladen.';if(err.message==='access_denied'){app.hidden=true;denied.hidden=false}}
 finally{$('refresh').disabled=false}
}
async function init(){
 if(!window.supabase?.createClient||!cfg.supabaseUrl||!cfg.publishableKey){status.textContent='Accountdienst niet beschikbaar.';denied.hidden=false;return}
 client=window.supabase.createClient(cfg.supabaseUrl,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true}});
 const {data,error}=await client.auth.getUser();
 if(error||!data.user||!data.user.email_confirmed_at){status.textContent='Log in met een bevestigd beheerdersaccount.';denied.hidden=false;return}
 userId=data.user.id;await load();
}
$('grantForm').addEventListener('submit',async event=>{
 event.preventDefault();
 const form=$('grantForm'),result=$('grantStatus'),button=$('grantSubmit');
 if(busy||!form.reportValidity()||!userId)return;
 const email=$('grantEmail').value.trim().toLowerCase();
 const event_id=$('grantEvent').value.trim();
 if(!/^ra-\d{1,8}$/.test(event_id)){result.textContent='Ongeldig evenement-ID.';return}
 if(!window.confirm('Heb je de relatie met de organisator onafhankelijk gecontroleerd? Toegang wordt toegekend aan '+email+' voor '+event_id+'.'))return;
 busy=true;button.disabled=true;result.textContent='Accounttoegang controleren en toekennen…';
 try{
  const data=await api('POST',null,{action:'grant_access',email,event_id});
  result.textContent='Toegang toegekend voor '+(data.event_name||event_id)+'. De organisator kan nu het organisatordashboard gebruiken.';
  $('grantEmail').value='';$('grantEvent').value='';
 }catch(err){result.textContent=err.message==='access_denied'?'Geen beheerrechten.':'Toegang niet toegekend. Controleer het accountadres, de e-mailbevestiging en de officiële evenementstatus.'}
 finally{busy=false;button.disabled=false}
});
$('acquisitionRefresh').addEventListener('click',()=>{void loadAcquisition()});
$('filter').addEventListener('change',()=>{void load()});
$('refresh').addEventListener('click',()=>{void load()});
void init();
})();