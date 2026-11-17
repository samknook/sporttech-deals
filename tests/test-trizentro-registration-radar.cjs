#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const radar=fs.readFileSync('docs/raceatlas/intelligence.js','utf8');
const start=radar.indexOf('  function classify(r,now){');
const end=radar.indexOf('  function install(){',start);
assert.ok(start>=0&&end>start,'Radar classifier missing');
const ctx={parseDate:v=>v?new Date(v):null,fmt:v=>String(v),Date,Math};
const classify=vm.runInNewContext(radar.slice(start,end)+';classify',ctx);
const now=new Date('2026-11-17T08:00:00Z');
const cases=[
 {name:'known opening and missing race date',race:{start_date:null,registration_opens_at:'2026-11-19T13:00:00Z'},group:'soon'},
 {name:'known opening and unverified race date',race:{start_date:'2027-09-05',date_confidence:'unverified',registration_opens_at:'2026-11-19T13:00:00Z'},group:'soon'},
 {name:'distant known opening still visible',race:{start_date:null,registration_opens_at:'2027-10-19T13:00:00Z'},group:'later'},
 {name:'no registration facts',race:{start_date:null,registration_opens_at:null,registration_closes_at:null},group:null},
 {name:'past race cannot be promoted',race:{start_date:'2025-01-01',registration_opens_at:'2024-01-01T00:00:00Z'},group:null}
];
for(const {name,race,group} of cases)assert.equal(classify(race,now)?.group||null,group,name);
assert.ok(radar.includes("records.filter(r=>r.registration_opens_at||r.registration_closes_at)"),'Radar should not require race date confidence for independently verified registration evidence');
assert.ok(radar.includes('Wedstrijddatum nog niet officieel bevestigd'),'Unknown race date must be labeled honestly');
assert.ok(radar.includes('raIntelPendingList'),'Watchlist for saved races must be available');
console.log('PASS: registration radar handles independently verified openings, missing race dates and saved watchlist');
