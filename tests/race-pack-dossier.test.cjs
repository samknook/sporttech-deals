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
 assert.match(output,/official distances/i);
});
test('preview uses actual dossier module and editable notes',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../docs/race-pack-preview.html'),'utf8');
 assert.match(html,/src="race-pack-dossier\.js"/);
 assert.match(html,/id="dossier-checkpoints"/);
 assert.match(html,/id="race-notes"/);
 assert.match(html,/TriZentroRaceDossier\.textDossier/);
});

test('race morning timeline works backwards across midnight',()=>{
 const schedule=dossier.morningSchedule({date:'2027-06-20',start:'00:30',travel:60,parking:20,setup:40,warmup:30,buffer:20});
 assert.equal(schedule.length,6);
 assert.equal(schedule.at(-1).label,'Wave start');
 assert.equal(schedule[0].label,'Leave home / lodging');
 assert.equal(schedule.at(-1).date.getTime()-schedule[0].date.getTime(),(60+20+40+30+20)*60000);
 assert.equal(schedule[0].date.getDate(),19);
 for(let i=1;i<schedule.length;i++)assert.ok(schedule[i].date>=schedule[i-1].date);
});
test('race morning inputs reject invalid dates and times',()=>{
 const v={date:'2027-06-20',start:'08:00',travel:35,parking:20,setup:40,warmup:30,buffer:20};
 assert.throws(()=>dossier.morningSchedule({...v,date:'2027-02-30'}));
 assert.throws(()=>dossier.morningSchedule({...v,start:'25:00'}));
 assert.throws(()=>dossier.morningSchedule({...v,travel:-1}));
 assert.throws(()=>dossier.morningSchedule({...v,travel:1.2}));
});
test('race pack sample renders morning plan and exports it',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../docs/race-pack-preview.html'),'utf8');
 assert.match(html,/id="morning"/);
 assert.match(html,/id="travel"/);
 assert.match(html,/TriZentroRaceDossier\.morningSchedule/);
 assert.match(html,/scenarios:results,core,morning/);
});

test('feedback scorecard remains local and has no submission endpoint',()=>{
 const feedback=fs.readFileSync(path.join(__dirname,'../docs/tester-feedback.html'),'utf8');
 assert.match(feedback,/id="test-form"/);
 assert.match(feedback,/URL\.createObjectURL\(blob\)/);
 assert.doesNotMatch(feedback,/<form[^>]+action=|fetch\(|XMLHttpRequest|sendBeacon/);
});

test('tester feedback requires explicit email intent and uses project contact',()=>{
 const feedback=fs.readFileSync(path.join(__dirname,'../docs/tester-feedback.html'),'utf8');
 const transparent=fs.readFileSync(path.join(__dirname,'../docs/transparantie.html'),'utf8');
 const catalog=fs.readFileSync(path.join(__dirname,'../docs/products.html'),'utf8');
 assert.match(feedback,/id="email-feedback"/);
 assert.match(feedback,/mailto:trizentro\.team@gmail\.com/);
 assert.match(feedback,/addEventListener\('click'/);
 assert.match(transparent,/mailto:trizentro\.team@gmail\.com/);
 assert.match(catalog,/href="tester-feedback.html"/);
});
