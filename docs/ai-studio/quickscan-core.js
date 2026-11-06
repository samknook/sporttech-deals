/* MKB AI Studio — client-process triage; transparent heuristic, not automated decision-making */
(function(root){'use strict';
const TYPES={
 inbox:{nl:'Klantmail en inbox',en:'Inbox and customer requests',sensitivity:2,automation:3},
 documents:{nl:'Documenten en gegevens overnemen',en:'Document processing',sensitivity:2,automation:3},
 finance:{nl:'Financiële verschillen en facturen',en:'Invoices and financial exceptions',sensitivity:3,automation:2},
 sales:{nl:'Offertes en verkoopopvolging',en:'Sales and quotations',sensitivity:2,automation:2},
 planning:{nl:'Planning en taakoverdracht',en:'Planning and work handoffs',sensitivity:1,automation:2}
};
function rank(entry){
 if(!entry||!TYPES[entry.type])throw Error('Select a valid workflow');
 const n=['volume','minutes','reviewMinutes','hourly'].map(k=>Number(entry[k]));
 if(n.some(x=>!Number.isFinite(x)||x<0)||n[0]>5000||n[1]>240||n[2]>240||n[3]>500)throw Error('Check your inputs');
 const [volume,minutes,reviewMinutes,hourly]=n;
 const monthly=volume*4.33,rawHours=monthly*(minutes-reviewMinutes)/60;
 const qualityRisk=TYPES[entry.type].sensitivity;
 const canSave=minutes>reviewMinutes;
 const hours=Math.max(0,rawHours);
 return {type:entry.type,label:TYPES[entry.type].nl,monthlyTasks:monthly,hours,capacityValue:hours*hourly,
  priority:!canSave||volume===0?'low':qualityRisk===3?'review-first':hours>=15?'high':hours>=5?'medium':'low',
  requiresReview:true,risk:qualityRisk,warning:'Indicatie, geen gemeten besparing. Valideer met een echte, toegestane pilot.'};
}
function report(entries){if(!Array.isArray(entries)||entries.length>20)throw Error('Max 20 workflows');const ranked=entries.map(rank).sort((a,b)=>b.hours-a.hours);
 return {ranked,totalHours:ranked.reduce((sum,x)=>sum+x.hours,0),totalValue:ranked.reduce((sum,x)=>sum+x.capacityValue,0)};
}
const api={TYPES,rank,report};if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.MkbAiQuickscan=api;
})(typeof window!=='undefined'?window:globalThis);