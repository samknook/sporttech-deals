'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const page=read('docs/raceatlas/index.html');
const details=read('docs/raceatlas/details.js');
const tracking=read('docs/raceatlas/tracking.js');
const worker=read('raceatlas-backend/worker.js');
const schema=read('raceatlas-backend/schema.sql');
const organizers=read('docs/raceatlas/organisatoren.html');
test('Client tracking stays inactive until explicitly configured',()=>{
 assert.match(tracking,/const ENDPOINT = '';/);
 assert.match(tracking,/function enabled\(\)/);
 assert.match(tracking,/if\(!enabled\(\)/);
 assert.doesNotMatch(tracking,/localStorage|sessionStorage|document\.cookie/);
 new Function(tracking);
});
test('Both event cards and detail links carry the same anonymous click attributes',()=>{
 assert.match(page,/data-ra-outbound/);
 assert.match(page,/src="tracking\.js"/);
 assert.match(details,/a\.dataset\.raEvent=e\.id/);
 assert.match(details,/a\.dataset\.raOutbound/);
});
test('Worker aggregates daily click totals and requires private admin authorization for reports',()=>{
 assert.match(worker,/url\.pathname==='\/track'/);
 assert.match(worker,/origin!==env\.PUBLIC_ORIGIN/);
 assert.match(worker,/eventId/);
 assert.match(worker,/outbound_click_daily/);
 assert.match(worker,/url\.pathname==='\/stats'/);
 assert.match(worker,/STATS_ADMIN_TOKEN/);
 assert.match(worker,/metric:'outbound_clicks_not_unique_visitors_or_registrations'/);
 assert.match(schema,/CREATE TABLE IF NOT EXISTS outbound_click_daily/);
 for(const forbidden of ['ip_address TEXT','email TEXT','visitor_id TEXT'])assert.ok(!schema.slice(schema.indexOf('CREATE TABLE IF NOT EXISTS outbound_click_daily')).includes(forbidden));
 new Function(worker.replace('export default {','return {'));
});
test('Private correction workflow links events to organizer form without public Github issues',()=>{
 assert.match(details,/organisatoren\.html/);
 assert.match(details,/link\.searchParams\.set\('eventId',e\.id\)/);
 assert.doesNotMatch(details,/issues\/new/);
 assert.match(organizers,/function prefillOrganizerContact/);
 assert.match(organizers,/RaceAtlas evenement-ID:/);
});
