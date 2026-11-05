/* TriZentro Race Pack pre-export review. No network, no storage, no medical claims. */
(function(root){
'use strict';
function review(input){
 if(!input||typeof input!=='object')throw Error('Invalid review input');
 const nl=input.locale==='nl';
 const items=[];
 const add=(key,done,nlText,enText)=>items.push({key,done:!!done,label:nl?nlText:enText});
 const present=x=>typeof x==='string'&&x.trim().length>0;
 const checked=Array.isArray(input.checks)?input.checks:[];
 add('event',present(input.name)&&!['My first 70.3','Mijn eerste 70.3'].includes(String(input.name).trim()),
  'Echte wedstrijdnaam ingevuld','Actual race name entered');
 add('date',/^\d{4}-\d{2}-\d{2}$/.test(input.date||'')&&Number.isFinite(Date.parse(input.date)),
  'Wedstrijddatum gecontroleerd','Race date entered');
 add('transition',present(input.transitionClose),
  'Sluiting wisselzone ingevoerd uit officiële briefing (indien van toepassing)',
  'Transition closure entered from official briefing (if applicable)');
 add('official',checked[0]===true,
  'Officiële racebriefing, regels en cut-offs gecontroleerd','Official race briefing, rules and cut-offs checked');
 add('registration',checked[1]===true,
  'Registratie en materiaal-incheck gecontroleerd','Registration and equipment check-in checked');
 add('equipment',checked[3]===true,
  'Materiaalcontrole op checklist afgevinkt','Equipment check ticked off');
 add('food',checked[4]===true,
  'Geteste wedstrijdvoeding voorbereid','Tested race nutrition prepared');
 add('transport',checked[6]===true,
  'Transport en toegang wisselzone gecontroleerd','Transport and transition access checked');
 add('weather',present(input.weather),
  'Eigen alternatief bij gewijzigd weer of parcours beschreven','Weather/course contingency written');
 add('mechanical',present(input.mechanical),
  'Eigen materiaalpech-plan beschreven','Equipment contingency written');
 add('nutrition',present(input.nutrition),
  'Eigen plan bij ontbrekende wedstrijdvoeding beschreven','Nutrition contingency written');
 return {done:items.filter(x=>x.done).length,total:items.length,items};
}
const api={review};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.TriZentroPackReview=api;
})(typeof window!=='undefined'?window:globalThis);
