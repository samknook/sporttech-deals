/* TriZentro race sharing: native sharing where supported, safe copy fallback. */
(() => {
  'use strict';
  const button=document.getElementById('shareRace');
  const status=document.getElementById('shareRaceStatus');
  if(!button||!status)return;
  const original=button.textContent;
  const url=new URL(location.pathname,location.origin).href;
  const title=(document.querySelector('h1')?.textContent||'Wedstrijd op TriZentro').trim();
  async function fallback(){
    if(navigator.clipboard?.writeText){
      try{await navigator.clipboard.writeText(url);return true}catch{}
    }
    // Legacy browser: allow people to select and copy the full link.
    const field=document.createElement('input');
    field.value=url;field.readOnly=true;field.setAttribute('aria-label','Link naar deze wedstrijd');
    field.style.cssText='width:100%;max-width:440px;margin:8px 0;padding:10px;border:1px solid #cbd5dc;border-radius:8px';
    status.replaceChildren(field);field.select();field.focus();
    return false;
  }
  button.addEventListener('click',async()=>{
    button.disabled=true;
    try{
      if(typeof navigator.share==='function'){
        try{
          await navigator.share({title,text:'Bekijk deze wedstrijd op TriZentro',url});
          status.textContent='Wedstrijd gedeeld.';
          return;
        }catch(error){
          if(error?.name==='AbortError'){status.textContent='Delen geannuleerd.';return}
        }
      }
      const copied=await fallback();
      if(copied)status.textContent='Wedstrijdlink gekopieerd.';
      else status.append(document.createTextNode(' Selecteer en kopieer deze link.'));
    }finally{
      button.disabled=false;button.textContent=original;
    }
  });
})();
