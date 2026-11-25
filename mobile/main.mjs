import {Preferences} from '@capacitor/preferences';
import {Browser} from '@capacitor/browser';
import {Share} from '@capacitor/share';
import {selectRaces,toggleRace} from './model.mjs';
const $=id=>document.getElementById(id),key='trizentro.native.saved.v1';
const state={events:[],saved:[],query:'',sport:'',tab:'discover',limit:24,asOf:'',busy:false};
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
 $('snapshot').textContent=about?'':'Wedstrijdgegevens van '+state.asOf+' · actuele informatie via de wedstrijddetails.';
 document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===state.tab)));
 document.querySelectorAll('[data-sport]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sport===state.sport)));
 const list=about?[]:selectRaces(state.events,{query:season?'':state.query,sport:season?'':state.sport,savedOnly:season,saved:state.saved});
 $('races').replaceChildren(...list.slice(0,state.limit).map(card));
 if(!about&&!list.length)$('races').append(node('p',season?'Je hebt nog geen wedstrijden bewaard.':'Geen wedstrijden gevonden.','caption'));
 $('more').hidden=about||list.length<=state.limit;
}
async function init(){
 try{
  const response=await fetch('./catalogue.json');if(!response.ok)throw Error('Catalogue unavailable');
  const catalogue=await response.json();state.events=catalogue.events;state.asOf=catalogue.asOf;
  const result=await Preferences.get({key});
  try{const saved=JSON.parse(result.value||'[]');if(Array.isArray(saved))state.saved=saved.filter(id=>typeof id==='string'&&/^ra-\d{1,8}$/.test(id))}catch{}
  $('search').addEventListener('input',e=>{state.query=e.target.value;state.limit=24;render()});
  document.querySelectorAll('[data-sport]').forEach(b=>b.onclick=()=>{state.sport=b.dataset.sport;state.limit=24;render()});
  document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{state.tab=b.dataset.tab;state.limit=24;msg('');render();window.scrollTo(0,0)});
  $('more').onclick=()=>{state.limit+=24;render()};
  $('openSite').onclick=()=>open('https://trizentro.com/events/');
  render();
 }catch{msg('De app kon niet worden geladen. Start TriZentro opnieuw.')}
}
init();
