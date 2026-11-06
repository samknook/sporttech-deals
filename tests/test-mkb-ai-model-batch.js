'use strict';
const assert=require('node:assert/strict');
const {processBatch}=require('../ventures/mkb-ai-studio/api-pilot/model-batch.cjs');
const base={
 sample:{id:'CASE-001',message:'Please check INV-218',approvedFacts:[{source:'Synthetic fact sheet',fact:'INV-218 exists, payment status unknown.'}]},
 assertions:[{kind:'invoice',reference:'INV-218',field:'payment_status',value:'unpaid'}],
 records:[{kind:'invoice',reference:'INV-218',field:'payment_status',value:'unpaid',source:'Synthetic ledger',checkedOn:'2026-11-06'}],
 asOf:'2026-11-06'
};
const item=id=>({...base,sample:{...base.sample,id}});
const response=text=>({ok:true,status:200,json:async()=>({status:'completed',output:[{type:'message',content:[{type:'output_text',text}]}]})});
(async()=>{
 let calls=0;
 const blocked=async()=>{calls++;throw Error('unexpected call')};
 const dry=await processBatch({items:[item('CASE-001'),item('CASE-002')],fetchImpl:blocked});
 assert.equal(dry.summary.notExecuted,2);
 assert.equal(dry.summary.drafts,0);
 assert.equal(dry.summary.outboundSent,0);
 assert.equal(calls,0);
 await assert.rejects(processBatch({items:[item('CASE-001')],mode:'live',model:'test-model',apiKey:'fake',fetchImpl:blocked}),/approved/);
 await assert.rejects(processBatch({items:[item('CASE-001'),item('CASE-001')],fetchImpl:blocked}),/Duplicate/);
 await assert.rejects(processBatch({items:[{...base,assertions:[]}],fetchImpl:blocked}),/assertions/);
 assert.equal(calls,0);
 const good='CATEGORY: invoice\nDRAFT: We will review invoice INV-218 and follow up after checking authorized records.\nHUMAN CHECKS: Verify invoice, identity, and the true ledger state.';
 const live=await processBatch({items:[item('CASE-001'),item('CASE-002')],mode:'live',model:'test-model',apiKey:'synthetic-key',approvedData:true,fetchImpl:async()=>{calls++;return response(good)}});
 assert.equal(live.summary.drafts,2);
 assert.equal(live.summary.errors,0);
 assert.equal(live.summary.outboundSent,0);
 assert.equal(live.results[0].status,'needs-human-review');
 assert.equal(live.results[0].assessment.state,'pending-review');
 assert.equal(live.results[0].assessment.sendEnabled,false);
 assert.equal(calls,2);
 const risky='CATEGORY: invoice\nDRAFT: Payment has been received for INV-218, so your invoice is settled.\nHUMAN CHECKS: Check original bank receipt and invoice status.';
 const flagged=await processBatch({items:[item('CASE-003')],mode:'live',model:'test-model',apiKey:'synthetic-key',approvedData:true,fetchImpl:async()=>{calls++;return response(risky)}});
 assert.equal(flagged.results[0].status,'needs-escalation');
 assert.equal(flagged.results[0].assessment.problems.includes('claim:confirmed-payment'),true);
 const failed=await processBatch({items:[item('CASE-004'),item('CASE-005')],mode:'live',model:'test-model',apiKey:'synthetic-key',approvedData:true,fetchImpl:async()=>{calls++;return {ok:false,status:429}}});
 assert.equal(failed.summary.errors,1);
 assert.equal(failed.summary.stoppedEarly,true);
 assert.equal(failed.summary.processed,1);
 assert.equal(failed.results[0].reason.includes('429'),false);
 console.log('Offline-first model batch tests passed. All model replies mocked.');
})().catch(e=>{console.error(e);process.exitCode=1});
