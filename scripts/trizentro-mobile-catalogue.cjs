function publicRace(e){
 if(!/^ra-\d{1,8}$/.test(e.id)||!e.name)return null;
 let url;try{url=new URL(e.officialEventUrl)}catch{return null}
 if(url.protocol!=='https:'||url.username||url.password)return null;
 const sport=/triat|duat|multi|run.bike.run/i.test([e.sport,e.discipline,e.name].join(' '))?'Triatlon':/fiets|wiel|gravel|mtb/i.test([e.sport,e.discipline].join(' '))?'Fietsen':/hardlop|run|trail|marathon/i.test([e.sport,e.discipline].join(' '))?'Hardlopen':'Overig';
 const date=e.dateEvidence==='official'&&/^\d{4}-\d{2}-\d{2}$/.test(e.date||'')?e.date:null;
 const slug=String(e.name).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,75)||'wedstrijd';
 return {id:e.id,name:String(e.name),place:String(e.place||''),country:String(e.country||''),sport,distance:String(e.distance||''),date,detail:'https://trizentro.com/events/wedstrijden/'+slug+'-'+e.id+'.html',official:url.href};
}

// A versioned, public-only feed. Never include user, tracking or registration credentials.
function makeCatalogue(list,now=new Date()){
 const events=list.map(publicRace).filter(Boolean);
 const unique=[...new Map(events.map(e=>[e.id,e])).values()];
 return {schemaVersion:1,generatedAt:now.toISOString(),asOf:now.toISOString().slice(0,10),events:unique};
}
function validateCatalogue(value){
 if(!value||value.schemaVersion!==1||!Array.isArray(value.events)||value.events.length===0||value.events.length>20000)return null;
 const time=Date.parse(value.generatedAt);
 if(!Number.isFinite(time)||new Date(time).toISOString()!==value.generatedAt||value.asOf!==value.generatedAt.slice(0,10)||time>Date.now()+86400000)return null;
 const ids=new Set(),events=[];
 for(const e of value.events){
  if(!e||!/^ra-\d{1,8}$/.test(e.id)||ids.has(e.id))return null;
  if(!['name','place','country','sport','distance','detail','official'].every(k=>typeof e[k]==='string'&&e[k].length<=1500)||!e.name||!['Hardlopen','Fietsen','Triatlon','Overig'].includes(e.sport))return null;
  if(e.date!==null&&!(typeof e.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(e.date)&&Number.isFinite(Date.parse(e.date))&&new Date(e.date).toISOString().slice(0,10)===e.date))return null;
  try{
   const detail=new URL(e.detail),official=new URL(e.official);
   if(detail.origin!=='https://trizentro.com'||detail.search||detail.hash||!new RegExp('^/events/wedstrijden/[a-z0-9-]+-'+e.id+'\\.html$').test(detail.pathname)||official.protocol!=='https:'||official.username||official.password)return null;
  }catch{return null}
  ids.add(e.id);events.push({id:e.id,name:e.name,place:e.place,country:e.country,sport:e.sport,distance:e.distance,date:e.date,detail:e.detail,official:e.official});
 }
 return {schemaVersion:1,generatedAt:value.generatedAt,asOf:value.asOf,events};
}
module.exports={publicRace,makeCatalogue,validateCatalogue};
