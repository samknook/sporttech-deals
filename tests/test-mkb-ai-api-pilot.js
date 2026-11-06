/* Execute: node tests/test-mkb-ai-api-pilot.js */
'use strict';
const assert=require('node:assert/strict');
const adapter=require('../ventures/mkb-ai-studio/api-pilot/inbox-adapter.cjs');
const sample=require('../ventures/mkb-ai-studio/api-pilot/synthetic-sample.json');
(async()=>{
 let requests=0;
 const blockedFetch=async()=>{requests++;throw Error('Should never be called in dry-run')};
 const dry=await adapter.run({sample,fetchImpl:blockedFetch});
 assert.equal(dry.mode,'dry-run');assert.equal(dry.sent,false);assert.equal(dry.reviewRequired,true);
 assert.equal(requests,0);
 const req=adapter.buildRequest(sample,'gpt-6-luna');
 assert.equal(req.payload.store,false);
 assert.equal(req.payload.tools,undefined);
 assert.equal(req.payload.max_output_tokens,550);
 assert.equal(req.payload.input[0].role,'user');
 assert.doesNotMatch(req.payload.instructions,/INV-218/);
 assert.throws(()=>adapter.validateSample({...sample,message:''}));
 assert.throws(()=>adapter.validateSample({...sample,approvedFacts:Array(9).fill({source:'x',fact:'y'})}));
 assert.throws(()=>adapter.buildRequest(sample,'invalid model id'));
 await assert.rejects(adapter.run({sample,mode:'live',apiKey:'unused',model:'gpt-6-luna',fetchImpl:blockedFetch}),/approve/);
 await assert.rejects(adapter.run({sample,mode:'live',approvedData:true,model:'gpt-6-luna',fetchImpl:blockedFetch}),/API key/);
 assert.equal(requests,0);
 const fake=async(url,options)=>{
  requests++;
  assert.equal(url,'https://api.openai.com/v1/responses');
  assert.equal(options.method,'POST');
  const body=JSON.parse(options.body);
  assert.equal(body.store,false);
  assert.equal(body.tools,undefined);
  assert.match(options.headers.Authorization,/Bearer /);
  return {ok:true,status:200,json:async()=>({status:'completed',output:[{type:'message',content:[{type:'output_text',text:'CATEGORY: invoice\nDRAFT: Thank you\nHUMAN CHECKS: Verify'}]}]})};
 };
 const result=await adapter.run({sample,mode:'live',approvedData:true,apiKey:'synthetic_test_key',model:'gpt-6-luna',fetchImpl:fake});
 assert.equal(result.sent,false);
 assert.equal(result.reviewRequired,true);
 assert.match(result.text,/HUMAN CHECKS/);
 assert.equal(result.quality.approvedForSending,false);
 assert.equal(result.quality.needsHumanReview,true);
 assert.equal(result.quality.flagged.length,1); // short test draft; still not accepted automatically
 const strong=adapter.assessDraft('CATEGORY: invoice\nDRAFT: We will verify the payment using our accounting source.\nHUMAN CHECKS: Review invoice, bank transfer and identity.');
 assert.equal(strong.flagged.length,0);
 assert.equal(strong.approvedForSending,false);
 assert.ok(adapter.assessDraft('Bad output').flagged.length>0);
 assert.equal(requests,1);
 await assert.rejects(adapter.run({sample,mode:'live',approvedData:true,apiKey:'synthetic_test_key',model:'gpt-6-luna',fetchImpl:async()=>({ok:false,status:429})}),/429/);
 assert.throws(()=>adapter.outputText({status:'incomplete',output:[]}));
 console.log('MKB AI Studio API pilot adapter tests passed. No real API call.');
})().catch(err=>{console.error(err);process.exitCode=1});
