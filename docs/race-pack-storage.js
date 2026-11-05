/* Local draft storage for the TriZentro 70.3 prototype.
 * An athlete opts in by pressing Save. Nothing autosaves or reaches a server.
 * Browser-local storage is readable by users of the same browser profile.
 */
(function(root){
'use strict';
const KEY='trizentro.racePackDraft.v1';
const VERSION=1;
const fieldRules={
 'race-name':{type:'text',max:90},'race-date':{type:'text',max:10},
 start:{type:'text',max:5},target:{type:'text',max:8},swim:{type:'text',max:8},
 bike:{type:'text',max:15},run:{type:'text',max:8},
 t1:{type:'text',max:15},t2:{type:'text',max:15},
 'transition-close':{type:'text',max:5},
 travel:{type:'text',max:8},parking:{type:'text',max:8},
 setup:{type:'text',max:8},warmup:{type:'text',max:8},buffer:{type:'text',max:8},
 'race-notes':{type:'text',max:1500},
 'shock-swim':{type:'text',max:3},'shock-bike':{type:'text',max:3},
 'shock-transition':{type:'text',max:2},'shock-run':{type:'text',max:3},
 'plan-weather':{type:'text',max:350},'plan-mechanical':{type:'text',max:350},'plan-nutrition':{type:'text',max:350}
};
const fields=Object.keys(fieldRules);
function validate(data){
 if(!data||typeof data!=='object'||Array.isArray(data)||data.version!==VERSION)throw Error('Unsupported race pack draft.');
 if(!data.values||typeof data.values!=='object'||Array.isArray(data.values))throw Error('Invalid race pack draft.');
 const values={};
 for(const id of fields){
  const defaults={'transition-close':'','shock-swim':'2','shock-bike':'6','shock-transition':'2','shock-run':'4',
    'plan-weather':'','plan-mechanical':'','plan-nutrition':''};
  const value=data.values[id]===undefined&&Object.prototype.hasOwnProperty.call(defaults,id)?defaults[id]:data.values[id];
  if(typeof value!=='string'||value.length>fieldRules[id].max)throw Error('Invalid draft field: '+id);
  values[id]=value;
 }
 if(!Array.isArray(data.checks)||data.checks.length!==8||data.checks.some(x=>typeof x!=='boolean'))throw Error('Invalid race-week checklist.');
 return {version:VERSION,values,checks:data.checks.slice()};
}
function capture(doc){
 const values={};
 for(const id of fields){
  const el=doc.getElementById(id);
  if(!el)throw Error('Missing race pack field: '+id);
  values[id]=el.value;
 }
 const checks=[...doc.querySelectorAll('#checklist input[type="checkbox"]')].map(el=>!!el.checked);
 return validate({version:VERSION,values,checks});
}
function apply(doc,draft){
 const data=validate(draft);
 // Check the complete form BEFORE changing a single field. If the UI
 // has changed or a field is missing, never partially overwrite a plan.
 const elements=fields.map(id=>doc.getElementById(id));
 const inputs=[...doc.querySelectorAll('#checklist input[type="checkbox"]')];
 if(elements.some(el=>!el||typeof el.value!=='string')||inputs.length!==data.checks.length){
  throw Error('Race pack form changed; saved data was not applied.');
 }
 fields.forEach((id,i)=>{elements[i].value=data.values[id]});
 inputs.forEach((el,i)=>{el.checked=data.checks[i]});
 return data;
}
function save(storage,data){
 if(!storage)throw Error('Local storage is unavailable.');
 const clean=validate(data);
 storage.setItem(KEY,JSON.stringify(clean));
 return clean;
}
function load(storage){
 if(!storage)throw Error('Local storage is unavailable.');
 const raw=storage.getItem(KEY);
 if(raw===null)return null;
 if(raw.length>5000)throw Error('Saved draft is unexpectedly large.');
 return validate(JSON.parse(raw));
}
function remove(storage){
 if(!storage)throw Error('Local storage is unavailable.');
 storage.removeItem(KEY);
}
const api={KEY,VERSION,fields,capture,apply,save,load,remove,validate};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.TriZentroRacePackStorage=api;
})(typeof window!=='undefined'?window:globalThis);
