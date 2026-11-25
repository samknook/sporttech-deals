import {Capacitor,CapacitorHttp} from '@capacitor/core';
import {Preferences} from '@capacitor/preferences';
import {Browser} from '@capacitor/browser';
import {Share} from '@capacitor/share';
import {selectRaces,toggleRace,validateCatalogue,raceCountdown,seasonShareText} from './model.mjs';
const $=id=>document.getElementById(id),key='trizentro.native.saved.v1';
const catalogueKey='trizentro.native.catalogue.v1',feed='https://trizentro.com/app-catalogue.json';
const state={events:[],saved:[],query:'',sport:'',tab:'discover',limit:24,asOf:'',generatedAt:'',busy:false,refreshing:false};
const msg=s=>$('status').textContent=s;
function button(label,fn,className=''){const b=document.createElement('button');b.type='button';b.textContent=label;b.className=className;b.addEventListener('click',fn);return b}
function node(tag,content,cls=''){const el=document.createElement(tag);el.textContent=content;if(cls)el.className=cls;return el}
async function open(url){try{await Browser.open({url})}catch{msg('Openen mislukt. Controleer je internetverbinding.')}}
async function save(id){
 if(state.busy)return;
 state.busy=true;
 const next=toggleRace(state.saved,id);
 try{await Preferences.set({key,value:JSON.stringify(next)});state.saved=next;render();msg(next.includes(id)?'Wedstrijd bewaard op dit apparaat.':'Wedstrijd verwijderd.')}
 catch{msg('Opslaan mislukt. Probeer opnieuw.')}
 finally{state.busy=false}
}
function card(e){
 const a=document.createElement('article');
 a.append(node('span',e.sport,'tag'),node('h2',e.name),node('p',[e.date||'Datum nog niet officieel bevestigd',e.place,e.country].filter(Boolean).join(' · ')));
 if(e.distance)a.append(node('p',e.distance));
 const actions=document.createElement('div');actions.className='actions';
 const saved=state.saved.includes(e.id),b=button(saved?'✓ Bewaard':'+ Bewaar',()=>save(e.id),'save');
 b.setAttribute('aria-pressed',String(saved));
 actions.append(b,button('Wedstrijddetails ↗',()=>open(e.detail)),button('Deel wedstrijd ↗',async()=>{
 try{await Share.share({title:e.name,text:'Bekijk deze wedstrijd op TriZentro',url:e.detail})}catch{msg('Delen niet voltooid.')}
 },'share'));
 a.append(actions);return a;
}
function render(){
 const season=state.tab==='season',about=state.tab==='about';
 $('heading').textContent=about?'Meer TriZentro':season?'Mijn seizoen':'Vind jouw volgende startlijn.';
 $('intro').textContent=season?'Jouw lokaal bewaarde wedstrijden.':about?'Van ontdekken naar jouw volgende sportdoel.':'Ontdek wedstrijden en bewaar jouw doelen.';
 $('filters').hidden=season||about;$('about').hidden=!about;
 $('snapshot').textContent=about?'':'Kalenderexport van '+state.asOf+' · actuele informatie via de wedstrijddetails.';
 document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===state.tab)));
 document.querySelectorAll('[data-sport]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sport===state.sport)));
 const list=about?[]:selectRaces(state.events,{query:season?'':state.query,sport:season?'':state.sport,savedOnly:season,saved:state.saved});
 const next=season?raceCountdown(state.events,state.saved):null;
 $('seasonOverview').hidden=!season||!list.length;
 $('nextRace').hidden=!next;
 if(next){
  $('nextRaceName').textContent=next.race.name;
  $('countdown').textContent=next.days===0?'Vandaag':next.days===1?'Nog 1 dag':'Nog '+next.days+' dagen';
 }
 $('seasonCount').textContent=list.length===1?'1 bewaarde wedstrijd':list.length+' bewaarde wedstrijden';
 $('shareSeason').hidden=!list.length;
 $('races').replaceChildren(...list.slice(0,state.limit).map(card));
 if(!about&&!list.length)$('races').append(node('p',season?'Je hebt nog geen wedstrijden bewaard.':'Geen wedstrijden gevonden.','caption'));
 const missing=season?state.saved.filter(id=>!state.events.some(e=>e.id===id)).length:0;
 if(missing)$('races').append(node('p',missing+' bewaarde wedstrijd(en) ontbreken in de huidige kalender. Je bewaarkeuzes blijven behouden.','caption'));
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
  $('search').addEventListener('input',e=>{state.query=e.target.value;state.limit=24;render()});
  document.querySelectorAll('[data-sport]').forEach(b=>b.onclick=()=>{state.sport=b.dataset.sport;state.limit=24;render()});
  document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{state.tab=b.dataset.tab;state.limit=24;msg('');render();window.scrollTo(0,0)});
  $('more').onclick=()=>{state.limit+=24;render()};
  $('openSite').onclick=()=>open('https://trizentro.com/events/');
  $('refresh').onclick=refreshCatalogue;
  $('shareSeason').onclick=async()=>{const text=seasonShareText(state.events,state.saved);if(!text)return;try{await Share.share({title:'Mijn wedstrijdseizoen',text})}catch{msg('Delen niet voltooid.')}};
  render();
 }catch{msg('De app kon niet worden geladen. Start TriZentro opnieuw.')}
}
init();
