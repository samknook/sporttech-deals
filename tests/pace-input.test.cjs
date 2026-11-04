const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {normalize,normalizeClock,normalizeDuration}=require('../docs/pace-input.js');
const docs=path.join(__dirname,'..','docs');

test('mobile digits become swim and run pace',()=>{
  assert.equal(normalize('445'),'4:45');
  assert.equal(normalize('150'),'1:50');
  assert.equal(normalize('200'),'2:00');
  assert.equal(normalize('1234'),'12:34');
});
test('colon values remain accepted',()=>{
  assert.equal(normalize('4:45'),'4:45');
  assert.equal(normalize('4:5'),'4:05');
  assert.equal(normalize('05:09'),'5:09');
  assert.equal(normalize('5'),'5:00');
});
test('invalid seconds and characters are rejected',()=>{
  for(const input of ['4:65','465','12a4','1:2:3','4.45','10000'])assert.equal(normalize(input),null);
  assert.equal(normalize(''),'');
});
test('all three race screens use the shared mobile formatter',()=>{
  for(const file of ['race-dashboard.html','race-planner.html','triathlon-calculator.html']){
    const html=fs.readFileSync(path.join(docs,file),'utf8');
    assert.match(html,/src="pace-input.js"/);
    assert.match(html,/TriZentroPaceInput\.bind\(/);
    assert.match(html,/inputmode="numeric"/);
  }
});

test('colon-free clock and duration inputs are normalized',()=>{
 assert.equal(normalizeClock('830'),'08:30');
 assert.equal(normalizeClock('1430'),'14:30');
 assert.equal(normalizeClock('8'),'08:00');
 assert.equal(normalizeClock('08:3'),'08:03');
 assert.equal(normalizeDuration('530'),'05:30');
 assert.equal(normalizeDuration('500'),'05:00');
 assert.equal(normalizeDuration('53015'),'05:30:15');
 assert.equal(normalizeDuration('05:30:15'),'05:30:15');
});
test('invalid clock and duration entries are not silently corrected',()=>{
 for(const x of ['2360','2500','12:99','hello'])assert.equal(normalizeClock(x),null);
 for(const x of ['560','0499','12:79','01:30:90'])assert.equal(normalizeDuration(x),null);
});
test('every typed start and finish field gets appropriate formatter',()=>{
 const pages=[
  ['race-dashboard.html','start','goal'],
  ['race-pack-preview.html','start','target'],
  ['race-planner.html','start-time','target-time'],
  ['race-day-timeline.html','start',null],
  ['triathlon-calculator.html',null,'target-time']
 ];
 for(const [file,start,duration] of pages){
  const html=fs.readFileSync(path.join(docs,file),'utf8');
  assert.match(html,/src="pace-input.js"/);
  if(start){
   assert.ok(html.includes('bindClock(["'+start+'"])'),file+' missing clock formatter');
   assert.match(html,new RegExp('<input[^>]*id="'+start+'"[^>]*type="text"|<input[^>]*type="text"[^>]*id="'+start+'"'));
  }
  if(duration)assert.ok(html.includes('bindDuration(["'+duration+'"])'),file+' missing duration formatter');
 }
});
