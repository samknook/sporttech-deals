#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync('docs/raceatlas/index.html','utf8');
const begin=html.indexOf('const EVENTS=')+'const EVENTS='.length;
const end=html.indexOf(';\n',begin);
assert.ok(end>begin,'Public events JSON missing');
const events=JSON.parse(html.slice(begin,end));
const archive=JSON.parse(fs.readFileSync('audit/2026-11-17-original-event-catalogue.json','utf8'));
assert.ok(archive.events.length>=434,'Original event catalogue must be retained for further research');
assert.ok(events.length>=120&&events.length<300,'Unverified events must not appear in public catalogue');
const ids=new Set();
for(const event of events){
 assert.match(event.id,/^ra-\d{1,8}$/,'Valid event ID');
 assert.ok(!ids.has(event.id),'No repeated events '+event.id);
 ids.add(event.id);
 assert.ok(typeof event.officialEventUrl==='string'&&event.officialEventUrl.startsWith('https://'),
  'A published race requires a distinct official event or registration URL: '+event.id);
 assert.ok(!/^https:\/\/www\.ironman\.com\/races\/?$/.test(event.officialEventUrl),
  'A generic IRONMAN directory is not a race page: '+event.id);
 assert.ok(!/championship-calendar/.test(event.officialEventUrl),
  'A generic championship announcement is not an event page: '+event.id);
}
// Keep confirmed, official-link entries published, but never reintroduce
// draft events whose individual official registration/event page is missing.
for(const id of ['ra-28','ra-236','ra-429']){
 assert.ok(ids.has(id),'Verified published event disappeared: '+id);
}
for(const id of ['ra-150','ra-161','ra-163','ra-252','ra-264','ra-284','ra-304','ra-311','ra-316','ra-327','ra-330','ra-332']){
 assert.ok(!ids.has(id),'Unverified draft wrongly restored to public calendar: '+id);
 assert.ok(archive.events.some(event=>event.id===id),'Original unverified event must remain in the research archive: '+id);
}
for(const event of events){
 assert.ok(!/\/toertochten\/?$|\/evenementen\/?$/.test(new URL(event.officialEventUrl).pathname)
  || /tempo-soest/.test(event.officialEventUrl),
  'An unfiltered generic category listing is not an event-specific registration destination: '+event.id);
}
const pageBuilder=fs.readFileSync('scripts/build-trizentro-event-pages.cjs','utf8');
const shell=fs.readFileSync('scripts/build-trizentro-platform-shell.cjs','utf8');
const auto=fs.readFileSync('docs/raceatlas/auto-events.js','utf8');
const radar=fs.readFileSync('docs/raceatlas/intelligence.js','utf8');
assert.ok(pageBuilder.includes("fs.rmSync(output,{recursive:true,force:true})"),'Old legacy race pages must be cleared');
assert.ok(shell.includes("fs.rmSync(cleanDetailsDir,{recursive:true,force:true})"),'Old canonical race pages must be cleared');
assert.ok(pageBuilder.includes("e.reviewedByTriZentro===true"),'Generated auto events must be explicitly reviewed');
assert.ok(auto.includes("row.reviewedByTriZentro!==true"),'Browser auto events must be explicitly reviewed');
assert.ok(radar.includes('fetched.filter(record=>publicIds.has(record.event_id))'),'Radar should not show archived races');
console.log('PASS: '+events.length+' official-link-only events, archive, no stale race pages, verified feed-only policy');
