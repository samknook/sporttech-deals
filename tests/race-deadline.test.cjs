const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const deadline=require('../docs/race-deadline-core.js');
test('missing organizer time stays unverified',()=>{
 const r=deadline.check({start:'08:00',warmup:30,transitionClose:'',locale:'nl'});
 assert.equal(r.status,'not-entered');
 assert.match(r.message,/officiële/);
});
test('warn when the personal schedule misses the entered closure',()=>{
 const r=deadline.check({start:'08:00',warmup:30,transitionClose:'07:00',locale:'nl'});
 assert.equal(r.status,'late');
 assert.equal(r.readyTime,'07:30');
 assert.equal(r.minutesLate,30);
 assert.match(r.message,/ná/);
});
test('estimated buffer is described without guaranteeing venue access',()=>{
 const r=deadline.check({start:'08:00',warmup:45,transitionClose:'07:30',locale:'en'});
 assert.equal(r.status,'estimate-ok');
 assert.equal(r.readyTime,'07:15');
 assert.equal(r.minutesBefore,15);
 assert.match(r.message,/verify access/);
});
test('invalid or ambiguous deadline triggers a review instead of inventing official rules',()=>{
 assert.equal(deadline.check({start:'08:00',warmup:30,transitionClose:'7:00'}).status,'invalid');
 assert.equal(deadline.check({start:'08:00',warmup:30,transitionClose:'09:00'}).status,'review');
 assert.equal(deadline.check({start:'00:15',warmup:60,transitionClose:'00:10'}).status,'review');
 assert.throws(()=>deadline.check({start:'25:00',warmup:30,transitionClose:'07:00'}));
});
test('Race Pack UI provides a user-entered deadline and includes its warning in export',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../docs/race-pack-preview.html'),'utf8');
 assert.match(html,/id="transition-close"/);
 assert.match(html,/src="race-deadline-core.js"/);
 assert.match(html,/TriZentroRaceDeadline\.check/);
 assert.match(html,/TRANSITION CLOSURE \(USER-ENTERED\)/);
});
