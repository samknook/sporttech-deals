#!/usr/bin/env node
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const js=fs.readFileSync('docs/raceatlas/organizer-dashboard.js','utf8');
const html=fs.readFileSync('docs/raceatlas/organizer-dashboard.html','utf8');
const begin=js.indexOf('const csvValue=');
const end=js.indexOf('function render(data){',begin);
assert.ok(begin>=0&&end>begin,'CSV formatter or daily export missing');
const rows=vm.runInNewContext('(()=>{'+js.slice(begin,end)+'return dailyCsvRows;})()', {Date,Map,Number,String});
test('daily report exports only verified selected event IDs within period and aggregates duplicate days',()=>{
 const data={days:7,asOf:'2026-11-24T10:00:00Z',trend:[
  {event_id:'ra-219',day:'2026-11-24',registration_clicks:2},
  {event_id:'ra-219',day:'2026-11-24',registration_clicks:3},
  {event_id:'ra-219',day:'2026-11-20',registration_clicks:1},
  {event_id:'ra-219',day:'2026-11-16',registration_clicks:99},
  {event_id:'ra-214',day:'2026-11-24',registration_clicks:20},
  {event_id:'ra-219',day:'invalid',registration_clicks:5},
  {event_id:'ra-219',day:'2026-11-23',registration_clicks:-1}
 ]};
 const exported=rows(data,[{event_id:'ra-219',event_name:'RBR Almere'}]);
 assert.equal(exported.length,3,'Header and two matching days only');
 assert.ok(exported[1].includes('"2026-11-20"')&&exported[1].includes('"1"'));
 assert.ok(exported[2].includes('"2026-11-24"')&&exported[2].includes('"5"'));
 assert.ok(!exported.join('\n').includes('ra-214'),'Unselected race must never leak into report');
 assert.ok(!exported.join('\n').includes('"99"'),'Outside requested date window');
});
test('CSV labels are safely quoted and spreadsheet formula injection blocked',()=>{
 const data={days:30,asOf:'2026-11-24',trend:[{event_id:'ra-1',day:'2026-11-24',registration_clicks:1}]};
 const result=rows(data,[{event_id:'ra-1',event_name:'=SUM(1,2)'}]).join('\n');
 assert.ok(result.includes("'=SUM(1,2)"),'Event name must not execute as a spreadsheet formula');
 assert.ok(html.includes('id="exportDaily"'),'Daily CSV control must exist');
 assert.ok(js.includes("dailyCsvRows(report,selectedEvents())"),'Export must respect event selection');
 assert.ok(js.includes("trizentro-inschrijfklikken-per-dag-"),'Filename must distinguish daily report');
});
