import catalogue from '../scripts/trizentro-mobile-catalogue.cjs';
export const {publicRace,makeCatalogue,validateCatalogue}=catalogue;
function normalizeSearch(value) {
 return value.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
}

export function selectRaces(events,{query='',sport='',confirmedOnly=false,savedOnly=false,saved=[],today=localToday()}={}){
 const terms=normalizeSearch(query).split(' ').filter(Boolean);
 const ids=new Set(saved);
 return events.filter(event=>{
  if(savedOnly?!ids.has(event.id):event.date&&event.date<today)return false;
  if((sport&&event.sport!==sport)||(confirmedOnly&&!event.date))return false;
  if(!terms.length)return true;
  const searchable=normalizeSearch([event.name,event.place,event.country,event.distance].join(' '));
  return terms.every(term=>searchable.includes(term));
 }).sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999')||a.name.localeCompare(b.name,'nl'));
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
export function sharedTriZentroUrl(url, campaign) {
 const link = new URL(url);
 link.searchParams.set('utm_source', 'trizentro_app');
 link.searchParams.set('utm_medium', 'share');
 link.searchParams.set('utm_campaign', campaign);
 return link.href;
}
export function seasonShareText(events,saved){
 const list=selectRaces(events,{savedOnly:true,saved});
 if(!list.length)return '';
 const lines=['Mijn wedstrijdseizoen op TriZentro 🏁'];
 for(const race of list.slice(0,8))lines.push(race.name+' — '+(race.date||'Datum nog niet bevestigd')+' · '+race.place,sharedTriZentroUrl(race.detail,'app_season_share'));
 if(list.length>8)lines.push('En nog '+(list.length-8)+' andere wedstrijden.');
 lines.push('Ontdek jouw volgende startlijn: '+sharedTriZentroUrl('https://trizentro.com/events/','app_season_share'));
 return lines.join('\n');
}

export function radarStatus(e){
 const labels={mixed:'Beschikbaarheid verschilt per afstand',sold_out:'Uitverkocht volgens bron',link_available:'Directe inschrijflink beschikbaar',closed:'Inschrijving gesloten volgens bron',upcoming:'Inschrijving opent later',not_open:'Inschrijving opent later',open:'Inschrijving open volgens bron',on_site:'Controleer bij organisator',check:'Controleer bij organisator',window:'Inschrijfperiode bekend',unknown:'Inschrijfstatus onbekend'};
 return labels[e.registrationStatus]||labels.unknown;
}
export function radarRaces(events,watched){
 return selectRaces(events,{savedOnly:true,saved:watched}).sort((a,b)=>(a.registrationDate||'9999').localeCompare(b.registrationDate||'9999'));
}
