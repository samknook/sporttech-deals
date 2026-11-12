'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('docs/raceatlas/auto-events.js','utf8');
const context={
 window:{RACEATLAS_EVENTS:[]},document:{readyState:'loading',addEventListener(){}},
 URL,Date,AbortSignal,fetch:async()=>({ok:false,json:async()=>({})})
};
vm.runInNewContext(source,context,{filename:'auto-events.js'});
const apply=context.window.RaceAtlasAutoEventsApply;
assert.equal(typeof apply,'function');
const events=[{id:'ra-12',name:'Existing Race',date:'2027-05-01',dateEvidence:'listed',place:'Bergen'}];
const newRace={id:'ra-81234567',date:'2027-05-15',name:'New Race',place:'Utrecht',country:'Nederland',
 sport:'Hardlopen',discipline:'Weg',officialEventUrl:'https://organizer.example.org/race',
 source:'https://organizer.example.org/race',dateEvidence:'official',sourceMethod:'official_jsonld_event',verifiedOn:'2026-11-12'};
const update={id:'ra-12',name:'Existing Race',date:'2027-05-02',source:'https://organizer.example.org/existing',
 officialEventUrl:'https://organizer.example.org/existing',verifiedOn:'2026-11-12'};
const payload={version:1,events:[newRace],updates:[update]};
const result=apply(payload,events);
assert.equal(result.added,1);
assert.equal(result.updated,1);
assert.equal(events[0].date,'2027-05-02');
assert.equal(events[1].name,'New Race');
assert.equal(events[1].distance,'Afstanden bij organisator');
assert.equal(events[1].registrationStatus,'check');
assert.equal(apply(payload,events).added,0,'Never duplicate new events when refreshing');
const malicious=apply({version:1,events:[{...newRace,id:'ra-83456789',officialEventUrl:'javascript:alert(1)'}]},events);
assert.equal(malicious.added,0,'Block non-HTTPS URLs');
assert.equal(events.length,2);
console.log('RaceAtlas automatic event feed and official date update tests passed');
