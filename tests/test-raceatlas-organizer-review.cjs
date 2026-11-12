'use strict';
const assert=require('node:assert/strict');
const {build,organize,researchQuery}=require('../scripts/raceatlas-organizer-review.cjs');
const rows=[
 {event_id:'ra-2',event_name:'Race "One"',city:'Haarlem',country_code:'NL',organizer_link_status:'missing',research_priority:1,listed_date:'2027-01-02'},
 {event_id:'ra-1',event_name:'Other Event',city:'Edam',organizer_link_status:'candidate',research_priority:4,listed_date:'2027-05-01'}
];
const result=build(rows);
assert.equal(result.counts.total,2);
assert.equal(result.counts.missing,1);
assert.equal(result.counts.candidate,1);
assert.match(result.csv,/"Race ""One"""/);
assert.equal(organize(rows)[0].event_id,'ra-2');
assert.match(researchQuery(rows[0]),/organisator officiële website/);
assert.ok(!result.markdown.includes('https://www.fietssport.nl/'));
console.log('RaceAtlas organizer review tests passed');
