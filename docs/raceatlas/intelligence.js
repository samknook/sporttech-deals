/* RaceAtlas registration radar — sourced historical dates, never live availability claims. */
(() => {
  'use strict';
  const API='https://lpzndnxloykcthbsqcet.supabase.co/rest/v1/raceatlas_event_intelligence';
  const KEY='sb_publishable_AE_Qr8VLmWb2020QCOEAKQ_Nl5mZ5Sw';
  const SEASON_KEY='raceatlas-saved-v2';
  const LOCAL_PREF_KEY='raceatlas-intel-season-only-v1';
  const el=(tag,klass,value)=>{
    const node=document.createElement(tag);
    if(klass)node.className=klass;
    if(value!==undefined)node.textContent=value;
    return node;
  };
  const parseDate=(value)=>value?new Date(value):null;
  const fmt=(value)=>{
    const date=parseDate(value);
    return date&&!Number.isNaN(date.getTime())?date.toLocaleDateString('nl-NL',{day:'numeric',month:'short',year:'numeric',timeZone:'Europe/Amsterdam'}):'Onbekend';
  };
  const eventFmt=value=>{
    if(!/^20\d{2}-\d{2}-\d{2}$/.test(value||''))return 'Onbekend';
    return new Date(value+'T12:00:00Z').toLocaleDateString('nl-NL',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
  };
  const https=value=>{try{return new URL(value).protocol==='https:'}catch{return false}};
  const dateKey=value=>value?String(value).slice(0,10):'';
  const savedIds=()=>{
    try {
      const items=JSON.parse(localStorage.getItem(SEASON_KEY)||'[]');
      return new Set(Array.isArray(items)?items.filter(x=>/^ra-\d{1,8}$/.test(x)):[]);
    }catch{return new Set()}
  };
  const seasonOnly=()=>{
    try{return localStorage.getItem(LOCAL_PREF_KEY)==='true'}catch{return false}
  };
  const setSeasonOnly=value=>{
    try{localStorage.setItem(LOCAL_PREF_KEY,String(value))}catch{}
  };
  function classify(r,now){
    const race=parseDate((r.start_date||'')+'T23:59:59Z');
    if(!race||Number.isNaN(race.getTime())||race<now)return null;
    const opens=parseDate(r.registration_opens_at);
    const closes=parseDate(r.registration_closes_at);
    const dayInMs=86400000;
    const daysToOpen=opens?Math.ceil((opens.getTime()-now.getTime())/dayInMs):null;
    const daysToClose=closes?Math.ceil((closes.getTime()-now.getTime())/dayInMs):null;
    if(closes&&closes<now)return {group:'closed',label:'Vermelde deadline verstreken · '+fmt(closes),priority:4};
    if(opens&&opens>now&&daysToOpen<=120)return {group:'soon',label:'Openingsdatum volgens bron · '+fmt(opens),priority:0};
    if(opens&&opens<=now&&daysToClose!==null&&daysToClose>=0&&daysToClose<=30)return {group:'deadline',label:'Deadline volgens bron · '+fmt(closes),priority:1};
    if(opens&&opens<=now)return {group:'past',label:'Opening was op '+fmt(opens)+' · beschikbaarheid onbekend',priority:2};
    if(closes&&closes>=now&&daysToClose<=30)return {group:'deadline',label:'Deadline volgens bron · '+fmt(closes),priority:1};
    return null;
  }
  function install(){
    const resultsMore=document.getElementById('more');
    if(!resultsMore||document.getElementById('raIntelPanel'))return null;
    const panel=el('section','raIntelPanel');panel.id='raIntelPanel';
    panel.setAttribute('aria-label','Inschrijfradar met broninformatie');
    const head=el('div','raIntelHead');
    head.append(el('div','', 'INSCHRIJFRADAR'),el('h2','', 'Mis geen belangrijke inschrijfdatum'));
    const intro=el('p','raIntelNote','Controleer beschikbaarheid altijd bij de organisator.');
    const controls=el('div','raIntelControls');
    const label=el('label','raIntelToggle');
    const check=document.createElement('input');check.type='checkbox';check.checked=seasonOnly();
    label.append(check,el('span','','Alleen mijn opgeslagen wedstrijden'));
    controls.append(label);
    const status=el('p','raIntelStatus','Brongegevens laden…');status.setAttribute('role','status');
    const list=el('div','raIntelList');
    const more=el('button','raIntelMore','Bekijk alle inschrijfmomenten ↓');
    more.type='button';more.hidden=true;
    const emailNotice=el('p','raIntelNote tz-radar-email-notice','📧 E-mailmeldingen worden voorbereid. Kalenderherinneringen en lokale meldingsvoorkeuren werken al. Open bij een wedstrijd de knop Meldingen om je voorkeuren te beheren.');
    panel.append(head,intro,emailNotice,controls,status,list,more);
    resultsMore.after(panel);
    const jump=document.querySelector('.raRadarJump');
    if(jump)jump.hidden=false;
    return {panel,check,status,list,more,expanded:false};
  }
  function render(ui,records){
    ui.list.replaceChildren();
    const now=new Date(), saved=savedIds();
    const classified=records.filter(r=>r.date_confidence==='official').map(r=>({r,kind:classify(r,now)})).filter(x=>x.kind);
    const selected=classified.filter(x=>!ui.check.checked||saved.has(x.r.event_id));
    const ordered=selected.sort((a,b)=>{
      const savedA=saved.has(a.r.event_id)?0:1;
      const savedB=saved.has(b.r.event_id)?0:1;
      if(savedA!==savedB)return savedA-savedB;
      if(a.kind.priority!==b.kind.priority)return a.kind.priority-b.kind.priority;
      return String(a.r.registration_opens_at||a.r.start_date).localeCompare(String(b.r.registration_opens_at||b.r.start_date));
    }).slice(0,12);
    const visible=ui.expanded?ordered:ordered.slice(0,3);
    ui.more.hidden=ordered.length<=3;
    ui.more.textContent=ui.expanded?'Toon minder ↑':'Bekijk alle '+ordered.length+' inschrijfmomenten ↓';
    if(ui.more.hidden)ui.expanded=false;
    ui.status.textContent=ui.check.checked
      ?selected.length+' inschrijfmomenten voor mijn seizoen'
      :classified.length+' inschrijfmomenten om te volgen';
    if(!ordered.length){
      ui.list.append(el('p','raIntelEmpty',ui.check.checked
        ?'Geen bekende aankomende inschrijfdatums bij jouw opgeslagen races. Bewaar een wedstrijd om deze hier te volgen.'
        :'Momenteel geen inschrijfdatums in beeld. Controleer altijd de organisator voor de actuele stand.'));
      return;
    }
    for(const {r,kind} of visible){
      const item=el('article','raIntelItem');
      const body=el('div','');
      const badge=saved.has(r.event_id)?'★ Mijn seizoen':'Wedstrijdkalender';
      body.append(el('span','raIntelEyebrow',badge+' · '+kind.label),el('strong','',r.event_name),el('small','', 'Wedstrijd '+eventFmt(r.start_date)));
      const actions=el('div','raIntelActions');
      const detail=el('button','raIntelButton','Wedstrijddetails');
      detail.type='button';
      detail.addEventListener('click',()=>{
        const target=document.querySelector('[data-ra-detail="'+r.event_id+'"]');
        if(target)target.click();
        else{
          const url=new URL(location.href);
          url.searchParams.set('event',r.event_id);
          location.href=url.toString();
        }
      });
      actions.append(detail);
      const source=r.verification_source_url||r.official_event_url;
      if(https(source)){
        const a=el('a','raIntelSource','Controleer bron ↗');
        a.href=source;a.target='_blank';a.rel='noopener noreferrer';
        actions.append(a);
      }
      item.append(body,actions);
      ui.list.append(item);
    }
  }
  async function load(){
    const ui=install();if(!ui)return;
    try {
      const response=await fetch(API+'?select=event_id,event_name,start_date,registration_opens_at,registration_closes_at,official_event_url,verification_source_url,last_verified_at,date_confidence&publish_status=eq.published&order=start_date.asc&limit=500',{
        headers:{apikey:KEY,Accept:'application/json'},
        signal:AbortSignal.timeout(9000)
      });
      if(!response.ok)throw Error('HTTP '+response.status);
      const records=await response.json();
      if(!Array.isArray(records))throw Error('Invalid response');
      const refresh=()=>render(ui,records);
      ui.check.addEventListener('change',()=>{setSeasonOnly(ui.check.checked);ui.expanded=false;refresh()});
      ui.more.addEventListener('click',()=>{ui.expanded=!ui.expanded;refresh()});
      window.addEventListener('storage',event=>{
        if(event.key===SEASON_KEY||event.key===LOCAL_PREF_KEY){
          if(event.key===LOCAL_PREF_KEY)ui.check.checked=seasonOnly();
          refresh();
        }
      });
      // Existing save controls update localStorage synchronously, and click bubbles to document.
      document.addEventListener('click',event=>{
        if(event.target.closest('.save'))queueMicrotask(refresh);
      });
      refresh();
    }catch{
      ui.status.textContent='Inschrijfradar tijdelijk niet beschikbaar.';
      ui.list.append(el('p','raIntelEmpty','De gewone evenementenkalender blijft werken. Bekijk de organisatorsite voor inschrijfgegevens.'));
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});
  else load();
})();
