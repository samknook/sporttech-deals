import catalogue from '../scripts/trizentro-mobile-catalogue.cjs';
export const {publicRace,makeCatalogue,validateCatalogue}=catalogue;
export function selectRaces(events,{query='',sport='',savedOnly=false,saved=[],today=localToday()}={}){
 const q=query.trim().toLowerCase();
 const ids=new Set(saved);
 return events.filter(e=>(savedOnly?ids.has(e.id):(!e.date||e.date>=today))&&(!sport||e.sport===sport)&&(!q||[e.name,e.place,e.country,e.distance].join(' ').toLowerCase().includes(q))).sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999')||a.name.localeCompare(b.name,'nl'));
}
export function toggleRace(saved,id){
 if(!/^ra-\d{1,8}$/.test(id))return [...saved];
 return saved.includes(id)?saved.filter(x=>x!==id):[...saved,id];
}

export function localToday(now=new Date()){
 return [now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
}
export function raceCountdown(events,saved,today=localToday()){
 const next=selectRaces(events,{savedOnly:true,saved,today}).find(e=>e.date&&e.date>=today);
 if(!next)return null;
 const days=Math.round((Date.parse(next.date)-Date.parse(today))/86400000);
 return {race:next,days};
}
export function seasonShareText(events,saved){
 const list=selectRaces(events,{savedOnly:true,saved});
 if(!list.length)return '';
 const lines=['Mijn wedstrijdseizoen op TriZentro 🏁'];
 for(const race of list.slice(0,8))lines.push(race.name+' — '+(race.date||'Datum nog niet bevestigd')+' · '+race.place,race.detail);
 if(list.length>8)lines.push('En nog '+(list.length-8)+' andere wedstrijden.');
 lines.push('Ontdek jouw volgende startlijn: https://trizentro.com/events/');
 return lines.join('\n');
}

export function radarStatus(e){
 const labels={mixed:'Beschikbaarheid verschilt per afstand',sold_out:'Uitverkocht volgens bron',link_available:'Directe inschrijflink beschikbaar',closed:'Inschrijving gesloten volgens bron',upcoming:'Inschrijving opent later',not_open:'Inschrijving opent later',open:'Inschrijving open volgens bron',on_site:'Controleer bij organisator',check:'Controleer bij organisator',window:'Inschrijfperiode bekend',unknown:'Inschrijfstatus onbekend'};
 return labels[e.registrationStatus]||labels.unknown;
}
export function radarRaces(events,watched){
 return selectRaces(events,{savedOnly:true,saved:watched}).sort((a,b)=>(a.registrationDate||'9999').localeCompare(b.registrationDate||'9999'));
}
