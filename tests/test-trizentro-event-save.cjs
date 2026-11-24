#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const source=fs.readFileSync('docs/raceatlas/event-save.js','utf8');
async function scenario({signedIn=false,exists=false}={}){
 const operations=[],listeners={},storage=new Map();
 let stored=exists?{event_id:'ra-42',season_status:'registered'}:null;
 const button={disabled:false,textContent:'',setAttribute(){},insertAdjacentElement(){},addEventListener(type,handler){listeners[type]=handler}};
 const note={className:'',style:{},setAttribute(){},insertAdjacentElement(){},textContent:''};
 const user=signedIn?{id:'user-123'}:null;
 const chain={
   select(){return this},eq(){return this},
   async maybeSingle(){return {data:stored,error:null}},
   async upsert(row,options){operations.push({type:'upsert',row,options});if(!stored)stored={...row};return {error:null}},
   delete(){return {eq(){return {eq:async()=>{stored=null;operations.push({type:'delete'});return {error:null}}}}}}
 };
 const client={auth:{
   async getUser(){return {data:{user},error:null}},
   async getSession(){return {data:{session:user?{user}:null}}},
   onAuthStateChange(){}},
   from(name){assert.equal(name,'raceatlas_saved_events');return chain}
 };
 const window={TriZentroEventSaveId:'ra-42',
   RACEATLAS_ACCOUNT_CONFIG:{enabled:true,supabaseUrl:'https://example.supabase.co',publishableKey:'sb_publishable_test'},
   supabase:{createClient:()=>client},addEventListener(type,handler){listeners['window:'+type]=handler}};
 const document={hidden:false,getElementById(){return button},createElement(){return note},addEventListener(type,handler){listeners['document:'+type]=handler}};
 const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
 const context={window,document,localStorage,setTimeout(fn){fn()},console,Promise,Set,JSON};
 vm.runInNewContext(source,context);
 for(let n=0;n<8;n++)await Promise.resolve();
 return {operations,listeners,button,storage,click:async()=>{await listeners.click();for(let n=0;n<4;n++)await Promise.resolve()},getStored:()=>stored};
}
(async()=>{
 const guest=await scenario();
 assert.equal(guest.button.disabled,false,'Guest button should load');
 await guest.click();
 assert.equal(JSON.parse(guest.storage.get('raceatlas-saved-v2'))[0],'ra-42','Guest should save locally');
 assert.equal(guest.operations.length,0,'Guest should never write cloud');
 const newUser=await scenario({signedIn:true});
 await newUser.click();
 assert.equal(newUser.operations.length,1,'First cloud save should write');
 assert.equal(newUser.operations[0].options.ignoreDuplicates,true,'Cloud save must keep existing season status on conflict');
 assert.equal(newUser.operations[0].row.season_status,'interested','New saved races should start as interested');
 const existing=await scenario({signedIn:true,exists:true});
 assert.match(existing.button.textContent,/Bewaard/,'Already saved races should be recognized');
 await existing.click();
 assert.equal(existing.operations[0].type,'delete','Saved race should be removable');
 assert.ok(source.includes("window.addEventListener('focus'"),'Cross-tab returning should refresh saved state');
 assert.ok(source.includes("visibilitychange"),'Mobile tab visibility should refresh saved state');
 console.log('PASS: guest save, cloud insert-only save, completed/registered protection, delete and cross-tab refresh');
})().catch(error=>{console.error(error);process.exitCode=1});
