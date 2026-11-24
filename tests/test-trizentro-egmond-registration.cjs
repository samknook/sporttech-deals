#!/usr/bin/env node
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('docs/raceatlas/index.html','utf8');
const start=html.indexOf('const EVENTS=')+'const EVENTS='.length;
const end=html.indexOf(';\n',start);
assert.ok(end>start,'Catalogue missing');
const race=JSON.parse(html.slice(start,end)).find(e=>e.id==='ra-0');
test('Egmond 2027 has official registration form with honest mixed availability',()=>{
 assert.ok(race,'Egmond race missing');
 assert.equal(race.registrationUrl,'https://atleta.cc/e/nhIVGRx4Tk9h');
 assert.equal(race.registrationInfoUrl,'https://www.egmondhalvemarathon.nl/inschrijven');
 assert.equal(race.registrationStatus,'mixed');
 assert.match(race.registrationStatusNote,/halve marathon uitverkocht/i);
 assert.match(race.registrationStatusNote,/beschikbaarheid per afstand/i);
});
