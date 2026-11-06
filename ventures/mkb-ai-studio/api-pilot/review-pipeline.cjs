/* MKB AI Studio — offline approval workflow for synthetic pilot cases.
 * Not an API integration. Drafts and assertions are supplied independently.
 * No persistence, sending, payment or accounting changes.
 */
'use strict';
const {validateSample,assessDraft,auditClaims}=require('./inbox-adapter.cjs');
const evidence=require('./source-evidence.cjs');
function prepare({sample,draft,assertions,records,asOf}){
 const safe=validateSample(sample);
 if(!Array.isArray(assertions)||!Array.isArray(records)||typeof draft!=='string')throw Error('Invalid case payload');
 if(assertions.length<1)throw Error('At least one structured assertion is required for this pilot');
 const structure=assessDraft(draft);
 const warnings=auditClaims(draft,safe);
 const comparison=evidence.batch(assertions,records,asOf,{maxAgeDays:7});
 const problems=[
 ...structure.flagged.map(k=>'format:'+k),
 ...warnings.flagged.map(x=>'claim:'+x.key),
 ...comparison.results.filter(x=>x.status!=='matched').map(x=>'evidence:'+x.status)
 ];
 return {id:safe.id,draft,structure,warnings,comparison,problems,
  state:'pending-review',approval:null,reviewRequired:true,sendEnabled:false,
  note:'Structured assertions are provided independently, not extracted or verified by an AI. Matching provided records does not establish real-world accuracy.'};
}
function review(caseResult,{decision,reviewer,reason='',sourceVerified=false}){
 if(!caseResult||caseResult.state!=='pending-review')throw Error('Case is not pending review');
 if(typeof reviewer!=='string'||!reviewer.trim()||reviewer.length>60)throw Error('Reviewer identity required');
 if(decision!=='approve-draft'&&decision!=='escalate')throw Error('Unsupported decision');
 if(typeof reason!=='string'||reason.length>300)throw Error('Invalid review reason');
 if(decision==='approve-draft'){
  if(caseResult.problems.length)throw Error('Unresolved warnings must be escalated');
  if(sourceVerified!==true)throw Error('Human must verify source authenticity and currency');
 }
 if(decision==='escalate'&&!reason.trim())throw Error('Escalation reason required');
 return {...caseResult,state:decision==='approve-draft'?'reviewed-draft':'escalated',
  approval:{reviewer:reviewer.trim(),decision,reason:reason.trim(),sourceVerified:sourceVerified===true},
  reviewRequired:true,sendEnabled:false};
}
function summary(c){
 if(!c||!Array.isArray(c.problems))throw Error('Invalid case');
 return {id:c.id,state:c.state,issues:c.problems.slice(),sources:c.comparison.results.map(x=>({status:x.status,sourceLabels:x.sourceLabels})),
  sent:false,approvedForSending:false};
}
module.exports={prepare,review,summary};
