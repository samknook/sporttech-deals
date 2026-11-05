const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const storage=require('../docs/race-pack-storage.js');
const fixture=()=>({
 version:1,
 values:Object.fromEntries(storage.fields.map(id=>[id,id==='race-notes'?'Check start wave':id==='race-name'?'First 70.3':'30'])),
 checks:[true,false,false,true,false,true,false,true]
});
function memoryStorage(){
 const content=new Map();
 return {getItem:key=>content.has(key)?content.get(key):null,setItem:(key,value)=>content.set(key,value),removeItem:key=>content.delete(key),size:()=>content.size};
}
test('draft is only persisted when Save is explicitly called',()=>{
 const db=memoryStorage();
 assert.equal(storage.load(db),null);
 assert.equal(db.size(),0);
 const original=fixture();
 storage.save(db,original);
 assert.equal(db.size(),1);
 assert.deepEqual(storage.load(db),original);
 storage.remove(db);
 assert.equal(storage.load(db),null);
});
test('draft captures and restores editable fields and eight checklist items',()=>{
 const data=fixture();
 const nodes=new Map(storage.fields.map(id=>[id,{value:data.values[id]}]));
 const checks=data.checks.map(checked=>({checked}));
 const doc={
  getElementById:id=>nodes.get(id),
  querySelectorAll:selector=>selector==='#checklist input[type="checkbox"]'?checks:[]
 };
 const captured=storage.capture(doc);
 assert.deepEqual(captured,data);
 nodes.get('race-name').value='Changed';
 checks[0].checked=false;
 storage.apply(doc,data);
 assert.equal(nodes.get('race-name').value,'First 70.3');
 assert.equal(checks[0].checked,true);
});
test('malformed or oversized draft is refused without code execution',()=>{
 const draft=fixture();
 for(const corrupted of [
  {...draft,version:99},
  {...draft,checks:[true]},
  {...draft,values:{...draft.values,'race-notes':'A'.repeat(1501)}},
  {...draft,values:{...draft.values,'race-name':4}},
  {...draft,values:{'race-name':'Missing fields'}}
 ])assert.throws(()=>storage.validate(corrupted));
 const db=memoryStorage();
 db.setItem(storage.KEY,'{oops');
 assert.throws(()=>storage.load(db));
 db.setItem(storage.KEY,'x'.repeat(5001));
 assert.throws(()=>storage.load(db));
});
test('Race Pack UI exposes safe explicit save, load and delete controls',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../docs/race-pack-preview.html'),'utf8');
 const privacy=fs.readFileSync(path.join(__dirname,'../docs/transparantie.html'),'utf8');
 for(const id of ['save-draft','load-draft','delete-draft','draft-status'])assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(html,/src="race-pack-storage.js"/);
 assert.match(html,/draftStorage\.save\(storageRef\(\),draftStorage\.capture\(document\)\)/);
 assert.match(html,/draftStorage\.load\(storageRef\(\)\)/);
 assert.match(html,/draftStorage\.remove\(storageRef\(\)\)/);
 assert.match(privacy,/Race Pack-concepten en apparaatopslag/);
});

test('previously saved Race Pack drafts without new optional deadline still load',()=>{
 const old=fixture();
 delete old.values['transition-close'];
 const db=memoryStorage();
 db.setItem(storage.KEY,JSON.stringify(old));
 const actual=storage.load(db);
 assert.equal(actual.values['transition-close'],'');
 assert.equal(actual.values['race-name'],'First 70.3');
});

test('restoring an incompatible form never partially overwrites user inputs',()=>{
 const draft=fixture();
 const nodes=new Map(storage.fields.map(id=>[id,{value:'CURRENT'}]));
 const checks=draft.checks.map(()=>({checked:false}));
 const doc={
  getElementById:id=>nodes.get(id),
  querySelectorAll:()=>checks.slice(0,7)
 };
 assert.throws(()=>storage.apply(doc,draft),/not applied/);
 for(const el of nodes.values())assert.equal(el.value,'CURRENT');
 assert.equal(checks.every(el=>el.checked===false),true);
 const incomplete={
  getElementById:id=>id==='run'?null:nodes.get(id),
  querySelectorAll:()=>checks
 };
 assert.throws(()=>storage.apply(incomplete,draft),/not applied/);
 for(const el of nodes.values())assert.equal(el.value,'CURRENT');
});

test('voluntary tester flow exposes realistic tasks without collecting responses automatically',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../docs/tester-feedback.html'),'utf8');
 assert.match(html,/id="tester-instructions"/);
 assert.equal((html.match(/<li>/g)||[]).length,4);
 for(const href of ['70-3-readiness-check.html','race-pack-preview.html'])assert.ok(html.includes('href="'+href+'"'));
 assert.match(html,/No account or purchase required/);
 assert.match(html,/id="email-feedback"/);
});
