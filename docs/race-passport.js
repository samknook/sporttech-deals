/* Compact 70.3 race passport — deterministic, privacy-preserving view model.
 * No storage/network. Original organizer rules always prevail.
 */
(function(root){
'use strict';
function build({name,date,start,locale='en',result,core,morning=[],review,transitionClosure='',sourceUrl='',sourceChecked='',decisions={}}){
 if(!result||!core||!Number.isFinite(result.total)||result.total<=0)throw Error('Valid race calculation required');
 const nl=locale==='nl',tr=(a,b)=>nl?a:b;
 const title=String(name||tr('Mijn wedstrijd','My race')).slice(0,90);
 const fmt=n=>core.formatDuration(n);
 const finish=core.clockAt(start,result.total);
 const times=[
 {label:tr('Uit het water','Swim exit'),elapsed:result.swim},
 {label:tr('Start fietsen','Bike start'),elapsed:result.swim+result.t1},
 {label:tr('Einde fietsen','Bike finish'),elapsed:result.swim+result.t1+result.bike},
 {label:tr('Start lopen','Run start'),elapsed:result.swim+result.t1+result.bike+result.t2},
 {label:tr('Finish','Finish'),elapsed:result.total}
 ].map(p=>({...p,clock:core.clockAt(start,p.elapsed)}));
 const plans=[
 {label:tr('Weer / parcours','Weather / course'),value:decisions.weather},
 {label:tr('Materiaalpech','Equipment'),value:decisions.mechanical},
 {label:tr('Voeding','Nutrition'),value:decisions.nutrition}
 ].map(p=>({...p,value:String(p.value||'').trim().slice(0,350)||tr('Nog geen eigen plan','No personal plan yet')}));
 return {
 title,date:String(date||''),start,finish,total:fmt(result.total),target:result.target===null?tr('Niet ingevuld','Not set'):fmt(result.target),
 swim:fmt(result.swim),bike:fmt(result.bike),run:fmt(result.run),t1:fmt(result.t1),t2:fmt(result.t2),
 times,plans,morning:Array.isArray(morning)?morning.map(p=>({time:String(p.time),label:String(p.label)})):[],
 review:review&&Number.isFinite(review.done)?review.done+'/'+review.total:'—',
 transitionClosure:String(transitionClosure||'').trim()||tr('Niet opgegeven','Not entered'),
 sourceUrl:String(sourceUrl||'').slice(0,500)||tr('Niet opgegeven','Not entered'),
 sourceChecked:String(sourceChecked||'')||tr('Niet opgegeven','Not entered'),
 warning:tr('Persoonlijke rekenschatting. Officiële tijden, regels en veiligheid van de organisatie gaan altijd voor.','Personal arithmetic estimate. Official organizer timings, rules and safety instructions always take priority.')
 };
}
const api={build};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.TriZentroRacePassport=api;
})(typeof window!=='undefined'?window:globalThis);
