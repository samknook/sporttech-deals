/* Fail-closed linked claim contract for a draft and separately supplied evidence.
 * This is a structural assertion test, not semantic proof or source authentication.
 */
'use strict';
const evidence=require('./source-evidence.cjs');
const {coverage}=require('./claim-coverage.cjs');
const allowed=new Set(['invoice','order','credit']);
function validate(contract,records,asOf){
 if(!contract||typeof contract!=='object'||Array.isArray(contract))throw Error('Contract object required');
 if(typeof contract.draft!=='string'||contract.draft.length<20||contract.draft.length>5000)throw Error('Invalid draft');
 if(!Array.isArray(contract.claims)||contract.claims.length<1||contract.claims.length>20)throw Error('At least one linked claim required');
 if(!Array.isArray(records))throw Error('Evidence records required');
 const evidenceResults=[],issues=[],seen=new Set();
 for(let i=0;i<contract.claims.length;i++){
  const c=contract.claims[i];
  if(!c||typeof c!=='object'||typeof c.quote!=='string'||c.quote.trim().length<8||c.quote.length>300)throw Error('Invalid claim quote');
  if(!contract.draft.includes(c.quote))issues.push('claim-'+i+':quote-not-in-draft');
  const ref=c.evidence;
  if(!ref||typeof ref!=='object'||!allowed.has(ref.kind))throw Error('Invalid structured evidence reference');
  const tokens=c.quote.toLowerCase().split(/[^a-z0-9_-]+/).filter(Boolean);
  if(!tokens.includes(String(ref.reference).toLowerCase()))issues.push('claim-'+i+':reference-not-in-quote');
  if(!tokens.includes(String(ref.value).toLowerCase()))issues.push('claim-'+i+':value-not-in-quote');
  // A cited span may itself contain unrelated factual claims. No blanket citation of entire paragraphs.
  const indicators=coverage(c.quote,[]).findings;
  if(c.quote.length>180)issues.push('claim-'+i+':citation-too-broad');
  for(const indicator of indicators){
   const kind=indicator.kind;
   if(kind==='reference'&&indicator.text.toUpperCase()!==String(ref.reference).toUpperCase())issues.push('claim-'+i+':unrelated-reference');
   if(kind==='amount'&&ref.field!=='amount_due')issues.push('claim-'+i+':unrelated-amount');
   if(kind==='date'&&ref.field!=='delivery_date')issues.push('claim-'+i+':unrelated-date');
   if(kind==='refund-assertion'&&ref.field!=='refund_status')issues.push('claim-'+i+':unrelated-refund');
   if(kind==='delivery-assertion'&&!String(ref.field).startsWith('delivery_'))issues.push('claim-'+i+':unrelated-delivery');
   if(kind==='bank-change')issues.push('claim-'+i+':bank-change-needs-separate-review');
  }
  const key=[ref.kind,ref.reference,ref.field,ref.value].join('|');
  if(seen.has(key))issues.push('claim-'+i+':duplicate');
  seen.add(key);
  const compared=evidence.compare(ref,records,asOf,{maxAgeDays:7});
  evidenceResults.push({...compared,claimIndex:i,quote:c.quote});
  if(compared.status!=='matched')issues.push('claim-'+i+':'+compared.status);
 }
 const spanAudit=coverage(contract.draft,contract.claims);
 for(const finding of spanAudit.findings)issues.push('unlinked:'+finding.kind);
 // This checks only visible candidate spans; no semantic completeness guarantee.
 return {issues,claimCount:contract.claims.length,evidenceResults,spanAudit,requiresHumanReview:true,
  claimsComplete:false,verifiedReality:false,approvedForSending:false,
  note:'All quoted claims are checked structurally; unlisted factual statements may still be present.'};
}
function parse(text){
 if(typeof text!=='string'||text.length>14000||!text.trim())throw Error('Invalid model output');
 let value;
 try{value=JSON.parse(text)}catch(e){throw Error('Expected a single valid JSON response')};
 if(!value||typeof value!=='object'||Array.isArray(value)||typeof value.draft!=='string'||!Array.isArray(value.claims))throw Error('Invalid response contract');
 return value;
}
module.exports={validate,parse};
