/* MKB AI Studio — offline intake and pilot decision support. No backend.
 * This is not legal advice, a compliance certification or a binding offer.
 */
(function(root){'use strict';
const WORKFLOWS={
 inbox:{nl:'Klantmail / inbox',en:'Customer inbox',price:995},
 documents:{nl:'Documentverwerking',en:'Document processing',price:995},
 finance:{nl:'Financiële voorcontrole',en:'Finance pre-check',price:995}
};
const RISK_IDS=['sensitive','external','writeback','approvedWorkspace','humanApproval','sourceOwner'];
const yes=v=>v===true;
const clean=(x,max)=>typeof x==='string'?x.trim().slice(0,max):'';
const asNum=(v,max)=>{const n=Number(v);if(v===''||v===null||v===undefined||!Number.isFinite(n)||n<0||n>max)throw Error('Invalid number');return n};
function assess(raw,locale='nl'){
 if(!raw||typeof raw!=='object')throw Error('Missing intake');
 const nl=locale!=='en',tr=(a,b)=>nl?a:b;
 const workflow=raw.workflow;
 if(!Object.prototype.hasOwnProperty.call(WORKFLOWS,workflow))throw Error('Unknown workflow');
 const company=clean(raw.company,90),owner=clean(raw.owner,90),tools=clean(raw.tools,250);
 const volume=asNum(raw.volume,5000),before=asNum(raw.before,240),after=asNum(raw.after,240),hourly=asNum(raw.hourly,500);
 for(const id of RISK_IDS)if(typeof raw[id]!=='boolean')throw Error('Missing control answer: '+id);
 const findings=[];
 function flag(key,severity,nlText,enText){findings.push({key,severity,label:tr(nlText,enText)})}
 if(raw.sensitive)flag('sensitive','review', 'Er kunnen gevoelige persoonsgegevens of vertrouwelijke data in het proces zitten; bepaal eerst een toegestane en beveiligde gegevensstroom.', 'Sensitive personal or confidential data may be involved; establish an approved secure data flow first.');
 if(raw.external)flag('external','block','Automatisch extern verzenden is buiten het Starter-aanbod; schakel terug naar concepten met menselijke goedkeuring.','Unattended outbound communication is excluded from Starter; use human-approved drafts.');
 if(raw.writeback)flag('writeback','block','Automatisch wijzigen van boekhouding of andere bronsystemen valt buiten Starter.','Unattended writes to accounting or systems are excluded from Starter.');
 if(!raw.approvedWorkspace)flag('workspace','block','Er is nog geen door de klant goedgekeurde zakelijke AI-omgeving.','No customer-approved business AI environment exists yet.');
 if(!raw.humanApproval)flag('approval','block','Menselijke eindcontrole ontbreekt; pilot mag niet live.','Human approval is missing; the pilot must not go live.');
 if(!raw.sourceOwner)flag('owner','block','Er is nog geen proces- of bronverantwoordelijke aangewezen.','No process/source owner has been designated.');
 if(before<=after)flag('time','review','De verwachte controle- en verwerkingstijd is niet lager dan nu. Meet eerst een realistische uitgangssituatie.','Expected processing and review time is not lower than baseline; measure the process first.');
 const monthly=volume*4.33,netHours=(before-after)*monthly/60,positiveHours=Math.max(0,netHours);
 const status=findings.some(f=>f.severity==='block')?'blocked':findings.length?'review':'candidate';
 const labels={blocked:tr('Geblokkeerd voor pilot','Blocked for pilot'),review:tr('Eerst nader onderzoeken','Review required'),candidate:tr('Kandidaat voor gecontroleerde pilot','Candidate for supervised pilot')};
 return {company,owner,tools,workflow,workflowLabel:nl?WORKFLOWS[workflow].nl:WORKFLOWS[workflow].en,volume,before,after,hourly,
  monthly,netHours,capacityValue:netHours*hourly,positiveHours,status,statusLabel:labels[status],findings,
  proposedScope:tr('Eén afgebakend conceptproces, maximaal 8 tests, overdracht en menselijke controle. Geen API-koppeling of automatische externe acties.','One scoped draft-only workflow, up to 8 tests, handoff and human approval. No API integration or unattended external action.'),
  proposedPrice:WORKFLOWS[workflow].price};
}
function textReport(raw,locale='nl'){const a=assess(raw,locale),nl=locale!=='en';
 const eur=n=>new Intl.NumberFormat(nl?'nl-NL':'en-GB',{style:'currency',currency:'EUR'}).format(n);
 return [
 'MKB AI STUDIO — '+(nl?'CONCEPT INTAKERAPPORT':'DRAFT INTAKE REPORT'),
 (nl?'Bedrijf (optioneel): ':'Company (optional): ')+(a.company||'—'),
 (nl?'Procesverantwoordelijke (optioneel): ':'Process owner (optional): ')+(a.owner||'—'),
 (nl?'Proces: ':'Workflow: ')+a.workflowLabel,
 (nl?'Gebruikte software: ':'Current software: ')+(a.tools||'—'),
 (nl?'Handelingen per week: ':'Tasks per week: ')+a.volume,
 (nl?'Minuten vóór / na (aanname): ':'Minutes before / after (assumption): ')+a.before+' / '+a.after,
 (nl?'Indicatieve uren per maand (kan negatief zijn): ':'Estimated hours per month (may be negative): ')+a.netHours.toFixed(1),
 (nl?'Indicatieve capaciteitswaarde, geen gerealiseerde besparing: ':'Estimated capacity value, not realized savings: ')+eur(a.capacityValue),
 (nl?'Voorlopige beoordeling: ':'Initial classification: ')+a.statusLabel,
 (nl?'Actiepunten: ':'Actions: '),
 ...(a.findings.length?a.findings.map(x=>'- '+x.label):['- '+(nl?'Geen directe blokkades gemeld. Valideer aannames en AVG voordat echte gegevens worden gebruikt.':'No immediate blockers reported. Validate assumptions and privacy before real data is used.')]),
 (nl?'Conceptscope: ':'Draft scope: ')+a.proposedScope,
 (nl?'Referentieprijs (hypothese, geen offerte): ':'Reference price (hypothesis, not a quote): ')+eur(a.proposedPrice),
 '',nl?'Niet bindend. Geen gegevensverwerking of productie-implementatie goedgekeurd.':'Non-binding. No data processing or production deployment approved.'
 ].join('\n');
}
const api={WORKFLOWS,assess,textReport};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.MkbAiIntake=api;
})(typeof window!=='undefined'?window:globalThis);