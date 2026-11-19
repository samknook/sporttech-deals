'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const src=fs.readFileSync(path.resolve(__dirname,'../docs/raceatlas/index.html'),'utf8');
const a=src.indexOf('const EVENTS=')+'const EVENTS='.length,b=src.indexOf('];',a)+1;
const events=JSON.parse(src.slice(a,b));
test('newly researched 2026-2027 races exist with official event references',()=>{
 const required=['ra-236','ra-448','ra-449','ra-450','ra-451','ra-452','ra-453','ra-454'];
 for(const id of required){const e=events.find(r=>r.id===id);assert.ok(e,id);assert.match(e.officialEventUrl,/^https:\/\//);assert.equal(e.dateEvidence,'official');assert.match(e.date,/^20\d{2}-\d{2}-\d{2}$/)}
 assert.equal(new Set(events.map(r=>r.id)).size,events.length);
});
test('2027 Nieuwkoop edition is separate from the previous edition and registration pages are official',()=>{
 assert.equal(events.find(x=>x.id==='ra-236').date,'2027-05-30');
 const run=events.find(x=>x.id==='ra-448');
 assert.equal(run.date,'2027-05-29');
 assert.match(run.registrationUrl,/^https:\/\/vissenloop\.nl\//);
});
test('Katwijk races match confirmed Duinloopcircuit dates',()=>{
 const expected={'ra-451':'2027-01-23','ra-452':'2027-02-13','ra-453':'2027-03-13','ra-454':'2026-12-05'};
 for(const [id,date] of Object.entries(expected)){const e=events.find(x=>x.id===id);assert.equal(e.date,date);assert.equal(new URL(e.officialEventUrl).hostname,'duinloopcircuit.nl')}
});
