'use strict';
const assert=require('node:assert/strict');
const {safeUrl,htmlEvents,links,linkScore,eventDate,parseEvent,raceLike,choose,discover,fingerprint,monitorExisting}=require('../scripts/raceatlas-official-discovery.cjs');
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
assert.equal(fingerprint('<html><script>var x=1</script><body>Race 2027</body></html>'),fingerprint('<html><script>var x=2</script><body>Race 2027</body></html>'));
assert.notEqual(fingerprint('<body>Registration open</body>'),fingerprint('<body>Registration closed</body>'));
assert.equal(htmlEvents(html).length,1);
assert.equal(links(html,'https://events.example.org/calendar/','events.example.org').length,1);
assert.ok(linkScore('https://events.example.org/events/race-2027')>linkScore('https://events.example.org/loopgroepen/start-to-run/'));
assert.equal(linkScore('https://events.example.org/nieuws/uitslagen-marathon'),-100);
assert.deepEqual(links('<a href="/nieuws/uitslagen-marathon">Results</a>','https://events.example.org/calendar/','events.example.org'),[]);
assert.equal(eventDate('2027-04-18',today),'2027-04-18');
assert.equal(eventDate('2027-02-30',today),null);
assert.equal(eventDate('2026-03-01',today),null);
assert.equal(raceLike('Clubrit vrijdagavond'),false);
assert.equal(raceLike('Cursus reanimatie'),false);
assert.equal(raceLike('De Gooische Strade Bianche XV'),true);
assert.equal(raceLike('Twiskemolenloop'),true);
assert.equal(raceLike('Devil’s Cross Duathlon'),true);
assert.equal(parseEvent({...first,name:'Cursus EHBfO'},src.url,src,today),null);
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
const organizerDuplicate=choose([{...race,name:'Bergen Trail 2027'}],[established],{},today);
assert.equal(organizerDuplicate.newEvents.length,0,'An organizer event URL should not duplicate the same edition');
assert.equal(organizerDuplicate.review[0].reason,'organizer_url_matches_existing_different_name');
const recurringTwo={...first,name:'Twiskemolenloop',startDate:'2027-03-07',
 url:'https://events.example.org/twiskemolenloop'};
const recurringThree={...recurringTwo,startDate:'2027-04-04'};
const recurringEvents=[parseEvent(recurringTwo,src.url,src,today),parseEvent(recurringThree,src.url,src,today)];
assert.notEqual(recurringEvents[0].id,recurringEvents[1].id,'Monthly editions need unique stable event IDs');
const recurringResult=choose(recurringEvents,[],{},today);
assert.equal(recurringResult.newEvents.length,2,'Recurring races on one organizer URL must be separate editions');
const knownRecurring=[
 {...recurringEvents[0],id:'ra-352',date:'2027-03-07'},
 {...recurringEvents[1],id:'ra-353',date:'2027-04-04'}
];
const recurringNew=parseEvent({...recurringTwo,startDate:'2027-05-02'},src.url,src,today);
const recurringAdditional=choose([recurringNew],knownRecurring,{},today);
assert.equal(recurringAdditional.newEvents.length,1,'Known recurring series should accept a new officially dated edition');
assert.equal(recurringAdditional.changed.length,0,'Never silently rewrite another monthly edition');
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
 const result=await discover({sources:[src]},[],{}, {today,fetchImpl,sourceState:{version:1,sources:{'https://events.example.org/calendar/':'old-hash'}}});
 assert.equal(result.data.events.length,1);
 assert.equal(result.pagesChecked,2);
 assert.equal(result.contentChanges.length,1,'Changed existing official page should generate review signal');
 assert.equal(Object.keys(result.sourceState.sources).length,2);
 assert.ok(requested.every(u=>u.startsWith('https://events.example.org/')));
 console.log('RaceAtlas official discovery and safe date-update tests passed');
}
run().catch(e=>{console.error(e);process.exitCode=1});
