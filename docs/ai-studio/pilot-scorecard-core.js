/* MKB AI Studio: local paired-task pilot scorecard.
 * Data is never stored or transmitted. Only synthetic or authorized non-sensitive timings.
 */
(function(root){'use strict';
function finite(value,label,min,max){const n=Number(value);if(value===''||value===null||value===undefined||!Number.isFinite(n)||n<min||n>max)throw Error('Ongeldig veld: '+label);return n}
function assess(rows,options={}){
 if(!Array.isArray(rows)||rows.length<3||rows.length>200)throw Error('Voer 3 tot 200 taken in');
 const hourly=finite(options.hourlyCost===undefined?0:options.hourlyCost,'uurwaarde',0,500);
 const minEvidence=20,ids=new Set();
 const valid=rows.map((r,i)=>{
  if(!r||typeof r!=='object'||!['yes','no'].includes(r.comparable)||!['yes','no'].includes(r.correct))throw Error('Onvolledige taakinvoer');
  const id=String(r.id||'').trim();
  if(!id||ids.has(id)||id.length>30)throw Error('Taaknummer moet uniek zijn');
  ids.add(id);
  return {id,before:finite(r.before,'vooraf',0,240),processing:finite(r.processing,'voorbereiding',0,240),
   review:finite(r.review,'controle',0,240),rework:finite(r.rework,'herstel',0,240),correct:r.correct==='yes',comparable:r.comparable==='yes'};
 });
 const eligible=valid.filter(x=>x.comparable);
 const excluded=valid.length-eligible.length;
 const errors=valid.filter(x=>!x.correct).length;
 const excludedErrors=valid.filter(x=>!x.comparable&&!x.correct).length;
 const before=eligible.reduce((a,x)=>a+x.before,0);
 const after=eligible.reduce((a,x)=>a+x.processing+x.review+x.rework,0);
 const saved=before-after;
 const meanSaving=eligible.length?saved/eligible.length:null;
 const confidence=eligible.length>=minEvidence?'minimum-sample':'insufficient-sample';
 const qualityPass=errors===0;
 const speedPass=saved>0;
 const state=!qualityPass?'quality-block':confidence==='insufficient-sample'?'insufficient-evidence':!speedPass?'no-net-gain':'further-review';
 return {observed:valid.length,eligible:eligible.length,excluded,errors,excludedErrors,beforeMinutes:before,afterMinutes:after,
  savedMinutes:saved,meanMinutesSaved:meanSaving,
  capacityValue:saved/60*hourly,
  state,confidence,qualityPass,speedPass,
  approvedForProduction:false,verifiedSavings:false,
  warning:'Dit is een beperkte, door een medewerker ingevulde vergelijking; geen bewijs van causaliteit, productiegeschiktheid of gerealiseerde geldbesparing.'};
}
function report(x){const euro=new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR'});const label={ 'quality-block':'STOP — kritieke fout(en) in vergelijkbare taken', 'insufficient-evidence':'ONVOLDOENDE BEWIJS — verzamel ten minste 20 vergelijkbare taken', 'no-net-gain':'GEEN NETTO TIJDWINST — onderzochte taken werden niet sneller', 'further-review':'VERDERE BEOORDELING — netto tijdwinst binnen een kleine steekproef' };
return ['MKB AI STUDIO — PILOTMEETRAPPORT','Verwerkte taken: '+x.observed,'Vergelijkbare taken: '+x.eligible,'Uitgesloten taken: '+x.excluded,
 'Kritieke/inhoudelijke fouten (inclusief uitgesloten taken): '+x.errors,
 'Waarvan fouten in uitgesloten taken: '+x.excludedErrors,'Totale handmatige tijd vóór: '+x.beforeMinutes.toFixed(1)+' min',
 'AI-verwerking + menselijke controle + correcties: '+x.afterMinutes.toFixed(1)+' min',
 'Netto tijdsverschil: '+x.savedMinutes.toFixed(1)+' min',
 'Capaciteitswaarde op basis van opgegeven uurwaarde: '+euro.format(x.capacityValue),
 'Oordeel: '+label[x.state], 'Productieautorisatie: NOOIT automatisch',x.warning].join('\n')}
const api={assess,report};if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.MkbAiPilotScorecard=api;
})(typeof window!=='undefined'?window:null);
