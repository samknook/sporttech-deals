/* Compare personal race-morning estimates with user-entered organizer deadlines.
 * No event data or real-time rules are inferred by TriZentro.
 */
(function(root){
'use strict';
function minutes(clock){
 if(typeof clock!=='string'||!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(clock))return null;
 const [h,m]=clock.split(':').map(Number);
 return 60*h+m;
}
function format(minutesValue){
 const n=((minutesValue%1440)+1440)%1440;
 return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');
}
function check({start,warmup,transitionClose,locale='en'}){
 const nl=locale==='nl';
 const startMin=minutes(start);
 if(startMin===null)throw Error('Enter a valid start time.');
 if(!Number.isInteger(warmup)||warmup<0||warmup>240)throw Error('Enter valid warm-up minutes.');
 if(transitionClose===''||transitionClose===null||transitionClose===undefined)return {status:'not-entered',message:nl?'Vul desgewenst de officiële sluitingstijd uit de deelnemershandleiding in.':'Optionally enter the official transition closing time from your athlete guide.'};
 const closeMin=minutes(transitionClose);
 if(closeMin===null)return {status:'invalid',message:nl?'Gebruik voor de officiële sluitingstijd uu:mm (bijvoorbeeld 07:00).':'Enter the official transition closing time as hh:mm (for example 07:00).'};
 const readyMin=startMin-warmup;
 if(readyMin<0||closeMin>startMin){
  return {status:'review',message:nl?'Controleer de datum en betekenis van de sluitingstijd bij de organisatie. Deze vergelijking gaat ervan uit dat de sluiting op de wedstrijdochtend vóór jouw start is.':'Check the date and meaning of the closing time with the organizer. This comparison assumes transition closes on race morning before your wave.'};
 }
 const delta=closeMin-readyMin;
 if(delta<0)return {status:'late',readyTime:format(readyMin),closeTime:transitionClose,minutesLate:-delta,message:nl?
 'Let op: volgens jouw planning ben je om '+format(readyMin)+' klaar in de wisselzone, '+(-delta)+' minuten ná de ingevoerde sluiting van '+transitionClose+'. Pas je schema aan en controleer de officiële instructies.':
 'Warning: your plan finishes transition setup at '+format(readyMin)+', '+(-delta)+' minutes AFTER the entered '+transitionClose+' closure. Adjust your schedule and check official instructions.'};
 return {status:'estimate-ok',readyTime:format(readyMin),closeTime:transitionClose,minutesBefore:delta,message:nl?
 'Volgens jouw schatting ben je om '+format(readyMin)+' klaar, '+delta+' minuten vóór de ingevoerde sluiting van '+transitionClose+'. Controleer altijd toegangstijden en overige regels.':
 'Your estimate finishes setup at '+format(readyMin)+', '+delta+' minutes before the entered '+transitionClose+' closure. Always verify access windows and other event rules.'};
}
const api={minutes,check};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.TriZentroRaceDeadline=api;
})(typeof window!=='undefined'?window:globalThis);
