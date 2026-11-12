/* Thumb-first event discovery enhancements. Reuses the existing sport filter and render pipeline. */
(()=>{'use strict';
const select=document.getElementById('sport');
const filters=document.querySelector('#explore .primaryFilters');
if(!select||!filters||document.getElementById('tz-mobile-sport-filters'))return;
const strip=document.createElement('div');strip.id='tz-mobile-sport-filters';strip.className='tz-mobile-sports';
strip.setAttribute('role','group');strip.setAttribute('aria-label','Filter evenementen op sport');
const types=[
 {value:'',nl:'Alle',en:'All',icon:'✦'},
 {value:'Hardlopen',nl:'Hardlopen',en:'Running',icon:'🏃'},
 {value:'Fietsen',nl:'Wielrennen',en:'Cycling',icon:'🚴'},
 {value:'Triatlon',nl:'Triatlon',en:'Triathlon',icon:'🏊'}
];
const getLanguage=()=>{const q=new URLSearchParams(location.search).get('lang');if(q==='en'||q==='nl')return q;try{return localStorage.getItem('trizentro.language')||localStorage.getItem('raceatlas-language-v1')||'nl'}catch{return 'nl'}};
for(const item of types){
 const b=document.createElement('button');b.type='button';b.className='tz-mobile-sport';b.dataset.sport=item.value;b.setAttribute('aria-pressed','false');
 const ico=document.createElement('span');ico.setAttribute('aria-hidden','true');ico.textContent=item.icon;const label=document.createElement('span');label.textContent=getLanguage()==='en'?item.en:item.nl;
 b.append(ico,label);strip.append(b);
 b.addEventListener('click',()=>{
   const all=document.querySelector('.quick [data-quick="all"]');
   if(all&& !all.classList.contains('on'))all.click();
   select.value=item.value;
   select.dispatchEvent(new Event('change',{bubbles:true}));
   sync();
 });
}
filters.parentNode.insertBefore(strip,filters);
function sync(){strip.querySelectorAll('button').forEach(b=>{const current=b.dataset.sport===select.value;b.classList.toggle('selected',current);b.setAttribute('aria-pressed',String(current))})}
select.addEventListener('change',sync);
document.getElementById('reset')?.addEventListener('click',()=>queueMicrotask(sync));
window.addEventListener('popstate',sync);
sync();
})();
