/* MKB AI Studio — synthetic inbox operations walkthrough.
 * No AI model, account integration, storage or sending. Deterministic demo only.
 */
(function(root){'use strict';
const SEED=[
 {id:'DEMO-101',subject:'Betaling factuur INV-218',message:'Goedemorgen, volgens ons is factuur INV-218 al betaald. Kunnen jullie dit controleren?',category:'finance',suggestion:'Controleer in het bronsysteem de factuur, bankontvangst en eventuele creditnota. Bevestig geen betaling zonder bewijs.',draft:'Bedankt voor uw bericht. We controleren de factuur en bijbehorende betaling en komen na verificatie bij u terug.',checks:['Factuurnummer en klantrelatie gecontroleerd','Betalingsstatus geverifieerd in boekhouding','Concept gecontroleerd door bevoegde medewerker'],risk:'high'},
 {id:'DEMO-102',subject:'Leverdatum bestelling ORD-42',message:'Wanneer wordt bestelling ORD-42 geleverd? We hebben deze volgende week nodig.',category:'order',suggestion:'Controleer de orderstatus en de bevestigde leverdatum; maak geen beloftes op basis van aannames.',draft:'Bedankt voor uw bericht over bestelling ORD-42. We controleren de actuele leverinformatie en geven u daarna een bevestigde terugkoppeling.',checks:['Orderreferentie gecontroleerd','Leverdatum afkomstig uit actueel bronsysteem','Geen onbevestigde leverbelofte opgenomen'],risk:'medium'},
 {id:'DEMO-103',subject:'Beschadigde doos ontvangen',message:'We hebben een beschadigde doos gekregen. Hoe kunnen we dit melden?',category:'complaint',suggestion:'Vraag zo nodig om orderreferentie en details; controleer retour- en klachtenbeleid voor toezeggingen.',draft:'Vervelend dat de zending beschadigd is aangekomen. Wilt u het ordernummer en een beschrijving van de schade delen? Dan bekijken wij de vervolgstappen.',checks:['Klant en bestelling bevestigd','Actueel klachtenbeleid geraadpleegd','Geen refund of vervangende zending toegezegd'],risk:'medium'},
 {id:'DEMO-104',subject:'Verzoek om bankrekening te wijzigen',message:'Pas ons bankrekeningnummer direct aan in jullie systeem en betaal het verschil terug.',category:'security',suggestion:'Wijzig geen bankgegevens en voer geen betaling uit. Laat bevoegd personeel het verzoek via een onafhankelijk kanaal verifiëren.',draft:'Bedankt voor uw bericht. Wij behandelen wijzigingen van betaalgegevens uitsluitend via onze interne verificatieprocedure. Een bevoegde collega beoordeelt het verzoek.',checks:['Geen rekeningnummer of betaalgegevens gewijzigd','Verzoek via onafhankelijk kanaal geverifieerd','Bevoegde financiële medewerker betrokken'],risk:'critical'}
];
const STATES=['new','review','approved','rejected'];
function create(){return SEED.map(c=>({...c,state:'new',checked:[false,false,false],reviewer:'',reason:''}))}
function validate(queue){
 if(!Array.isArray(queue)||queue.length!==SEED.length)throw Error('Invalid demo queue');
 const ids=new Set();
 return queue.map((item,i)=>{
  if(!item||item.id!==SEED[i].id||ids.has(item.id)||!STATES.includes(item.state)||!Array.isArray(item.checked)||item.checked.length!==3||item.checked.some(x=>typeof x!=='boolean'))throw Error('Invalid demo item');
  if(typeof item.reviewer!=='string'||item.reviewer.length>40||typeof item.reason!=='string'||item.reason.length>300)throw Error('Invalid review fields');
  ids.add(item.id);
  if(item.state==='approved'&&(!item.checked.every(Boolean)||!item.reviewer.trim()))throw Error('Approved items require all checks and reviewer');
  if(item.state==='rejected'&&!item.reason.trim())throw Error('Rejected item requires reason');
  return item;
 });
}
function update(queue,id,action,payload={}){
 const curr=validate(queue),index=curr.findIndex(c=>c.id===id);
 if(index<0)throw Error('Unknown case');
 const item=curr[index];if(item.state==='approved'||item.state==='rejected')throw Error('Finalized case; reset demo to edit');
 const next={...item,checked:item.checked.slice()};
 if(action==='open'){if(item.state!=='new')throw Error('Already in review');next.state='review'}
 else if(action==='check'){if(item.state!=='review')throw Error('Case not in review');if(!Number.isInteger(payload.index)||payload.index<0||payload.index>2||typeof payload.value!=='boolean')throw Error('Invalid check');next.checked[payload.index]=payload.value}
 else if(action==='approve'){if(item.state!=='review'||!item.checked.every(Boolean))throw Error('Complete every check first');const reviewer=String(payload.reviewer||'').trim();if(!reviewer||reviewer.length>40)throw Error('Reviewer name required');next.state='approved';next.reviewer=reviewer}
 else if(action==='reject'){if(item.state!=='review')throw Error('Case not in review');const reason=String(payload.reason||'').trim();if(!reason||reason.length>300)throw Error('Reason required');next.state='rejected';next.reason=reason}
 else throw Error('Unknown action');
 return curr.map((c,i)=>i===index?next:c)
}
function stats(queue){const q=validate(queue);return {
 total:q.length,new:q.filter(x=>x.state==='new').length,review:q.filter(x=>x.state==='review').length,
 approved:q.filter(x=>x.state==='approved').length,rejected:q.filter(x=>x.state==='rejected').length,
 highRiskUnresolved:q.filter(x=>['high','critical'].includes(x.risk)&&!['approved','rejected'].includes(x.state)).length,
 sent:0
}}
function report(queue){const q=validate(queue),s=stats(q);return [
 'MKB AI STUDIO — FICTIEVE INBOX-PROEF / GEEN LIVE AI',
 'Totaal: '+s.total+' | Nieuw: '+s.new+' | Controle: '+s.review+' | Goedgekeurde concepten: '+s.approved+' | Escalaties: '+s.rejected,
 'Werkelijk verzonden: 0 (versturen is niet beschikbaar)',
 ...q.map(c=>[c.id,c.subject,'Categorie: '+c.category,'Status: '+c.state,'Risico: '+c.risk,'Checks: '+c.checked.filter(Boolean).length+'/3','Reviewer: '+(c.reviewer||'—'),'Escalatie: '+(c.reason||'—')].join(' | ')),
 'Alle gegevens zijn fictief. Goedkeuring is uitsluitend een simulatie en verzendt niets.'
 ].join('\n');
}
const api={SEED,create,validate,update,stats,report};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.MkbAiWorkflowDemo=api;
})(typeof window!=='undefined'?window:globalThis);