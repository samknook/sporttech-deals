#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const script=fs.readFileSync('docs/season-dashboard.js','utf8');
const radar=fs.readFileSync('docs/raceatlas/intelligence.js','utf8');
const host={children:[],replaceChildren(){this.children=[]},append(...nodes){this.children.push(...nodes)},get textContent(){return this.children.map(x=>x.textContent||'').join('')}};
function element(tag){
 return {tag,children:[],attributes:{},className:'',value:'',href:'',
   append(...nodes){this.children.push(...nodes)},
   replaceChildren(){this.children=[]},
   setAttribute(k,v){this.attributes[k]=v},addEventListener(){},
   get textContent(){return (this._text||'')+this.children.map(x=>x.textContent||'').join('')},
   set textContent(value){this._text=String(value)}
 };
}
const ctx={document:{documentElement:{lang:'nl'},getElementById:()=>host,createElement:element},
  window:{addEventListener(){},RaceAtlasRefresh(){}},Date,Intl};
vm.runInNewContext(script,ctx);
const render=ctx.window.TriZentroDashboard.render;
const today=new Date(),day=offset=>{const d=new Date(today.getFullYear(),today.getMonth(),today.getDate()+offset);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
const races=[
 {id:'ra-7',name:'Tentative Race',date:day(8),dateEvidence:'unverified',place:'Teststad',sport:'Hardlopen'},
 {id:'ra-8',name:'Confirmed Race',date:day(19),dateEvidence:'official',place:'Teststad',sport:'Triatlon'},
 {id:'ra-9',name:'Waitlist Race',date:day(60),dateEvidence:'official',place:'Teststad',sport:'Fietsen'}
];
render(races,{'ra-7':'planned','ra-8':'registered','ra-9':'waitlist'},event=>'/events/wedstrijden/'+event.id+'.html',()=>{});
const all=host.textContent;
assert.ok(all.includes('Confirmed Race'),'Confirmed race should be the headline');
assert.ok(!all.includes('Eerstvolgende wedstrijdTentative Race'),'Tentative race must not displace a confirmed race');
assert.ok(all.includes('1 op wachtlijst'),'Waitlist must be separate');
assert.ok(all.includes('1 nog te regelen'),'Only planned events count as unregistered');
function allNodes(parent){return [parent,...(parent.children||[]).flatMap(allNodes)]}
const links=allNodes(host).filter(n=>n.tag==='a');
assert.ok(links.some(link=>link.href==='/events/#raIntelPanel'),'Dashboard should link to canonical radar');
render([races[0]],{'ra-7':'planned'},event=>'/events/wedstrijden/'+event.id+'.html',()=>{});
assert.ok(host.textContent.includes('Tentative Race')&&host.textContent.includes('datum nog te controleren'),
  'Unverified race must be labelled when no verified race exists');
assert.ok(radar.includes("location.hash==='#raIntelPanel'")&&radar.includes('ui.panel.scrollIntoView'),
  'Radar should scroll into dynamically created section when opened from dashboard');
console.log('PASS: confirmed race priority, tentative fallback, waitlist, pending counts, radar navigation');