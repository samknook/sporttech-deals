/* Conservative literal coverage scanner for business facts in a draft.
 * Patterns are intentionally incomplete. Passing never authorizes sending.
 */
'use strict';
const PATTERNS=[
 {key:'reference',regex:/\b(?:INV|ORD)[-_ ]?\d{2,12}\b/gi},
 {key:'date',regex:/\b20\d{2}-\d{2}-\d{2}\b/g},
 {key:'amount',regex:/(?:€\s*|\bEUR\s+)\d[\d.,]*/gi},
 {key:'payment-assertion',regex:/\b(?:is paid|has been paid|was paid|is unpaid|payment received|payment confirmed|factuur is betaald|factuur is onbetaald|betaling ontvangen|betaling bevestigd|status paid|status unpaid)\b/gi},
 {key:'delivery-assertion',regex:/\b(?:delivery confirmed|will be delivered|will arrive|arrives tomorrow|guaranteed delivery|levering bevestigd|wordt morgen geleverd|levering gegarandeerd|leverdatum bevestigd)\b/gi},
 {key:'refund-assertion',regex:/\b(?:refund issued|refund processed|refund approved|refund\s+(?:of\s+)?(?:EUR\s*|€\s*)?[\d.,]+\s+has been processed|terugbetaling uitgevoerd|terugbetaling verwerkt|terugbetaling goedgekeurd)\b/gi},
 {key:'bank-change',regex:/\b(?:bank account changed|bank details updated|rekeningnummer gewijzigd|bankgegevens aangepast)\b/gi}
];
function coverage(draft,claims){
 if(typeof draft!=='string'||draft.length>5000||!Array.isArray(claims))throw Error('Invalid coverage input');
 const ranges=[];
 for(const c of claims){
  if(!c||typeof c.quote!=='string'||!c.quote)continue;
  let at=0,index=0;
  while((index=draft.indexOf(c.quote,at))!==-1){
   ranges.push([index,index+c.quote.length]);
   at=index+Math.max(1,c.quote.length);
  }
 }
 const findings=[];
 for(const {key,regex} of PATTERNS){
  for(const match of draft.matchAll(regex)){
   const start=match.index,end=start+match[0].length;
   if(!ranges.some(([from,to])=>start>=from&&end<=to)){
    findings.push({kind:key,at:start,text:match[0]});
   }
  }
 }
 findings.sort((a,b)=>a.at-b.at);
 return {findings,unlinked:findings.length,coveredCandidateSpans:ranges.length,
  complete:false,verifiedReality:false,approvedForSending:false,
  disclaimer:'Literal candidate scanner only. Facts can be omitted or disguised; full review required.'};
}
module.exports={coverage};
