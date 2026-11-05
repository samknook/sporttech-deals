const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const brief=require('../docs/club-brief-core.js');
function fixture(){return {event:'Sample Triathlon',date:'2027-06-20',venue:'Race village',guide:'https://example.org/athlete-guide',checkin:'06:00',bikeClose:'07:00',transitionClose:'07:30',briefing:'07:40',waveA:'08:00',waveB:'08:15',notes:'Follow event officials'};}
test('builds chronological race briefing from explicit organizer inputs',()=>{
 const result=brief.analyze(fixture());
 assert.deepEqual(result.warnings,[]);
 assert.deepEqual(result.events.map(x=>x.time),['06:00','07:00','07:30','07:40','08:00','08:15']);
 const dutch=brief.lines(result,'nl').join('\n');
 const english=brief.lines(result,'en').join('\n');
 assert.match(dutch,/Wisselzone sluit/);
 assert.match(english,/Transition closes/);
 assert.match(english,/https:\/\/example\.org\/athlete-guide/);
 assert.match(dutch,/CONCEPT/);
});
test('flags chronological contradictions without inventing organizer rules',()=>{
 const x=fixture();x.transitionClose='08:10';x.waveB='07:55';x.briefing='08:20';
 const result=brief.analyze(x);
 assert.ok(result.warnings.includes('transition-closes-after-wave'));
 assert.ok(result.warnings.includes('wave-order'));
 assert.ok(result.warnings.includes('briefing-after-wave'));
 assert.ok(result.requiresReview);
});
test('missing mandatory source context is disclosed',()=>{
 const x=fixture();x.guide='';x.transitionClose='';x.checkin='';
 const result=brief.analyze(x);
 assert.ok(result.warnings.includes('source-link-missing'));
 assert.ok(result.warnings.includes('transition-closure-missing'));
 assert.ok(result.warnings.includes('checkin-time-missing'));
});
test('reject invalid dates, times and non-http guide links',()=>{
 for(const value of ['2027-02-30','2027-13-01','bad'])assert.throws(()=>brief.validate({...fixture(),date:value}));
 for(const value of ['8:00','25:00','08:99'])assert.throws(()=>brief.validate({...fixture(),waveA:value}));
 for(const value of ['javascript:alert(1)','file:///tmp/local','this is not a URL'])assert.throws(()=>brief.validate({...fixture(),guide:value}));
 assert.throws(()=>brief.validate({...fixture(),event:''}));
});
test('public page exposes explicit guidance, export and bilingual navigation',()=>{
 const docs=path.join(__dirname,'../docs');
 const html=fs.readFileSync(path.join(docs,'club-race-brief.html'),'utf8');
 const nav=fs.readFileSync(path.join(docs,'navigation.js'),'utf8');
 assert.match(html,/src="club-brief-core.js"/);
 assert.match(html,/id="club-form"/);
 assert.match(html,/id="download-brief"/);
 assert.match(html,/id="copy-brief"/);
 assert.match(html,/id="print-brief"/);
 assert.match(html,/officiële deelnemershandleiding/);
 assert.match(nav,/club-race-brief\.html/);
});