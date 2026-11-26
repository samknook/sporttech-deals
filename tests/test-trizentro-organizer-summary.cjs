#!/usr/bin/env node
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('docs/raceatlas/organizer-dashboard.html','utf8');
const js=fs.readFileSync('docs/raceatlas/organizer-dashboard.js','utf8');
const metricStart=js.indexOf('const metricKeys=');
const helperStart=js.indexOf('function organizerSummaryText(');
const helperEnd=js.indexOf('function dailyCsvRows(',helperStart);
assert.ok(metricStart>=0&&helperStart>metricStart&&helperEnd>helperStart,'Summary implementation missing');
const metricDecl=js.slice(metricStart,js.indexOf('\n',metricStart));
const summary=vm.runInNewContext('(()=>{'+metricDecl+'\nconst format=n=>new Intl.NumberFormat("nl-NL").format(Number(n)||0);\n'+js.slice(helperStart,helperEnd)+'return organizerSummaryText;})()', {Intl,Number,String,Array});

test('summary totals only the selected authorized races and accurately labels measured clicks',()=>{
 const data={days:30,asOf:'2026-11-24T11:00:00Z'};
 const events=[{event_id:'ra-219',event_name:'RBR Almere',card_views:100,detail_views:20,organizer_clicks:7,registration_clicks:4}];
 const text=summary(data,events);
 assert.match(text,/RBR Almere/);
 assert.match(text,/laatste 30 dagen/);
 assert.match(text,/Kaartweergaven: 100/);
 assert.match(text,/Detailopeningen: 20/);
 assert.match(text,/Websiteklikken: 7/);
 assert.match(text,/Inschrijfklikken: 4/);
 assert.match(text,/geen unieke bezoekers en geen bevestigde inschrijvingen/);
 assert.doesNotMatch(text,/ra-214/);
});

test('summary does not interpret unavailable or negative figures as positive engagement',()=>{
 const text=summary({days:999},[
  {event_id:'ra-1',event_name:'Race A',card_views:12,detail_views:-50,organizer_clicks:'not-a-number',registration_clicks:3},
  {event_id:'ra-2',event_name:'Race B',card_views:8,detail_views:2,organizer_clicks:1,registration_clicks:2}
 ]);
 assert.match(text,/Overzicht van 2 geverifieerde evenementen/);
 assert.match(text,/laatste 30 dagen/);
 assert.match(text,/Kaartweergaven: 20/);
 assert.match(text,/Detailopeningen: 2/);
 assert.match(text,/Websiteklikken: 1/);
 assert.match(text,/Inschrijfklikken: 5/);
});

test('organizer summary only copies on user click and handles clipboard absence',()=>{
 assert.ok(html.includes('id="copySummary" type="button" disabled'));
 assert.ok(html.includes('id="copySummaryStatus"'));
 assert.ok(js.includes("organizerSummaryText(report,selectedEvents())"));
 assert.ok(js.includes("navigator.clipboard.writeText(summary)"));
 assert.ok(js.includes("Automatisch kopiëren is niet beschikbaar."));
});

test('organizer can download the scoped text summary without clipboard permission',()=>{
 assert.ok(html.includes('id="downloadSummary" type="button" disabled'));
 const download=js.slice(js.indexOf("$('downloadSummary').addEventListener"),js.indexOf("$('exportDaily').addEventListener"));
 assert.match(download,/const events=selectedEvents\(\)/);
 assert.match(download,/organizerSummaryText\(report,events\)/);
 assert.match(download,/text\/plain;charset=utf-8/);
 assert.doesNotMatch(download,/clipboard/);
});
