#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const {buildDashboard}=require('../scripts/build-trizentro-organizer-dashboard.cjs');
const sample={periodStart:'2026-11-01',periodEnd:'2026-11-30',events:[
 {event_id:'ra-423',event_name:'Maastricht <test> & Co',card_views:15,detail_views:5,organizer_clicks:3,registration_clicks:2},
 {event_id:'ra-49',event_name:'Run =HYPERLINK()',card_views:30,detail_views:0,organizer_clicks:0,registration_clicks:1}
],daily:[
 {event_id:'ra-423',day:'2026-11-16',kind:'organizer',clicks:3},
 {event_id:'ra-423',day:'2026-11-17',kind:'registration',clicks:2},
 {event_id:'ra-423',day:'2026-10-05',kind:'organizer',clicks:999}
]};
const dashboard=buildDashboard(sample);
assert.ok(dashboard.includes('Maastricht &lt;test&gt; &amp; Co'),'Escape organizer event labels');
assert.ok(!dashboard.includes('2026-10-05'),'Do not include activity outside period');
assert.ok(dashboard.includes('trizentro-rapport-ra-423.html'),'Link to private per-event export');
assert.ok(dashboard.includes('id="filter"'),'Dashboard must allow filtering events');
assert.ok(dashboard.includes('id="races"'),'Dashboard must render event table');
assert.ok(dashboard.includes('Geen unieke bezoekers')||dashboard.includes('geen unieke bezoekers'),'Report must be explicit about unique visitor limitations');
assert.ok(dashboard.includes('noindex,nofollow'),'Do not index local reporting interface');
assert.ok(dashboard.includes('2026-11-17'),'Valid daily click records must be represented');
assert.ok(!dashboard.includes('999 klikken'),'Old records excluded');
assert.throws(()=>buildDashboard({...sample,periodEnd:'2026-10-01'}),/periodStart/);
console.log('PASS: private analytics dashboard, safe escaping, daily trends, per-event export, period controls');
