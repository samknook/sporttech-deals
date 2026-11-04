/* TriZentro Race Pack dossier helpers — deterministic calculations and safe text export.
 * Does not store or transmit user inputs. RaceOrganizer instructions always take precedence.
 */
(function(root){
'use strict';
const stages=[
  {label:'Swim exit',distance:'1.9 km swim',pick:r=>r.swim},
  {label:'Start bike',distance:'Transition 1',pick:r=>r.swim+r.t1},
  {label:'Bike km 30',distance:'30 km cycling',pick:r=>r.swim+r.t1+r.bike/3},
  {label:'Bike km 60',distance:'60 km cycling',pick:r=>r.swim+r.t1+2*r.bike/3},
  {label:'End bike',distance:'90 km cycling',pick:r=>r.swim+r.t1+r.bike},
  {label:'Start run',distance:'Transition 2',pick:r=>r.swim+r.t1+r.bike+r.t2},
  {label:'Run km 5',distance:'5 km running',pick:r=>r.swim+r.t1+r.bike+r.t2+5/21.0975*r.run},
  {label:'Run km 10',distance:'10 km running',pick:r=>r.swim+r.t1+r.bike+r.t2+10/21.0975*r.run},
  {label:'Run km 15',distance:'15 km running',pick:r=>r.swim+r.t1+r.bike+r.t2+15/21.0975*r.run},
  {label:'Run km 20',distance:'20 km running',pick:r=>r.swim+r.t1+r.bike+r.t2+20/21.0975*r.run},
  {label:'Finish',distance:'70.3 finish',pick:r=>r.total}
];
function checkpoints(result,core,start){
  if(!result||!core||!Number.isFinite(result.total))throw Error('Provide a valid calculated race scenario.');
  return stages.map(s=>({label:s.label,distance:s.distance,elapsed:s.pick(result),clock:core.clockAt(start,s.pick(result))}));
}
function morningSchedule({date,start,travel,parking,setup,warmup,buffer}){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(String(date))||!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(String(start)))throw Error('Enter a valid race date and start time.');
  const numbers=[travel,parking,setup,warmup,buffer];
  if(numbers.some(n=>!Number.isInteger(n)||n<0||n>1440))throw Error('Enter valid nonnegative planning times.');
  const [year,month,day]=date.split('-').map(Number),[hour,minute]=start.split(':').map(Number);
  const origin=new Date(year,month-1,day,hour,minute);
  if(origin.getFullYear()!==year||origin.getMonth()!==month-1||origin.getDate()!==day||origin.getHours()!==hour||origin.getMinutes()!==minute)throw Error('Invalid race date.');
  const offset=mins=>new Date(origin.getTime()-mins*60000);
  const fmt=d=>d.toLocaleDateString('en-GB',{day:'2-digit',month:'short'})+' '+d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',hour12:false});
  const toStart=warmup, toSetup=toStart+setup, toParking=toSetup+parking,toArrival=toParking+buffer,toLeave=toArrival+travel;
  return [
    {label:'Leave home / lodging',date:offset(toLeave),time:fmt(offset(toLeave))},
    {label:'Arrive at event area (buffer begins)',date:offset(toArrival),time:fmt(offset(toArrival))},
    {label:'Move toward transition zone',date:offset(toParking),time:fmt(offset(toParking))},
    {label:'Bike check and transition setup',date:offset(toSetup),time:fmt(offset(toSetup))},
    {label:'Warm-up and enter start area',date:offset(toStart),time:fmt(offset(toStart))},
    {label:'Wave start',date:origin,time:fmt(origin)}
  ];
}
function textDossier({name,date,start,target,scenarios,checks,notes,core,morning=[]}){
  if(!Array.isArray(scenarios)||scenarios.length!==3)throw Error('Three race scenarios required.');
  const headings=['Conservative','Baseline','Ambition'];
  const lines=[
    'TRIZENTRO / YOUR FIRST 70.3 - RACE DOSSIER SAMPLE',
    'Free prototype. Not personalized coaching or an official event plan.',
    'Race: '+String(name||'My race').slice(0,90),
    'Race date: '+String(date||'Not specified'),
    'Wave start: '+start,
    'Finish target: '+(target||'No target'),
    '',
    'THREE RACE SCENARIOS',
    ...scenarios.map((r,i)=>headings[i]+': '+core.formatDuration(r.total)),
    '',
    'BASELINE CHECKPOINTS',
    ...checkpoints(scenarios[1],core,start).map(p=>p.clock+' | '+p.label+' | '+p.distance),
    '',
    'RACE MORNING',
    ...morning.map(x=>x.time+' | '+x.label),
    '',
    'CHECKLIST',
    ...checks.map(x=>(x.checked?'[x] ':'[ ] ')+String(x.label)),
    '',
    'MY RACE NOTES',
    String(notes||'No notes').slice(0,1500),
    '',
    'Check official distances, local race timings and event rules. Numbers are estimates based on fixed input pace.',
    'Pacing and nutrition must be tested in training. Weather, terrain and fatigue are not modeled.'
  ];
  return lines.join('\n');
}
const api={checkpoints,morningSchedule,textDossier};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.TriZentroRaceDossier=api;
})(typeof window!=='undefined'?window:globalThis);
