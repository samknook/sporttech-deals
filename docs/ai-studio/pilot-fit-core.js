/* MKB AI Studio — local first-contact pilot fit screening.
 * No storage, network, personal contact data or actual AI.
 */
(function(root){'use strict';
const PRICE={quickscan:295,starter:995,business:2495};
function evaluate(input){
 if(!input||typeof input!=='object')throw Error('Ongeldige invoer');
 const volume=Number(input.weeklyMessages),minutes=Number(input.minutesPerMessage);
 const same=['yes','some','no'].includes(input.repetition)?input.repetition:'no';
 const source=['digital','manual','none'].includes(input.source)?input.source:'none';
 const owner=input.owner===true;
 const sensitive=input.sensitive===true,needsIntegration=input.needsIntegration===true;
 if(!Number.isFinite(volume)||volume<0||volume>10000||!Number.isFinite(minutes)||minutes<0||minutes>120)throw Error('Ongeldige aantallen');
 const alerts=[];
 if(volume<20)alerts.push('Laag volume: eerst proceswaarde toetsen, geen implementatie beloven');
 if(same==='no')alerts.push('Weinig terugkerende vragen: eerst analyseren');
 if(source==='none')alerts.push('Geen bruikbare digitale bron: eerst informatiehuishouding beoordelen');
 if(!owner)alerts.push('Geen verantwoordelijke medewerker: geen begeleide pilot');
 if(sensitive)alerts.push('Gevoelige gegevens: eerst privacy- en beveiligingsbeoordeling');
 if(needsIntegration)alerts.push('Koppelingen nodig: buiten vaste Starter-scope');
 const blocked=!owner||source==='none'||sensitive||needsIntegration;
 const candidate=!blocked&&volume>=20&&same!=='no';
 const route=candidate?'starter':blocked?'custom-review':'quickscan';
 const baselineMinutes=volume*minutes;
 return {route,candidate,alerts,priceIndicative:route==='starter'?PRICE.starter:route==='quickscan'?PRICE.quickscan:null,
  baselineMinutes,baselineHours:baselineMinutes/60,
  potentialSavings:null,reviewRequired:true,contract:false,
  caveat:'Volume is een door de bezoeker ingevuld scenario. Geen tijdwinst, besparing of technische haalbaarheid bewezen.'};
}
function summary(result){
 const routeLabel=result.route==='starter'?'Starter kan inhoudelijk worden onderzocht':result.route==='quickscan'?'Begin met een QuickScan':'Eerst maatwerk- en risicoanalyse';
 return ['MKB AI STUDIO — VOORBEREIDING EERSTE GESPREK',
  'Adviesrichting: '+routeLabel,
  'Huidige handmatige werklast (ingevuld scenario): '+result.baselineHours.toFixed(1)+' uur per week',
  'Indicatieve standaardprijs excl. btw: '+(result.priceIndicative===null?'maatwerk/offerte':'EUR '+result.priceIndicative),
  'Aandachtspunten:',...(result.alerts.length?result.alerts.map(a=>'- '+a):['- Geen directe blokkade in de beperkte vragenlijst']),
  'Volgende stap: scope, datarechten, bronsystemen en kwaliteit samen beoordelen.',
  'Er is niets besteld of verstuurd. Deze uitkomst is geen offerte, veiligheidsbeoordeling of akkoord voor verwerking van klantdata.'
 ].join('\n');
}
const api={evaluate,summary};if(typeof module==='object'&&module.exports)module.exports=api;
if(root)root.MkbAiPilotFit=api;
})(typeof window!=='undefined'?window:null);
