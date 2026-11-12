'use strict';
const assert=require('node:assert/strict');
const {safeUrl,classify,fetchLimited,summary}=require('../scripts/raceatlas-source-health.cjs');
assert.equal(safeUrl('https://example.org/race'),'https://example.org/race');
for(const url of ['http://example.org','https://127.0.0.1/','https://localhost/','https://a.local/','https://user:pw@example.org/','https://example.org:8443/']){
 assert.equal(safeUrl(url),null,url);
}
assert.equal(classify({status:200,contentType:'text/html'}),'reachable_unverified');
assert.equal(classify({status:404}),'http_error');
assert.equal(classify({status:429}),'blocked_or_rate_limited');
assert.equal(classify({error:'network_error'}),'error');
assert.match(summary({events_scanned:2,unique_sources_checked:1,results:[{status:'reachable_unverified'},{status:'error'}]}),/Events scanned: 2/);
(async()=>{
 const fake=async()=>({
  status:200,ok:true,headers:{get:(key)=>key==='content-type'?'text/html':null},
  body:{getReader(){let once=false;return {async read(){if(once)return {done:true};once=true;return {done:false,value:Buffer.from('<h1>Race</h1>')}},async cancel(){}}}}
 });
 const result=await fetchLimited('https://example.org',fake);
 assert.equal(result.status,200);
 assert.ok(result.contentHash);
 assert.equal(result.bytes,13);
 console.log('RaceAtlas source health checks passed');
})().catch(e=>{console.error(e);process.exitCode=1});
