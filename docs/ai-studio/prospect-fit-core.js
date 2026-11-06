/* MKB AI Studio — prospect qualification and offer routing.
 * Browser-only. Never accepts names, addresses, email, phone or customer records.
 * Score reflects internal fit assumptions, not verified demand or a sales forecast.
 */
(function(root){'use strict';
const allowed={
 sector:['b2b-wholesale','b2b-service','accountancy','other'],
 volume:['under-20','20-74','75-plus'],
 repetition:['low','some','high'],
 sources:['none','manual','approved-digital'],
 reviewer:['no','yes'],
 integrations:['none','api','erp-write'],
 sensitive:['no','yes'],
 budget:['unknown','under-295','295-994','995-plus'],
 decision:['unknown','researcher','decision-maker']
};
function assess(x){
 if(!x||typeof x!=='object'||Array.isArray(x))throw Error('Invalid prospect');
 for(const [key,options] of Object.entries(allowed))if(!options.includes(x[key]))throw Error('Invalid input: '+key);
 const blockers=[];
 if(x.reviewer==='no')blockers.push('Geen medewerker voor inhoudelijke goedkeuring');
 if(x.sources==='none')blockers.push('Geen betrouwbare broninformatie');
 if(x.sensitive==='yes')blockers.push('Gevoelige data: privacy- en securityonderzoek vereist');
 if(x.integrations!=='none')blockers.push('API-/ERP-integraties vallen buiten standaard Starter');
 const score=([
 x.sector==='b2b-wholesale'?15:x.sector==='b2b-service'?12:x.sector==='accountancy'?8:4,
 x.volume==='75-plus'?20:x.volume==='20-74'?12:0,
 x.repetition==='high'?20:x.repetition==='some'?10:0,
 x.sources==='approved-digital'?15:x.sources==='manual'?5:0,
 x.reviewer==='yes'?10:0,
 x.budget==='995-plus'?10:x.budget==='295-994'?5:0,
 x.decision==='decision-maker'?10:x.decision==='researcher'?4:0
 ]).reduce((a,b)=>a+b,0);
 const fit=blockers.length?'review-required':score>=70?'starter-candidate':score>=40?'quickscan-candidate':'low-fit';
 const canOfferStandard=fit==='starter-candidate';
 return {score,fit,blockers,canOfferStandard,
  nextStep:fit==='starter-candidate'?'Plan een scopegesprek; verifieer uren, rechten en betalingsbereidheid':
  fit==='review-required'?'Bespreek blokkades; beloof geen vast Starter-tarief':
  fit==='quickscan-candidate'?'Onderzoek een betaalde QuickScan, pas na zakelijke gereedheid':
  'Onderzoek eerst of het proces echt urgent en herhalend is',
  prices:{quickscan:295,starter:995},
  actualCustomer:false,requestSent:false,productionApproved:false,
  note:'Score gebaseerd op interne aannames en door een gesprekgever gekozen categorieën. Niet gevalideerd op echte klanten.'};
}
function brief(result,code){
 const id=String(code||'DEMO-001').trim();
 if(!/^[A-Z0-9-]{3,24}$/.test(id))throw Error('Only anonymous codes permitted');
 return [
 'MKB AI Studio — prospectkwalificatie (lokaal, niet opgeslagen)',
 'Dossiercode: '+id,
 'Fit-score: '+result.score+'/100',
 'Route: '+result.fit,
 'Volgende stap: '+result.nextStep,
 'Aandachtspunten: '+(result.blockers.join('; ')||'Geen directe uitsluiting op basis van deze vragen'),
 'Richtprijzen: QuickScan €295 / Starter €995 excl. btw; geen bindende offerte',
 'Na scope- en compliancecontrole kan de onderneming een aparte overeenkomst overwegen.',
 'Er is geen klant geregistreerd, geen e-mail verstuurd en geen productie geactiveerd.',
 result.note
 ].join('\n');
}
const api={assess,brief};
if(typeof module==='object'&&module.exports)module.exports=api;
if(root)root.MkbAiProspectFit=api;
})(typeof window!=='undefined'?window:null);
