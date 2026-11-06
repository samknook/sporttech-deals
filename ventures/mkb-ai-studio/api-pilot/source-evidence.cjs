/* MKB AI Studio — exact-match evidence comparison for synthetic business records.
 * It does not establish authenticity of the input records or semantic truth.
 * No external calls, no outgoing actions, no customer data.
 */
'use strict';
const FIELDS={
 invoice:new Set(['payment_status','amount_due','currency']),
 order:new Set(['delivery_date','delivery_status']),
 credit:new Set(['refund_status'])
};
const STATUS={
 payment_status:new Set(['paid','unpaid','partial','unknown']),
 delivery_status:new Set(['confirmed','unconfirmed','cancelled','unknown']),
 refund_status:new Set(['issued','pending','not_issued','unknown'])
};
function plain(value,max){if(typeof value!=='string'||!value.trim()||value.length>max)throw Error('Invalid evidence field');return value.trim()}
function day(text){
 if(typeof text!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(text))throw Error('Date must be YYYY-MM-DD');
 const date=new Date(text+'T00:00:00Z');if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==text)throw Error('Invalid calendar day');
 return date;
}
function normalizeRecord(r){
 if(!r||typeof r!=='object'||Array.isArray(r))throw Error('Invalid evidence record');
 const kind=plain(r.kind,15),reference=plain(r.reference,40),field=plain(r.field,40),value=plain(r.value,80),source=plain(r.source,120);
 if(!Object.hasOwn(FIELDS,kind)||!FIELDS[kind].has(field)||!/^[A-Za-z0-9_-]{3,40}$/.test(reference))throw Error('Unsupported evidence schema');
 if(STATUS[field]&&!STATUS[field].has(value))throw Error('Invalid status value');
 if(field==='delivery_date')day(value);
 if(field==='amount_due'&&!/^\d{1,9}(?:\.\d{2})$/.test(value))throw Error('Amount must be decimal with two digits');
 if(field==='currency'&&!/^[A-Z]{3}$/.test(value))throw Error('Currency must be ISO-like 3 letters');
 day(r.checkedOn);
 return {kind,reference,field,value,source,checkedOn:r.checkedOn};
}
function compare(assertion,records,asOf){
 if(!assertion||typeof assertion!=='object')throw Error('Invalid assertion');
 if(!Array.isArray(records)||records.length>100)throw Error('Evidence set exceeds limit');
 const on=day(asOf),wanted=normalizeRecord({...assertion,source:'CLAIM',checkedOn:asOf});
 const relevant=records.map(normalizeRecord).filter(r=>r.kind===wanted.kind&&r.reference===wanted.reference&&r.field===wanted.field);
 const future=relevant.filter(r=>day(r.checkedOn)>on);
 const valid=relevant.filter(r=>day(r.checkedOn)<=on);
 const versions=[...new Set(valid.map(r=>r.value))];
 const sources=[...new Set(valid.map(r=>r.source))];
 let status='missing';
 if(future.length&&!valid.length)status='future-only';
 else if(versions.length>1)status='conflict';
 else if(valid.length&&valid.some(r=>r.value==='unknown'))status='unknown';
 else if(versions.length===1)status=versions[0]===wanted.value?'matched':'contradicted';
 return {status,assertion:{kind:wanted.kind,reference:wanted.reference,field:wanted.field,value:wanted.value},
  evidenceCount:valid.length,sourceLabels:sources,checkedThrough:asOf,
  requiresHumanReview:true,verifiedReality:false,approvedForSending:false,
  note:'Matched only means exact agreement with supplied records; it does not verify source authenticity, permissions or current truth.'};
}
function batch(assertions,records,asOf){
 if(!Array.isArray(assertions)||assertions.length>50)throw Error('Invalid assertions');
 const results=assertions.map(x=>compare(x,records,asOf));
 const unresolved=results.filter(x=>x.status!=='matched').length;
 return {results,unresolved,total:results.length,approvedForSending:false,requiresHumanReview:true};
}
const api={normalizeRecord,compare,batch};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(typeof window!=='undefined')window.MkbAiEvidence=api;
