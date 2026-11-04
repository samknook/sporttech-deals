const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const app=require('../docs/readiness-core.js');
const docs=path.join(__dirname,'..','docs');
const record=(status,i)=>({status,topic:'Check '+i,action:'Do action '+i,url:'race-planner.html'});
test('all done does not imply physical readiness',()=>{
 const v=Array.from({length:12},(_,i)=>record('done',i));
 const result=app.summarize(v);
 assert.equal(result.done,12);
 assert.equal(result.unanswered,0);
 assert.equal(result.pending.length,0);
 assert.match(result.summary,/does not indicate medical or physical race readiness/i);
});
test('incomplete checks give a focused list of tasks',()=>{
 const v=Array.from({length:12},(_,i)=>record(i===0?'not':i===1?'progress':i===2?'':'done',i));
 const result=app.summarize(v);
 assert.equal(result.done,9);
 assert.equal(result.unanswered,1);
 assert.equal(result.pending.length,2);
 assert.equal(result.pending[0].topic,'Check 0');
 const output=app.exportText(v,result);
 assert.match(output,/NEXT STEPS/);
 assert.match(output,/Do action 0/);
 assert.match(output,/unanswered/);
});
test('invalid statuses and list lengths rejected',()=>{
 assert.throws(()=>app.summarize([]));
 assert.throws(()=>app.summarize(Array.from({length:12},(_,i)=>record('absolutely',i))));
});
test('readiness check linked from homepage and catalog with no data submission',()=>{
 const html=fs.readFileSync(path.join(docs,'70-3-readiness-check.html'),'utf8');
 const home=fs.readFileSync(path.join(docs,'index.html'),'utf8');
 const products=fs.readFileSync(path.join(docs,'products.html'),'utf8');
 assert.match(html,/src="readiness-core.js"/);
 assert.match(html,/id="questions"/);
 assert.match(html,/id="download"/);
 assert.match(html,/URL\.createObjectURL/);
 assert.doesNotMatch(html,/fetch\(|XMLHttpRequest|sendBeacon|<form[^>]+action=/);
 assert.match(home,/href="70-3-readiness-check.html"/);
 assert.match(products,/href="70-3-readiness-check.html"/);
});
