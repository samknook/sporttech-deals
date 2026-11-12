/* Shared mobile navigation for public TriZentro pages except Events, which has its own functional toolbar. */
(()=>{'use strict';
const existing=document.querySelector('.raMobileNav');if(existing)return;
if(document.querySelector('.tz-mobile-destinations'))return;
const inEventsFolder=location.pathname.includes('/raceatlas/');
const root=inEventsFolder?'../':'';
const linkLang=()=>{const l=new URLSearchParams(location.search).get('lang');if(l==='en')return '?lang=en';try{return (localStorage.getItem('trizentro.language')||localStorage.getItem('raceatlas-language-v1'))==='en'?'?lang=en':''}catch{return ''}};
const suffix=linkLang(),url=(path,hash='')=>path+suffix+hash;
const nav=document.createElement('nav');
nav.className='tz-mobile-destinations';nav.setAttribute('aria-label','Snelle navigatie');
const items=[
 {text:'Events',en:'Events',icon:'⌕',href:url(root+'raceatlas/')},
 {text:'Mijn seizoen',en:'My season',icon:'☆',href:url(root+'raceatlas/','#mijn-seizoen')},
 {text:'Performance',en:'Performance',icon:'⚡',href:url(root+'performance.html'),active:!inEventsFolder}
];
const selected=new URLSearchParams(location.search).get('lang')||(()=>{try{return localStorage.getItem('trizentro.language')||localStorage.getItem('raceatlas-language-v1')||'nl'}catch{return 'nl'}})();
items.forEach(item=>{const a=document.createElement('a');a.href=item.href;a.innerHTML='<span aria-hidden="true">'+item.icon+'</span><span>'+((selected==='en')?item.en:item.text)+'</span>';if(item.active)a.setAttribute('aria-current','page');nav.append(a)});
document.body.append(nav);
})();
