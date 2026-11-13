/* TriZentro shared navigation v2 — same destinations and behaviour on every page. */
(()=>{'use strict';
const nav=document.querySelector('body>header>nav');
if(!nav)return;
const events=document.getElementById('navExplore');
const isEvents=!!events;
const path=location.pathname;
const inRace=path.includes('/raceatlas/');
const prefix=path.includes('/raceatlas/wedstrijden/')?'../../':inRace?'../':'';
const root=prefix+'raceatlas/';
const queryLang=new URLSearchParams(location.search).get('lang');
const getLang=()=>{if(queryLang==='nl'||queryLang==='en')return queryLang;try{return localStorage.getItem('trizentro.language')||localStorage.getItem('raceatlas-language-v1')||'nl'}catch{return 'nl'}};
const tr=(nl,en)=>getLang()==='en'?en:nl;
const link=(p,hash='')=>p+(getLang()==='en'?'?lang=en':'')+hash;
const isOrganizer=path.includes('/organisatoren.html');
const isPerformance=/\/(performance|calculator|triathlon-calculator|pace-calculator|race-dashboard|race-fuel-planner)\.html$/.test(path);
const isSeason=isEvents&&location.hash==='#mijn-seizoen';
const items=[
 {id:'events',nl:'Events',en:'Events',icon:'⌕',url:link(root),active:isEvents&&!isSeason},
 {id:'season',nl:'Mijn seizoen',en:'My season',icon:'☆',url:link(root,'#mijn-seizoen'),active:isSeason},
 {id:'performance',nl:'Performance',en:'Performance',icon:'⚡',url:link(prefix+'performance.html'),active:isPerformance},
 {id:'account',nl:'Mijn account',en:'My account',icon:'♙',url:link(root,'#mijn-account')},
 {id:'organizers',nl:'Voor organisatoren',en:'For organizers',icon:'▤',url:link(root+'organisatoren.html'),active:isOrganizer}
];
const desktop=nav.querySelector('.navright,.tz-site-links');
const current=(id)=>id==='events'?document.getElementById('navExplore'):id==='season'?document.getElementById('navSaved'):id==='account'?document.getElementById('raAccountNav'):null;
const makeAnchor=item=>{
 const a=document.createElement('a');a.href=item.url;a.textContent=tr(item.nl,item.en);a.dataset.tzDestination=item.id;
 if(item.active)a.setAttribute('aria-current','page');
 if(item.id==='organizers')a.className=isEvents?'organizerNav':'tz-organizers';
 return a;
};
if(desktop){
 const preservedLanguage=Array.from(desktop.children).filter(el=>el.id==='raLanguageSwitch'||el.classList.contains('raLanguageSwitch'));
 const nodes=items.map(item=>{
  const existing=isEvents?current(item.id):null;
  if(!existing)return makeAnchor(item);
  existing.dataset.tzDestination=item.id;
  if(item.id==='events'||item.id==='season'){
    existing.textContent=tr(item.nl,item.en);
    if(item.id==='season'){
      const badge=document.createElement('span');badge.id='savedCount';
      badge.textContent=window.RaceAtlasSaved?.get()?.length??'0';
      existing.append(' ',badge);
    }
  }else if(item.id==='account')existing.textContent=tr(item.nl,item.en);
  return existing;
 });
 desktop.replaceChildren(...nodes,...preservedLanguage);
}
const navigateLocal=id=>{
 if(!isEvents)return false;
 if(id==='events'){document.getElementById('navExplore')?.click();history.replaceState(null,'',location.pathname+location.search);return true}
 if(id==='season'){document.getElementById('navSaved')?.click();history.replaceState(null,'',location.pathname+location.search+'#mijn-seizoen');return true}
 if(id==='account'){
  const account=document.getElementById('raAccountNav');
  if(account){account.click();history.replaceState(null,'',location.pathname+location.search+'#mijn-account');return true}
  document.getElementById('navSaved')?.click();
  history.replaceState(null,'',location.pathname+location.search+'#mijn-account');
  document.querySelector('#raAccount,#raSeasonBackup')?.scrollIntoView({behavior:'smooth',block:'start'});
  return true;
 }
 return false;
};
const updateSelected=()=>{
 const saved=isEvents&&document.getElementById('navSaved')?.classList.contains('current');
 for(const el of nav.querySelectorAll('[data-tz-destination]')){
  const id=el.dataset.tzDestination;
  const active=isEvents?(id==='season'?saved:id==='events'?!saved:false):!!items.find(x=>x.id===id)?.active;
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
nav.append(menuButton,menu);
function close(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label',tr('Open navigatiemenu','Open navigation menu'))}
menuButton.addEventListener('click',()=>{
 const willOpen=menu.hidden;menu.hidden=!willOpen;menuButton.setAttribute('aria-expanded',String(willOpen));
 menuButton.setAttribute('aria-label',willOpen?tr('Sluit navigatiemenu','Close navigation menu'):tr('Open navigatiemenu','Open navigation menu'));
});
document.addEventListener('keydown',event=>{if(event.key==='Escape')close()});
document.addEventListener('click',event=>{if(!nav.contains(event.target))close()});
window.addEventListener('resize',()=>{if(innerWidth>700)close()});
if(isEvents){
 desktop?.addEventListener('click',e=>{const target=e.target.closest('[data-tz-destination]');if(!target)return;if(target.tagName==='A'&&navigateLocal(target.dataset.tzDestination)){e.preventDefault();updateSelected()}else requestAnimationFrame(updateSelected)});
}
const existingBottom=document.querySelector('.tz-mobile-destinations');
existingBottom?.remove();
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
if(isEvents){
 for(const id of ['navExplore','navSaved']){
  document.getElementById(id)?.addEventListener('click',()=>requestAnimationFrame(updateSelected));
 }
}
updateSelected();
})();