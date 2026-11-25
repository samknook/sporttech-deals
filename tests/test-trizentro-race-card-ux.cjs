#!/usr/bin/env node
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('docs/raceatlas/index.html','utf8');
const start=html.indexOf('function eventCard(e){');
const end=html.indexOf('function renderCards(',start);
assert.ok(start>=0&&end>start,'Calendar event card renderer missing');
const card=html.slice(start,end);
const primary=card.slice(card.indexOf('raCardActions'),card.indexOf('raCardMoreActions'));
test('cards present save and details before optional registration action',()=>{
 assert.ok(primary.includes('ra-card-save'));
 assert.ok(primary.includes('aria-pressed='));
 assert.ok(primary.includes('Bekijk wedstrijd'));
 assert.ok(primary.indexOf('ra-card-save')<primary.indexOf('ra-detail-btn'));
 assert.ok(primary.includes('ra-direct-registration'));
 assert.ok(card.includes('registrationUrl?'));
});
test('secondary actions remain accessible through a native disclosure',()=>{
 assert.ok(card.includes('<details class="raCardMore"><summary>Meer opties</summary>'));
 assert.ok(card.includes('class="ra-alert-btn"'),'Reminder action missing');
 assert.ok(card.includes('class="tz-race-share"'),'Share action missing');
 assert.ok(card.includes('data-ra-outbound="organizer"'),'Official website tracking missing');
 assert.ok(card.includes('card.querySelector(\'.tz-race-share\').onclick'),'Share handler missing');
 assert.ok(card.includes('card.querySelector(\'.save\').onclick'),'Save handler missing');
 assert.ok(html.includes('.raCardMore summary:focus-visible'),'Disclosure keyboard focus missing');
});
test('card layout preserves ample touch targets on mobile',()=>{
 assert.ok(html.includes('.raCardActions .ra-card-save,.raCardActions .ra-detail-btn{min-height:46px'));
 assert.ok(html.includes('.raCardMoreActions button,.raCardMoreActions a{min-height:44px'));
 assert.ok(html.includes('.raCardActions .ra-direct-registration{grid-column:1/-1'));
});
