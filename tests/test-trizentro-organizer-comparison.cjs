#!/usr/bin/env node
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync('docs/raceatlas/organizer-dashboard.html','utf8');
const source=fs.readFileSync('docs/raceatlas/organizer-dashboard.js','utf8');
const metric=source.indexOf('const metricKeys=');
const end=source.indexOf('function renderComparison(){',metric);
assert.ok(metric>=0&&end>metric,'Organizer ranking implementation missing');
const rank=vm.runInNewContext('(()=>{'+source.slice(metric,end).replace(/const selectedEvents=[^\n]+\n/,'').replace(/const filteredTotals=[^\n]+\n/,'').replace(/function renderInsights\(\)\{[\s\S]*?\n\}\n(?=function rankedOrganizerEvents)/,'')+'return rankedOrganizerEvents})()', {Number,String});
test('ranking handles ties, missing values and ignores unknown metrics',()=>{
 const e=[{event_id:'ra-3',event_name:'Zulu',registration_clicks:0,detail_views:20},{event_id:'ra-1',event_name:'Alpha',registration_clicks:5,detail_views:1},{event_id:'ra-2',event_name:'Bravo',registration_clicks:5,detail_views:15}];
 assert.deepEqual(Array.from(rank(e,'registration_clicks'),x=>x.event_id),['ra-1','ra-2','ra-3']);
 assert.deepEqual(Array.from(rank(e,'detail_views'),x=>x.event_id),['ra-3','ra-2','ra-1']);
 assert.deepEqual(Array.from(rank(e,'unknown'),x=>x.event_id),['ra-1','ra-2','ra-3']);
 assert.equal(e[0].event_id,'ra-3','Sorting must not mutate report data');
});
test('comparison is accessible, renders text safely and is based only on authorized report events',()=>{
 assert.ok(html.includes('id="comparisonRows"'),'Comparison tbody missing');
 assert.ok(html.includes('id="comparisonSort"'),'Ranking selector missing');
 assert.ok(source.includes('rankedOrganizerEvents(Array.isArray(report?.events)?report.events:[]'),'Only verified report events may be ranked');
 assert.ok(source.includes('name.textContent=event.event_name||event.event_id'),'Event names must use textContent');
 assert.ok(source.includes("comparisonSort').addEventListener('change',renderComparison)"),'Sort must update without reload');
 assert.ok(html.includes('geen unieke bezoekers of bevestigde inschrijvingen'),'Measurement disclaimer missing');
});
