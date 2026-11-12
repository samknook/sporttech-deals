'use strict';
const assert=require('node:assert/strict');
const {safeUrl,htmlEvents,links,eventDate,parseEvent,choose,discover}=require('../scripts/raceatlas-official-discovery.cjs');
const src={url:'https://events.example.org/calendar/',sport:'Hardlopen',country:'Nederland',discover:true};
const today='2026-11-12';
const first={
 '@context':'https://schema.org','@type':'SportsEvent',
 name:'Bergen Trail Challenge',startDate:'2027-04-18',
 url:'https://events.example.org/events/bergen-trail',
 location:{'@type':'Place',name:'Sportpark',address:{'@type':'PostalAddress',addressLocality:'Bergen',addressCountry:'NL'}}
};
const html='<html><head><script type="application/ld+json">'+JSON.stringify(first)+'</script></head><body><a href="/events/bergen-trail">Trail</a></body></html>';
assert.equal(safeUrl('https://events.example.org/hello','events.example.org'),'https://events.example.org/hello');
assert.equal(safeUrl('http://events.example.org/hello','events.example.org'),null);
assert.equal(safeUrl('https://other.example.org/hello','events.example.org'),null);
assert.equal(safeUrl('https://127.0.0.1/hello','127.0.0.1'),null);
assert.equal(htmlEvents(html).length,1);
assert.equal(links(html,'https://events.example.org/calendar/','events.example.org').length,1);
assert.equal(eventDate('2027-04-18',today),'2027-04-18');
assert.equal(eventDate('2027-02-30',today),null);
assert.equal(eventDate('2026-03-01',today),null);
const race=parseEvent(first,src.url,src,today);
assert.equal(race.date,'2027-04-18');
assert.equal(race.place,'Bergen');
assert.equal(race.sport,'Hardlopen');
assert.match(race.id,/^ra-8\d{7}$/);
const firstSelection=choose([race],[],{},today);
assert.equal(firstSelection.newEvents.length,1);
assert.equal(firstSelection.data.events.length,1);
assert.equal(choose([race],[],firstSelection.data,today).newEvents.length,0,'No duplicate event on subsequent scan');
const established={id:'ra-42',name:'Bergen Trail Challenge',date:'2027-04-10',place:'Bergen',
 officialEventUrl:'https://events.example.org/events/bergen-trail'};
const existingUpdate=choose([race],[established],{},today);
assert.equal(existingUpdate.changed.length,1,'Exact organizer URL and year allow updating a known race date');
assert.equal(existingUpdate.newEvents.length,0);
const conflicting=choose([race],[{...established,officialEventUrl:'https://other.example.org/events/trail'}],{},today);
assert.equal(conflicting.changed.length,0);
assert.equal(conflicting.review[0].reason,'existing_race_same_year_date_conflict');
const wrongYear={...first,startDate:'2025-04-18'};
assert.equal(parseEvent(wrongYear,src.url,src,today),null);
const noCity={...first,location:{'@type':'Place'}};
assert.equal(parseEvent(noCity,src.url,src,today),null);
const foreign={...first,url:'https://evil.example.org/events/bergen-trail'};
assert.equal(parseEvent(foreign,src.url,src,today),null);
async function run(){
 const requested=[];
 const fetchImpl=async url=>{
  requested.push(url);
  return new Response(url.endsWith('/calendar/')?html:html,{headers:{'content-type':'text/html'}});
 };
 const result=await discover({sources:[src]},[],{}, {today,fetchImpl});
 assert.equal(result.data.events.length,1);
 assert.equal(result.pagesChecked,2);
 assert.ok(requested.every(u=>u.startsWith('https://events.example.org/')));
 console.log('RaceAtlas official discovery and safe date-update tests passed');
}
run().catch(e=>{console.error(e);process.exitCode=1});
