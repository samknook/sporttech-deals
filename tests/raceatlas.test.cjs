'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..','docs','raceatlas');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const dataStart=html.indexOf('const EVENTS=')+'const EVENTS='.length;
const dataEnd=html.indexOf(';\nwindow.RACEATLAS_EVENTS',dataStart);
const events=JSON.parse(html.slice(dataStart,dataEnd));
test('RaceAtlas contains enough valid event records',()=>{
  assert.ok(events.length>=400);
  const ids=new Set();
  for(const e of events) {
    assert.equal(typeof e.id,'string');
    assert.ok(!ids.has(e.id),'Duplicate ID: '+e.id);ids.add(e.id);
    assert.ok(e.name&&e.place&&e.sport);
    if(e.date)assert.match(e.date,/^20\d{2}-\d{2}-\d{2}$/);
    else assert.ok(!e.date);
    if(e.registrationUrl)assert.match(e.registrationUrl,/^https:\/\//);
  }
});
test('RaceAtlas HTML scripts have valid JavaScript syntax',()=>{
  for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)){
    if(match[1].trim())new vm.Script(match[1]);
  }
  for(const name of ['distance.js','alerts.js','details.js'])new vm.Script(fs.readFileSync(path.join(root,name),'utf8'));
});
test('Event details, radius search and notifications are wired',()=>{
  assert.match(html,/src="details\.js"/);
  assert.match(html,/src="distance\.js"/);
  assert.match(html,/src="alerts\.js"/);
  assert.match(html,/data-ra-detail/);
  assert.match(html,/data-ra-alert/);
  assert.match(html,/window\.RACEATLAS_EVENTS=EVENTS/);
  assert.match(html,/RaceAtlasRadius\.matches/);
});
test('Unconfirmed events have no invented event date',()=>{
  const pending=events.filter(e=>e.status==='date_pending');
  assert.ok(pending.length>0);
  for(const e of pending)if(e.expectedMonth)assert.match(e.expectedMonth,/^(0[1-9]|1[0-2])$/);
});
