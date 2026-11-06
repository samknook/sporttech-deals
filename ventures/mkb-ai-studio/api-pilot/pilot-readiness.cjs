/* MKB AI Studio — fail-closed commercial pilot release gate.
 * Evaluates explicitly documented evidence, never guesses missing readiness.
 * No accounts, live tests, or payments are activated by this module.
 */
'use strict';
const REQUIREMENTS=Object.freeze([
 {id:'registered-business',label:'Registration, invoicing and business identity',owner:'founder'},
 {id:'signed-scope',label:'Signed customer scope and commercial agreement',owner:'founder'},
 {id:'privacy-agreement',label:'Approved data-processing and confidentiality terms',owner:'customer-and-founder'},
 {id:'customer-tenant',label:'Customer-owned authorized AI tenant and licenses',owner:'customer'},
 {id:'source-access',label:'Verified source permissions and minimum necessary access',owner:'customer'},
 {id:'reviewer-auth',label:'Authenticated reviewers and documented roles',owner:'implementation'},
 {id:'audit-trail',label:'Immutable review and approval audit trail',owner:'implementation'},
 {id:'retention-policy',label:'Approved data deletion, retention and backups',owner:'customer-and-founder'},
 {id:'incident-plan',label:'Incident escalation, rollback and support owner',owner:'implementation'},
 {id:'model-evaluation',label:'Representative model-output evaluation on approved data',owner:'implementation'},
 {id:'quality-acceptance',label:'Customer-accepted quality and exception thresholds',owner:'customer'},
 {id:'measured-benefit',label:'Measured total handling time including review and rework',owner:'customer'},
 {id:'human-approval',label:'Enforced human approval and no unattended external action',owner:'implementation'}
]);
const VALUES=new Set(['pending','verified','failed']);
function assess(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Invalid readiness evidence');
 const unknown=Object.keys(input).filter(id=>!REQUIREMENTS.some(r=>r.id===id));
 if(unknown.length)throw Error('Unknown readiness item');
 const checks=REQUIREMENTS.map(r=>{
  const data=input[r.id];
  if(data===undefined)return {...r,status:'pending',evidence:null};
  if(!data||typeof data!=='object'||Array.isArray(data)||!VALUES.has(data.status))throw Error('Invalid status');
  if(data.status==='verified'&&(typeof data.reference!=='string'||!data.reference.trim()||data.reference.length>200))throw Error('Verified items require a bounded evidence reference');
  const reference=typeof data.reference==='string'?data.reference.trim().slice(0,200):null;
  return {...r,status:data.status,evidence:reference};
 });
 const verified=checks.filter(r=>r.status==='verified').length;
 const failed=checks.filter(r=>r.status==='failed').length;
 const pending=checks.length-verified-failed;
 const complete=pending===0&&failed===0;
 return {checks,total:checks.length,verified,failed,pending,
  allEvidenceDeclared:complete,
  releaseCandidate:complete,
  productionAuthorized:false,
  note:'Completeness of user-supplied evidence references does not verify authenticity, security, compliance or actual deployment approval.'};
}
function report(a){
 if(!a||!Array.isArray(a.checks))throw Error('Invalid readiness result');
 return ['MKB AI STUDIO — CUSTOMER PILOT READINESS',
  'Verified (operator claimed): '+a.verified+'/'+a.total,
  'Pending: '+a.pending+' | Failed: '+a.failed,
  'Release candidate on paper: '+(a.releaseCandidate?'YES — requires independent sign-off':'NO'),
  'Production authorized by this tool: NEVER',
  ...a.checks.map(r=>r.id+' | '+r.status+' | '+r.owner+' | '+(r.evidence||'no evidence')),
  a.note].join('\n');
}
module.exports={REQUIREMENTS,assess,report};
