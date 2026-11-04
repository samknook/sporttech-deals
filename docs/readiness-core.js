/* TriZentro readiness planning self-check. No medical or physical readiness scoring. */
(function(root){
'use strict';
const statuses=['done','progress','not',''];
function summarize(records){
  if(!Array.isArray(records)||records.length!==12)throw Error('Expected twelve checks.');
  if(records.some(r=>!r||!statuses.includes(r.status)||typeof r.topic!=='string'||typeof r.action!=='string'))throw Error('Invalid check data.');
  const done=records.filter(r=>r.status==='done').length;
  const unanswered=records.filter(r=>!r.status).length;
  const pending=records.filter(r=>r.status==='not'||r.status==='progress');
  let summary;
  if(unanswered) summary='Keep going: '+unanswered+' planning items have not been answered.';
  else if(!pending.length)summary='All planning steps have been marked done. This does not indicate medical or physical race readiness.';
  else summary=pending.length+' planning tasks still need attention. Prioritize official safety and check-in requirements.';
  return {total:records.length,done,unanswered,pending,summary};
}
function exportText(records,result){
  return [
    'TRIZENTRO - 70.3 READINESS ACTION LIST',
    'Planning self-check, not a fitness, safety or medical assessment.',
    '',
    result.done+' of '+result.total+' marked done',
    result.summary,
    '',
    'ALL CHECKS',
    ...records.map(r=>'['+(r.status==='done'?'x':' ')+'] '+r.topic+' - '+(r.status||'unanswered')),
    '',
    'NEXT STEPS',
    ...result.pending.map(r=>'- '+r.topic+': '+r.action+' (TriZentro resource: '+r.url+')'),
    '',
    'Consult the event organizer for current mandatory rules, cutoffs and instructions.'
  ].join('\n');
}
const api={summarize,exportText};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.TriZentroReadiness=api;
})(typeof window!=='undefined'?window:globalThis);
