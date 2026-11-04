// TriZentro regression tests for public Race Dashboard and race calculation engine.
// Run with: node --test tests/race-dashboard.test.cjs
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const core=require('../docs/race-planner-core.js');
const docs=path.join(__dirname,'..','docs');
function race(distance='half',overrides={}){
 return core.calculate({distance,swimPace:'2:00',bikeSpeed:30,runPace:'5:00',t1Minutes:4,t2Minutes:3,start:'08:00',target:'05:00',...overrides});
}
test('70.3 race sum and distance match',()=>{
 const r=race();
 assert.equal(r.distance.swimMeters,1900);
 assert.equal(r.distance.bikeKm,90);
 assert.equal(r.distance.runKm,21.0975);
 assert.ok(Math.abs(r.total-(r.swim+r.t1+r.bike+r.t2+r.run))<1e-8);
 assert.equal(r.checkpoints.at(-1).label,'Finish');
 assert.ok(Math.abs(r.checkpoints.at(-1).elapsed-r.total)<1e-8);
});
test('distance presets represent four distances',()=>{
 for(const [key,m,b,r] of [['sprint',750,20,5],['olympic',1500,40,10],['half',1900,90,21.0975],['full',3800,180,42.195]]){
  const d=race(key).distance;
  assert.deepEqual([d.swimMeters,d.bikeKm,d.runKm],[m,b,r]);
 }
});
test('faster cycling reduces calculated finish time, holding all else constant',()=>{
 assert.ok(race('half',{bikeSpeed:35}).total<race('half',{bikeSpeed:30}).total);
});
test('scenario comparison has slower, baseline and faster outcomes',()=>{
 const baseline={distance:'half',swimPace:'2:00',bikeSpeed:30,runPace:'5:00',t1Minutes:4,t2Minutes:3,start:'08:00',target:'05:00'};
 const scenarios=core.compareScenarios(baseline);
 assert.equal(scenarios.length,3);
 assert.ok(scenarios[0].total>scenarios[1].total);
 assert.ok(scenarios[2].total<scenarios[1].total);
 assert.equal(scenarios[1].deltaSeconds,0);
});
test('unrealistic and malformed inputs fail validation',()=>{
 assert.throws(()=>race('half',{swimPace:'bad'}));
 assert.throws(()=>race('half',{bikeSpeed:0}));
 assert.throws(()=>race('half',{runPace:'0:20'}));
 assert.throws(()=>race('half',{t1Minutes:-2}));
});
test('dashboard and sitemap contain consistent references',()=>{
 const dashboard=fs.readFileSync(path.join(docs,'race-dashboard.html'),'utf8');
 const homepage=fs.readFileSync(path.join(docs,'index.html'),'utf8');
 const sitemap=fs.readFileSync(path.join(docs,'sitemap.xml'),'utf8');
 assert.match(dashboard,/<script src="race-planner-core.js"><\/script>/);
 assert.match(dashboard,/localStorage\.setItem/);
 assert.match(dashboard,/localStorage\.removeItem/);
 assert.match(dashboard,/id="download"/);
 assert.match(dashboard,/id="scenarios"/);
 assert.match(dashboard,/core\.compareScenarios\(v\.input\)/);
 assert.match(homepage,/href="race-dashboard.html"/);
 assert.match(sitemap,/https:\/\/samknook\.github\.io\/sporttech-deals\/race-dashboard\.html/);
});
test('every sitemap URL has a matching docs file',()=>{
 const sitemap=fs.readFileSync(path.join(docs,'sitemap.xml'),'utf8');
 const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
 assert.ok(urls.length>=8);
 for(const url of urls){
  const u=new URL(url);
  assert.equal(u.hostname,'samknook.github.io');
  assert.ok(u.pathname.startsWith('/sporttech-deals/'));
  const rel=u.pathname.slice('/sporttech-deals/'.length);
  assert.ok(fs.existsSync(path.join(docs,rel||'index.html')),'Missing file for '+url);
 }
 assert.equal(new Set(urls).size,urls.length,'duplicate sitemap URLs');
});
