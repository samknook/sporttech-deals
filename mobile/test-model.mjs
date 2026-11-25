import test from 'node:test';import assert from 'node:assert/strict';import {publicRace,selectRaces,toggleRace,makeCatalogue,validateCatalogue} from './model.mjs';
const raw={id:'ra-219',name:'RBR Almere 2027',place:'Almere',country:'Nederland',sport:'Triatlon',officialEventUrl:'https://rbr-almere.nl/',date:'2027-04-18',dateEvidence:'official'};
test('public data only, correct canonical route',()=>{const e=publicRace({...raw,registrationUrl:'https://example.com',email:'private@example.com'});assert.equal(e.detail,'https://trizentro.com/events/wedstrijden/rbr-almere-2027-ra-219.html');assert.equal(e.date,'2027-04-18');assert.equal(e.email,undefined);assert.equal(e.registrationUrl,undefined);assert.equal(publicRace({...raw,officialEventUrl:'http://example.com'}),null);assert.equal(publicRace({...raw,dateEvidence:'unknown'}).date,null)});
test('filters, local season, and past dates',()=>{const a=publicRace(raw),b=publicRace({...raw,id:'ra-3',name:'Hardloopwedstrijd',sport:'Hardlopen',date:'2026-01-01'});assert.deepEqual(selectRaces([a,b],{today:'2026-11-25',query:'almere',sport:'Triatlon'}),[a]);assert.deepEqual(selectRaces([a,b],{savedOnly:true,saved:['ra-3'],today:'2026-11-25'}),[b]);assert.deepEqual(toggleRace([],a.id),[a.id]);assert.deepEqual(toggleRace([a.id],a.id),[])});

test('versioned public feed rejects malformed or foreign detail URLs and duplicates',()=>{
 const feed=makeCatalogue([raw],new Date('2026-11-25T00:00:00Z'));
 // Use the real current timestamp for validation in tests running before the fixture date.
 const current=makeCatalogue([raw]);
 assert.deepEqual(validateCatalogue(current),current);
 assert.equal(validateCatalogue({...current,schemaVersion:2}),null);
 assert.equal(validateCatalogue({...current,events:[current.events[0],current.events[0]]}),null);
 assert.equal(validateCatalogue({...current,events:[{...current.events[0],detail:'https://evil.example/events/wedstrijden/rbr-almere-2027-ra-219.html'}]}),null);
 assert.equal(validateCatalogue({...current,events:[{...current.events[0],date:'2027-02-30'}]}),null);
 assert.equal(validateCatalogue({...current,events:[{...current.events[0],email:'private@example.com'}]}).events[0].email,undefined);
 assert.equal(feed.asOf,'2026-11-25');
});