const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {normalize}=require('../docs/pace-input.js');
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
