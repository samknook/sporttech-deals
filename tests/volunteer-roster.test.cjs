const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const tool=require('../docs/volunteer-roster-core.js');
const people=()=>[
 {id:'VOL-01',available_from:'06:00',available_to:'12:00',skills:'water|registration'},
 {id:'VOL-02',available_from:'06:00',available_to:'11:00',skills:'registration'},
 {id:'VOL-03',available_from:'07:00',available_to:'13:00',skills:'water|course'},
 {id:'VOL-04',available_from:'07:00',available_to:'12:00',skills:'course'},
 {id:'VOL-05',available_from:'06:00',available_to:'10:00',skills:'registration'},
 {id:'VOL-06',available_from:'08:00',available_to:'13:00',skills:'course'}
];
const shifts=()=>[
 {id:'CHECKIN',from:'06:00',to:'08:00',needed:'2',skill:'registration'},
 {id:'SWIM',from:'08:00',to:'10:00',needed:'2',skill:'water'},
 {id:'COURSE',from:'10:00',to:'12:00',needed:'3',skill:'course'},
 {id:'FINISH',from:'12:00',to:'13:00',needed:'2',skill:'course'}
];
test('CSV parser reads expected columns and quoted fields',()=>{
 const csv='id,available_from,available_to,skills\n"VOL-01",06:00,12:00,"water|registration"\n';
 assert.equal(tool.parseCsv(csv,['id','available_from','available_to','skills'])[0].skills,'water|registration');
 assert.throws(()=>tool.parseCsv('bad,columns\n1,2',['id','available_from','available_to','skills']));
 assert.throws(()=>tool.parseCsv('id,available_from,available_to,skills\n"missing,06:00,10:00,water',['id','available_from','available_to','skills']));
});
test('generates shortage report and prevents overlapping or unqualified assignments',()=>{
 const result=tool.assign(people(),shifts());
 assert.equal(result.required,9);
 assert.equal(result.assigned+result.unfilled,result.required);
 assert.ok(result.unfilled>0,'example should show a real shortfall');
 const roster=new Map();
 for(const shift of result.shifts){
  assert.equal(shift.assigned.length+shift.unfilled,shift.needed);
  for(const id of shift.assigned){
   const p=people().find(x=>x.id===id);
   assert.ok(p);
   assert.ok(tool.mins(p.available_from)<=shift.from&&tool.mins(p.available_to)>=shift.to);
   assert.ok(!shift.skill||p.skills.split('|').includes(shift.skill));
   const existing=roster.get(id)||[];
   for(const previous of existing)assert.ok(shift.from>=previous.to||previous.from>=shift.to,'overlap for '+id);
   existing.push(shift);roster.set(id,existing);
  }
 }
});
test('scarce qualified people are allocated before general roles where possible',()=>{
 const result=tool.assign([
  {id:'A',available_from:'06:00',available_to:'11:00',skills:'medic'},
  {id:'B',available_from:'06:00',available_to:'11:00',skills:''}
 ],[
  {id:'GENERAL',from:'08:00',to:'10:00',needed:'1',skill:''},
  {id:'MEDIC',from:'08:00',to:'10:00',needed:'1',skill:'medic'}
 ]);
 assert.deepEqual(result.shifts.find(x=>x.id==='MEDIC').assigned,['A']);
 assert.deepEqual(result.shifts.find(x=>x.id==='GENERAL').assigned,['B']);
 assert.equal(result.unfilled,0);
});
test('rejects duplicate aliases, bad availability and invalid staffing numbers',()=>{
 assert.throws(()=>tool.assign([people()[0],people()[0]],shifts()));
 assert.throws(()=>tool.assign([{...people()[0],available_to:'05:00'}],shifts()));
 assert.throws(()=>tool.assign(people(),[{...shifts()[0],needed:'0'}]));
 assert.throws(()=>tool.assign(people(),[{...shifts()[0],from:'10:00',to:'08:00'}]));
});
test('CSV export escapes formula-like values and keeps deficit totals',()=>{
 const result=tool.assign(people(),shifts());
 const csv=tool.exportCsv(result);
 assert.match(csv,/shift_id/);
 assert.match(csv,/COURSE/);
 assert.match(csv,/unfilled/);
});
test('public tool is locally computed and explicitly labels the output as a proposal',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../docs/volunteer-roster.html'),'utf8');
 for(const id of ['volunteers','shifts','roster-results','missing-slots','roster-rows','download-roster'])assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(html,/src="volunteer-roster-core.js"/);
 assert.match(html,/geen echte namen/);
 assert.match(html,/voorstel/);
});
