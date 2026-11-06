/* Run: node tests/test-mkb-ai-claims.js */
'use strict';
const assert=require('node:assert/strict');
const {auditClaims,assessDraft}=require('../ventures/mkb-ai-studio/api-pilot/inbox-adapter.cjs');
const sample={id:'QA-001',message:'Please check our invoice.',approvedFacts:[{source:'Synthetic accounting export',fact:'INV-123 exists, payment status unknown.'}]};
function draft(body){return 'CATEGORY: invoice\nDRAFT: '+body+'\nHUMAN CHECKS: Finance reviewer checks authorized source records and customer identity.'}
const cases=[
 {title:'False payment confirmation',body:'Payment has been received for INV-123.',key:'confirmed-payment'},
 {title:'Unsupported order reference',body:'We will check ORD-999 against the records.',key:'unverified-reference'},
 {title:'Completed bank change claim',body:'Your bank account has been updated.',key:'bank-change'},
 {title:'Guaranteed delivery claim',body:'We guarantee delivery tomorrow.',key:'delivery-guaranteed'},
 {title:'Noncommittal follow-up',body:'We will check INV-123 in the source system.',key:null}
];
for(const t of cases){
 const report=auditClaims(draft(t.body),sample);
 const keys=report.flagged.map(f=>f.key);
 if(t.key)assert.ok(keys.includes(t.key),t.title);
 else assert.deepEqual(keys,[],t.title);
 assert.equal(report.approvedForSending,false);
 assert.equal(report.verifiedBySystem,false);
 assert.equal(report.needsHumanReview,true);
}
assert.equal(assessDraft(draft('We will review the records before replying.')).flagged.length,0);
assert.equal(assessDraft('Quick reply').flagged.length,3);
console.log('Conservative claim quality checks passed; no model calls or outbound actions.');
