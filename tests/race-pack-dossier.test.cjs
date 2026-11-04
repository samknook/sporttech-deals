const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const core=require('../docs/race-planner-core.js');
const dossier=require('../docs/race-pack-dossier.js');
const input={distance:'half',swimPace:'2:00',bikeSpeed:30,runPace:'5:00',t1Minutes:4,t2Minutes:3,start:'08:00',target:'06:00'};
const baseline=core.calculate(input);
test('dossier checkpoints progress monotonically, ending at finish',()=>{
 const points=dossier.checkpoints(baseline,core,'08:00');
 assert.equal(points.length,11);
 assert.equal(points[0].label,'Swim exit');
 assert.equal(points.at(-1).label,'Finish');
 assert.ok(Math.abs(points.at(-1).elapsed-baseline.total)<0.00001);
 for(let i=1;i<points.length;i++)assert.ok(points[i].elapsed>points[i-1].elapsed);
});
test('30km and 60km checkpoints divide the bike time correctly',()=>{
 const points=dossier.checkpoints(baseline,core,'08:00');
 assert.ok(Math.abs(points[2].elapsed-(baseline.swim+baseline.t1+baseline.bike/3))<0.01);
 assert.ok(Math.abs(points[3].elapsed-(baseline.swim+baseline.t1+2*baseline.bike/3))<0.01);
});
test('export includes personal race notes, checkmarks, times and warnings',()=>{
 const scenarios=core.compareScenarios(input).map((_,i)=>{
 const swim=core.paceToSeconds(input.swimPace),run=core.paceToSeconds(input.runPace);
 const variation=i===0?1:i===2?-1:0;
 return core.calculate({...input,swimPace:core.secondsToPace(swim+5*variation),bikeSpeed:Number(input.bikeSpeed)-variation,runPace:core.secondsToPace(run+10*variation)});
 });
 const output=dossier.textDossier({name:'Testing 70.3',date:'2027-06-20',start:'08:00',target:'06:00',scenarios,checks:[{checked:true,label:'Helmet check'}],notes:'Bring the spare tyre.',core});
 assert.match(output,/BASELINE CHECKPOINTS/);
 assert.match(output,/Testing 70\.3/);
 assert.match(output,/\[x\] Helmet check/);
 assert.match(output,/Bring the spare tyre/);
 assert.match(output,/Official distances/);
});
test('preview uses actual dossier module and editable notes',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../docs/race-pack-preview.html'),'utf8');
 assert.match(html,/src="race-pack-dossier\.js"/);
 assert.match(html,/id="dossier-checkpoints"/);
 assert.match(html,/id="race-notes"/);
 assert.match(html,/TriZentroRaceDossier\.textDossier/);
});
