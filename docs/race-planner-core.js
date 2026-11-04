/*
 * SportTech Deals — Triathlon Race Tools v2.
 * Pure calculations for Sprint, Olympic, 70.3, Full and Custom distances.
 * No network requests, accounts or cookies.
 */
(function (global) {
  'use strict';

  const DISTANCES = Object.freeze({
    sprint:  Object.freeze({name:'Sprint',swimMeters:750,bikeKm:20,runKm:5}),
    olympic: Object.freeze({name:'Olympisch',swimMeters:1500,bikeKm:40,runKm:10}),
    half:    Object.freeze({name:'70.3 / Halve',swimMeters:1900,bikeKm:90,runKm:21.0975}),
    full:    Object.freeze({name:'Full distance',swimMeters:3800,bikeKm:180,runKm:42.195})
  });
  // Legacy constants retained for older 70.3 calculator/test compatibility.
  const SWIM_METERS = DISTANCES.half.swimMeters;
  const BIKE_KM = DISTANCES.half.bikeKm;
  const RUN_KM = DISTANCES.half.runKm;
  const TARGET_SECONDS = 5 * 3600;

  function paceToSeconds(value) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(String(value).trim());
    if (!m || Number(m[2]) > 59) return NaN;
    return Number(m[1]) * 60 + Number(m[2]);
  }
  function targetToSeconds(value) {
    if (value == null || String(value).trim() === '') return null;
    const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(String(value).trim());
    if (!m || Number(m[2]) > 59 || (m[3] && Number(m[3]) > 59)) return NaN;
    const seconds = Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3] || 0);
    return seconds >= 900 && seconds <= 48 * 3600 ? seconds : NaN;
  }
  function formatDuration(value) {
    if (!Number.isFinite(value) || value < 0) return '—';
    const total = Math.round(value);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return [h, String(m).padStart(2,'0'),String(s).padStart(2,'0')].join(':');
  }
  function clockAt(start, elapsedSeconds) {
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(start) || !Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) return '—';
    const [hours,minutes]=start.split(':').map(Number);
    const totalMinutes=hours*60+minutes+Math.round(elapsedSeconds/60);
    const days=Math.floor(totalMinutes/1440);
    const minute=totalMinutes%1440;
    return String(Math.floor(minute/60)).padStart(2,'0')+':'+String(minute%60).padStart(2,'0')+(days?' (+'+days+' dag)':'');
  }
  function finiteInRange(value, min, max) {
    if (value === null || value === undefined || String(value).trim() === '') return false;
    const num=Number(value);
    return Number.isFinite(num) && num >= min && num <= max;
  }
  function resolveDistance(values) {
    const key=values.distance || 'half';
    if (Object.prototype.hasOwnProperty.call(DISTANCES,key)) return {id:key,...DISTANCES[key]};
    if (key !== 'custom') throw new Error('Kies een geldige triatlonafstand.');
    if (!finiteInRange(values.swimMeters,100,10000)) throw new Error('Zwemafstand: vul 100 tot 10.000 meter in.');
    if (!finiteInRange(values.bikeKm,1,400)) throw new Error('Fietsafstand: vul 1 tot 400 kilometer in.');
    if (!finiteInRange(values.runKm,1,100)) throw new Error('Loopafstand: vul 1 tot 100 kilometer in.');
    return {id:'custom',name:'Eigen afstand',swimMeters:Number(values.swimMeters),bikeKm:Number(values.bikeKm),runKm:Number(values.runKm)};
  }
  function formatKm(value, digits=2) {
    return new Intl.NumberFormat('nl-NL',{maximumFractionDigits:digits}).format(value);
  }
  function calculate(values) {
    const distance=resolveDistance(values);
    const swimPace=paceToSeconds(values.swimPace);
    const runPace=paceToSeconds(values.runPace);
    const bikeSpeed=Number(values.bikeSpeed);
    const t1Minutes=Number(values.t1Minutes);
    const t2Minutes=Number(values.t2Minutes);
    const start=values.start || '08:00';
    if (!(swimPace >= 60 && swimPace <= 360)) throw new Error('Zwemtempo: gebruik 1:00 tot 6:00 per 100 meter.');
    if (!(runPace >= 120 && runPace <= 900)) throw new Error('Looptempo: gebruik 2:00 tot 15:00 per kilometer.');
    if (!finiteInRange(values.bikeSpeed,10,60)) throw new Error('Fietssnelheid: gebruik 10 tot 60 km/u.');
    if (!finiteInRange(values.t1Minutes,0,30)) throw new Error('T1: gebruik 0 tot 30 minuten.');
    if (!finiteInRange(values.t2Minutes,0,30)) throw new Error('T2: gebruik 0 tot 30 minuten.');
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(start)) throw new Error('Starttijd: gebruik uu:mm.');
    // Keep pre-v2 callers on the historic sub-5 example; explicitly empty means no target.
    const target=values.target===undefined ? (distance.id==='half'?TARGET_SECONDS:null) : targetToSeconds(values.target);
    if (target !== null && !Number.isFinite(target)) throw new Error('Doeltijd: gebruik uu:mm, bijvoorbeeld 05:00.');

    const swim=swimPace*distance.swimMeters/100;
    const t1=t1Minutes*60;
    const bike=distance.bikeKm/bikeSpeed*3600;
    const t2=t2Minutes*60;
    const run=distance.runKm*runPace;
    const total=swim+t1+bike+t2+run;
    const bikeBegin=swim+t1,runBegin=swim+t1+bike+t2;
    const points=[
      {label:'Start zwemmen',distance:'0 m',elapsed:0,discipline:'swim'},
      {label:'Uit het water',distance:formatKm(distance.swimMeters,0)+' m zwemmen',elapsed:swim,discipline:'swim'},
      {label:'Start fietsen · T1 klaar',distance:'Wissel 1',elapsed:bikeBegin,discipline:'transition'},
      {label:'Fietsen · ⅓',distance:formatKm(distance.bikeKm/3)+' km',elapsed:bikeBegin+bike/3,discipline:'bike'},
      {label:'Fietsen · ⅔',distance:formatKm(distance.bikeKm*2/3)+' km',elapsed:bikeBegin+bike*2/3,discipline:'bike'},
      {label:'Einde fietsen',distance:formatKm(distance.bikeKm)+' km',elapsed:bikeBegin+bike,discipline:'bike'},
      {label:'Start lopen · T2 klaar',distance:'Wissel 2',elapsed:runBegin,discipline:'transition'},
      {label:'Lopen · 25%',distance:formatKm(distance.runKm*.25)+' km',elapsed:runBegin+run*.25,discipline:'run'},
      {label:'Lopen · 50%',distance:formatKm(distance.runKm*.5)+' km',elapsed:runBegin+run*.5,discipline:'run'},
      {label:'Lopen · 75%',distance:formatKm(distance.runKm*.75)+' km',elapsed:runBegin+run*.75,discipline:'run'},
      {label:'Lopen · 90%',distance:formatKm(distance.runKm*.9)+' km',elapsed:runBegin+run*.9,discipline:'run'},
      {label:'Finish',distance:formatKm(distance.runKm)+' km',elapsed:total,discipline:'finish'}
    ];
    return {
      distance,swim,t1,bike,t2,run,total,target,targetDifference:target===null?null:target-total,
      checkpoints:points.map(p=>({...p,clock:clockAt(start,p.elapsed)}))
    };
  }
  const api={DISTANCES,SWIM_METERS,BIKE_KM,RUN_KM,TARGET_SECONDS,
    paceToSeconds,targetToSeconds,formatDuration,formatKm,clockAt,resolveDistance,calculate};
  if (typeof module !== 'undefined' && module.exports) module.exports=api;
  global.RacePlannerCore=api;
})(typeof window !== 'undefined' ? window : globalThis);
