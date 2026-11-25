#!/usr/bin/env node
'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync('docs/raceatlas/index.html','utf8');
const start=html.indexOf("function shareableSeasonText("),end=html.indexOf("async function shareSavedSeason()",start);
assert.ok(start>=0&&end>start,'Shareable season helper missing');
const helper=vm.runInNewContext(html.slice(start,end)+';shareableSeasonText',{
 sortKey:e=>e.date||'9999-12-31',
 isConfirmedEventDate:e=>e.dateEvidence==='official'&&!!e.date,
 dateLabel:date=>date,
 eventPage:e=>'/events/wedstrijden/'+e.id+'.html'
});
test('shareable season links are first-party and dates are not asserted when unverified',()=>{
 const text=helper([{id:'ra-1',name:'Race A',date:'2027-01-01',dateEvidence:'official',place:'A'}, {id:'ra-2',name:'Race B',date:'2027-02-01',dateEvidence:'unknown',place:'B'}],'https://not-trizentro.example');
 assert.match(text,/https:\/\/trizentro.com\/events\/wedstrijden\/ra-1.html/);
 assert.match(text,/Race B — Datum nog te controleren/);
 assert.doesNotMatch(text,/not-trizentro.example/);
});
test('season sharing limits overly large messages while retaining discoverability',()=>{
 const events=Array.from({length:12},(_,i)=>({id:'ra-'+i,name:'Race '+i,place:'NL',date:'2027-02-01',dateEvidence:'official'}));
 const text=helper(events);
 assert.match(text,/En nog 4 andere wedstrijden/);
 assert.ok(!text.includes('Race 9'));
 assert.match(text,/Ontdek jouw volgende wedstrijd: https:\/\/trizentro.com\/events\//);
});
test('share only on user action and provide clipboard fallback',()=>{
 assert.ok(html.includes('id="raShareSeason"'));
 assert.ok(html.includes("$('raShareSeason').onclick=shareSavedSeason"));
 assert.ok(html.includes('await navigator.share({title:'));
 assert.ok(html.includes('await navigator.clipboard.writeText(message)'));
});
