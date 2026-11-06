#!/usr/bin/env node
/* MKB AI Studio — synthetic end-to-end workflow only.
 * No user input, API keys, provider requests, mail or persistent writes.
 */
'use strict';
const pipeline=require('./review-pipeline.cjs');
const sample={id:'PILOT-001',message:'Could you confirm payment for invoice INV-218?',approvedFacts:[{source:'Synthetic ledger summary',fact:'INV-218 exists, but no customer-facing payment confirmation is authorized.'}]};
const reference={kind:'invoice',reference:'INV-218',field:'payment_status'};
const source={...reference,value:'unpaid',source:'Synthetic ledger snapshot',checkedOn:'2026-11-06'};
const draft='CATEGORY: invoice inquiry\nDRAFT: Thank you for your message about INV-218. We will verify payment details before replying.\nHUMAN CHECKS: Verify customer identity and current payment status in the real accounting system.';
const base={sample,draft,assertions:[{...reference,value:'unpaid'}],records:[source],asOf:'2026-11-06'};
const safe=pipeline.prepare(base);
const contradictory=pipeline.prepare({...base,assertions:[{...reference,value:'paid'}]});
const reviewed=pipeline.review(safe,{decision:'approve-draft',reviewer:'Synthetic supervisor',sourceVerified:true});
const escalated=pipeline.review(contradictory,{decision:'escalate',reviewer:'Synthetic supervisor',reason:'Payment claim conflicts with source'});
for(const item of [safe,reviewed,contradictory,escalated]){
 const overview=pipeline.summary(item);
 console.log(overview.id+' | '+overview.state+' | flags: '+(overview.issues.join(', ')||'none')+' | sent: '+overview.sent);
}
console.log('These are fixed synthetic examples. No actual source was verified and no external action occurred.');
