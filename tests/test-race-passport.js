/* Run with Node: node tests/test-race-passport.js */
'use strict';
const assert=require('node:assert/strict');
const core=require('../docs/race-planner-core.js');
const passport=require('../docs/race-passport.js');
const packReview=require('../docs/race-pack-review.js');
function approx(a,b,delta=1e-6){assert.ok(Math.abs(a-b)<=delta,`expected ${a} close to ${b}`);}
const input={distance:'half',swimPace:'2:00',bikeSpeed:30,runPace:'5:00',t1Minutes:4,t2Minutes:3,start:'08:00',target:'05:30'};
const result=core.calculate(input);
approx(result.swim,2280);approx(result.bike,10800);approx(result.run,6329.25);
const checked=packReview.review({locale:'nl',name:'Test Race',date:'2027-06-20',transitionClose:'07:00',
 checks:Array(8).fill(true),weather:'Wind',mechanical:'Pech',nutrition:'Reserve'});
assert.equal(checked.total,11);assert.equal(checked.done,11);
const view=passport.build({name:'Test Race',date:'2027-06-20',start:'08:00',locale:'nl',result,core,
 morning:[{time:'06:00',label:'Vertrek'}],review:checked,transitionClosure:'07:00',
 decisions:{weather:'Wind',mechanical:'Pech',nutrition:'Reserve'}});
assert.equal(view.total,'5:30:29');assert.equal(view.finish,'13:30');
assert.equal(view.times.length,5);assert.equal(view.times[0].clock,'08:38');
assert.equal(view.times[4].clock,'13:30');
assert.equal(view.review,'11/11');
assert.equal(view.plans[0].value,'Wind');
assert.equal(view.transitionClosure,'07:00');
const missing=packReview.review({locale:'en',name:'My first 70.3',date:'',transitionClose:'',
 checks:Array(8).fill(false),weather:'',mechanical:'',nutrition:''});
assert.equal(missing.done,0);
const minimal=passport.build({name:'',start:'23:30',locale:'en',result,core,review:missing});
assert.equal(minimal.review,'0/11');assert.equal(minimal.plans[0].value,'No personal plan yet');
assert.match(minimal.times[4].clock,/\+1 dag/);
assert.throws(()=>passport.build({name:'bad',start:'08:00',result:{total:NaN},core}),/Valid race calculation/);
console.log('TriZentro race passport regression tests passed.');
