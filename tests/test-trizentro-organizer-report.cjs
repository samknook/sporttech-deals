#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const {render}=require('../scripts/build-trizentro-organizer-report.cjs');
const input={
 periodStart:'2026-11-01',periodEnd:'2026-11-30',
 events:[{event_id:'ra-423',event_name:'Maastricht <Test> & Friends',card_views:25,detail_views:10,organizer_clicks:3,registration_clicks:2,sponsored_clicks:0}],
 daily:[{event_id:'ra-423',day:'2026-11-12',kind:'organizer',clicks:3},{event_id:'ra-423',day:'2026-10-01',kind:'organizer',clicks:999}]
};
const report=render(input);
assert.equal(report.reports.length,1);
assert.equal(report.summary.card,25);
assert.equal(report.summary.organizer,3);
assert.ok(report.reports[0].html.includes('Maastricht &lt;Test&gt; &amp; Friends'),'Event names must be escaped');
const unsafe=render({...input,events:[{...input.events[0],event_name:'=HYPERLINK("bad")'}]});
assert.ok(unsafe.csv.includes("'=HYPERLINK"),'CSV must neutralize spreadsheet formulas in event names');
assert.ok(!report.reports[0].html.includes('2026-10-01'),'Out-of-range data must be omitted');
assert.ok(report.reports[0].html.includes('Geen unieke bezoekers'),'Reports should disclose aggregation');
assert.ok(report.reports[0].html.includes('Een klik is geen bevestigde inschrijving'),'No unsupported conversion claims');
assert.ok(report.csv.includes('"30.0%"'),'CSV should contain an indicative action ratio (not actual registrations)');
assert.throws(()=>render({...input,periodStart:'wrong'}),/periodStart/);
assert.throws(()=>render({...input,periodStart:'2026-12-01'}),/periodStart/);
console.log('PASS: organizer report generation, CSV totals, HTML escaping, period boundaries, metric caveats');
