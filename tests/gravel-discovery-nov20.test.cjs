'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const src=fs.readFileSync(path.resolve(__dirname,'../docs/raceatlas/index.html'),'utf8');
const a=src.indexOf('const EVENTS=')+'const EVENTS='.length,b=src.indexOf('];',a)+1;
const rows=JSON.parse(src.slice(a,b));
test('All five 2027 gravel events are from official sources',()=>{
 for(const id of ['ra-34','ra-455','ra-456','ra-457','ra-458']){
  const e=rows.find(x=>x.id===id);
  assert.ok(e,'missing '+id);assert.match(e.officialEventUrl,/^https:\/\//);
  assert.equal(e.dateEvidence,'official');
  assert.equal(e.sport,'Wielrennen');
  assert.match(e.date,/^2027-/);
 }
 assert.equal(new Set(rows.map(x=>x.id)).size,rows.length);
});
test('Known event dates match official organizer edition dates',()=>{
 assert.equal(rows.find(x=>x.id==='ra-34').date,'2027-01-03');
 assert.equal(rows.find(x=>x.id==='ra-455').date,'2027-07-25');
 assert.equal(rows.find(x=>x.id==='ra-456').date,'2027-06-04');
 assert.equal(rows.find(x=>x.id==='ra-457').date,'2027-09-18');
 assert.equal(rows.find(x=>x.id==='ra-458').date,'2027-05-09');
});
