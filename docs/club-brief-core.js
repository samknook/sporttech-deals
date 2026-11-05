/* TriZentro club/event briefing prototype. Source all rules from the organizer;
 * no external feed, account or third-party data transmission.
 */
(function(root){
'use strict';
const timeToMinute=x=>{
 if(typeof x!=='string'||!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(x))return null;
 const [h,m]=x.split(':').map(Number);return h*60+m;
};
function validate(values){
 if(!values||typeof values!=='object')throw Error('Invalid input.');
 const clean={};
 for(const key of ['event','date','venue','guide','checkin','bikeClose','transitionClose','briefing','waveA','waveB','waveC','waveD','waveE','waveF','notes']){
  const raw=values[key]??'';
  if(typeof raw!=='string'||raw.length>(key==='notes'?500:key==='guide'?300:120))throw Error('Invalid field '+key);
  clean[key]=raw.trim();
 }
 if(!clean.event||!clean.date||!clean.waveA)throw Error('Required event, date or first wave missing.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(clean.date))throw Error('Invalid event date.');
 const [y,m,d]=clean.date.split('-').map(Number);
 const date=new Date(Date.UTC(y,m-1,d));
 if(date.getUTCFullYear()!==y||date.getUTCMonth()!==m-1||date.getUTCDate()!==d)throw Error('Invalid calendar date.');
 if(clean.guide){
  let u;
  try{u=new URL(clean.guide)}catch(_){throw Error('Invalid guide link.');}
  if(!['http:','https:'].includes(u.protocol)||!u.hostname)throw Error('Invalid guide link.');
 }
 const deadlines=['checkin','bikeClose','transitionClose','briefing','waveA','waveB','waveC','waveD','waveE','waveF'];
 for(const key of deadlines)if(clean[key]&&timeToMinute(clean[key])===null)throw Error('Invalid time: '+key);
 return clean;
}
function analyze(values){
 const v=validate(values);
 const warnings=[],times=['checkin','bikeClose','transitionClose','briefing','waveA','waveB'];
 const t=Object.fromEntries(times.map(k=>[k,v[k]?timeToMinute(v[k]):null]));
 const waves=['waveA','waveB','waveC','waveD','waveE','waveF'];
 let previous=null;
 for(const key of waves){
  if(t[key]===null)continue;
  if(previous!==null&&t[key]<=t[previous])warnings.push(key==='waveB'?'wave-order':'wave-order-'+key);
  previous=key;
 }
 if(t.checkin!==null&&t.bikeClose!==null&&t.checkin>t.bikeClose)warnings.push('checkin-after-bike-close');
 if(t.checkin!==null&&t.transitionClose!==null&&t.checkin>t.transitionClose)warnings.push('checkin-after-transition-close');
 if(t.bikeClose!==null&&t.transitionClose!==null&&t.bikeClose>t.transitionClose)warnings.push('bike-close-after-transition');
 if(t.transitionClose!==null&&t.waveA<t.transitionClose)warnings.push('transition-closes-after-wave');
 if(t.briefing!==null&&t.briefing>t.waveA)warnings.push('briefing-after-wave');
 if(t.transitionClose===null)warnings.push('transition-closure-missing');
 if(t.checkin===null)warnings.push('checkin-time-missing');
 if(!v.guide)warnings.push('source-link-missing');
 const events=[
  ['checkin','Registration / check-in opens','Registratie / incheck opent'],
  ['bikeClose','Bike check-in closes','Fietsincheck sluit'],
  ['transitionClose','Transition closes','Wisselzone sluit'],
  ['briefing','Race briefing','Wedstrijdbriefing'],
  ['waveA','Wave A starts','Startgroep A vertrekt'],
  ['waveB','Wave B starts','Startgroep B vertrekt'],
  ['waveC','Wave C starts','Startgroep C vertrekt'],
  ['waveD','Wave D starts','Startgroep D vertrekt'],
  ['waveE','Wave E starts','Startgroep E vertrekt'],
  ['waveF','Wave F starts','Startgroep F vertrekt']
 ].filter(([key])=>v[key]).map(([key,en,nl])=>({key,time:v[key],minutes:t[key],en,nl}))
 .sort((a,b)=>a.minutes-b.minutes);
 return {values:v,events,warnings,requiresReview:warnings.length>0};
}
const warnLabels={
 'wave-order':['Wave B starts before or at the same time as wave A.','Startgroep B vertrekt vóór of tegelijk met groep A.'],
 'wave-order-waveC':['Wave C must start after the previous wave.','Startgroep C moet na de vorige startgroep vertrekken.'],
 'wave-order-waveD':['Wave D must start after the previous wave.','Startgroep D moet na de vorige startgroep vertrekken.'],
 'wave-order-waveE':['Wave E must start after the previous wave.','Startgroep E moet na de vorige startgroep vertrekken.'],
 'wave-order-waveF':['Wave F must start after the previous wave.','Startgroep F moet na de vorige startgroep vertrekken.'],
 'checkin-after-bike-close':['Check-in opens after bike check-in closes.','Incheck opent na sluiting van de fietsincheck.'],
 'checkin-after-transition-close':['Check-in opens after transition closes.','Incheck opent na sluiting van de wisselzone.'],
 'bike-close-after-transition':['Bike check-in closes after transition closes.','Fietsincheck sluit nadat de wisselzone sluit.'],
 'transition-closes-after-wave':['Transition closes after wave A starts.','Wisselzone sluit nadat startgroep A begint.'],
 'briefing-after-wave':['Race briefing is scheduled after wave A starts.','De wedstrijdbriefing staat na de start van groep A.'],
 'transition-closure-missing':['Confirm the official transition closure time.','Controleer de officiële sluitingstijd van de wisselzone.'],
 'checkin-time-missing':['Confirm official check-in opening time.','Controleer de officiële openingstijd van de incheck.'],
 'source-link-missing':['Add an official source link before distributing this briefing.','Voeg een officiële bronlink toe vóór verspreiding van de briefing.']
};
function lines(analysis,locale='nl'){
 const nl=locale!=='en',v=analysis.values;
 return [
 'TRIZENTRO — '+(nl?'CONCEPT WEDSTRIJDBRIEFING':'DRAFT RACE BRIEF'),
 '',
 (nl?'Evenement: ':'Event: ')+v.event,
 (nl?'Datum: ':'Date: ')+v.date,
 (nl?'Locatie: ':'Venue: ')+(v.venue||'—'),
 (nl?'Officiële bron: ':'Official source: ')+(v.guide|| (nl?'Niet toegevoegd':'Not supplied')),
 '',
 (nl?'TIJDLIJN (INVOER VAN ORGANISATIE)':'TIMELINE (ORGANIZER-ENTERED)'),
 ...analysis.events.map(e=>e.time+' — '+(nl?e.nl:e.en)),
 '',
 (nl?'TE CONTROLEREN':'REVIEW BEFORE SHARING'),
 ...(analysis.warnings.length?analysis.warnings.map(w=>'! '+warnLabels[w][nl?1:0]):[nl?'Geen automatische inconsistenties gevonden. Controleer alsnog de officiële bron.':'No automatic inconsistencies found. Still verify against the official source.']),
 '',
 (nl?'BIJZONDERHEDEN':'ADDITIONAL NOTES'),
 v.notes||'—','',
 nl?'CONCEPT. Geen officiële publicatie of goedkeuring door TriZentro. Controleer alle regels en tijden zelf.':'DRAFT. Not an official TriZentro-verified notice. Verify all rules and times independently.'
 ];
}
const api={timeToMinute,validate,analyze,lines,warnLabels};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.TriZentroClubBrief=api;
})(typeof window!=='undefined'?window:globalThis);