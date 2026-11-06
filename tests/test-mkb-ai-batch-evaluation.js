'use strict';
const assert=require('node:assert/strict');
const batch=require('../ventures/mkb-ai-studio/api-pilot/batch-evaluation.cjs');
const make=(id,paid=false)=>({
 sample:{id,message:'Please check invoice INV-218',approvedFacts:[{source:'Demo facts',fact:'INV-218 exists; payment status has not been shared'}]},
 draft:'CATEGORY: invoice\nDRAFT: We will check invoice INV-218 and follow up after verifying the accounting data.\nHUMAN CHECKS: Verify customer identity and accounting records.',
 assertions:[{kind:'invoice',reference:'INV-218',field:'payment_status',value:paid?'paid':'unpaid'}],
 records:[{kind:'invoice',reference:'INV-218',field:'payment_status',value:'unpaid',source:'Synthetic ledger',checkedOn:'2026-11-06'}],
 asOf:'2026-11-06'
});
const first=make('BATCH-001'),second=make('BATCH-002',true);
const result=batch.evaluateBatch([first,second],{minutesBefore:8,minutesAfter:5,hourlyCost:40});
assert.equal(result.metrics.total,2);
assert.equal(result.metrics.flagged,1);
assert.equal(result.metrics.projectedMinutes,6);
assert.equal(result.metrics.projectedCapacityValue,4);
assert.equal(result.metrics.emailsSent,0);
assert.equal(result.metrics.goLiveApproved,false);
assert.match(batch.report(result),/SIMULATED/);
assert.throws(()=>batch.evaluateBatch([first,first],{minutesBefore:8,minutesAfter:5,hourlyCost:40}),/Duplicate/);
assert.throws(()=>batch.evaluateBatch([first],{minutesBefore:8,minutesAfter:5,hourlyCost:-1}),/Invalid/);
assert.throws(()=>batch.applyDecision(result,'BATCH-002',{decision:'approve-draft',reviewer:'Supervisor',sourceVerified:true}),/Unresolved/);
const escalated=batch.applyDecision(result,'BATCH-002',{decision:'escalate',reviewer:'Supervisor',reason:'Contradictory payment status'});
assert.equal(escalated.cases[1].state,'escalated');
assert.equal(result.cases[1].state,'pending-review');
const checked=batch.applyDecision(result,'BATCH-001',{decision:'approve-draft',reviewer:'Supervisor',sourceVerified:true});
assert.equal(checked.cases[0].state,'reviewed-draft');
assert.equal(checked.sendEnabled,false);
console.log('Batch evaluation checks passed; no outbound actions.');
