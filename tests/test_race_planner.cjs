'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../docs/race-planner-core.js');

const sample = {
  start:'08:00', swimPace:'2:00', bikeSpeed:'33', runPace:'5:00', t1Minutes:'4', t2Minutes:'3'
};
test('70.3 afstanden en tempo-conversie', () => {
  assert.equal(core.SWIM_METERS, 1900);
  assert.equal(core.BIKE_KM, 90);
  assert.equal(core.RUN_KM, 21.0975);
  assert.equal(core.paceToSeconds('2:00'), 120);
  assert.equal(core.paceToSeconds('4:55'), 295);
  assert.ok(Number.isNaN(core.paceToSeconds('5:60')));
  assert.ok(Number.isNaN(core.paceToSeconds('0.50')));
  assert.equal(core.formatDuration(3600+61), '1:01:01');
});
test('berekening rond correct af bij hele race', () => {
  const p = core.calculate(sample);
  assert.equal(p.swim, 2280);
  assert.ok(Math.abs(p.bike - 9818.181818) < 0.001);
  assert.equal(p.t1, 240);
  assert.equal(p.t2, 180);
  assert.ok(Math.abs(p.run - 6329.25) < 0.001);
  assert.equal(core.formatDuration(p.total), '5:14:07');
  assert.equal(p.checkpoints.length, 12);
  assert.equal(p.checkpoints[0].clock, '08:00');
  assert.equal(p.checkpoints[0].elapsed, 0);
  assert.equal(p.checkpoints.at(-1).label, 'Finish');
  assert.equal(p.checkpoints.at(-1).elapsed, p.total);
});
test('alle checkpoints nemen in tijd toe', () => {
  const p = core.calculate(sample);
  for (let i = 1; i < p.checkpoints.length; i++) {
    assert.ok(p.checkpoints[i].elapsed >= p.checkpoints[i-1].elapsed);
    assert.notEqual(p.checkpoints[i].clock, '—');
  }
});
test('sub-5 scenario wordt als marge berekend', () => {
  const p = core.calculate({...sample,swimPace:'1:50',bikeSpeed:'36',runPace:'4:55',t1Minutes:'3',t2Minutes:'2'});
  assert.ok(p.total < 18000);
  assert.ok(p.targetDifference > 0);
  assert.ok(Math.abs(p.total - 17613.7625) < 0.0001);
});
test('kloktijd schuift door middernacht zonder datumaanname', () => {
  assert.equal(core.clockAt('23:50',1200), '00:10 (+1 dag)');
  assert.equal(core.clockAt('08:00', 3900), '09:05');
  assert.equal(core.clockAt('08:00',0), '08:00');
  assert.equal(core.clockAt('25:90',120), '—');
});
test('ongeldige invoer wordt veilig geweigerd', () => {
  for (const bad of [
    {...sample,swimPace:'0:59'},
    {...sample,swimPace:'6:01'},
    {...sample,runPace:'15:01'},
    {...sample,runPace:'4:60'},
    {...sample,bikeSpeed:''},
    {...sample,bikeSpeed:0},
    {...sample,bikeSpeed:100},
    {...sample,t1Minutes:''},
    {...sample,t2Minutes:-1},
    {...sample,t1Minutes:31},
    {...sample,start:'24:00'},
    {...sample,start:'12:67'}
  ]) assert.throws(()=>core.calculate(bad),Error);
});

