'use strict';
const assert=require('node:assert/strict');
const {extract,heading,dateStrings,dateISO}=require('../scripts/raceatlas-html-candidates.cjs');
const {discover,candidatePriority,candidateReviewRows}=require('../scripts/raceatlas-official-discovery.cjs');
const today='2026-11-12';
assert.equal(dateISO(2027,2,29),null);
assert.equal(dateISO(2028,2,29),'2028-02-29');
assert.ok(dateStrings('Op zondag 18 april 2027').some(x=>x.date==='2027-04-18'));
assert.ok(dateStrings('April 18, 2027').some(x=>x.date==='2027-04-18'));
assert.ok(dateStrings('2027-04-18T09:00').some(x=>x.date==='2027-04-18'));
const html='<!doctype html><html lang="nl"><head><title>De Bosloop 2027 | AV Het Woud</title>'+
'<style>.hidden{display:none}</style><script>const fakeDate="2028-12-31";</script></head><body>'+
'<h1>De Bosloop</h1><div>De volgende editie van De Bosloop is op zondag 18 april 2027 in Bergen.</div>'+
'<div>Inschrijven kan vanaf 12 januari 2027.</div>'+
'<footer>Archief 4 mei 2025</footer></body></html>';
const result=extract(html,'https://club.example.org/wedstrijden/bosloop',today);
assert.equal(heading(html),'De Bosloop');
assert.equal(result.requiresHumanReview,true);
assert.equal(result.candidates.find(x=>x.date==='2027-04-18').rank,2);
assert.equal(result.candidates.some(x=>x.date==='2028-12-31'),false,'Never treat JS strings as visible official dates');
assert.equal(result.candidates.some(x=>x.date==='2025-05-04'),false);
const absent=extract('<h1>De Bosloop</h1><p>Inschrijven start op 15 januari 2027</p>','https://club.example.org/bosloop',today);
assert.ok(absent.candidates.every(c=>c.rank===0),'Registration dates are not race-date signals');
const fromTime=extract('<h1>De Bosloop</h1><time datetime="2027-05-09">9 mei 2027</time>','https://club.example.org/bosloop',today);
assert.ok(fromTime.candidates.some(c=>c.date==='2027-05-09'));
async function main(){
 const fetched=[];
 const fake=async url=>{
  fetched.push(url);
  return new Response(html,{headers:{'content-type':'text/html'}});
 };
 const config={sources:[{url:'https://club.example.org/',sport:'Hardlopen',country:'Nederland',discover:false}]};
 const report=await discover(config,[],{}, {today,fetchImpl:fake,sourceState:{version:1,sources:{}}});
 assert.equal(report.data.events.length,0,'Ordinary HTML is NEVER automatically published');
 assert.equal(report.structuredEvents,0);
 assert.equal(report.plainCandidates.length,1,'Expected one plausible race date for manual review');
 assert.equal(report.plainCandidates[0].dateCandidate,'2027-04-18');
 assert.equal(report.plainCandidates[0].autoPublished,false);
 assert.equal(candidatePriority({...report.plainCandidates[0],matchingIds:['ra-123']},today),1);
 const csv=candidateReviewRows(report.plainCandidates,today);
 assert.ok(csv.includes('ordinary_html_date_needs_organizer_confirmation'));
 assert.ok(csv.includes('2027-04-18'));
 assert.ok(csv.includes('https://club.example.org/'));
 assert.ok(!csv.includes('2027-01-12'),'Registration deadlines must never be treated as race candidates');
 assert.deepEqual(fetched,['https://club.example.org/']);
 const unchanged=await discover(config,[],{}, {today,fetchImpl:fake,sourceState:report.sourceState});
 assert.equal(unchanged.plainCandidates.length,0,'Do not requeue unchanged ordinary pages daily');
 console.log('Ordinary organizer HTML review-only tests passed');
}
main().catch(e=>{console.error(e);process.exitCode=1});
