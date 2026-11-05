/* Offline reusable TriZentro event templates. No cloud sync or storage.
 * JSON export/import is deliberate; every imported template requires fresh review.
 */
(function(root){
'use strict';
const SCHEMA='trizentro.club-template',VERSION=1;
function create(values,revision,core){
 const checked=core.validate(values);
 if(typeof revision!=='string'||!/^v[0-9]{1,3}(?:\.[0-9]{1,3})?$/.test(revision))throw Error('Revision must look like v1 or v1.1.');
 return {schema:SCHEMA,version:VERSION,revision,values:checked};
}
function parse(raw,core){
 if(typeof raw!=='string'||raw.length>15000)throw Error('Template too large or invalid.');
 const obj=JSON.parse(raw);
 if(!obj||typeof obj!=='object'||Array.isArray(obj)||obj.schema!==SCHEMA||obj.version!==VERSION)throw Error('Unknown template format.');
 return create(obj.values,obj.revision,core);
}
function filename(event,revision){
 const slug=String(event||'event').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,48)||'event';
 return 'trizentro-'+slug+'-'+revision.replace(/[^a-z0-9.]/gi,'')+'.json';
}
const api={SCHEMA,VERSION,create,parse,filename};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.TriZentroClubTemplate=api;
})(typeof window!=='undefined'?window:globalThis);