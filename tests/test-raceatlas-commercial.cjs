'use strict';
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const script=fs.readFileSync('docs/raceatlas/campaigns.js','utf8');
const context={
 window:{},
 document:{readyState:'loading',addEventListener(){}},
 URL, Date, AbortSignal, fetch:async()=>{throw Error('Should not fetch during unit test')}
};
vm.runInNewContext(script,context,{filename:'campaigns.js'});
const {chooseCampaigns,render}=context.window.RaceAtlasCampaigns;
const races=[
 {id:'ra-0',name:'Egmond Halve Marathon',place:'Egmond',country:'Nederland',officialEventUrl:'https://example.org/egmond'},
 {id:'ra-1',name:'Midwinter Marathon',place:'Apeldoorn',country:'Nederland',officialEventUrl:'https://example.org/midwinter'}
];
const campaign={eventId:'ra-0',status:'active',start:'2026-11-01',end:'2026-12-01'};
assert.equal(chooseCampaigns({version:1,campaigns:[]},races,'2026-11-12').length,0,'No paid placements before approval');
assert.equal(chooseCampaigns({version:1,campaigns:[campaign]},races,'2026-11-12').length,1);
assert.equal(chooseCampaigns({version:1,campaigns:[campaign]},races,'2027-01-01').length,0,'Expired sponsorships must stop');
assert.equal(chooseCampaigns({version:1,campaigns:[{...campaign,status:'lead'}]},races,'2026-11-12').length,0);
assert.equal(chooseCampaigns({version:1,campaigns:[{...campaign,eventId:'ra-999'}]},races,'2026-11-12').length,0);
assert.equal(chooseCampaigns({version:1,campaigns:[campaign,campaign]},races,'2026-11-12').length,1,'Duplicate campaigns not displayed');
assert.equal(chooseCampaigns({version:1,campaigns:[{...campaign,eventId:'ra-1'},campaign,campaign]},races,'2026-11-12').length,2,'Maximum two placements');
assert.equal(chooseCampaigns({version:1,campaigns:[campaign]},[{...races[0],officialEventUrl:'javascript:bad()'}],'2026-11-12').length,0);
let slot={hidden:false,innerHTML:'old',replaceChildren(){this.innerHTML=''}};
render([],slot);
assert.equal(slot.hidden,true,'Empty campaigns must be invisible');
context.document.documentElement={lang:'nl'};
render(chooseCampaigns({version:1,campaigns:[campaign]},races,'2026-11-12'),slot);
assert.equal(slot.hidden,false);
assert.ok(slot.innerHTML.includes('Gesponsord · Betaalde plaatsing'));
assert.ok(slot.innerHTML.includes('data-ra-outbound="promotion"'));
assert.ok(slot.innerHTML.includes('https://example.org/egmond'));
assert.ok(!slot.innerHTML.includes('€'),'Do not publicly show organizer pricing');
context.document.documentElement.lang='en';
render(chooseCampaigns({version:1,campaigns:[campaign]},races,'2026-11-12'),slot);
assert.ok(slot.innerHTML.includes('Sponsored · Paid placement'));
console.log('RaceAtlas sponsored placements: all safety and localization checks passed');
