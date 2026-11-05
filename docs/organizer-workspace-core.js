/* TriZentro organizer workspace: offline checklist with strict imports */
(function(root){'use strict';
const KEY='trizentro.organizer.workspace.v1';
const TASKS=[
 ['source','Official source / Officiële bron'],
 ['schedule','Start waves and deadlines / Startgroepen en deadlines'],
 ['brief','Participant briefing / Deelnemersbriefing'],
 ['roster','Volunteer draft / Vrijwilligersrooster'],
 ['gaps','Staffing gaps reviewed / Tekorten beoordeeld'],
 ['review','Organizer final review / Eindcontrole organisator']
];
function empty(){return {version:1,event:'',date:'',source:'',tasks:Object.fromEntries(TASKS.map(([k])=>[k,false])),notes:''};}
function validate(input){
 if(!input||typeof input!=='object'||Array.isArray(input)||input.version!==1)throw Error('Invalid workspace version');
 const obj=empty();
 for(const [key,max] of [['event',100],['date',10],['source',500],['notes',1800]]){
  if(typeof input[key]!=='string'||input[key].length>max)throw Error('Invalid '+key);
  obj[key]=input[key];
 }
 if(obj.date&&!/^\d{4}-\d{2}-\d{2}$/.test(obj.date))throw Error('Invalid event date');
 if(obj.source){let u;try{u=new URL(obj.source)}catch(e){throw Error('Invalid source URL')}
  if(u.protocol!=='https:'||u.username||u.password)throw Error('Use an HTTPS source without credentials');
 }
 if(!input.tasks||typeof input.tasks!=='object'||Array.isArray(input.tasks))throw Error('Invalid tasks');
 for(const [id] of TASKS){if(typeof input.tasks[id]!=='boolean')throw Error('Invalid '+id);obj.tasks[id]=input.tasks[id]}
 return obj;
}
function progress(data){const d=validate(data),complete=TASKS.filter(([k])=>d.tasks[k]).length;
 const remaining=TASKS.filter(([k])=>!d.tasks[k]).map(([key,label])=>({key,label}));
 return {complete,total:TASKS.length,remaining,ready:complete===TASKS.length&&!!d.event.trim()&&!!d.date&&!!d.source};
}
function report(data,locale='nl'){const d=validate(data),p=progress(d),nl=locale!=='en';return [
 'TRIZENTRO EVENT OPERATIONS — '+(nl?'WERKOVERZICHT':'WORKSPACE SUMMARY'),
 (nl?'Evenement: ':'Event: ')+(d.event||'—'),
 (nl?'Datum: ':'Date: ')+(d.date||'—'),
 (nl?'Bron (zelf ingevoerd, niet geverifieerd): ':'Source (user supplied, not verified): ')+(d.source||'—'),
 (nl?'Afgerond: ':'Completed: ')+p.complete+'/'+p.total,
 ...TASKS.map(([id,label])=>(d.tasks[id]?'[x] ':'[ ] ')+label),
 (nl?'Notities: ':'Notes: ')+(d.notes||'—'),
 nl?'Geen officiële goedkeuring. De organisator controleert en publiceert zelf.':'Not an official approval. Organizer must review and publish.'
 ].join('\n')}
const api={KEY,TASKS,empty,validate,progress,report};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.TriZentroOrganizerWorkspace=api;
})(typeof window!=='undefined'?window:globalThis);
