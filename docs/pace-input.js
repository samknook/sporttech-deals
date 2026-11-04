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
  // Time-of-day: 830 -> 08:30, 1430 -> 14:30, 8 -> 08:00.
  function normalizeClock(value){
    const raw=String(value==null?"":value).trim();
    if(!raw)return "";
    let hours,minutes;
    if(/^\d{1,2}:\d{1,2}$/.test(raw)){
      [hours,minutes]=raw.split(":").map(Number);
    }else if(/^\d{1,4}$/.test(raw)){
      if(raw.length<=2){hours=Number(raw);minutes=0;}
      else{hours=Number(raw.slice(0,-2));minutes=Number(raw.slice(-2));}
    }else return null;
    if(hours>23||minutes>59)return null;
    return String(hours).padStart(2,"0")+":"+String(minutes).padStart(2,"0");
  }
  // Duration/finish target: 530 -> 05:30, 500 -> 05:00,
  // 12345 -> 01:23:45, 53015 -> 05:30:15.
  function normalizeDuration(value){
    const raw=String(value==null?"":value).trim();
    if(!raw)return "";
    let hours,minutes,seconds=null;
    if(/^\d{1,2}:\d{1,2}:\d{1,2}$/.test(raw)){
      [hours,minutes,seconds]=raw.split(":").map(Number);
    }else if(/^\d{1,2}:\d{1,2}$/.test(raw)){
      [hours,minutes]=raw.split(":").map(Number);
    }else if(/^\d{1,6}$/.test(raw)){
      if(raw.length<=2){hours=Number(raw);minutes=0;}
      else if(raw.length<=4){hours=Number(raw.slice(0,-2));minutes=Number(raw.slice(-2));}
      else{hours=Number(raw.slice(0,-4));minutes=Number(raw.slice(-4,-2));seconds=Number(raw.slice(-2));}
    }else return null;
    if(hours>48||minutes>59||(seconds!==null&&seconds>59))return null;
    return String(hours).padStart(2,"0")+":"+String(minutes).padStart(2,"0")+(seconds===null?"":":"+String(seconds).padStart(2,"0"));
  }
  function bindTimes(ids,kind){
    const formatter=kind==="clock"?normalizeClock:normalizeDuration;
    ids.forEach(id=>{
      const el=document.getElementById(id);
      if(!el)return;
      el.setAttribute("inputmode","numeric");
      el.setAttribute("autocomplete","off");
      el.setAttribute("aria-description",kind==="clock"?"Type 830 for 08:30. The colon is inserted when you leave the field.":"Type 530 for 05:30, or 53015 for 05:30:15. The colons are inserted when you leave the field.");
      const convert=()=>{
        const formatted=formatter(el.value);
        if(formatted!==null&&formatted!==el.value){
          el.value=formatted;
          el.dispatchEvent(new Event("input",{bubbles:true}));
        }
      };
      el.addEventListener("blur",convert);
      el.addEventListener("change",convert);
    });
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
  const api={normalize,bind,normalizeClock,normalizeDuration,bindClock:ids=>bindTimes(ids,"clock"),bindDuration:ids=>bindTimes(ids,"duration")};
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  root.TriZentroPaceInput=api;
})(typeof window!=="undefined"?window:globalThis);
