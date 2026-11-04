/* TriZentro mobile pace entry: accepts 4:45, 445, 1234, 5 or 12.
 * Numeric keyboard stays usable; formatting happens on blur/change to avoid
 * changing the cursor while a runner is still typing. No network/storage.
 */
(function(root){
  "use strict";
  function normalize(value){
    const raw=String(value==null?"":value).trim().replace(/\s+/g,"");
    if(!raw)return "";
    let minutes,seconds;
    if(/^\d{1,2}:\d{1,2}$/.test(raw)){
      const pair=raw.split(":");minutes=Number(pair[0]);seconds=Number(pair[1]);
    }else if(/^\d{1,4}$/.test(raw)){
      // 445 -> 4:45, 1234 -> 12:34, 5 -> 5:00, 12 -> 12:00
      if(raw.length<=2){minutes=Number(raw);seconds=0;}
      else{minutes=Number(raw.slice(0,-2));seconds=Number(raw.slice(-2));}
    }else return null;
    if(seconds>59||minutes>99)return null;
    return String(minutes)+":"+String(seconds).padStart(2,"0");
  }
  function bind(ids){
    ids.forEach(id=>{
      const el=document.getElementById(id);
      if(!el)return;
      el.setAttribute("inputmode","numeric");
      el.setAttribute("autocomplete","off");
      el.setAttribute("aria-description","Typ bijvoorbeeld 445 voor 4 minuten en 45 seconden. De dubbele punt wordt automatisch toegevoegd als je het veld verlaat.");
      const convert=()=>{
        const formatted=normalize(el.value);
        if(formatted!==null&&formatted!==el.value){
          el.value=formatted;
          el.dispatchEvent(new Event("input",{bubbles:true}));
        }
      };
      el.addEventListener("blur",convert);
      el.addEventListener("change",convert);
    });
  }
  const api={normalize,bind};
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  root.TriZentroPaceInput=api;
})(typeof window!=="undefined"?window:globalThis);
