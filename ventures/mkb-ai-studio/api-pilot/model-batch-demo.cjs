#!/usr/bin/env node
/* Fixed synthetic end-to-end demo with a mocked model provider.
 * No real API call, billable usage, account secrets or outbound messages.
 */
'use strict';
const {processBatch}=require('./model-batch.cjs');
const item=(id,claim)=>({
 sample:{id,message:'Please check payment for invoice INV-218.',approvedFacts:[{source:'Synthetic invoice reference',fact:'INV-218 exists; payment status remains unconfirmed.'}]},
 assertions:[{kind:'invoice',reference:'INV-218',field:'payment_status',value:claim}],
 records:[{kind:'invoice',reference:'INV-218',field:'payment_status',value:'unpaid',source:'Synthetic ledger',checkedOn:'2026-11-06'}],
 asOf:'2026-11-06'
});
const reply='CATEGORY: invoice\nDRAFT: Thanks for contacting us about INV-218. We will check the ledger and respond once the payment is verified.\nHUMAN CHECKS: Verify source authenticity, invoice identity and current payment status.';
const fakeProvider=async()=>({ok:true,status:200,json:async()=>({status:'completed',output:[{type:'message',content:[{type:'output_text',text:reply}]}]})});
async function main(){
 const result=await processBatch({items:[item('MOCK-001','unpaid'),item('MOCK-002','paid')],mode:'live',approvedData:true,model:'synthetic-test-model',apiKey:'fake-local-test-key',fetchImpl:fakeProvider});
 console.log(JSON.stringify({summary:result.summary,cases:result.results.map(r=>({id:r.id,status:r.status,issues:r.assessment?.problems||[]}))},null,2));
 console.log('Mock provider only. Both outputs require human review. Messages sent: 0.');
}
main().catch(e=>{console.error('Synthetic test failed: '+e.message);process.exitCode=1});
