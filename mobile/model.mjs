export function publicRace(e){
 if(!/^ra-\d{1,8}$/.test(e.id)||!e.name)return null;
 let url;try{url=new URL(e.officialEventUrl)}catch{return null}
 if(url.protocol!=='https:')return null;
 const sport=/triat|duat|multi|run.bike.run/i.test([e.sport,e.discipline,e.name].join(' '))?'Triatlon':/fiets|wiel|gravel|mtb/i.test([e.sport,e.discipline].join(' '))?'Fietsen':/hardlop|run|trail|marathon/i.test([e.sport,e.discipline].join(' '))?'Hardlopen':'Overig';
 const date=e.dateEvidence==='official'&&/^\d{4}-\d{2}-\d{2}$/.test(e.date||'')?e.date:null;
 const slug=String(e.name).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,75)||'wedstrijd';
 return {id:e.id,name:String(e.name),place:String(e.place||''),country:String(e.country||''),sport,distance:String(e.distance||''),date,detail:'https://trizentro.com/events/wedstrijden/'+slug+'-'+e.id+'.html',official:url.href};
}
export function selectRaces(events,{query='',sport='',savedOnly=false,saved=[],today=new Date().toISOString().slice(0,10)}={}){
 const q=query.trim().toLowerCase();
 const ids=new Set(saved);
 return events.filter(e=>(savedOnly?ids.has(e.id):(!e.date||e.date>=today))&&(!sport||e.sport===sport)&&(!q||[e.name,e.place,e.country,e.distance].join(' ').toLowerCase().includes(q))).sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999')||a.name.localeCompare(b.name,'nl'));
}
export function toggleRace(saved,id){
 if(!/^ra-\d{1,8}$/.test(id))return [...saved];
 return saved.includes(id)?saved.filter(x=>x!==id):[...saved,id];
}
