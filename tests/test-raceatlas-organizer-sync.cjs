'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const src=fs.readFileSync('docs/raceatlas/organizer-sync.js','utf8');
const sandbox={window:{RACEATLAS_EVENTS:[]},document:{readyState:'loading',addEventListener(){}},URL};
vm.runInNewContext(src,sandbox,{filename:'organizer-sync.js'});
const apply=sandbox.window.RaceAtlasOrganizerSyncUpdate;
assert.equal(typeof apply,'function');
const events=[
{id:'ra-1',date:'2027-02-02',dateEvidence:'listed',name:'Race A'},
{id:'ra-2',date:'2027-03-03',dateEvidence:'listed',name:'Race B'}
];
const results=apply([
{event_id:'ra-1',official_event_url:'https://official.example.org',organizer_link_status:'candidate',date_confidence:'unverified',start_date:null,registration_status:'unknown'},
{event_id:'ra-2',official_event_url:'https://club.example.org/event',organizer_link_status:'verified',date_confidence:'official',start_date:'2027-04-04',distance_label:'10 km',registration_status:'unknown'},
{event_id:'ra-3',official_event_url:'https://other.example.org',organizer_link_status:'verified',date_confidence:'official',start_date:'2027-05-05'}
],events);
assert.equal(results.updated,2);
assert.equal(events[0].date,'2027-02-02');
assert.equal(events[0].dateEvidence,'listed');
assert.equal(events[0].officialEventUrl,'https://official.example.org');
assert.equal(events[0].organizerLinkStatus,'candidate');
assert.equal(events[1].date,'2027-04-04');
assert.equal(events[1].dateEvidence,'official');
assert.equal(events[1].distance,'10 km');
assert.equal(events[1].registrationStatus,undefined,'Unknown status must never be promoted to open');
const blocked=apply([{event_id:'ra-1',official_event_url:'javascript:alert(1)',organizer_link_status:'verified',date_confidence:'unverified'}],events);
assert.equal(blocked.updated,0);
assert.equal(events[0].officialEventUrl,'https://official.example.org');
console.log('Organizer sync regression tests passed');
