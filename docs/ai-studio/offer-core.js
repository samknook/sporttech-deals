/* MKB AI Studio — indicative scope/price checker.
 * No checkout, private configuration, sensitive data handling or actual client service.
 */
(function(root){'use strict';
const PACKAGES=Object.freeze({
 quickscan:{price:295,deliveryHours:3,maxWorkflows:0,label:'Begeleide AI QuickScan'},
 starter:{price:995,deliveryHours:9,maxWorkflows:1,label:'AI Starter'},
 business:{price:2495,deliveryHours:24,maxWorkflows:3,label:'AI Business'}
});
const TYPES=new Set(['inbox','documents','finance']);
const EXTRAS=new Set(['api','erp','autonomous','sensitive','multisite']);
const days=n=>Number.isFinite(n)?Number(n.toFixed(1)):0;
function quote(input){
 if(!input||typeof input!=='object')throw Error('Missing scope');
 if(!Object.prototype.hasOwnProperty.call(PACKAGES,input.package))throw Error('Unknown package');
 if(!Array.isArray(input.workflows)||input.workflows.length>3||new Set(input.workflows).size!==input.workflows.length||input.workflows.some(x=>!TYPES.has(x)))throw Error('Invalid workflows');
 if(!Array.isArray(input.extras)||input.extras.length>EXTRAS.size||new Set(input.extras).size!==input.extras.length||input.extras.some(x=>!EXTRAS.has(x)))throw Error('Invalid extras');
 const selected=PACKAGES[input.package],workflowCount=input.workflows.length;
 const reasons=[];
 if(input.package==='quickscan'&&workflowCount)reasons.push('QuickScan is an assessment, not an implementation');
 if(input.package!=='quickscan'&&(!workflowCount||workflowCount>selected.maxWorkflows))reasons.push('Workflow count exceeds selected implementation scope');
 const labels={
 api:'Custom API or integration work needs separate design, security review and pricing',
 erp:'ERP write-back or live-system modification is excluded from standard packages',
 autonomous:'Unattended customer communication or financial actions are excluded',
 sensitive:'Sensitive data requires additional privacy and security review',
 multisite:'Multiple teams or locations require separately scoped access and onboarding'
 };
 for(const id of input.extras)reasons.push(labels[id]);
 const care=input.care===true;
 if(input.care!==true&&input.care!==false)throw Error('Invalid care choice');
 const status=reasons.length?'custom-review':'standard-candidate';
 const recurring=care?199:0;
 return {
 package:input.package,packageLabel:selected.label,workflows:input.workflows.slice(),extras:input.extras.slice(),
 status,reasons,price:selected.price,recurring,deliveryHours:selected.deliveryHours,
 capacityCost:days(selected.deliveryHours*50),firstYearIllustration:selected.price+12*recurring,
 excludes:['Customer software licenses and consumption','API and system integration','Taxes','Contract-specific support and change requests'],
 disclaimer:'Indicative scope only, not a binding quote. No delivery, payment, onboarding or account access is activated.'
 };
}
function format(q,locale='nl'){
 const nl=locale!=='en',money=n=>new Intl.NumberFormat(nl?'nl-NL':'en-GB',{style:'currency',currency:'EUR',minimumFractionDigits:0,maximumFractionDigits:0}).format(n);
 return [
 'MKB AI STUDIO — '+(nl?'INDICATIEVE SCOPE, GEEN OFFERTE':'INDICATIVE SCOPE, NOT A QUOTE'),
 (nl?'Pakket: ':'Package: ')+q.packageLabel,
 (nl?'Werkprocessen: ':'Workflows: ')+(q.workflows.join(', ')||'—'),
 (nl?'Voorlopige status: ':'Preliminary status: ')+(q.status==='custom-review'?(nl?'Extra beoordeling nodig':'Custom review needed'):(nl?'Standaardkandidaat':'Standard candidate')),
 (nl?'Eenmalige richtprijs excl. btw: ':'Illustrative one-off ex VAT: ')+money(q.price),
 (nl?'Optionele beheerhypothese per maand excl. btw: ':'Optional care hypothesis per month ex VAT: ')+money(q.recurring),
 (nl?'Illustratie eerste 12 maanden excl. btw: ':'Illustrative first 12 months ex VAT: ')+money(q.firstYearIllustration),
 (nl?'Indicatieve leveruren: ':'Estimated delivery hours: ')+q.deliveryHours,
 (nl?'Uit te zoeken: ':'Points requiring scoping: ')+(q.reasons.length?'\n- '+q.reasons.join('\n- '):nl?'geen gemelde uitzonderingen':'no exceptions declared'),
 (nl?'Niet inbegrepen: ':'Not included: ')+q.excludes.join('; '),
 '',
 nl?'Dit is geen offerte, bestelling of betaalverzoek. Werkelijke prijs en scope vereisen schriftelijke overeenstemming.':'Not a quote, order or payment request. Final price and scope require written agreement.'
 ].join('\n');
}
const api={PACKAGES,quote,format};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.MkbAiScope=api;
})(typeof window!=='undefined'?window:globalThis);