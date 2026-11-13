/* Unified responsive navigation. Keeps Events' functional filter tabs intact. */
(()=>{'use strict';
const isEventsHome=!!document.querySelector('.raMobileNav');
const inEventsFolder=location.pathname.includes('/raceatlas/');
const prefix=location.pathname.includes('/raceatlas/wedstrijden/')?'../../':inEventsFolder?'../':'';
const language=()=>{const q=new URLSearchParams(location.search).get('lang');if(q==='nl'||q==='en')return q;try{return localStorage.getItem('trizentro.language')||localStorage.getItem('raceatlas-language-v1')||'nl'}catch{return 'nl'}};
const languageQuery=()=>language()==='en'?'?lang=en':'';
const href=(path,hash='')=>path+languageQuery()+hash;
const perf=location.pathname.includes('/performance.html')||location.pathname.includes('/calculator.html')||location.pathname.includes('/race-dashboard.html')||location.pathname.includes('/race-fuel-planner.html')||location.pathname.includes('/pace-calculator.html');
const destinations=[
 {nl:'Events',en:'Events',icon:'⌕',href:href(prefix+'raceatlas/'),active:isEventsHome},
 {nl:'Mijn seizoen',en:'My season',icon:'☆',href:href(prefix+'raceatlas/','#mijn-seizoen')},
 {nl:'Performance',en:'Performance',icon:'⚡',href:href(prefix+'performance.html'),active:perf},
 {nl:'Mijn account',en:'My account',icon:'♙',href:href(prefix+'raceatlas/','#mijn-account')},
 {nl:'Voor organisatoren',en:'For organizers',icon:'▤',href:href(prefix+'raceatlas/organisatoren.html'),active:location.pathname.includes('/organisatoren.html')}
];
const nav=document.querySelector('body>header>nav');
if(nav&&!isEventsHome){
 const links=nav.querySelector('.tz-site-links');
 if(links)links.replaceChildren();
 if(links)destinations.forEach(item=>{
  const a=document.createElement('a');a.href=item.href;a.textContent=language()==='en'?item.en:item.nl;
  if(item.active)a.setAttribute('aria-current','page');
  if(item.nl==='Voor organisatoren')a.className='tz-organizers';
  links.append(a);
 });
}
if(nav&&!nav.querySelector('.tz-menu-toggle')){
 const button=document.createElement('button');button.className='tz-menu-toggle';button.type='button';button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','tz-mobile-menu');button.setAttribute('aria-label',language()==='en'?'Open navigation menu':'Open navigatiemenu');
 button.innerHTML='<span class="tz-menu-glyph" aria-hidden="true">☰</span><span class="tz-menu-title">Menu</span>';
 const menu=document.createElement('div');menu.id='tz-mobile-menu';menu.className='tz-mobile-menu';menu.hidden=true;
 const heading=document.createElement('div');heading.className='tz-mobile-menu-heading';heading.textContent=language()==='en'?'Navigate':'Navigatie';menu.append(heading);
 destinations.forEach(item=>{const a=document.createElement('a');a.href=item.href;a.textContent=language()==='en'?item.en:item.nl;if(item.active)a.setAttribute('aria-current','page');menu.append(a)});
 nav.append(button,menu);
 const close=()=>{menu.hidden=true;button.setAttribute('aria-expanded','false');button.setAttribute('aria-label',language()==='en'?'Open navigation menu':'Open navigatiemenu')};
 button.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?(language()==='en'?'Close navigation menu':'Sluit navigatiemenu'):(language()==='en'?'Open navigation menu':'Open navigatiemenu'))});
 document.addEventListener('keydown',ev=>{if(ev.key==='Escape')close()});
 document.addEventListener('click',ev=>{if(!nav.contains(ev.target))close()});
 window.addEventListener('resize',()=>{if(innerWidth>700)close()});
}
if(!isEventsHome&&!document.querySelector('.tz-mobile-destinations')){
 const bottom=document.createElement('nav');bottom.className='tz-mobile-destinations';bottom.setAttribute('aria-label',language()==='en'?'Quick navigation':'Snelle navigatie');
 destinations.slice(0,3).forEach(item=>{const a=document.createElement('a');a.href=item.href;const glyph=document.createElement('span');glyph.setAttribute('aria-hidden','true');glyph.className='tz-tab-icon';glyph.textContent=item.icon;const text=document.createElement('span');text.className='tz-tab-label';text.textContent=language()==='en'?item.en:item.nl;a.append(glyph,text);if(item.active)a.setAttribute('aria-current','page');bottom.append(a)});
 document.body.append(bottom);
}
})();
