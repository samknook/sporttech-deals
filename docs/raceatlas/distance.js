(() => {
'use strict';
const CITY_COORDS={"Amsterdam":[52.3676,4.9041],"Rotterdam":[51.924,4.478],"Utrecht":[52.0907,5.1214],"Den Haag":[52.0705,4.3007],"Haarlem":[52.3874,4.6462],"Alkmaar":[52.6324,4.7534],"Purmerend":[52.505,4.958],"Hoorn":[52.642,5.059],"Edam":[52.5125,5.048],"Volendam":[52.495,5.07],"Oosthuizen":[52.571,4.997],"Middelie":[52.534,5.018],"Warder":[52.565,5.028],"Jisp":[52.506,4.852],"Wormer":[52.498,4.818],"Wormerveer":[52.492,4.795],"Zaandam":[52.438,4.826],"Zaandijk":[52.474,4.806],"Zwaag":[52.668,5.073],"Blokker":[52.667,5.102],"Grootebroek":[52.698,5.218],"Enkhuizen":[52.704,5.291],"Medemblik":[52.772,5.105],"Wervershoof":[52.731,5.158],"Obdam":[52.675,4.905],"Spierdijk":[52.647,4.942],"Ursem":[52.629,4.891],"De Rijp":[52.556,4.844],"Beemster":[52.55,4.93],"Westbeemster":[52.579,4.888],"Landsmeer":[52.43,4.916],"Monnickendam":[52.458,5.037],"Marken":[52.458,5.107],"Broek in Waterland":[52.433,4.996],"Ilpendam":[52.464,4.953],"Katwoude":[52.47,5.05],"Kwadijk":[52.525,4.985],"Schoorl":[52.704,4.696],"Egmond aan Zee":[52.618,4.627],"Castricum":[52.55,4.66],"Heiloo":[52.602,4.708],"Schagen":[52.787,4.799],"Heerhugowaard":[52.664,4.838],"Langedijk":[52.7,4.8],"Anna Paulowna":[52.86,4.83],"Den Helder":[52.956,4.76],"Callantsoog":[52.845,4.696],"Texel":[53.085,4.8],"Den Burg":[53.055,4.797],"Den Hoorn":[53.03,4.752],"De Cocksdorp":[53.155,4.867],"Aalsmeer":[52.268,4.762],"Amstelveen":[52.306,4.863],"Uithoorn":[52.236,4.827],"Ouderkerk aan de Amstel":[52.295,4.905],"Hoofddorp":[52.302,4.688],"Zandvoort":[52.372,4.535],"IJmuiden":[52.458,4.626],"Wijk aan Zee":[52.494,4.596],"Santpoort-Noord":[52.43,4.632],"Overveen":[52.391,4.603],"Weesp":[52.307,5.041],"Nederhorst den Berg":[52.255,5.047],"Huizen":[52.299,5.241],"Bergen":[52.669,4.702],"Nieuwe Niedorp":[52.739,4.897],"t Veld":[52.745,4.864],"Leiden":[52.16,4.497],"Delft":[52.011,4.357],"Gouda":[52.011,4.71],"Alphen aan den Rijn":[52.129,4.662],"Nieuwkoop":[52.151,4.779],"Veenendaal":[52.026,5.555],"Amersfoort":[52.156,5.387],"Soest":[52.174,5.292],"Driebergen":[52.053,5.282],"Bunnik":[52.067,5.199],"Apeldoorn":[52.211,5.969],"Arnhem":[51.985,5.923],"Nijmegen":[51.842,5.852],"Wageningen":[51.969,5.666],"Ede":[52.043,5.665],"Epe":[52.348,5.985],"Zwolle":[52.512,6.094],"Almere":[52.35,5.264],"Lelystad":[52.518,5.472],"Emmeloord":[52.711,5.748],"Kraggenburg":[52.665,5.904],"Enschede":[52.221,6.894],"Hengelo":[52.266,6.793],"Oldenzaal":[52.311,6.929],"Almelo":[52.357,6.663],"Rijssen":[52.305,6.518],"Holten":[52.284,6.421],"Nijverdal":[52.361,6.46],"Markelo":[52.236,6.502],"Deventer":[52.255,6.164],"Doetinchem":[51.966,6.289],"Winterswijk":[51.972,6.719],"Groningen":[53.219,6.567],"Assen":[52.993,6.565],"Hoogeveen":[52.728,6.476],"Emmen":[52.786,6.895],"Leeuwarden":[53.2,5.8],"Dokkum":[53.323,5.996],"Sneek":[53.033,5.658],"Drachten":[53.112,6.1],"Burgum":[53.193,6.007],"Earnewâld":[53.131,5.941],"Stroe":[52.188,5.689],"Valkenburg":[50.865,5.831],"Maastricht":[50.852,5.69],"Sittard":[51,5.869],"Venlo":[51.37,6.173],"Roermond":[51.194,5.988],"Eindhoven":[51.441,5.469],"Tilburg":[51.556,5.091],"Breda":[51.587,4.776],"Den Bosch":[51.688,5.304],"Rosmalen":[51.717,5.375],"Oss":[51.763,5.519],"Uden":[51.66,5.615],"Boekel":[51.603,5.676],"Deurne":[51.462,5.797],"Helmond":[51.481,5.661],"Terneuzen":[51.335,3.827],"Hulst":[51.279,4.053],"Middelburg":[51.498,3.614],"Vlissingen":[51.442,3.573],"Goes":[51.504,3.892],"Zierikzee":[51.65,3.919],"Dordrecht":[51.813,4.691],"Gorinchem":[51.836,4.974],"Zaltbommel":[51.807,5.246],"Schoonhoven":[51.948,4.849],"Leerdam":[51.894,5.092],"Dronten":[52.524,5.719],"Zeewolde":[52.33,5.545],"Buren":[51.91,5.334],"Gendringen":[51.875,6.378],"Oostvoorne":[51.911,4.1],"Haren":[53.17,6.61],"Diever":[52.855,6.318],"Berg en Dal":[51.819,5.923],"Kampen":[52.555,5.911],"Lemmer":[52.847,5.709],"Wolvega":[52.875,5.997],"Burum":[53.271,6.228],"Jistrum":[53.212,6.066],"Surhuisterveen":[53.182,6.166],"Surhuizum":[53.203,6.184],"Warffum":[53.391,6.553],"Stiens":[53.26,5.759],"Steenwijk":[52.787,6.118],"Rhenoy":[51.876,5.157],"Staphorst":[52.645,6.211],"Overloon":[51.571,5.949],"Lonneker":[52.252,6.91],"Aalten":[51.924,6.582],"Tubbergen":[52.408,6.786],"Denekamp":[52.38,7.008],"Nutter nabij Vasse":[52.435,6.829],"Vasse":[52.434,6.834],"Gasselte":[52.972,6.796],"Oirschot":[51.505,5.313],"Oud Gastel":[51.586,4.459],"Tynaarlo":[53.073,6.622],"Renkum":[51.976,5.733],"Duisburg":[51.434,6.762],"Berlijn":[52.52,13.405],"Londen":[51.507,-0.128],"Gent":[51.054,3.718],"Brugge":[51.209,3.224],"Leuven":[50.879,4.7],"Brussel":[50.85,4.352],"Tokyo":[35.677,139.65],"New York":[40.713,-74.006],"Boston":[42.36,-71.059],"Chicago":[41.878,-87.63],"Sydney":[-33.868,151.209],"Kaapstad":[-33.924,18.424],"Nice":[43.7,7.27],"Frankfurt":[50.11,8.682],"Hamburg":[53.551,9.994],"Kopenhagen":[55.676,12.568],"Roth":[49.246,11.09]};
const clean=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const known={};for(const [name,coord] of Object.entries(CITY_COORDS))known[clean(name)]=coord;
const cache={};try{Object.assign(cache,JSON.parse(localStorage.getItem('raceatlas-geo-cache-v1')||'{}'))}catch{}
const state={origin:null,originName:'',radius:50,busy:false,unresolved:0,enabled:false};
const dist=(a,b)=>{const toRad=Math.PI/180;const dLat=(b[0]-a[0])*toRad,dLon=(b[1]-a[1])*toRad;const x=Math.sin(dLat/2)**2+Math.cos(a[0]*toRad)*Math.cos(b[0]*toRad)*Math.sin(dLon/2)**2;return 6371*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));};
const candidateName=e=>{let x=String(e.place||'').split(/\s+\/\s+|\s+[–—]\s+/)[0].trim();return x.replace(/^'t\s+/i,'t ')};
const eventCoord=e=>{if(Number.isFinite(e.lat)&&Number.isFinite(e.lon))return [e.lat,e.lon];const name=candidateName(e),key=clean(name);return known[key]||cache[key]||null};
async function geocode(name,country){const key=clean(name);if(known[key]||cache[key])return known[key]||cache[key];
 try{const params=new URLSearchParams({name:name,count:'8',language:'nl',format:'json'});const response=await fetch('https://geocoding-api.open-meteo.com/v1/search?'+params.toString());if(!response.ok)throw Error('Geocoder unavailable');const j=await response.json();const results=j.results||[];const country2=String(country||'').toLowerCase();const matches=results.filter(x=>!country2||x.country?.toLowerCase()===country2||((country2==='nederland')&&x.country_code==='NL'));const x=(matches[0]||(!country2?results[0]:null));if(!x)return null;const coords=[x.latitude,x.longitude];cache[key]=coords;try{localStorage.setItem('raceatlas-geo-cache-v1',JSON.stringify(cache))}catch{}return coords}catch{return null}}
function clearStatus(message){const s=document.getElementById('geoStatus');if(s)s.textContent=message}
function refresh(){if(typeof window.RaceAtlasRefresh==='function')window.RaceAtlasRefresh()}
function matches(e){if(!state.enabled)return true;const c=eventCoord(e);return !!(c&&state.origin&&dist(state.origin,c)<=state.radius)}
function km(e){const c=eventCoord(e);return state.origin&&c?Math.round(dist(state.origin,c)):null}
async function backgroundResolve(){
 if(state.busy)return;state.busy=true;
 const items=window.RACEATLAS_EVENTS||[],names=new Map();
 for(const e of items){if(eventCoord(e))continue;const name=candidateName(e),key=clean(name);if(!key||names.has(key))continue;names.set(key,{name,country:e.country})}
 const remaining=[...names.values()];
 if(!remaining.length){state.busy=false;refresh();clearStatus('Alle locaties met coördinaten zijn verwerkt.');return}
 clearStatus('Afstanden worden berekend. Voor '+remaining.length+' plaatsnamen zoeken we nog coördinaten…');
 let done=0;
 const batch=async()=>{
  while(remaining.length&&state.enabled){
   const x=remaining.shift();await geocode(x.name,x.country);done++;
   if(done%8===0){state.unresolved=items.filter(e=>!eventCoord(e)).length;refresh();clearStatus('Afstanden berekend voor '+done+' nieuwe plaatsnamen. '+state.unresolved+' evenementlocaties nog onbekend.')}
   await new Promise(resolve=>setTimeout(resolve,220));
  }
 };
 await Promise.all([batch(),batch()]);
 state.busy=false;state.unresolved=items.filter(e=>!eventCoord(e)).length;clearStatus('Hemelsbrede afstand vanaf '+state.originName+'. '+state.unresolved+' locaties nog niet te bepalen.');refresh();
}
async function setOriginByText(){
 const input=document.getElementById('geoPlace'),button=document.getElementById('geoSearch');const city=input.value.trim();
 if(!city){clearStatus('Vul eerst een plaats in.');return}
 button.disabled=true;clearStatus('Plaats wordt opgezocht…');
 let loc=known[clean(city)]||cache[clean(city)];
 if(!loc)loc=await geocode(city,'');
 button.disabled=false;
 if(!loc){clearStatus('Plaats niet gevonden. Probeer een andere plaatsnaam.');return}
 state.origin=loc;state.originName=city;state.enabled=true;state.radius=Number(document.getElementById('geoRadius').value);
 clearStatus('Afstand vanaf '+city+': maximaal '+state.radius+' km hemelsbreed.');refresh();backgroundResolve();
}
function setGps(){
 if(!navigator.geolocation){clearStatus('Locatiebepaling wordt niet ondersteund. Gebruik een plaatsnaam.');return}
 clearStatus('Je browser vraagt toestemming om je locatie te gebruiken…');
 navigator.geolocation.getCurrentPosition(p=>{
  state.origin=[p.coords.latitude,p.coords.longitude];state.originName='mijn locatie';state.enabled=true;state.radius=Number(document.getElementById('geoRadius').value);
  clearStatus('Afstand vanaf jouw locatie: maximaal '+state.radius+' km hemelsbreed.');refresh();backgroundResolve();
 },()=>clearStatus('Locatietoegang niet beschikbaar. Zoek op een plaatsnaam.'),{enableHighAccuracy:false,timeout:10000,maximumAge:300000})
}
function reset(){
 state.origin=null;state.enabled=false;state.originName='';document.getElementById('geoPlace').value='';clearStatus('Afstandsfilter uitgeschakeld.');refresh()
}
function init(){
 const host=document.querySelector('.toolbar');if(!host)return;
 const block=document.createElement('section');block.className='geoFilter';block.innerHTML='<div class="geoHeading"><strong>📍 Zoek evenementen bij jou in de buurt</strong><span>Afstand hemelsbreed, vanaf een plaats of je huidige locatie</span></div><div class="geoControls"><div class="geoCity"><label for="geoPlace">Plaats</label><input id="geoPlace" type="search" placeholder="Bijv. Utrecht, Rotterdam, Amsterdam" autocomplete="address-level2"></div><div><label for="geoRadius">Binnen straal</label><select id="geoRadius"><option value="10">10 km</option><option value="25">25 km</option><option value="50" selected>50 km</option><option value="75">75 km</option><option value="100">100 km</option><option value="150">150 km</option><option value="250">250 km</option><option value="500">500 km</option></select></div><button id="geoSearch" type="button">Zoek afstand</button><button id="geoGps" type="button" class="geoSub">Mijn locatie</button><button id="geoClear" type="button" class="geoSub">Wis afstand</button></div><p id="geoStatus" role="status">Kies een plaats en afstand. Evenementen zonder bekende coördinaten worden niet in de radiusresultaten getoond.</p>';
 host.append(block);
 document.getElementById('geoSearch').onclick=setOriginByText;
 document.getElementById('geoGps').onclick=setGps;
 document.getElementById('geoClear').onclick=reset;
 document.getElementById('geoPlace').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();setOriginByText()}});
 document.getElementById('geoRadius').onchange=()=>{state.radius=Number(document.getElementById('geoRadius').value);if(state.enabled){clearStatus('Afstand: '+state.radius+' km vanaf '+state.originName+'.');refresh()}};
}
const style=document.createElement('style');style.textContent='.geoFilter{border-top:1px solid #e3ede3;margin-top:19px;padding-top:19px}.geoHeading{display:flex;align-items:baseline;flex-wrap:wrap;gap:9px;margin-bottom:14px}.geoHeading strong{font-size:14px;color:#193f2e}.geoHeading span{font-size:12px;color:#6a7d71}.geoControls{display:grid;grid-template-columns:minmax(180px,2fr) 125px auto auto auto;gap:9px;align-items:end}.geoControls label{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#66786a;font-weight:800;display:block;margin-bottom:6px}.geoControls input,.geoControls select{height:42px;width:100%;padding:9px;border:1px solid #d4e0d4;background:#f8faf6;color:#172f25;border-radius:9px}.geoControls button{height:42px;padding:8px 12px;border-radius:9px;border:1px solid #173a2b;background:#183d2d;color:white;font-weight:800;white-space:nowrap}.geoControls button.geoSub{background:white;color:#28563a;border-color:#c5d9c9}.geoControls button:disabled{opacity:.5}#geoStatus{font-size:12px;color:#647b6a;line-height:1.4;margin:11px 0 0}@media(max-width:870px){.geoControls{grid-template-columns:1fr 130px}.geoControls button{width:100%}}@media(max-width:550px){.geoControls{grid-template-columns:1fr 1fr}.geoControls .geoCity{grid-column:span 2}.geoControls button{font-size:12px;padding:9px 7px}}';
 document.head.append(style);
 window.RaceAtlasRadius={matches,km,reset,get enabled(){return state.enabled},get originName(){return state.originName}};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();