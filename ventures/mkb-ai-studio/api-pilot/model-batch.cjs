/* MKB AI Studio: draft-only model batch coordinator.
 * Defaults to NO NETWORK. Live mode must be explicitly authorized externally.
 * No mail sending, ledger writes, persistence or customer integrations.
 */
'use strict';
const adapter=require('./inbox-adapter.cjs');
const review=require('./review-pipeline.cjs');
function validateCases(items){
 if(!Array.isArray(items)||items.length<1||items.length>10)throw Error('Use 1-10 pre-approved pilot cases');
 const seen=new Set();
 return items.map(item=>{
  if(!item||!Array.isArray(item.assertions)||item.assertions.length<1||!Array.isArray(item.records)||typeof item.asOf!=='string')throw Error('Missing assertions, records or asOf');
  const sample=adapter.validateSample(item.sample);
  if(seen.has(sample.id))throw Error('Duplicate ID');seen.add(sample.id);
  return {...item,sample};
 });
}
async function processBatch({items,mode='dry-run',model,apiKey,approvedData=false,fetchImpl}){
 if(!['dry-run','live'].includes(mode))throw Error('Unknown mode');
 const valid=validateCases(items);
 if(mode==='live'&&(approvedData!==true||typeof apiKey!=='string'||!apiKey.trim()||typeof model!=='string'||!model.trim()))throw Error('Live mode needs approved data, model and API credentials');
 const results=[];
 for(const item of valid){
  let response;
  try{
   response=await adapter.run({sample:item.sample,mode,model,apiKey,approvedData,fetchImpl});
   if(mode==='dry-run'){
    results.push({id:item.sample.id,status:'not-executed',reason:'No API call in dry-run mode',reviewRequired:true,sent:false});
    continue;
   }
   const assessment=review.prepare({...item,draft:response.text});
   results.push({id:item.sample.id,status:assessment.problems.length?'needs-escalation':'needs-human-review',
    assessment,quality:response.quality,claimWarnings:response.claims,reviewRequired:true,sent:false});
  }catch(e){
   // Do not expose provider response body, credentials or source record content.
   results.push({id:item.sample.id,status:'processing-error',reason:'Provider or validation failure; inspect private operator logs',
    reviewRequired:true,sent:false});
   if(mode==='live')break; // fail closed; do not continue through a potentially failing provider
  }
 }
 const summary={
  requested:valid.length,processed:results.length,
  drafts:results.filter(r=>r.assessment).length,
  escalations:results.filter(r=>r.status==='needs-escalation').length,
  errors:results.filter(r=>r.status==='processing-error').length,
  notExecuted:results.filter(r=>r.status==='not-executed').length,
  stoppedEarly:results.length<valid.length,
  outboundSent:0,goLiveApproved:false
 };
 return {mode,results,summary,requiresHumanReview:true,sendEnabled:false};
}
module.exports={validateCases,processBatch};
