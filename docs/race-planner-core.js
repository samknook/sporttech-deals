/*
 * SportTech Deals — 70.3 Race Planner: berekeningskern.
 * Geen netwerkverzoeken, cookies of externe afhankelijkheden.
 */
(function (global) {
  'use strict';
  const SWIM_METERS = 1900;
  const BIKE_KM = 90;
  const RUN_KM = 21.0975;
  const TARGET_SECONDS = 5 * 3600;

  function paceToSeconds(value) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(String(value).trim());
    if (!m || Number(m[2]) > 59) return NaN;
    return Number(m[1]) * 60 + Number(m[2]);
  }
  function formatDuration(value) {
    if (!Number.isFinite(value) || value < 0) return '—';
    const total = Math.round(value);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return [h, String(m).padStart(2, '0'), String(s).padStart(2, '0')].join(':');
  }
  function clockAt(start, elapsedSeconds) {
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(start) || !Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) return '—';
    const [hours, minutes] = start.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + Math.round(elapsedSeconds / 60);
    const days = Math.floor(totalMinutes / 1440);
    const minute = totalMinutes % 1440;
    return String(Math.floor(minute / 60)).padStart(2, '0') + ':' + String(minute % 60).padStart(2, '0') + (days ? ' (+' + days + ' dag)' : '');
  }
  function calculate(values) {
    const swimPace = paceToSeconds(values.swimPace);
    const runPace = paceToSeconds(values.runPace);
    const bikeSpeed = Number(values.bikeSpeed);
    const t1Minutes = Number(values.t1Minutes);
    const t2Minutes = Number(values.t2Minutes);
    if (!(swimPace >= 60 && swimPace <= 360)) throw new Error('Kies een zwemtempo tussen 1:00 en 6:00 per 100 meter.');
    if (!(runPace >= 120 && runPace <= 900)) throw new Error('Kies een looptempo tussen 2:00 en 15:00 per kilometer.');
    if (!Number.isFinite(bikeSpeed) || bikeSpeed < 10 || bikeSpeed > 60 || String(values.bikeSpeed).trim() === '') throw new Error('Kies een fietssnelheid tussen 10 en 60 km/u.');
    if (!Number.isFinite(t1Minutes) || t1Minutes < 0 || t1Minutes > 30 || String(values.t1Minutes).trim() === '') throw new Error('Wissel 1 moet tussen 0 en 30 minuten liggen.');
    if (!Number.isFinite(t2Minutes) || t2Minutes < 0 || t2Minutes > 30 || String(values.t2Minutes).trim() === '') throw new Error('Wissel 2 moet tussen 0 en 30 minuten liggen.');
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(values.start)) throw new Error('Kies een starttijd in het formaat uu:mm.');
    const swim = swimPace * SWIM_METERS / 100;
    const t1 = t1Minutes * 60;
    const bike = BIKE_KM / bikeSpeed * 3600;
    const t2 = t2Minutes * 60;
    const run = RUN_KM * runPace;
    const total = swim + t1 + bike + t2 + run;
    const checkpoints = [
      {label:'Start zwemmen', distance:'0 km', elapsed:0},
      {label:'Uit het water', distance:'1,9 km zwemmen', elapsed:swim},
      {label:'Start fietsen', distance:'T1 afgerond', elapsed:swim+t1},
      {label:'Fiets 30 km', distance:'30 km fietsen', elapsed:swim+t1+bike/3},
      {label:'Fiets 60 km', distance:'60 km fietsen', elapsed:swim+t1+bike*2/3},
      {label:'Einde fietsen', distance:'90 km fietsen', elapsed:swim+t1+bike},
      {label:'Start hardlopen', distance:'T2 afgerond', elapsed:swim+t1+bike+t2},
      {label:'Run 5 km', distance:'5 km hardlopen', elapsed:swim+t1+bike+t2+runPace*5},
      {label:'Run 10 km', distance:'10 km hardlopen', elapsed:swim+t1+bike+t2+runPace*10},
      {label:'Run 15 km', distance:'15 km hardlopen', elapsed:swim+t1+bike+t2+runPace*15},
      {label:'Run 20 km', distance:'20 km hardlopen', elapsed:swim+t1+bike+t2+runPace*20},
      {label:'Finish', distance:'21,0975 km hardlopen', elapsed:total}
    ];
    return {
      swim, t1, bike, t2, run, total,
      targetDifference: TARGET_SECONDS - total,
      checkpoints:checkpoints.map(p=>({...p, clock:clockAt(values.start,p.elapsed)}))
    };
  }
  const api = {SWIM_METERS, BIKE_KM, RUN_KM, TARGET_SECONDS, paceToSeconds, formatDuration, clockAt, calculate};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.RacePlannerCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
