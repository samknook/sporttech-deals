#!/usr/bin/env node
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('docs/raceatlas/index.html','utf8');
const start=html.indexOf('const EVENTS=')+'const EVENTS='.length;
const end=html.indexOf(';\n',start);
assert.ok(end>start,'Event catalogue not found');
const events=JSON.parse(html.slice(start,end));
const expected={
 'ra-219':{date:'2027-04-18',name:'RBR Almere 2027',registration:'https://in.njuko.com/rbr--tt-almere-20271786603370440'},
 'ra-214':{date:'2027-04-03',name:'RBR Rotterdam 2027',registration:'https://in.njuko.com/rbr-rotterdam-20271786625155223'}
};
test('verified RBR Almere and Rotterdam dates and direct registration URLs are retained',()=>{
 for(const [id,check] of Object.entries(expected)){
  const race=events.find(x=>x.id===id);
  assert.ok(race,'Missing race '+id);
  assert.equal(race.name,check.name);
  assert.equal(race.date,check.date);
  assert.equal(race.dateEvidence,'official');
  assert.equal(race.registrationUrl,check.registration);
  assert.equal(race.registrationStatus,'link_available');
  assert.equal(race.registrationInfoUrl,'https://live.challenge-family.com/php/trihard.html');
 }
});
