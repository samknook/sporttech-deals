/* Run: node tests/test-organizer-workspace.js */
'use strict';
const assert=require('node:assert/strict');
const ws=require('../docs/organizer-workspace-core.js');
const blank=ws.empty();const p=ws.progress(blank);
assert.equal(p.complete,0);assert.equal(p.total,6);assert.equal(p.ready,false);
const good={...blank,event:'Local Triathlon',date:'2027-06-20',source:'https://example.org/athlete-guide',
 tasks:Object.fromEntries(ws.TASKS.map(([id])=>[id,true])),notes:'Check water safety with official organizer.'};
assert.equal(ws.progress(good).complete,6);
assert.equal(ws.progress(good).ready,true);
assert.match(ws.report(good,'nl'),/6\/6/);
assert.match(ws.report(good,'en'),/WORKSPACE SUMMARY/);
assert.throws(()=>ws.validate({...good,source:'javascript:alert(1)'}));
assert.throws(()=>ws.validate({...good,source:'http://example.org'}));
assert.throws(()=>ws.validate({...good,tasks:{...good.tasks,review:'yes'}}));
assert.throws(()=>ws.validate({...good,event:'x'.repeat(101)}));
assert.throws(()=>ws.validate({...good,date:'20-06-2027'}));
const partial=ws.progress({...good,tasks:{...good.tasks,roster:false}});
assert.equal(partial.complete,5);assert.equal(partial.ready,false);
console.log('Organizer workspace regression tests passed.');
