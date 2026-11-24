#!/usr/bin/env node
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('docs/raceatlas/index.html','utf8');
const begin=html.indexOf('const EVENTS=')+'const EVENTS='.length;
const end=html.indexOf(';\n',begin);
assert.ok(end>begin,'Public event catalogue missing');
const events=JSON.parse(html.slice(begin,end));

test('quick filter exposes races with an actual direct registration URL',()=>{
  assert.ok(html.includes('data-quick="registration">↗ Met inschrijflink</button>'),'Registration shortcut missing');
  assert.ok(html.includes("(quick==='registration'&&hasRegistrationPage(e))"),'Shortcut must filter direct registration links');
  assert.ok(html.includes("quick!=='registration'&&[e.discipline,e.name]"),'Shortcut must not fall through to text search');
  assert.ok(html.includes('function hasRegistrationPage(e){return !!e.registrationUrl}'),'Only direct registration links qualify');
  assert.ok(events.some(e=>e.registrationUrl),'At least one race should qualify');
  assert.ok(events.some(e=>!e.registrationUrl),'Events without a link must be filtered out');
  assert.ok(html.includes("url.searchParams.set('ra_quick',quick)"),'Filter must survive sharing');
});

test('major race artwork preserves the correct JPG or WebP file extension',()=>{
  const start=html.indexOf('function raceArtwork(e){');
  const end=html.indexOf('function toggleSavedEvent(',start);
  assert.ok(start>=0&&end>start);
  const source=html.slice(start,end);
  assert.ok(source.includes('return e.imageUrl;'),'Featured image must retain its own file extension');
  assert.ok(!source.includes("e.id+'.webp'"),'Do not force WebP for JPG images');
  assert.ok(events.some(e=>e.major&&e.imageRights==='generated'&&/\.jpg$/.test(e.imageUrl||'')));
  assert.ok(events.some(e=>e.major&&e.imageRights==='generated'&&/\.webp$/.test(e.imageUrl||'')));
});
