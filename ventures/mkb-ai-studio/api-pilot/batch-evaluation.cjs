/* Batch pilot orchestration; synthetic or explicitly authorized data only.
 * No network, persistence, outgoing email, or account connection.
 */
'use strict';
const pipeline=require('./review-pipeline.cjs');
function validNumber(n,upper){return typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=upper}
function evaluateBatch(items,options={}){
 if(!Array.isArray(items)||items.length<1||items.length>100)throw Error('Batch must contain 1-100 cases');
 const before=options.minutesBefore,after=options.minutesAfter,rate=options.hourlyCost;
 if(!validNumber(before,240)||!validNumber(after,240)||!validNumber(rate,500))throw Error('Invalid pilot cost assumptions');
 const identifiers=new Set(),cases=[];
 for(const item of items){
  const c=pipeline.prepare(item);
  if(identifiers.has(c.id))throw Error('Duplicate case ID');
  identifiers.add(c.id);
  cases.push(c);
 }
 const clear=cases.filter(x=>x.problems.length===0).length;
 const flagged=cases.length-clear;
 const observed=options.observed===true;
 // Scenario calculations must never be described as realized savings.
 const projectedMinutes=cases.length*(before-after);
 const metrics={
  total:cases.length,
  basicChecksClear:clear,
  flagged,
  flagRate:flagged/cases.length,
  projectedMinutes,
  projectedHours:projectedMinutes/60,
  projectedCapacityValue:projectedMinutes*rate/60,
  measurementType:observed?'operator-entered estimate; not independently verified':'scenario estimate only',
  recordedMinutes:0,
  emailsSent:0,
  goLiveApproved:false
 };
 return {cases,metrics,reviewRequired:true,sendEnabled:false};
}
function applyDecision(batch,id,decision){
 if(!batch||!Array.isArray(batch.cases)||!batch.metrics||typeof id!=='string')throw Error('Invalid batch');
 const index=batch.cases.findIndex(c=>c.id===id);
 if(index<0)throw Error('Unknown case');
 const updated=pipeline.review(batch.cases[index],decision);
 return {...batch,cases:batch.cases.map((c,i)=>i===index?updated:c),sendEnabled:false};
}
function report(batch){
 if(!batch||!batch.metrics||!Array.isArray(batch.cases))throw Error('Invalid batch');
 const m=batch.metrics;
 return [
  'MKB AI STUDIO — PILOT EVALUATION (SIMULATED / UNVERIFIED)',
  'Cases: '+m.total+' | Basic checks clear: '+m.basicChecksClear+' | Flagged: '+m.flagged,
  'Flag rate: '+(100*m.flagRate).toFixed(1)+'%',
  'Projected minutes difference: '+m.projectedMinutes.toFixed(1),
  'Projected hours difference: '+m.projectedHours.toFixed(2),
  'Projected capacity value EUR: '+m.projectedCapacityValue.toFixed(2),
  'Measurement: '+m.measurementType,
  'Observed savings independently verified: NO',
  'Outbound messages sent: 0 | Production go-live approved: NO',
  ...batch.cases.map(c=>c.id+' | '+c.state+' | '+(c.problems.join('; ')||'no heuristic warnings')),
  'This report does not establish response accuracy or realized savings. Customer sources and workload require independent checks.'
 ].join('\n');
}
module.exports={evaluateBatch,applyDecision,report};
