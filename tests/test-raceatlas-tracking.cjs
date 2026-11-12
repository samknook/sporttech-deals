'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('docs/raceatlas/tracking.js','utf8');
const sent=[];
const listeners={};
const tracked=[];
class FakeIntersectionObserver {
 constructor(cb,config){this.cb=cb;this.config=config;FakeIntersectionObserver.last=this;}
 observe(card){tracked.push(card)}
 unobserve(){}
 fire(target,ratio=0.5){this.cb([{target,isIntersecting:ratio>0,intersectionRatio:ratio}]);}
}
const cards=[{dataset:{raEvent:'ra-0'}},{dataset:{raEvent:'ra-81234567'}}];
const modal={dataset:{raEvent:'ra-1'}};
const context={
 window:{},
 document:{
   readyState:'loading',visibilityState:'visible',
   addEventListener:(type,fn)=>{listeners[type]=fn},
   getElementById:id=>id==='raceatlasDetails'?modal:null,
   querySelectorAll:()=>cards
 },
 location:{hostname:'samknook.github.io'},
 navigator:{sendBeacon:(url,blob)=>{sent.push({url,blob});return true}},
 IntersectionObserver:FakeIntersectionObserver,
 Blob,fetch:async()=>({ok:true})
};
vm.runInNewContext(source,context,{filename:'tracking.js'});
assert.equal(context.window.RaceAtlasTracking.enabled(),true);
assert.equal(sent.length,0,'Pageview waits for page readiness');
listeners.DOMContentLoaded();
assert.equal(sent.length,2,'Records one site view and a deep-linked detail view');
assert.equal(sent[0].blob.size>0,true);
assert.ok(sent.every(x=>x.url==='https://lpzndnxloykcthbsqcet.supabase.co/functions/v1/raceatlas-track-outbound'));
assert.equal(context.window.RaceAtlasTracking.siteView(),undefined);
assert.equal(sent.length,2,'No duplicate site view');
const io=FakeIntersectionObserver.last;
assert.equal(tracked.length,2,'Only visible cards are observed, not all catalog events');
io.fire(cards[0],0.1);
assert.equal(sent.length,2,'Partially clipped card is not an impression');
io.fire(cards[0],0.5);
assert.equal(sent.length,3,'Visible card counted');
io.fire(cards[0],0.75);
assert.equal(sent.length,3,'Same card counted once per page');
io.fire(cards[1],0.5);
assert.equal(sent.length,4,'Auto-discovered event impression counted');
assert.equal(context.window.RaceAtlasTracking.detailView('ra-0'),true);
assert.equal(sent.length,5,'Opening a detail dialog is a new interaction');
listeners.click({target:{closest:()=>({dataset:{raEvent:'ra-1',raOutbound:'promotion'}})}});
assert.equal(sent.length,6,'Outbound campaign clicks counted separately');
assert.equal(context.window.RaceAtlasTracking.track('ra-1','registration'),true);
assert.equal(context.window.RaceAtlasTracking.track('ra-1','organizer'),true);
assert.equal(context.window.RaceAtlasTracking.track('ra-1','source'),true);
assert.equal(context.window.RaceAtlasTracking.track('ra-1','invalid'),false);
assert.equal(context.window.RaceAtlasTracking.track('email@example.com','detail_view'),false);
assert.equal(context.window.RaceAtlasTracking.track('ra-site','card_view'),false);
assert.equal(context.window.RaceAtlasTracking.track('ra-1','site_view'),false);
assert.equal(context.window.RaceAtlasTracking.track('ra-site','site_view'),true);
assert.ok(!source.includes('localStorage'),'No persistent visitor identifiers or cookies');
context.location.hostname='trizentro.com';
assert.equal(context.window.RaceAtlasTracking.enabled(),true,'Custom apex domain must track');
context.location.hostname='www.trizentro.com';
assert.equal(context.window.RaceAtlasTracking.enabled(),true,'WWW domain must track');
context.location.hostname='localhost';
assert.equal(context.window.RaceAtlasTracking.enabled(),false,'Local testing must not inflate production traffic');
assert.equal(context.window.RaceAtlasTracking.track('ra-2','detail_view'),false);
console.log('RaceAtlas aggregate site, visible-card, detail and outbound tracking tests passed');
