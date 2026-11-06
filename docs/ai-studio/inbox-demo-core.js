/* MKB AI Studio — deterministic, offline inbox workflow demonstrator.
   This is not an LLM: real client installations use approved AI software and customer-managed accounts. */
(function(root){'use strict';
const PATTERNS=[
 {id:'invoice',nl:'Facturen en betalingen',en:'Invoices and payments',test:/\b(factuur|facturen|invoice|payment|betaling|creditnota|credit note|overdue|reminder|aanmaning)\b/i,
  nlDraft:'Bedankt voor uw bericht over de factuur. We zoeken de gegevens op en controleren de betaling, factuur en eventuele creditnota voordat we inhoudelijk reageren.',
  enDraft:'Thank you for your message about the invoice. We will check the invoice, payment and any credit note before sending a substantive reply.'},
 {id:'order',nl:'Bestellingen',en:'Orders',test:/\b(bestelling|order|purchase|inkoop|artikelen|product|levering|delivery)\b/i,
  nlDraft:'Bedankt voor uw bericht over de bestelling. We controleren het ordernummer, de artikelgegevens en de bevestigde leverdatum en komen bij u terug.',
  enDraft:'Thank you for your order-related message. We will check the order number, items and confirmed delivery date before replying.'},
 {id:'complaint',nl:'Klachten en retouren',en:'Complaints and returns',test:/\b(klacht|defect|beschadigd|kapot|return|retour|complaint|broken|damage)\b/i,
  nlDraft:'Vervelend dat u dit ervaart. We bekijken de situatie, de ordergegevens en de relevante voorwaarden en reageren na controle met een passende vervolgstap.',
  enDraft:'We are sorry to hear this. We will review the issue, order details and relevant terms before proposing the next step.'},
 {id:'quote',nl:'Offertes',en:'Quotations',test:/\b(offerte|quotation|quote|prijsopgave|proposal|aanbieding)\b/i,
  nlDraft:'Bedankt voor uw offerteaanvraag. We controleren de gewenste aantallen, specificaties en termijn voordat we een voorstel sturen.',
  enDraft:'Thank you for your quotation request. We will review quantities, specifications and timing before sending a proposal.'}
];
function classify(message,locale='nl'){
 if(typeof message!=='string'||message.length>10000)throw Error('Enter up to 10,000 characters.');
 const value=message.trim();if(!value)throw Error('Enter a message.');
 const nl=locale!=='en';
 const hits=PATTERNS.filter(p=>p.test.test(value)),match=hits[0];
 const ambiguous=hits.length>1;
 const category=match?(nl?match.nl:match.en):(nl?'Overig / handmatig beoordelen':'Other / manual review');
 const questions=nl?['Klant en referentienummer bevestigen','Feiten verifiëren in bronsysteem','Geen klantbericht versturen zonder goedkeuring']:['Confirm customer and reference number','Verify facts in source system','Do not send without approval'];
 const draft=match?(nl?match.nlDraft:match.enDraft):(nl?'Bedankt voor uw bericht. We bekijken uw vraag en komen na controle bij u terug.':'Thank you for your message. We will review your request and reply after checking the details.');
 return {category,id:match?match.id:'other',ambiguous,matchedCategories:hits.map(p=>p.id),draft,checks:questions,
  warning:nl?'Voorbeeld op basis van trefwoorden. Geen AI-classificatie, geen feitencontrole en geen verzending.':'Keyword-based example. No AI classification, fact verification or sending.'};
}
function estimate({itemsPerDay,minutesBefore,minutesAfter,workingDays=22,hourlyCost}){
 const vals=[itemsPerDay,minutesBefore,minutesAfter,workingDays,hourlyCost].map(Number);
 if(vals.some(x=>!Number.isFinite(x)||x<0)||vals[0]>10000||vals[1]>240||vals[2]>240||vals[3]>31||vals[4]>500)throw Error('Invalid estimate inputs');
 const minutes=(vals[1]-vals[2])*vals[0]*vals[3];
 return {hoursSaved:minutes/60,value:minutes/60*vals[4],positive:minutes>0};
}
const api={classify,estimate};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.MkbAiStudioDemo=api;
})(typeof window!=='undefined'?window:globalThis);