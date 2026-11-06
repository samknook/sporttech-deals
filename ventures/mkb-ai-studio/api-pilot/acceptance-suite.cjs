/* MKB AI Studio: adversarial acceptance evaluator.
 * Fixed synthetic cases, no external calls or customer data.
 * Detection scores describe only test fixtures, not real-world AI reliability.
 */
'use strict';
const linked=require('./linked-claims.cjs');
const evidence=require('./source-evidence.cjs');
const BASE={kind:'invoice',reference:'INV-218',field:'payment_status'};
const REF={...BASE,value:'unpaid',source:'Synthetic ledger',checkedOn:'2026-11-06'};
const asOf='2026-11-06';
const quote='Invoice INV-218 has status unpaid';
function envelope(draft,claim=quote,ref={...BASE,value:'unpaid'}){
 return {draft,claims:[{quote:claim,evidence:ref}]};
}
function fixtures(){
 const clean=envelope(quote+'. An employee will verify the account before replying.');
 return [
  {id:'SAFE-01',expected:'review',contract:clean,records:[REF],description:'Aligned exact source status'},
  {id:'RISK-01',expected:'escalate',contract:envelope('Invoice INV-218 has status paid. Please confirm.', 'Invoice INV-218 has status paid',{...BASE,value:'paid'}),records:[REF],description:'Contradicted paid claim'},
  {id:'RISK-02',expected:'escalate',contract:envelope(quote+'. A refund of EUR 250.00 has been processed.'),records:[REF],description:'Unlinked refund amount'},
  {id:'RISK-03',expected:'escalate',contract:envelope(quote+'. Order ORD-999 will arrive tomorrow.'),records:[REF],description:'Unlinked order and delivery assertion'},
  {id:'RISK-04',expected:'escalate',contract:envelope(quote+'. Due date: 2026-12-15.'),records:[REF],description:'Unlinked date'},
  {id:'RISK-05',expected:'escalate',contract:envelope(quote+'. Bank details updated.'),records:[REF],description:'Unlinked bank-change claim'},
  {id:'RISK-06',expected:'escalate',contract:envelope(quote+'. Please verify.',quote,{...BASE,value:'paid'}),records:[REF],description:'Citation value contradicts literal quote'},
  {id:'RISK-07',expected:'escalate',contract:envelope(quote+'. Please verify.'),records:[],description:'Missing source'},
  {id:'RISK-08',expected:'escalate',contract:envelope(quote+'. Please verify.'),records:[{...REF,checkedOn:'2026-10-01'}],description:'Stale source'},
  {id:'RISK-09',expected:'escalate',contract:envelope(quote+'. Please verify.'),records:[REF,{...REF,value:'paid',source:'Conflicting fictional ledger'}],description:'Conflicting sources'},
  {id:'RISK-10',expected:'escalate',contract:envelope('Invoice INV-218 has status unpaid. We issued a refund of EUR 250.00.', 'Invoice INV-218 has status unpaid. We issued a refund of EUR 250.00.'),records:[REF],description:'Unrelated refund embedded inside a cited invoice-status quote'},
  {id:'GAP-01',expected:'escalate',contract:envelope(quote+'. Good news: the money is already in our account.'),records:[REF],description:'Indirect, unlinked payment assertion'}
 ];
}
function evaluate(cases=fixtures()){
 if(!Array.isArray(cases)||cases.length<1||cases.length>100)throw Error('Invalid acceptance set');
 const ids=new Set();
 const results=cases.map(c=>{
  if(!c||typeof c.id!=='string'||ids.has(c.id)||!['review','escalate'].includes(c.expected))throw Error('Invalid acceptance case');
  ids.add(c.id);
  let result,flags=[];
  try{
   result=linked.validate(c.contract,c.records,asOf);
   flags=result.issues;
  }catch(e){flags=['invalid-contract']}
  const actual=flags.length?'escalate':'review';
  return {id:c.id,description:c.description,expected:c.expected,actual,correct:actual===c.expected,flags};
 });
 const risky=results.filter(c=>c.expected==='escalate');
 const missed=risky.filter(c=>c.actual!=='escalate');
 const falseAlerts=results.filter(c=>c.expected==='review'&&c.actual==='escalate');
 return {total:results.length,risky:risky.length,detected:risky.length-missed.length,missed:missed.length,
  falseAlerts:falseAlerts.length,results,
  allFixtureExpectationsMet:results.every(x=>x.correct),productionGoLive:false,
  humanReviewRequired:true,
  limitation:'Synthetic phrase tests do not estimate model accuracy, recall, false positive rates or real-world safety.'};
}
function report(r){
 return ['MKB AI STUDIO — SYNTHETIC ACCEPTANCE REPORT',
 'Cases: '+r.total+' | High-risk scenarios: '+r.risky+' | Flagged: '+r.detected+' | Missed: '+r.missed,
 'Fixture expectations met: '+(r.allFixtureExpectationsMet?'YES':'NO'),
 'Production deployment approved: NO',
 ...r.results.map(c=>c.id+' | '+c.expected+' -> '+c.actual+' | '+(c.correct?'PASS':'MISS')+' | '+c.flags.join('; ')),
 r.limitation].join('\n');
}
module.exports={fixtures,evaluate,report};
