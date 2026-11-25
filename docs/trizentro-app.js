/* Optional install affordance. No push permission prompts or tracking. */
(()=>{
'use strict';
if(!('serviceWorker' in navigator)||!window.isSecureContext)return;
let promptEvent=null;
let button=null,status=null;
const installed=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const ios=/iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const english=()=>document.documentElement.lang==='en';
function refresh(){
 if(!button)return;
 button.hidden=installed()||(!promptEvent&&!ios);
 button.textContent=english()?'Install TriZentro':'Installeer TriZentro';
}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();promptEvent=e;refresh()});
window.addEventListener('appinstalled',()=>{promptEvent=null;refresh();if(status)status.textContent=english()?'TriZentro installed.':'TriZentro geïnstalleerd.'});
window.addEventListener('raceatlas:languagechange',refresh);
async function start(){
 try{await navigator.serviceWorker.register('/trizentro-sw.js',{scope:'/'})}catch(e){return}
 const host=document.querySelector('.foot')||document.querySelector('footer')||document.querySelector('main');
 if(!host)return;
 const area=document.createElement('div');area.className='tz-app-install';
 button=document.createElement('button');button.type='button';button.hidden=true;
 button.style.cssText='border:1px solid #8ba8ad;border-radius:10px;background:#102b32;color:white;padding:11px 16px;min-height:44px;font:inherit;font-weight:800;cursor:pointer';
 status=document.createElement('p');status.setAttribute('role','status');status.style.cssText='max-width:460px;margin:8px auto 0;font-size:13px;line-height:1.5';
 button.addEventListener('click',async()=>{
  if(promptEvent){const pending=promptEvent;promptEvent=null;try{await pending.prompt();const result=await pending.userChoice;status.textContent=result.outcome==='accepted'?(english()?'Installation requested.':'Installatie aangevraagd.'):''}catch{}refresh();return}
  if(ios)status.textContent=english()?'Open Safari, tap Share, then Add to Home Screen.':'Open Safari, tik op Deel en kies Zet op beginscherm.';
 });
 area.append(button,status);host.append(area);area.style.cssText='margin:12px auto;text-align:center';refresh();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
