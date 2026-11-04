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