test('presets cover Sprint, Olympic, 70.3 and Full', () => {
  const expected={
    sprint:[750,20,5],
    olympic:[1500,40,10],
    half:[1900,90,21.0975],
    full:[3800,180,42.195]
  };
  for(const [key,distances] of Object.entries(expected)){
    const result=core.calculate({...sample,distance:key,target:''});
    assert.deepEqual([result.distance.swimMeters,result.distance.bikeKm,result.distance.runKm],distances);
    const manual=120*distances[0]/100 + 90/distances[1]*0 + distances[1]/33*3600 + 7*60 + 300*distances[2];
    assert.ok(Math.abs(result.total-manual)<.00001);
    assert.equal(result.targetDifference,null);
    assert.equal(result.checkpoints.length,12);
    assert.equal(result.checkpoints.at(-1).elapsed,result.total);
    for(let i=1;i<result.checkpoints.length;i++){
      assert.ok(result.checkpoints[i].elapsed>=result.checkpoints[i-1].elapsed);
    }
  }
});
test('custom distance respects fractional distances',()=>{
  const r=core.calculate({...sample,distance:'custom',swimMeters:500,bikeKm:25.5,runKm:7.5,target:''});
  assert.equal(r.swim,600);
  assert.ok(Math.abs(r.bike-25.5/33*3600)<1e-6);
  assert.equal(r.run,2250);
  assert.ok(r.checkpoints.some(p=>p.distance.includes('25,5 km')));
  assert.equal(r.distance.name,'Eigen afstand');
});
test('target time belongs to selected race',()=>{
  const full=core.calculate({...sample,distance:'full',target:'12:00'});
  assert.equal(full.target,43200);
  assert.equal(full.targetDifference,43200-full.total);
  const race=core.calculate({...sample,distance:'sprint',target:'01:30'});
  assert.equal(race.target,5400);
  const none=core.calculate({...sample,distance:'full',target:''});
  assert.equal(none.target,null);
  assert.equal(none.targetDifference,null);
  assert.equal(core.targetToSeconds('05:00'),18000);
  assert.equal(core.targetToSeconds('12:15:30'),44130);
});
test('reject unknown presets and unsafe custom/goal values',()=>{
  for(const opts of [
    {distance:'half-unknown'},
    {distance:'custom',swimMeters:0,bikeKm:20,runKm:5},
    {distance:'custom',swimMeters:750,bikeKm:'',runKm:5},
    {distance:'custom',swimMeters:750,bikeKm:20,runKm:500},
    {distance:'custom',swimMeters:750,bikeKm:Infinity,runKm:5},
    {distance:'sprint',target:'01:60'},
    {distance:'sprint',target:'-1:00'},
    {distance:'full',target:'99:00'}
  ])assert.throws(()=>core.calculate({...sample,...opts}),Error);
});
test('full distance and long custom race clock passes midnight safely',()=>{
  const p=core.calculate({...sample,start:'18:00',distance:'full',target:''});
  assert.equal(p.distance.runKm,42.195);
  assert.ok(p.checkpoints.at(-1).clock.includes('(+1 dag)'));
});


test('doeltijdmodus rekent benodigde pacing per onderdeel exact terug', () => {
  const v={...sample,distance:'half',target:'05:00'};
  const current=core.calculate(v);
  const goals=core.goalPacing(v);
  assert.equal(goals.target,18000);
  assert.equal(goals.swim.status,'possible');
  assert.equal(goals.bike.status,'possible');
  assert.equal(goals.run.status,'possible');
  const baseWithoutSwim=current.total-current.swim;
  assert.ok(goals.swim.raw*19+baseWithoutSwim<=18000+1e-6);
  assert.ok(Math.abs((goals.bike.raw>0 ? 90/goals.bike.raw*3600 : 0)+current.swim+current.run+current.t1+current.t2-18000)<1e-6);
  assert.ok(Math.abs(goals.run.raw*21.0975+current.swim+current.bike+current.t1+current.t2-18000)<1e-6);
  assert.equal(core.goalPacing({...v,target:''}),null);
});
test('doeltijdmodus waarschuwt bij onhaalbaar rekenscenario of ruim doel',()=>{
  const tiny=core.goalPacing({...sample,distance:'half',target:'00:15'});
  assert.equal(tiny.swim.status,'outside-fast');
  assert.equal(tiny.bike.status,'outside-fast');
  assert.equal(tiny.run.status,'outside-fast');
  const loose=core.goalPacing({...sample,distance:'sprint',target:'20:00'});
  assert.equal(loose.swim.status,'already');
  assert.equal(loose.bike.status,'already');
  assert.equal(loose.run.status,'already');
});
test('scenariovergelijking rekent consequent voor alle afstanden',()=>{
  for(const key of ['sprint','olympic','half','full','custom']){
    const opt={...sample,distance:key,target:'',...(key==='custom'?{swimMeters:850,bikeKm:34.5,runKm:7.5}:{})};
    const scenarios=core.compareScenarios(opt);
    assert.equal(scenarios.length,3);
    assert.ok(scenarios[0].total>scenarios[1].total);
    assert.ok(scenarios[2].total<scenarios[1].total);
    assert.equal(scenarios[1].deltaSeconds,0);
    assert.ok(Math.abs(scenarios[0].deltaSeconds-(scenarios[0].total-scenarios[1].total))<1e-9);
  }
});
test('scenariovergelijking houdt tempogrenzen aan',()=>{
  const list=core.compareScenarios({...sample,distance:'sprint',swimPace:'1:00',runPace:'2:00',bikeSpeed:60,target:''});
  assert.ok(list.every(item=>Number.isFinite(item.total)));
  assert.ok(list[0].total>=list[1].total);
  assert.ok(list[1].total>=list[2].total);
});
