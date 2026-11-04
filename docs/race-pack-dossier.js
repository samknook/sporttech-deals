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
const dutch={
 'Swim exit':'Uit het water','Start bike':'Start fietsen','Bike km 30':'Fietsen km 30','Bike km 60':'Fietsen km 60',
 'End bike':'Einde fietsdeel','Start run':'Start hardlopen','Run km 5':'Lopen km 5','Run km 10':'Lopen km 10',
 'Run km 15':'Lopen km 15','Run km 20':'Lopen km 20','Finish':'Finish',
 '1.9 km swim':'1,9 km zwemmen','Transition 1':'Wissel 1','30 km cycling':'30 km fietsen',
 '60 km cycling':'60 km fietsen','90 km cycling':'90 km fietsen','Transition 2':'Wissel 2',
 '5 km running':'5 km lopen','10 km running':'10 km lopen','15 km running':'15 km lopen',
 '20 km running':'20 km lopen','70.3 finish':'70.3 finish',
 'Leave home / lodging':'Vertrek van huis / verblijf','Arrive at event area (buffer begins)':'Aankomst bij evenement (buffer begint)',
 'Move toward transition zone':'Naar de wisselzone','Bike check and transition setup':'Fietscontrole en wisselzone voorbereiden',
 'Warm-up and enter start area':'Warming-up en naar startgebied','Wave start':'Start van je startgroep'
};
const localized=(value,locale)=>locale==='nl'?(dutch[value]||value):value;
function checkpoints(result,core,start,locale='en'){
  if(!result||!core||!Number.isFinite(result.total))throw Error('Provide a valid calculated race scenario.');
  return stages.map(s=>({label:localized(s.label,locale),distance:localized(s.distance,locale),elapsed:s.pick(result),clock:core.clockAt(start,s.pick(result))}));
}
function morningSchedule({date,start,travel,parking,setup,warmup,buffer,locale='en'}){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(String(date))||!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(String(start)))throw Error('Enter a valid race date and start time.');
  const numbers=[travel,parking,setup,warmup,buffer];
  if(numbers.some(n=>!Number.isInteger(n)||n<0||n>1440))throw Error('Enter valid nonnegative planning times.');
  const [year,month,day]=date.split('-').map(Number),[hour,minute]=start.split(':').map(Number);
  const origin=new Date(year,month-1,day,hour,minute);
  if(origin.getFullYear()!==year||origin.getMonth()!==month-1||origin.getDate()!==day||origin.getHours()!==hour||origin.getMinutes()!==minute)throw Error('Invalid race date.');
  const offset=mins=>new Date(origin.getTime()-mins*60000);
  const dateLocale=locale==='nl'?'nl-NL':'en-GB';
  const fmt=d=>d.toLocaleDateString(dateLocale,{day:'2-digit',month:'short'})+' '+d.toLocaleTimeString(dateLocale,{hour:'2-digit',minute:'2-digit',hour12:false});
  const toStart=warmup, toSetup=toStart+setup, toParking=toSetup+parking,toArrival=toParking+buffer,toLeave=toArrival+travel;
  return [
    {label:localized('Leave home / lodging',locale),date:offset(toLeave),time:fmt(offset(toLeave))},
    {label:localized('Arrive at event area (buffer begins)',locale),date:offset(toArrival),time:fmt(offset(toArrival))},
    {label:localized('Move toward transition zone',locale),date:offset(toParking),time:fmt(offset(toParking))},
    {label:localized('Bike check and transition setup',locale),date:offset(toSetup),time:fmt(offset(toSetup))},
    {label:localized('Warm-up and enter start area',locale),date:offset(toStart),time:fmt(offset(toStart))},
    {label:localized('Wave start',locale),date:origin,time:fmt(origin)}
  ];
}
function textDossier({name,date,start,target,scenarios,checks,notes,core,morning=[],locale='en'}){
  const nl=locale==='nl';
  if(!Array.isArray(scenarios)||scenarios.length!==3)throw Error('Three race scenarios required.');
  const headings=nl?['Voorzichtig','Basis','Ambitieus']:['Conservative','Baseline','Ambition'];
  const lines=[
    nl?'TRIZENTRO / JE EERSTE 70.3 - VOORBEELD RACEDOSSIER':'TRIZENTRO / YOUR FIRST 70.3 - RACE DOSSIER SAMPLE',
    nl?'Gratis prototype. Geen persoonlijke coaching of officieel raceplan.':'Free prototype. Not personalized coaching or an official event plan.',
    (nl?'Wedstrijd: ':'Race: ')+String(name||(nl?'Mijn wedstrijd':'My race')).slice(0,90),
    (nl?'Datum: ':'Race date: ')+String(date||(nl?'Niet opgegeven':'Not specified')),
    (nl?'Starttijd: ':'Wave start: ')+start,
    (nl?'Doeltijd: ':'Finish target: ')+(target||(nl?'Geen doel':'No target')),
    '',
    nl?'DRIE RACESCENARIO’S':'THREE RACE SCENARIOS',
    ...scenarios.map((r,i)=>headings[i]+': '+core.formatDuration(r.total)),
    '',
    nl?'DOORKOMSTPUNTEN BASISPLAN':'BASELINE CHECKPOINTS',
    ...checkpoints(scenarios[1],core,start,locale).map(p=>p.clock+' | '+p.label+' | '+p.distance),
    '',
    nl?'WEDSTRIJDOCHTEND':'RACE MORNING',
    ...morning.map(x=>x.time+' | '+x.label),
    '',
    nl?'CHECKLIST':'CHECKLIST',
    ...checks.map(x=>(x.checked?'[x] ':'[ ] ')+String(x.label)),
    '',
    nl?'MIJN WEDSTRIJDNOTITIES':'MY RACE NOTES',
    String(notes||(nl?'Geen notities':'No notes')).slice(0,1500),
    '',
    nl?'Controleer officiële afstanden, tijden en wedstrijdregels. De tijden zijn schattingen op basis van vaste tempo’s.':'Check official distances, local race timings and event rules. Numbers are estimates based on fixed input pace.',
    nl?'Test pacing en voeding in training. Weer, parcours en vermoeidheid zijn niet meegerekend.':'Pacing and nutrition must be tested in training. Weather, terrain and fatigue are not modeled.'
  ];
  return lines.join('\n');
}
const api={checkpoints,morningSchedule,textDossier};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.TriZentroRaceDossier=api;
})(typeof window!=='undefined'?window:globalThis);
