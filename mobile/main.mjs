import {Capacitor,CapacitorHttp} from '@capacitor/core';
import {Preferences} from '@capacitor/preferences';
import {Browser} from '@capacitor/browser';
import {Share} from '@capacitor/share';
import {selectRaces,toggleRace,validateCatalogue,raceCountdown,seasonShareText,radarStatus,radarRaces} from './model.mjs';
const $=id=>document.getElementById(id),key='trizentro.native.saved.v1';
const radarKey='trizentro.native.radar.v1';
const catalogueKey='trizentro.native.catalogue.v1',feed='https://trizentro.com/app-catalogue.json';
const state={events:[],saved:[],watched:[],query:'',sport:'',tab:'discover',limit:24,asOf:'',generatedAt:'',busy:false,refreshing:false};
const msg=s=>{$('status').textContent=s;if($('raceDetail').open)$('detailStatus').textContent=s};
function button(label,fn,className=''){const b=document.createElement('button');b.type='button';b.textContent=label;b.className=className;b.addEventListener('click',fn);return b}
function node(tag,content,cls=''){const el=document.createElement(tag);el.textContent=content;if(cls)el.className=cls;return el}
async function open(url){try{await Browser.open({url})}catch{msg('Openen mislukt. Controleer je internetverbinding.')}}
async function save(id){
 if(state.busy)return;
 state.busy=true;
 const next=toggleRace(state.saved,id);
 try{await Preferences.set({key,value:JSON.stringify(next)});state.saved=next;render();syncDetailSave();msg(next.includes(id)?'Wedstrijd bewaard op dit apparaat.':'Wedstrijd verwijderd.')}
 catch{msg('Opslaan mislukt. Probeer opnieuw.')}
 finally{state.busy=false}
}
async function watch(id){
 if(state.busy)return;
 state.busy=true;
 const next=toggleRace(state.watched,id);
 try{
  await Preferences.set({key:radarKey,value:JSON.stringify(next)});
  state.watched=next;render();syncDetailSave();
  msg(next.includes(id)?'Wedstrijd toegevoegd aan je lokale radar.':'Wedstrijd verwijderd uit je radar.');
 }catch{msg('Radar opslaan mislukt. Probeer opnieuw.')}
 finally{state.busy=false}
}
let activeRace=null;
function syncDetailSave(){
 if(!activeRace)return;
 const saved=state.saved.includes(activeRace.id);
 $('detailSave').textContent=saved?'✓ Bewaard in mijn seizoen':'+ Bewaar in mijn seizoen';
 $('detailSave').setAttribute('aria-pressed',String(saved));
 const watching=state.watched.includes(activeRace.id);
 $('detailWatch').textContent=watching?'✓ Op mijn radar':'+ Zet op mijn radar';
 $('detailWatch').setAttribute('aria-pressed',String(watching));
}
function showRace(e){
 activeRace=e;
 $('detailSport').textContent=e.sport;
 $('detailName').textContent=e.name;
 $('detailDate').textContent=e.date?new Intl.DateTimeFormat('nl-NL',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(e.date+'T00:00:00Z')):'Datum nog niet bevestigd';
 $('detailPlace').textContent=[e.place,e.country].filter(Boolean).join(', ')||'Locatie nog niet bekend';
 $('detailDistance').textContent=e.distance||'Afstand nog niet bekend';
 $('detailRegistrationState').textContent=radarStatus(e);
 $('detailSnapshot').textContent='Kalenderexport van '+state.asOf+'. Controleer actuele gegevens en inschrijving bij de organisator.';
 $('detailStatus').textContent='';
 syncDetailSave();
 $('raceDetail').showModal();
 $('detailClose').focus();
}
function card(e){
 const a=document.createElement('article');
 a.append(node('span',e.sport,'tag'),node('h2',e.name),node('p',[e.date||'Datum nog niet officieel bevestigd',e.place,e.country].filter(Boolean).join(' · ')));
 if(e.distance)a.append(node('p',e.distance));
 const actions=document.createElement('div');actions.className='actions';
 const saved=state.saved.includes(e.id),b=button(saved?'✓ Bewaard':'+ Bewaar',()=>save(e.id),'save');
 b.setAttribute('aria-pressed',String(saved));
 actions.append(b,button('Bekijk wedstrijd',()=>showRace(e)),button('Deel wedstrijd ↗',async()=>{
 try{await Share.share({title:e.name,text:'Bekijk deze wedstrijd op TriZentro',url:e.detail})}catch{msg('Delen niet voltooid.')}
 },'share'));
 a.append(actions);return a;
}
function radarCard(e){
 const a=document.createElement('article');
 a.append(node('span',radarStatus(e),'tag'),node('h2',e.name),node('p',[e.registrationDate?'Inschrijfdatum volgens kalender: '+e.registrationDate:'Geen exacte inschrijfdatum bekend',e.sourceCheckedOn?'Bron gecontroleerd: '+e.sourceCheckedOn:'Geen controledatum bekend'].join(' · ')));
 const actions=document.createElement('div');actions.className='actions';
 actions.append(button('Bekijk wedstrijd',()=>showRace(e)),button('Verwijder van radar',()=>watch(e.id)));
 a.append(actions);return a;
}
function render(){
 const season=state.tab==='season',about=state.tab==='about',radar=state.tab==='radar';
 $('heading').textContent=radar?'Inschrijfradar':about?'Meer TriZentro':season?'Mijn seizoen':'Vind jouw volgende startlijn.';
 $('intro').textContent=radar?'Volg jouw gewenste wedstrijden.':season?'Jouw lokaal bewaarde wedstrijden.':about?'Van ontdekken naar jouw volgende sportdoel.':'Ontdek wedstrijden en bewaar jouw doelen.';
 $('filters').hidden=season||about||radar;$('radarInfo').hidden=!radar;$('about').hidden=!about;
 $('snapshot').textContent=about?'':'Kalenderexport van '+state.asOf+' · actuele informatie via de wedstrijddetails.';
 document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===state.tab)));
 document.querySelectorAll('[data-sport]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sport===state.sport)));
 const list=about?[]:radar?radarRaces(state.events,state.watched):selectRaces(state.events,{query:season?'':state.query,sport:season?'':state.sport,savedOnly:season,saved:state.saved});
 const next=season?raceCountdown(state.events,state.saved):null;
 $('seasonOverview').hidden=!season||!list.length;
 $('nextRace').hidden=!next;
 if(next){
  $('nextRaceName').textContent=next.race.name;
  $('countdown').textContent=next.days===0?'Vandaag':next.days===1?'Nog 1 dag':'Nog '+next.days+' dagen';
 }
 $('seasonCount').textContent=list.length===1?'1 bewaarde wedstrijd':list.length+' bewaarde wedstrijden';
 $('shareSeason').hidden=!list.length;
 $('races').replaceChildren(...list.slice(0,state.limit).map(radar?radarCard:card));
 if(!about&&!list.length)$('races').append(node('p',radar?'Je radar is leeg. Open een wedstrijd en zet deze op je radar.':season?'Je hebt nog geen wedstrijden bewaard.':'Geen wedstrijden gevonden.','caption'));
 const missing=(season?state.saved:radar?state.watched:[]).filter(id=>!state.events.some(e=>e.id===id)).length;
 if(missing)$('races').append(node('p',missing+' wedstrijd(en) ontbreken in de huidige kalender. Je keuzes blijven behouden.','caption'));
 $('refresh').hidden=about;
 $('more').hidden=about||list.length<=state.limit;
}
function applyCatalogue(c){state.events=c.events;state.asOf=c.asOf;state.generatedAt=c.generatedAt}
async function refreshCatalogue(){
 if(state.refreshing)return;
 state.refreshing=true;$('refresh').disabled=true;msg('Wedstrijden bijwerken…');
 try{
  let data;
  if(Capacitor.isNativePlatform()){
   const response=await CapacitorHttp.get({url:feed,responseType:'json',connectTimeout:8000,readTimeout:8000});
   if(response.status!==200)throw Error('Catalogue unavailable');data=response.data;
  }else{
   const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),8000);
   try{const response=await fetch(feed,{cache:'no-store',credentials:'omit',signal:controller.signal});if(!response.ok)throw Error('Catalogue unavailable');data=await response.json()}finally{clearTimeout(timeout)}
  }
  const next=validateCatalogue(data);if(!next||next.generatedAt<state.generatedAt)throw Error('Invalid or older catalogue');
  await Preferences.set({key:catalogueKey,value:JSON.stringify(next)});
  applyCatalogue(next);render();msg('Wedstrijdkalender bijgewerkt.');
 }catch{msg('Geen nieuwe kalender beschikbaar. Je laatst beschikbare wedstrijden blijven zichtbaar.')}
 finally{state.refreshing=false;$('refresh').disabled=false}
}
async function init(){
 try{
  const response=await fetch('./catalogue.json');if(!response.ok)throw Error('Catalogue unavailable');
  const catalogue=validateCatalogue(await response.json());if(!catalogue)throw Error('Invalid catalogue');applyCatalogue(catalogue);
  try{const cache=await Preferences.get({key:catalogueKey});const savedCatalogue=validateCatalogue(JSON.parse(cache.value||'null'));if(savedCatalogue&&savedCatalogue.generatedAt>=state.generatedAt)applyCatalogue(savedCatalogue)}catch{}
  const result=await Preferences.get({key});
  try{const saved=JSON.parse(result.value||'[]');if(Array.isArray(saved))state.saved=saved.filter(id=>typeof id==='string'&&/^ra-\d{1,8}$/.test(id))}catch{}
  try{const result=await Preferences.get({key:radarKey});const ids=JSON.parse(result.value||'[]');if(Array.isArray(ids))state.watched=[...new Set(ids.filter(id=>typeof id==='string'&&/^ra-\d{1,8}$/.test(id)))];}catch{}
  $('search').addEventListener('input',e=>{state.query=e.target.value;state.limit=24;render()});
  document.querySelectorAll('[data-sport]').forEach(b=>b.onclick=()=>{state.sport=b.dataset.sport;state.limit=24;render()});
  document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{state.tab=b.dataset.tab;state.limit=24;msg('');render();window.scrollTo(0,0)});
  $('more').onclick=()=>{state.limit+=24;render()};
  $('openSite').onclick=()=>open('https://trizentro.com/events/');
  $('refresh').onclick=refreshCatalogue;
  $('detailClose').onclick=()=>$('raceDetail').close();
  $('raceDetail').addEventListener('close',()=>{activeRace=null});
  $('detailSave').onclick=()=>{if(activeRace)save(activeRace.id)};
  $('detailWatch').onclick=()=>{if(activeRace)watch(activeRace.id)};
  $('detailRegistration').onclick=()=>{if(activeRace)open(activeRace.detail)};
  $('detailOrganizer').onclick=()=>{if(activeRace)open(activeRace.official)};
  $('detailRadar').onclick=()=>{if(activeRace)open('https://trizentro.com/events/?ra_alert='+encodeURIComponent(activeRace.id))};

  $('shareSeason').onclick=async()=>{const text=seasonShareText(state.events,state.saved);if(!text)return;try{await Share.share({title:'Mijn wedstrijdseizoen',text})}catch{msg('Delen niet voltooid.')}};
  render();
 }catch{msg('De app kon niet worden geladen. Start TriZentro opnieuw.')}
}
init();
