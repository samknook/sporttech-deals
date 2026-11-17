#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const source=fs.readFileSync('docs/raceatlas/account.js','utf8');
const start=source.indexOf('async function setSeasonStatus(eventId,statusValue){');
const end=source.indexOf('// Dashboard and account settings',start);
assert.ok(start>=0&&end>start,'Account status handler not found');
function setup(response,{deferred=false}={}){
 let requests=0,resolveRequest=null;const synced=[],statuses=[];
 const state={user:{id:'user1'},mode:'cloud',authVersion:1,cloudEvents:[{event_id:'ra-42',season_status:'interested'}],statusWrites:new Set(),
 client:{from:()=>({update:()=>({eq(){return this},select(){return this},maybeSingle(){
 requests++;
 if(deferred)return new Promise(resolve=>{resolveRequest=()=>resolve(response)});
 return Promise.resolve(response)
 }})})},
 savedApi:()=>({setCloudStatus:(id,status)=>synced.push([id,status])}),
 showSignedIn:()=>{},setStatus:message=>statuses.push(message)};
 const ctx=vm.createContext(state);
 const update=vm.runInContext(source.slice(start,end)+';setSeasonStatus',ctx);
 return {update,state,synced,statuses,requests:()=>requests,resolve:()=>resolveRequest?.()};
}
(async()=>{
 const ok=setup({data:{event_id:'ra-42'},error:null});
 assert.equal(await ok.update('ra-42','registered'),true);
 assert.equal(ok.state.cloudEvents[0].season_status,'registered','Successful update should reach account state');
 assert.equal(ok.synced[0][1],'registered','Dashboard should receive successful update');
 const missing=setup({data:null,error:null});
 assert.equal(await missing.update('ra-42','completed'),false,'Zero-row update is not success');
 assert.equal(missing.state.cloudEvents[0].season_status,'interested');
 const failed=setup({data:null,error:{message:'offline'}});
 assert.equal(await failed.update('ra-42','completed'),false,'DB error must fail');
 const concurrent=setup({data:{event_id:'ra-42'},error:null},{deferred:true});
 const first=concurrent.update('ra-42','registered');
 assert.equal(await concurrent.update('ra-42','completed'),false,'Concurrent write rejected');
 assert.equal(concurrent.requests(),1,'Only one database write in flight');
 concurrent.resolve();
 assert.equal(await first,true);
 assert.equal(await concurrent.update('ra-999','registered'),false,'Unknown event cannot be updated');
 console.log('PASS: cloud status updates verify affected row, reject missing/error/concurrent/unknown writes');
})().catch(error=>{console.error(error);process.exitCode=1});
