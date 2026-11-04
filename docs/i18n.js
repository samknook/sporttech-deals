/* TriZentro bilingual switcher — offline and privacy-preserving.
 * Translations are bundled with the site, no third-party translation requests.
 * The URL language parameter takes precedence over the stored choice.
 */
(function(root){
'use strict';
const KEY='trizentro.language';
const params=new URLSearchParams(root.location.search);
const explicit=params.get('lang');
let stored=null;
try{stored=root.localStorage.getItem(KEY)}catch(e){}
const current=(explicit==='nl'||explicit==='en')?explicit:(stored==='nl'||stored==='en'?stored:'nl');
try{root.localStorage.setItem(KEY,current)}catch(e){}
const page=decodeURIComponent(root.location.pathname.split('/').pop()||'index.html');
const native=(root.document.documentElement.getAttribute('lang')||'nl').slice(0,2);
root.document.documentElement.lang=current;
const T=root.TriZentroTranslations||{};
const dict=(T[page]||{})[current]||{};
const common=(T.common||{})[current]||{};
const lastRendered=new WeakMap();
function translateNode(n){
 if(!n||n.nodeType!==3||!n.parentElement||n.parentElement.closest('script,style,noscript,code,pre,textarea,[data-no-translate],.tz-navigation'))return;
 const original=n.nodeValue;
 if(lastRendered.get(n)===original)return;
 const trimmed=original.trim();
 if(!trimmed)return;
 const translation=Object.prototype.hasOwnProperty.call(dict,trimmed)?dict[trimmed]:common[trimmed];
 if(typeof translation==='string'&&translation!==trimmed){
  const next=original.replace(trimmed,translation);
  lastRendered.set(n,next);
  n.nodeValue=next;
 }
}
function translate(){
 const walker=root.document.createTreeWalker(root.document.body,NodeFilter.SHOW_TEXT);
 const nodes=[];
 while(walker.nextNode())nodes.push(walker.currentNode);
 for(const n of nodes)translateNode(n);
 for(const el of root.document.querySelectorAll('[placeholder],[aria-label],[title]')){
  if(el.closest('.tz-navigation'))continue;
  for(const attr of ['placeholder','aria-label','title']){
   const val=el.getAttribute(attr);
   if(val&&Object.prototype.hasOwnProperty.call(dict,val))el.setAttribute(attr,dict[val]);
   else if(val&&Object.prototype.hasOwnProperty.call(common,val))el.setAttribute(attr,common[val]);
  }
 }
 const label=(T.pageTitles||{})[page];
 if(label&&label[current])root.document.title=label[current]+' | TriZentro';
}
const originalLinks=()=>root.document.querySelectorAll('a[href]');
function decorateLinks(){
 for(const a of originalLinks()){
  if(a.closest('.tz-navigation'))continue;
  const href=a.getAttribute('href');
  if(!href||href[0]==='#'||/^(?:https?:|mailto:|tel:|javascript:|data:)/i.test(href))continue;
  try{
    const url=new URL(href,root.location.href);
    if(url.origin!==root.location.origin||!(/\.html?$/.test(url.pathname)||url.pathname.endsWith('/')))continue;
    url.searchParams.set('lang',current);
    a.setAttribute('href',url.pathname.replace(root.location.pathname.slice(0,root.location.pathname.lastIndexOf('/')+1),'')+url.search+url.hash);
  }catch(e){}
 }
}
function switchLanguage(lang){
 if(lang!=='nl'&&lang!=='en')return;
 try{root.localStorage.setItem(KEY,lang)}catch(e){}
 const u=new URL(root.location.href);
 u.searchParams.set('lang',lang);
 root.location.assign(u.toString());
}
root.TriZentroI18n={lang:current,native,page,switchLanguage,translate,decorateLinks};
function init(){
 translate();decorateLinks();
 // Keep calculation messages and result labels in the selected language.
 if(typeof MutationObserver!=='undefined'){
  const observer=new MutationObserver(records=>{
   for(const record of records){
    if(record.type==='characterData')translateNode(record.target);
    for(const node of record.addedNodes||[]){
     if(node.nodeType===3)translateNode(node);
     else if(node.nodeType===1){
      const walker=root.document.createTreeWalker(node,NodeFilter.SHOW_TEXT);
      while(walker.nextNode())translateNode(walker.currentNode);
     }
    }
   }
  });
  observer.observe(root.document.body,{subtree:true,childList:true,characterData:true});
 }
}
if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',init);
else init();
})(window);
