/* TriZentro shared navigation v2 — same destinations and behaviour on every page. */
(()=>{'use strict';
const nav=document.querySelector('body>header>nav');
if(!nav)return;
const events=document.getElementById('navExplore');
const isEvents=!!events;
const path=location.pathname;
// Base URL comes from this shared asset, so clean routes and project previews work.
const scriptUrl=document.currentScript?.src||Array.from(document.scripts).find(x=>/\/shared-ui\.js(?:\?|$)/.test(x.src))?.src||location.href;
const basePath=new URL('.',scriptUrl).pathname;
const root=basePath+'events/';
const seasonRoot=basePath+'seizoen/';
const accountRoot=basePath+'account/';
const performanceRoot=basePath+'performance/';
const organizerRoot=basePath+'organisatoren/';
const getLang=()=>{const queryLang=new URLSearchParams(location.search).get('lang');if(queryLang==='nl'||queryLang==='en')return queryLang;if(/\/en\.html$/.test(path))return 'en';try{return localStorage.getItem('trizentro.language')||localStorage.getItem('raceatlas-language-v1')||'nl'}catch{return 'nl'}};
const tr=(nl,en)=>getLang()==='en'?en:nl;
const link=(p,hash='')=>p+(getLang()==='en'?'?lang=en':'')+hash;
const isOrganizer=path.includes('/organisatoren.html')||/\/organisatoren\/?$/.test(path);
const isPerformance=/\/performance\/?$/.test(path)||/\/(performance|calculator|triathlon-calculator|pace-calculator|race-dashboard|race-fuel-planner|race-planner|70-3-raceplan|70-3-readiness-check|70-3-eindtijd-calculator|goal-feasibility|race-day-timeline|triatlon-afstanden|first-70-3-race-week-checklist)\.html$/.test(path);
const isSeason=(isEvents&&['#mijn-seizoen','#saved'].includes(location.hash))||/\/seizoen\/?$/.test(path);
const isAccount=/\/account\/?$/.test(path)||location.hash==='#mijn-account';
const items=[
 {id:'events',nl:'Events',en:'Events',icon:'⌕',url:link(root),active:isEvents&&!isSeason},
 {id:'season',nl:'Mijn seizoen',en:'My season',icon:'☆',url:link(seasonRoot),active:isSeason},
 {id:'performance',nl:'Performance',en:'Performance',icon:'⚡',url:link(performanceRoot),active:isPerformance},
 {id:'account',nl:'Mijn account',en:'My account',icon:'♙',url:link(accountRoot),active:isAccount},
 {id:'organizers',nl:'Voor organisatoren',en:'For organizers',icon:'▤',url:link(organizerRoot),active:isOrganizer}
];
// Normalize the actual HTML classes, not just the appearance. Events still
// keeps its functional buttons; the other pages share precisely the same shell.
const siteHeader=nav.parentElement;
siteHeader.classList.add('tz-site-header');
nav.classList.add('tz-site-nav');
const brand=nav.querySelector('.brand,.tz-site-brand');
if(brand){brand.classList.add('tz-site-brand');brand.href=root;}
const desktop=nav.querySelector('.navright,.tz-site-links');
if(desktop)desktop.classList.add('tz-site-links');

const current=(id)=>id==='events'?document.getElementById('navExplore'):id==='season'?document.getElementById('navSaved'):null;
const savedCount=()=>{try{const ids=JSON.parse(localStorage.getItem('raceatlas-saved-v2')||'[]');return Array.isArray(ids)?ids.length:0}catch{return 0}};
const seasonText=()=>tr('Mijn seizoen','My season')+(savedCount()?' · '+savedCount():'');
const makeAnchor=item=>{
 const a=document.createElement('a');a.href=item.url;a.textContent=item.id==='season'?seasonText():tr(item.nl,item.en);a.dataset.tzDestination=item.id;
 if(item.active)a.setAttribute('aria-current','page');
 if(item.id==='organizers')a.className=isEvents?'organizerNav':'tz-organizers';
 return a;
};
if(desktop){
 const preservedLanguage=Array.from(document.querySelectorAll('body>header #raLanguageSwitch,body>header .raLanguageSwitch')).filter((el,i,arr)=>arr.indexOf(el)===i);
 const nodes=items.map(item=>{
  const existing=isEvents?current(item.id):null;
  if(!existing)return makeAnchor(item);
  existing.dataset.tzDestination=item.id;
  if(item.id==='events'||item.id==='season'){
    existing.textContent=tr(item.nl,item.en);
    if(item.id==='season'){
      const badge=document.createElement('span');badge.id='savedCount';
      badge.textContent=window.RaceAtlasSaved?.get()?.length??'0';
      existing.append(' · ',badge);
    }
  }else if(item.id==='account')existing.textContent=tr(item.nl,item.en);
  return existing;
 });
 desktop.replaceChildren(...nodes);
 const controls=document.createElement('div');controls.className='tz-header-controls';
 controls.append(...preservedLanguage);
 // Standalone account screen does not load the legacy translation switch.
 if(document.body.classList.contains('tz-account-page')&&!preservedLanguage.length){
  const languages=document.createElement('div');languages.id='raLanguageSwitch';
  languages.className='raLanguageSwitch';languages.setAttribute('role','group');
  languages.setAttribute('aria-label','Language / Taal');
  for(const code of ['nl','en']){
   const b=document.createElement('button');b.type='button';b.textContent=code.toUpperCase();
   b.dataset.language=code;b.classList.toggle('active',getLang()===code);
   b.setAttribute('aria-pressed',String(getLang()===code));
   b.addEventListener('click',()=>{
    try{localStorage.setItem('trizentro.language',code);localStorage.setItem('raceatlas-language-v1',code)}catch{}
    const target=new URL(location.href);target.searchParams.set('lang',code);location.assign(target.toString());
   });
   languages.append(b);
  }
  controls.append(languages);
 }
 nav.append(controls);
 window.__tzHeaderControls=controls;
}
const navigateLocal=id=>{
 if(!isEvents)return false;
 if(id==='events'){if(!/\/events\/?$/.test(path))return false;document.getElementById('navExplore')?.click();return true}
 if(id==='season'){if(!/\/seizoen\/?$/.test(path))return false;document.getElementById('navSaved')?.click();return true}
 if(id==='account'){
  if(!/\/account\/?$/.test(path))return false;
  const account=document.getElementById('raAccountNav');
  if(account){account.click();return true}
  document.getElementById('navSaved')?.click();
  document.querySelector('#raAccount,#raSeasonBackup')?.scrollIntoView({behavior:'smooth',block:'start'});
  return true;
 }
 return false;
};
const updateSeasonCounts=()=>{
 for(const a of document.querySelectorAll('a[data-tz-destination="season"]')){
   const label=a.querySelector('.tz-tab-label');
   if(label)label.textContent=seasonText();else a.textContent=seasonText();
 }
};
window.addEventListener('storage',event=>{if(event.key==='raceatlas-saved-v2')updateSeasonCounts()});
document.addEventListener('click',event=>{if(event.target.closest('#saveRace'))requestAnimationFrame(updateSeasonCounts)});
const updateSelected=()=>{
 const saved=isEvents&&document.getElementById('navSaved')?.classList.contains('current');
 for(const el of nav.querySelectorAll('[data-tz-destination]')){
  const id=el.dataset.tzDestination;
  const active=isEvents?(id==='account'?isAccount:id==='season'?saved&&!isAccount:id==='events'?!saved&&!isAccount:false):!!items.find(x=>x.id===id)?.active;
  if(active)el.setAttribute('aria-current','page');
  else el.removeAttribute('aria-current');
 }
 for(const el of document.querySelectorAll('.tz-mobile-destinations [data-tz-destination]')){
  const id=el.dataset.tzDestination,active=isEvents?(id==='season'?saved:id==='events'?!saved:false):!!items.find(x=>x.id===id)?.active;
  if(active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');
 }
};
const menuButton=document.createElement('button');menuButton.className='tz-menu-toggle';menuButton.type='button';menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-controls','tz-mobile-menu');menuButton.setAttribute('aria-label',tr('Open navigatiemenu','Open navigation menu'));
menuButton.innerHTML='<span class="tz-menu-glyph" aria-hidden="true">☰</span><span class="tz-menu-title">Menu</span>';
const menu=document.createElement('div');menu.id='tz-mobile-menu';menu.className='tz-mobile-menu';menu.hidden=true;
const heading=document.createElement('div');heading.className='tz-mobile-menu-heading';heading.textContent=tr('Navigatie','Navigation');menu.append(heading);
items.forEach(item=>{
 const a=makeAnchor(item);a.addEventListener('click',ev=>{if(navigateLocal(item.id)){ev.preventDefault();updateSelected()}close()});menu.append(a);
});
(window.__tzHeaderControls||nav).append(menuButton);
nav.append(menu);
// RaceAtlas i18n may create the language control on DOMContentLoaded,
// after this deferred script. Relocate it into the shared header once ready.
function reconcileLanguageControl(){
 const controls=window.__tzHeaderControls;
 if(!controls)return;
 const switches=Array.from(document.querySelectorAll('body>header #raLanguageSwitch,body>header .raLanguageSwitch'));
 for(const el of switches){
  if(el.parentElement!==controls)controls.prepend(el);
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',reconcileLanguageControl);
else reconcileLanguageControl();
function close(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label',tr('Open navigatiemenu','Open navigation menu'))}
menuButton.addEventListener('click',()=>{
 const willOpen=menu.hidden;menu.hidden=!willOpen;menuButton.setAttribute('aria-expanded',String(willOpen));
 menuButton.setAttribute('aria-label',willOpen?tr('Sluit navigatiemenu','Close navigation menu'):tr('Open navigatiemenu','Open navigation menu'));
});
document.addEventListener('keydown',event=>{if(event.key==='Escape')close()});
document.addEventListener('click',event=>{if(!nav.contains(event.target))close()});
window.addEventListener('resize',()=>{if(innerWidth>900)close()});
if(isEvents){
 desktop?.addEventListener('click',e=>{
  const target=e.target.closest('[data-tz-destination]');if(!target)return;
  const id=target.dataset.tzDestination;
  if(target.tagName==='A'&&navigateLocal(id)){e.preventDefault();updateSelected();return}
  if(target.tagName==='BUTTON'&&['events','season','account'].includes(id)){
   const destination=items.find(item=>item.id===id)?.url;
   if(destination&&!navigateLocal(id)){location.assign(destination);return}
  }
  requestAnimationFrame(updateSelected);
 });
}
const existingBottom=document.querySelector('.tz-mobile-destinations');
existingBottom?.remove();
{
const bottom=document.createElement('nav');bottom.className='tz-mobile-destinations';bottom.setAttribute('aria-label',tr('Snelle navigatie','Quick navigation'));
for(const item of items.slice(0,3)){
 const a=makeAnchor(item);
 const glyph=document.createElement('span');glyph.className='tz-tab-icon';glyph.setAttribute('aria-hidden','true');glyph.textContent=item.icon;
 const name=document.createElement('span');name.className='tz-tab-label';name.textContent=tr(item.nl,item.en);
 a.replaceChildren(glyph,name);
 a.addEventListener('click',e=>{if(navigateLocal(item.id)){e.preventDefault();updateSelected()}});
 bottom.append(a);
}
document.body.append(bottom);
}
if(isEvents){
 for(const id of ['navExplore','navSaved']){
  document.getElementById(id)?.addEventListener('click',()=>requestAnimationFrame(updateSelected));
 }
}

// Shared wayfinding and footer: visitors can move between discovery, season and preparation
// without encountering independent product silos.
const footerLinks=document.createElement('nav');
footerLinks.className='tz-platform-links';
footerLinks.setAttribute('aria-label',tr('TriZentro onderdelen','TriZentro sections'));
for(const item of items){
 const a=document.createElement('a');
 a.href=item.url;a.textContent=tr(item.nl,item.en);
 footerLinks.append(a);
}
const footerHost=document.querySelector('body>footer,body .foot,body .tz-footer');
if(footerHost){footerHost.append(footerLinks);}
else{
 const footer=document.createElement('footer');footer.className='tz-global-footer';
 const name=document.createElement('strong');name.textContent='TriZentro';
 const summary=document.createElement('span');summary.textContent=tr('Ontdek. Plan. Race.','Discover. Plan. Race.');
 footer.append(name,summary,footerLinks);document.body.append(footer);
}

// Clean season/account routes reuse the Events engine and open the correct view.
if(isEvents){
 if(isAccount)navigateLocal('account');
 else if(isSeason)navigateLocal('season');
}
// Language is a live state, not a one-time translation of newly inserted links.
// The RaceAtlas translator changes history + emits this event without reloading.
const updatePlatformLanguage=()=>{
 const language=getLang();
 document.documentElement.lang=language;
 for(const el of document.querySelectorAll('[data-tz-destination]')){
  const id=el.dataset.tzDestination,item=items.find(x=>x.id===id);
  if(!item)continue;
  el.href&&(el.href=link(id==='events'?root:id==='season'?seasonRoot:id==='performance'?performanceRoot:id==='account'?accountRoot:organizerRoot));
  const translated=tr(item.nl,item.en);
  const label=el.querySelector('.tz-tab-label');
  if(label)label.textContent=translated;
  else if(el.tagName==='A'||el.tagName==='BUTTON'){
   if(id==='season'&&el.querySelector('#savedCount')){
    const badge=el.querySelector('#savedCount');
    el.replaceChildren(document.createTextNode(translated+' · '),badge);
   }else el.textContent=id==='season'?seasonText():translated;
  }
 }
 for(let i=0;i<items.length;i++){
  const el=footerLinks.children[i],item=items[i];
  if(el&&item){el.textContent=tr(item.nl,item.en);
   el.href=link(item.id==='events'?root:item.id==='season'?seasonRoot:item.id==='performance'?performanceRoot:item.id==='account'?accountRoot:organizerRoot)}
 }
 heading.textContent=tr('Navigatie','Navigation');
 menuButton.setAttribute('aria-label',menu.hidden?tr('Open navigatiemenu','Open navigation menu'):tr('Sluit navigatiemenu','Close navigation menu'));
 document.querySelector('.tz-mobile-destinations')?.setAttribute('aria-label',tr('Snelle navigatie','Quick navigation'));
 footerLinks.setAttribute('aria-label',tr('TriZentro onderdelen','TriZentro sections'));
 for(const button of nav.querySelectorAll('#raLanguageSwitch button')){
  const code=button.dataset.language;
  button.classList.toggle('active',code===language);
  button.setAttribute('aria-pressed',String(code===language));
 }
 updateSelected();
};
window.addEventListener('raceatlas:languagechange',updatePlatformLanguage);
updatePlatformLanguage();
})();