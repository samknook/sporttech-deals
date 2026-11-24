#!/usr/bin/env node
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('docs/raceatlas/index.html','utf8');
const start=html.indexOf('function registrationCardStatus(e){');
const end=html.indexOf('function eventCard(e){',start);
assert.ok(start>=0&&end>start,'Status formatter must exist before event cards');
const classify=vm.runInNewContext(html.slice(start,end)+';registrationCardStatus');
test('race card status does not confuse a link with confirmed open registrations',()=>{
 assert.equal(classify({registrationUrl:'https://example.org/register'}).label,'Directe inschrijflink beschikbaar');
 assert.equal(classify({registrationStatus:'open',registrationUrl:'https://example.org/register'}).label,'Inschrijving open volgens bron');
 assert.equal(classify({registrationStatus:'closed',registrationUrl:'https://example.org/register'}).label,'Inschrijving gesloten volgens bron');
 assert.equal(classify({registrationStatus:'sold_out',registrationUrl:'https://example.org/register'}).label,'Uitverkocht volgens bron');
 assert.equal(classify({registrationStatus:'not_open'}).label,'Inschrijving opent later');
 assert.equal(classify({registrationStatus:'mixed'}).label,'Beschikbaarheid verschilt per afstand');
 assert.equal(classify({registrationStatus:'unknown'}),null);
});
test('status badges are rendered on calendar cards with safe escaped labels',()=>{
 const card=html.slice(end,html.indexOf('function renderCards(',end));
 assert.ok(card.includes('registrationState=registrationCardStatus(e)'),'Status must be calculated per card');
 assert.ok(card.includes('raRegistrationStatus--'),'Status styling class must be present');
 assert.ok(card.includes('safe(registrationState.label)'),'Status text must be escaped');
 assert.ok(html.includes('.raRegistrationStatus--closed{'),'Closed status must be visually distinct');
});
