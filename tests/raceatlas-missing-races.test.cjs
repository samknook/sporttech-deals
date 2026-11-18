'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../docs/raceatlas');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const source=fs.readFileSync(path.join(root,'organizer-sync.js'),'utf8');
const details=fs.readFileSync(path.join(root,'details.js'),'utf8');
const a=index.indexOf('const EVENTS=')+'const EVENTS='.length,b=index.indexOf('];',a)+1;
const events=JSON.parse(index.slice(a,b));
test('Kerstmannenrun and verified winter events appear in the canonical static list',()=>{
 for(const id of ['ra-345','ra-346','ra-347','ra-444','ra-445','ra-446','ra-447']){
  const e=events.find(x=>x.id===id);
  assert.ok(e,'missing '+id);assert.match(e.officialEventUrl,/^https:\/\//);assert.ok(e.name);
 }
 assert.equal(events.find(x=>x.id==='ra-347').date,'2026-12-19');
 assert.equal(events.find(x=>x.id==='ra-447').date,null);
 assert.notEqual(events.find(x=>x.id==='ra-447').dateEvidence,'official');
 assert.equal(new Set(events.map(e=>e.id)).size,events.length);
});
test('only verified published links are added by organizer sync, without duplicate IDs',()=>{
 const window={RACEATLAS_EVENTS:[],RaceAtlasRefresh:()=>{}};
 const document={readyState:'loading',addEventListener:()=>{}};
 vm.runInNewContext(source,{window,document,URL,Date,AbortSignal,fetch:()=>{}});
 const base={event_id:'ra-99550',event_name:'Test Kerstloop',sport:'running',country_code:'NL',region:'Noord-Holland',city:'Testdorp',start_date:'2026-12-19',date_confidence:'official',official_event_url:'https://organisatie.example/testloop',registration_status:'unknown',last_verified_at:'2026-11-18T12:00:00Z'};
 const verified={...base,organizer_link_status:'verified'};
 const candidate={...base,event_id:'ra-99551',event_name:'Unverified Run',organizer_link_status:'candidate'};
 const badLink={...base,event_id:'ra-99552',event_name:'Bad Link',organizer_link_status:'verified',official_event_url:'http://not-https.test'};
 assert.equal(window.RaceAtlasOrganizerSyncUpdate([candidate,badLink,verified]).updated,1);
 assert.equal(window.RACEATLAS_EVENTS.length,1);
 assert.equal(window.RACEATLAS_EVENTS[0].sport,'Hardlopen');
 assert.equal(window.RACEATLAS_EVENTS[0].dateEvidence,'official');
 assert.equal(window.RACEATLAS_EVENTS[0].liveOnly,true);
 assert.equal(window.RaceAtlasOrganizerSyncUpdate([verified]).updated,0);
 assert.equal(window.RACEATLAS_EVENTS.length,1);
});
test('confirmed dates are never inferred for events with only a tentative month',()=>{
 const window={RACEATLAS_EVENTS:[]},document={readyState:'loading',addEventListener:()=>{}};
 vm.runInNewContext(source,{window,document,URL,Date,AbortSignal});
 const r={event_id:'ra-99553',event_name:'Tentative Christmas Run',sport:'running',country_code:'NL',city:'Testdorp',official_event_url:'https://organisatie.example/run',organizer_link_status:'verified',date_confidence:'unverified',provisional_date:'2026-12-20',expected_month:12};
 window.RaceAtlasOrganizerSyncUpdate([r]);
 assert.equal(window.RACEATLAS_EVENTS.length,1);
 assert.equal(window.RACEATLAS_EVENTS[0].date,null);
 assert.equal(window.RACEATLAS_EVENTS[0].dateEvidence,'unverified');
 assert.equal(window.RACEATLAS_EVENTS[0].expectedYear,2026);
});
test('live only events do not route users to missing generated detail pages',()=>{
 assert.match(details,/e\?\.liveOnly/);
 assert.match(details,/url\.searchParams\.set\('event',e\.id\)/);
});
