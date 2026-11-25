#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const manifest=JSON.parse(fs.readFileSync('docs/manifest.webmanifest','utf8'));
assert.equal(manifest.display,'standalone');
assert.equal(manifest.start_url,'/events/');
assert.equal(manifest.scope,'/');
for(const size of [180,192,512]){
 const png=fs.readFileSync('docs/app-icons/icon-'+size+'.png');
 assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(png.readUInt32BE(16),size);assert.equal(png.readUInt32BE(20),size);
}
for(const route of ['events','seizoen','performance']){
 const html=fs.readFileSync('docs/'+route+'/index.html','utf8');
 assert.match(html,/rel="manifest" href="\/manifest.webmanifest"/);
 assert.match(html,/trizentro-app\.js\?v=/);
}
const handlers={};
const self={location:{origin:'https://trizentro.com'},addEventListener:(name,fn)=>handlers[name]=fn,clients:{claim:async()=>{}}};
const cache={addAll:async urls=>assert.deepEqual(Array.from(urls),['/app-offline.html','/app-icons/icon-192.png'])};
const caches={open:async()=>cache,match:async()=>({offline:true}),keys:async()=>[]};
vm.runInNewContext(fs.readFileSync('docs/trizentro-sw.js','utf8'),{self,caches,URL,fetch:async()=>{throw Error('offline')},Response});
(async()=>{
 let install;handlers.install({waitUntil:p=>install=p});await install;
 function request(url,method='GET',mode='navigate'){let reply;handlers.fetch({request:{url,method,mode},respondWith:p=>reply=p});return reply}
 assert.equal((await request('https://trizentro.com/events/')).offline,true);
 assert.equal((await request('https://trizentro.com/seizoen/')).offline,true);
 for(const url of ['https://trizentro.com/account/','https://trizentro.com/events/?code=secret','https://trizentro.com/raceatlas/organizer-dashboard.html','https://elsewhere.example/events/'])assert.equal(request(url),undefined);
 assert.equal(request('https://trizentro.com/events/','POST'),undefined);
 assert.equal(request('https://trizentro.com/events/','GET','cors'),undefined);
 console.log('PASS: installable manifest, generated app icons, public offline fallback, private routes excluded');
})().catch(e=>{console.error(e);process.exitCode=1});
