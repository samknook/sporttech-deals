/* MKB AI Studio: non-binding, client-side AI Inbox pilot economics.
 * No network, storage, customer records, or payment action.
 */
(function(root){'use strict';
function num(v,name,min,max){
 const n=Number(v);
 if(v===null||v===undefined||v===''||!Number.isFinite(n)||n<min||n>max)throw Error('Controleer '+name);
 return n;
}
function calculate(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Ongeldige gegevens');
 const volume=num(input.weeklyMessages,'aantal e-mails',0,10000);
 const repeated=num(input.repeatPercent,'percentage herhaling',0,100)/100;
 const adoption=num(input.adoptionPercent,'percentage deelname',0,100)/100;
 const before=num(input.beforeMinutes,'oorspronkelijke verwerkingstijd',0,120);
 const processing=num(input.aiProcessingMinutes,'verwerking met AI',0,120);
 const review=num(input.reviewMinutes,'controle door medewerker',0,120);
 const rework=num(input.reworkMinutes,'correctietijd',0,120);
 const weeklyOverhead=num(input.weeklyOverheadMinutes,'beheer per week',0,240);
 const hourlyCost=num(input.hourlyCost,'interne uurwaarde',0,500);
 const licenseMonthly=num(input.licenseMonthly,'softwarekosten',0,5000);
 const careMonthly=num(input.careMonthly,'onderhoudskosten',0,5000);
 const setupCost=num(input.setupCost,'eenmalige investering',0,100000);
 const issues=num(input.criticalErrors,'kritieke fouten in de proef',0,10000);
 const eligible=volume*repeated*adoption;
 const beforeWeekly=eligible*before;
 const afterWeekly=eligible*(processing+review+rework)+weeklyOverhead;
 const savedMinutes=beforeWeekly-afterWeekly;
 const grossMonthlyValue=savedMinutes/60*hourlyCost*52/12;
 const recurringMonthly=licenseMonthly+careMonthly;
 const netMonthlyValue=grossMonthlyValue-recurringMonthly;
 const year1Net=12*netMonthlyValue-setupCost;
 const breakEvenMonths=netMonthlyValue>0?setupCost/netMonthlyValue:null;
 const insufficient=eligible<20||repeated===0||adoption===0;
 const blockers=[];
 if(issues>0)blockers.push('Er zijn kritieke fouten; eerst de kwaliteit herstellen');
 if(savedMinutes<=0)blockers.push('Er is na controle en beheer geen netto tijdwinst');
 if(netMonthlyValue<=0)blockers.push('De berekende maandwaarde is niet hoger dan de terugkerende kosten');
 if(insufficient)blockers.push('Te weinig geschikte berichten in dit scenario voor een standaardpilot');
 const status=blockers.length?'do-not-deploy':'worth-testing';
 return {inputs:{volume,repeated,adoption,before,processing,review,rework,weeklyOverhead,hourlyCost,licenseMonthly,careMonthly,setupCost,issues},
 eligibleWeekly:eligible,beforeWeekly,afterWeekly,savedMinutes,monthlyHours:savedMinutes/60*52/12,
 grossMonthlyValue,recurringMonthly,netMonthlyValue,year1Net,breakEvenMonths,
 status,blockers,customerValueVerified:false,readyForProduction:false,
 caveat:'Ingevulde aannames, geen gerealiseerde besparing. Capaciteitswaarde is niet automatisch geld op de bank.'};
}
function euro(n){return new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n)}
function report(r){
 const payoff=r.breakEvenMonths===null?'Niet berekenbaar':r.breakEvenMonths.toFixed(1)+' maanden';
 return [
 'MKB AI STUDIO — HYPOTHETISCHE AI INBOX BUSINESSCASE',
 'Geschikte berichten per week: '+r.eligibleWeekly.toFixed(1),
 'Bruto oorspronkelijke taakminuten per week: '+r.beforeWeekly.toFixed(0),
 'AI + medewerkercontrole + herstel + beheer per week: '+r.afterWeekly.toFixed(0),
 'Netto vrijgespeelde minuten per week: '+r.savedMinutes.toFixed(0),
 'Berekende capaciteitswaarde per maand: '+euro(r.grossMonthlyValue),
 'Terugkerende software- en supportkosten: '+euro(r.recurringMonthly),
 'Netto berekende maandwaarde: '+euro(r.netMonthlyValue),
 'Eenmalige investering: '+euro(r.inputs.setupCost),
 'Scenarioresultaat eerste 12 maanden: '+euro(r.year1Net),
 'Terugverdientijd bij gelijkblijvende aannames: '+payoff,
 'Advies: '+(r.status==='worth-testing'?'Alleen geschikt voor verdere validatie':'Niet uitrollen op basis van deze aannames'),
 ...(r.blockers.length?['Blokkades:',...r.blockers.map(x=>'- '+x)]:[]),
 'Geen bestelling of offerte; alle uitkomsten zijn scenario-berekeningen.',
 r.caveat
 ].join('\n');
}
const api={calculate,report};
if(typeof module==='object'&&module.exports)module.exports=api;
if(root)root.MkbAiBusinessCase=api;
})(typeof window!=='undefined'?window:null);
