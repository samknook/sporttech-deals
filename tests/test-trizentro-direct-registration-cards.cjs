#!/usr/bin/env node
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync('docs/raceatlas/index.html','utf8');
const start=source.indexOf('const EVENTS=')+'const EVENTS='.length;
const end=source.indexOf(';\n',start);
assert.ok(end>start,'Event catalogue missing');
const events=JSON.parse(source.slice(start,end));
const card=source.slice(source.indexOf('function eventCard(e){'),source.indexOf('function renderCards(',source.indexOf('function eventCard(e){')));

test('direct registration action is only rendered for an explicit HTTPS registration URL',()=>{
 assert.ok(card.includes("typeof e.registrationUrl==='string'"),'Registration URL must be explicit');
 assert.ok(card.includes('registrationUrl?'), 'Registration action must be conditional');
 assert.ok(card.includes('ra-direct-registration'),'Direct registration visual class missing');
 assert.ok(card.includes('Naar inschrijving ↗'),'Direct registration label missing');
 assert.ok(card.includes('data-ra-outbound="registration"'),'Registration click tracking missing');
 assert.ok(card.includes("eventUrl&&eventUrl!==registrationUrl?"),'Organizer link must be distinct');
 assert.ok(card.includes('data-ra-outbound="organizer"'),'Organizer click tracking missing');
 assert.ok(source.includes('.raCardActions .ra-direct-registration{'),'Direct registration styling missing');
});
test('the filter and the card use the same available-registration catalogue field',()=>{
 assert.ok(source.includes("function hasRegistrationPage(e){return !!e.registrationUrl}"));
 assert.ok(source.includes("(quick==='registration'&&hasRegistrationPage(e))"));
 const withLink=events.filter(e=>e.registrationUrl);
 assert.ok(withLink.length>0,'Expected real races with registration links');
 for(const event of withLink){
  assert.match(event.registrationUrl,/^https:\/\//,'Unsafe registration link '+event.id);
 }
});
