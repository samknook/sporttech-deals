'use strict';
function measure(rows,hourlyCost=0){
 if(!Array.isArray(rows)||rows.length<3||rows.length>500)throw Error('Need 3-500 observations');
 if(typeof hourlyCost!=='number'||!Number.isFinite(hourlyCost)||hourlyCost<0||hourlyCost>500)throw Error('Invalid cost');
 const ids=new Set(),valid=[];
 for(const r of rows){
  if(!r||typeof r.id!=='string'||ids.has(r.id))throw Error('Duplicate or missing id');
  ids.add(r.id);
  for(const k of ['before','processing','review','rework'])if(typeof r[k]!=='number'||!Number.isFinite(r[k])||r[k]<0||r[k]>240)throw Error('Invalid task time');
  if(typeof r.comparable!=='boolean'||typeof r.correct!=='boolean')throw Error('Missing quality indicator');
  if(r.comparable)valid.push(r);
 }
 if(valid.length<3)throw Error('Insufficient comparable tasks');
 const before=valid.reduce((s,r)=>s+r.before,0);
 const after=valid.reduce((s,r)=>s+r.processing+r.review+r.rework,0);
 const exceptions=valid.filter(r=>!r.correct).length;
 return {total:rows.length,comparable:valid.length,excluded:rows.length-valid.length,
  before,after,netMinutes:before-after,netHours:(before-after)/60,
  capacityValue:(before-after)/60*hourlyCost,exceptions,
  eligibleForAssessment:exceptions===0&&before>after,
  goLive:false,verified:false,
  notice:'Operator-entered observations only. Includes human review and rework; no claim of causal proof or cash savings.'};
}
module.exports={measure};
