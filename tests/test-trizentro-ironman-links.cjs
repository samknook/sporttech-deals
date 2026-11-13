'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync('docs/raceatlas/index.html','utf8');
const start=html.indexOf('const EVENTS=');
assert.ok(start>=0,'catalogue constant missing');
const begin=start+'const EVENTS='.length,end=html.indexOf(';\n',begin);
assert.ok(end>begin,'catalogue terminator missing');
const events=JSON.parse(html.slice(begin,end));
assert.ok(events.length>=434,'verified 2027 catalogue additions missing');
const ids=new Set();
for(const e of events){
 assert.ok(!ids.has(e.id),'duplicate event ID '+e.id);ids.add(e.id);
}
const majors=events.filter(e=>e.major===true);
const imageUrls=new Set();
for(const e of majors){
 assert.ok(e.imageUrl,'Every major race must have its own photo: '+e.name);
 assert.ok(['generated','licensed'].includes(e.imageRights),'Major race photo must be original or licensed: '+e.name);
 assert.ok(!imageUrls.has(e.imageUrl),'Major race photo must not be reused: '+e.name);
 imageUrls.add(e.imageUrl);
 if(e.imageRights==='licensed'){
  assert.ok(/^https:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\//.test(e.imageUrl),'Use licensed Wikimedia photo for '+e.name);
  assert.ok(e.imageCredit&&e.imageSourceUrl,'Licensed image requires attribution and source for '+e.name);
 }
}
const ironman=events.filter(e=>/^IRONMAN\b/i.test(e.name));
assert.ok(ironman.length>=40,'IRONMAN coverage regressed');
assert.ok(ironman.filter(e=>e.officialEventUrl!=='https://www.ironman.com/races').length>=42,'specific IRONMAN race links regressed');
assert.equal(events.find(e=>e.id==='ra-295').date,null,'Unconfirmed Weymouth date must not be asserted as fact');
for(const e of ironman){
 assert.match(e.officialEventUrl||'',/^https:\/\/www\.ironman\.com\/races(?:\/|$)/,
  'IRONMAN official outbound must not point at third-party calendar: '+e.name);
}
for(const id of ['ra-11','ra-218','ra-220','ra-232','ra-233','ra-244','ra-260','ra-269','ra-279','ra-281','ra-288']){
 const e=events.find(x=>x.id===id);
 assert.ok(e?.officialEventUrl?.startsWith('https://www.ironman.com/races/im'),
  'verified unique IRONMAN race link missing: '+id);
}
for(const id of ['ra-423','ra-424','ra-425','ra-426','ra-427','ra-428','ra-429','ra-430','ra-431','ra-432','ra-433']){
 const e=events.find(x=>x.id===id);
 assert.ok(e,'newly researched event missing: '+id);
 assert.ok(e.officialEventUrl?.startsWith('https://'),'organizer link missing: '+id);
}
const maastricht=events.find(x=>x.id==='ra-423');
assert.equal(maastricht.date,'2027-09-05');
assert.ok(/nog (niet )?officieel|nog niet|bevestig/i.test(maastricht.distance),
 'Maastricht race distance must not be invented');
const zevenheuvelen=events.find(x=>x.id==='ra-433');
assert.ok(!zevenheuvelen.date,'unverified 2027 Zevenheuvelenloop date must stay unknown');
assert.ok(html.includes('id="tzPersonalDashboard"'),'existing season features must be preserved');
console.log('PASS: '+events.length+' races, '+ironman.length+' IRONMAN links, '+majors.length+' unique major covers and 11 additions');
