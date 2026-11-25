import catalogue from '../scripts/trizentro-mobile-catalogue.cjs';
export const {publicRace,makeCatalogue,validateCatalogue}=catalogue;
export function selectRaces(events,{query='',sport='',savedOnly=false,saved=[],today=new Date().toISOString().slice(0,10)}={}){
 const q=query.trim().toLowerCase();
 const ids=new Set(saved);
 return events.filter(e=>(savedOnly?ids.has(e.id):(!e.date||e.date>=today))&&(!sport||e.sport===sport)&&(!q||[e.name,e.place,e.country,e.distance].join(' ').toLowerCase().includes(q))).sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999')||a.name.localeCompare(b.name,'nl'));
}
export function toggleRace(saved,id){
 if(!/^ra-\d{1,8}$/.test(id))return [...saved];
 return saved.includes(id)?saved.filter(x=>x!==id):[...saved,id];
}
