/* Shared NL/EN control and cross-page language continuity for TriZentro Performance. */
(()=>{'use strict';
const key='trizentro.language',eventsKey='raceatlas-language-v1';
const links=document.querySelector('.tz-site-links');if(!links)return;
const org=links.querySelector('.tz-organizers');
const switcher=document.createElement('div');switcher.className='raLanguageSwitch';switcher.id='raLanguageSwitch';switcher.setAttribute('role','group');switcher.setAttribute('aria-label','Language / Taal');
for(const language of ['nl','en']){const b=document.createElement('button');b.type='button';b.dataset.language=language;b.textContent=language.toUpperCase();b.setAttribute('aria-label',language==='nl'?'Nederlands':'English');switcher.append(b)}
if(org)links.insertBefore(switcher,org);else links.append(switcher);
function getLang(){const explicit=new URLSearchParams(location.search).get('lang');if(['en','nl'].includes(explicit))return explicit;try{const l=localStorage.getItem(key)||localStorage.getItem(eventsKey);return l==='en'?'en':'nl'}catch{return 'nl'}}
const lang=getLang();
try{localStorage.setItem(key,lang);localStorage.setItem(eventsKey,lang)}catch{}
document.documentElement.lang=lang;
switcher.querySelectorAll('button').forEach(b=>{const current=b.dataset.language===lang;b.classList.toggle('active',current);b.setAttribute('aria-pressed',String(current));b.addEventListener('click',()=>{const next=b.dataset.language;try{localStorage.setItem(key,next);localStorage.setItem(eventsKey,next)}catch{}const url=new URL(location.href);url.searchParams.set('lang',next);location.assign(url.toString())})});
/* Apply the selected language to supported core calculators and newly added Performance pages. */
function localize(){if(window.TriZentroI18n){window.TriZentroI18n.translate();window.TriZentroI18n.decorateLinks()}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',localize,{once:true});else localize();
})();
