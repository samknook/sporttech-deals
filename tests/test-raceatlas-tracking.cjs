'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('docs/raceatlas/tracking.js','utf8');
const sent=[];
let clickHandler;
const context={
 window:{},
 document:{addEventListener:(name,fn)=>{if(name==='click')clickHandler=fn}},
 navigator:{sendBeacon:(url,blob)=>{sent.push({url,blob});return true}},
 Blob,
 fetch:async()=>({ok:true})
};
vm.runInNewContext(source,context,{filename:'tracking.js'});
assert.equal(context.window.RaceAtlasTracking.enabled(),true);
assert.equal(context.window.RaceAtlasTracking.track('ra-0','organizer'),true);
assert.equal(context.window.RaceAtlasTracking.track('ra-82345678','promotion'),true,'Auto-events must be trackable');
assert.equal(context.window.RaceAtlasTracking.track('ra-0','invalid'),false);
assert.equal(context.window.RaceAtlasTracking.track('customer@example.com','organizer'),false);
assert.equal(context.window.RaceAtlasTracking.track('ra-0','source'),true);
assert.equal(sent.length,3);
assert.ok(sent.every(r=>r.url==='https://lpzndnxloykcthbsqcet.supabase.co/functions/v1/raceatlas-track-outbound'));
assert.equal(typeof clickHandler,'function');
clickHandler({target:{closest:()=>({dataset:{raEvent:'ra-1',raOutbound:'promotion'}})}});
assert.equal(sent.length,4,'Promotion links must be counted separately');
assert.ok(!source.includes('localStorage'),'Tracking must not use stored visitor identifiers');
console.log('RaceAtlas privacy-first outbound and sponsored click tracking checks passed');
