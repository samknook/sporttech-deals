'use strict';
const assert=require('node:assert/strict');
const {measure}=require('../ventures/mkb-ai-studio/api-pilot/measure.cjs');
const tasks=[
 {id:'01',before:8,processing:3,review:2,rework:0,correct:true,comparable:true},
 {id:'02',before:10,processing:4,review:2,rework:1,correct:true,comparable:true},
 {id:'03',before:7,processing:3,review:2,rework:0,correct:true,comparable:true}
];
const m=measure(tasks,40);
assert.equal(m.netMinutes,8);
assert.equal(m.netHours,8/60);
assert.equal(m.capacityValue,8/60*40);
assert.equal(m.exceptions,0);
assert.equal(m.goLive,false);
assert.equal(m.verified,false);
assert.equal(m.eligibleForAssessment,true);
const wrong=measure([{...tasks[0],correct:false},tasks[1],tasks[2]],40);
assert.equal(wrong.eligibleForAssessment,false);
const slower=measure(tasks.map(x=>({...x,review:15})),40);
assert.ok(slower.netMinutes<0);
assert.ok(slower.capacityValue<0);
assert.equal(slower.eligibleForAssessment,false);
assert.throws(()=>measure([tasks[0],tasks[0],tasks[2]],40));
assert.throws(()=>measure(tasks.slice(0,2),40));
assert.throws(()=>measure(tasks,-1));
console.log('Pilot net time scorecard tests passed.');
