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
    if(!date||Number.isNaN(date.getTime()))return 'Onbekend';
    const day=date.toLocaleDateString('nl-NL',{day:'numeric',month:'short',year:'numeric',timeZone:'Europe/Amsterdam'});
    // Legacy source dates stored at 00:00 UTC have no confirmed clock time.
    // Show a time only when a non-midnight timestamp is explicitly provided.
    const timeKnown=!(date.getUTCHours()===0&&date.getUTCMinutes()===0);
    return timeKnown?day+' · '+new Intl.DateTimeFormat('nl-NL',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Amsterdam'}).format(date)+' uur':day;
  };
  const eventFmt=value=>{
    if(!/^20\d{2}-\d{2}-\d{2}$/.test(value||''))return 'Onbekend';
    return new Date(value+'T12:00:00Z').toLocaleDateString('nl-NL',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
  };
  const https=value=>{try{return new URL(value).protocol==='https:'}catch{return false}};
  const dateKey=value=>value?String(value).slice(0,10):'';
  // Use the same account-aware season as the Events catalogue.
  // When signed in, locally saved guest races must not replace cloud races.
  const savedIds=()=>{
    const shared=window.RaceAtlasSaved;
    if(shared&&typeof shared.get==='function'){
      try{return new Set(shared.get().filter(id=>/^ra-[0-9]{1,8}$/.test(id)))}catch{}
    }
    try{
      const items=JSON.parse(localStorage.getItem(SEASON_KEY)||'[]');
      return new Set(Array.isArray(items)?items.filter(id=>/^ra-[0-9]{1,8}$/.test(id)):[]);
    }catch{return new Set()}
  };
  const seasonOnly=()=>{
    try{return localStorage.getItem(LOCAL_PREF_KEY)==='true'}catch{return false}
  };
  const setSeasonOnly=value=>{
    try{localStorage.setItem(LOCAL_PREF_KEY,String(value))}catch{}
  };
  function classify(r,now){
    const race=r.start_date?parseDate(r.start_date+'T23:59:59Z'):null;
    // The organizer may confirm registration before publishing a final race date.
    // Preserve verified opening/deadline evidence independently of race-date confidence.
    if(race&&(!Number.isNaN(race.getTime()))&&race<now)return null;
    const opens=parseDate(r.registration_opens_at);
    const closes=parseDate(r.registration_closes_at);
    const dayInMs=86400000;
    const daysToOpen=opens?Math.ceil((opens.getTime()-now.getTime())/dayInMs):null;
    const daysToClose=closes?Math.ceil((closes.getTime()-now.getTime())/dayInMs):null;
    if(closes&&closes<now)return {group:'closed',label:'Vermelde deadline verstreken · '+fmt(closes),priority:4};
    if(opens&&opens>now&&daysToOpen<=120)return {group:'soon',label:'Openingsdatum volgens bron · '+fmt(opens),priority:0};
    if(opens&&opens>now)return {group:'later',label:'Inschrijving opent later volgens bron · '+fmt(opens),priority:3};
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
    const pendingHead=el('h3','raIntelPendingTitle','Volg: officiële datum en inschrijving');
    const pendingNote=el('p','raIntelNote','Ook zonder bevestigde wedstrijddatum kun je een evenement volgen, mits er een officiële evenementpagina is. Stel een melding in voor ‘Officiële wedstrijddatum bekend’ of voor inschrijfinformatie. E-mail wordt pas verzonden wanneer de meldingsdienst deze wijziging daadwerkelijk ondersteunt.');
    const pending=el('div','raIntelPendingList');
    const pendingMore=el('button','raIntelMore','Toon meer te volgen wedstrijden ↓');
    pendingMore.type='button';pendingMore.hidden=true;
    pendingHead.hidden=true;pendingNote.hidden=true;pending.hidden=true;
    const more=el('button','raIntelMore','Bekijk alle inschrijfmomenten ↓');
    more.type='button';more.hidden=true;
    const emailNotice=el('p','raIntelNote tz-radar-email-notice','Ontvang e-mailupdates voor een gekozen wedstrijd na bevestiging van je e-mailadres. Klik bij een wedstrijd op ‘Meldingen’ om je aan te melden. Kalenderherinneringen zijn ook beschikbaar.');
    panel.append(head,intro,emailNotice,controls,status,list,more,pendingHead,pendingNote,pending,pendingMore);
    resultsMore.after(panel);
    const jump=document.querySelector('.raRadarJump');
    if(jump)jump.hidden=false;
    return {panel,check,status,list,more,pendingHead,pendingNote,pending,pendingMore,expanded:false,pendingExpanded:false};
  }
  function render(ui,records){
    ui.list.replaceChildren();
    ui.pending.replaceChildren();
    ui.pending.hidden=true;ui.pendingHead.hidden=true;ui.pendingNote.hidden=true;ui.pendingMore.hidden=true;
    const now=new Date(), saved=savedIds();
    const classified=records.filter(r=>r.registration_opens_at||r.registration_closes_at).map(r=>({r,kind:classify(r,now)})).filter(x=>x.kind);
    const selected=classified.filter(x=>!ui.check.checked||saved.has(x.r.event_id));
    // Saved races without an upcoming recorded opening still need a way to opt in.
    // The catalogue is the source for event identity only, not unverified registration claims.
    {
      const knownOpening=new Set(records.filter(r=>r.registration_opens_at||r.registration_closes_at).map(r=>r.event_id));
      // An official organizer event page is enough to follow an undated race.
      // Never convert an estimated edition/month into a confirmed date.
      const candidates=(window.RACEATLAS_EVENTS||[])
        .filter(event=>/^https:\/\//i.test(event.officialEventUrl||''))
        .filter(event=>(!ui.check.checked||saved.has(event.id)) &&
          (event.dateEvidence!=='official'||!knownOpening.has(event.id)))
        .sort((a,b)=>(saved.has(a.id)?0:1)-(saved.has(b.id)?0:1)||
          (a.dateEvidence==='official'?1:0)-(b.dateEvidence==='official'?1:0)||
          String(a.date||'9999-12-31').localeCompare(String(b.date||'9999-12-31')));
      ui.pendingMore.hidden=candidates.length<=8;
      ui.pendingMore.textContent=ui.pendingExpanded?'Toon minder ↑':'Bekijk alle '+candidates.length+' te volgen wedstrijden ↓';
      if(candidates.length){
        ui.pending.hidden=false;ui.pendingHead.hidden=false;ui.pendingNote.hidden=false;
        for(const event of (ui.pendingExpanded?candidates:candidates.slice(0,8))){
          const article=el('article','raIntelItem');
          const info=el('div','');
          info.append(el('strong','',event.name),el('small','',event.dateEvidence==='official'?'Inschrijfdatum nog niet bevestigd':'Officiële wedstrijddatum nog niet bekend'));
          const actions=el('div','raIntelActions');
          const button=el('button','raIntelButton',event.dateEvidence==='official'?'🔔 Volg inschrijving':'🔔 Meld datum bekend');
          button.type='button';
          button.addEventListener('click',()=>{
            if(window.RaceAtlasAlerts?.openForEvent)window.RaceAtlasAlerts.openForEvent(event.id);
            else location.href='/events/?ra_alert='+encodeURIComponent(event.id);
          });
          actions.append(button);
          article.append(info,actions);
          ui.pending.append(article);
        }
      }
    }
    const ordered=selected.sort((a,b)=>{
      const savedA=saved.has(a.r.event_id)?0:1;
      const savedB=saved.has(b.r.event_id)?0:1;
      if(savedA!==savedB)return savedA-savedB;
      if(a.kind.priority!==b.kind.priority)return a.kind.priority-b.kind.priority;
      return String(a.r.registration_opens_at||a.r.start_date).localeCompare(String(b.r.registration_opens_at||b.r.start_date));
    });
    const visible=ui.expanded?ordered:ordered.slice(0,3);
    ui.more.hidden=ordered.length<=3;
    ui.more.textContent=ui.expanded?'Toon minder ↑':'Bekijk alle '+ordered.length+' inschrijfmomenten ↓';
    if(ui.more.hidden)ui.expanded=false;
    ui.status.textContent=ui.check.checked
      ?selected.length+' inschrijfmomenten voor mijn seizoen'
      :classified.length+' inschrijfmomenten om te volgen';
    if(!ordered.length){
      ui.list.append(el('p','raIntelEmpty',ui.check.checked
        ?'Voor jouw opgeslagen wedstrijden zijn momenteel geen aankomende inschrijfmomenten bevestigd. Je kunt hieronder wedstrijden volgen zodra er nieuwe informatie komt.'
        :'Momenteel geen inschrijfdatums in beeld. Controleer altijd de organisator voor de actuele stand.'));
      return;
    }
    for(const {r,kind} of visible){
      const item=el('article','raIntelItem');
      const body=el('div','');
      const badge=saved.has(r.event_id)?'★ Mijn seizoen':'Wedstrijdkalender';
      body.append(el('span','raIntelEyebrow',badge+' · '+kind.label),el('strong','',r.event_name),el('small','',r.start_date&&r.date_confidence==='official'?'Wedstrijd '+eventFmt(r.start_date):'Wedstrijddatum nog niet officieel bevestigd'));
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
      const alert=el('button','raIntelButton','🔔 Meldingen instellen');
      alert.type='button';
      alert.addEventListener('click',()=>{
        if(window.RaceAtlasAlerts?.openForEvent)window.RaceAtlasAlerts.openForEvent(r.event_id);
        else location.href='/events/?ra_alert='+encodeURIComponent(r.event_id);
      });
      actions.append(alert);
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
      const fetched=await response.json();
      if(!Array.isArray(fetched))throw Error('Invalid response');
      // Do not reintroduce archived/unverified races from stale analytics records.
      const publicIds=new Set((window.RACEATLAS_EVENTS||[]).map(event=>event.id));
      const records=fetched.filter(record=>publicIds.has(record.event_id));
      const refresh=()=>render(ui,records);
      ui.check.addEventListener('change',()=>{setSeasonOnly(ui.check.checked);ui.expanded=false;ui.pendingExpanded=false;refresh()});
      ui.more.addEventListener('click',()=>{ui.expanded=!ui.expanded;refresh()});
      ui.pendingMore.addEventListener('click',()=>{ui.pendingExpanded=!ui.pendingExpanded;refresh()});
      window.addEventListener('raceatlas:season-source-change',refresh);
      window.addEventListener('raceatlas:saved-change',refresh);
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
      // The dashboard links here from My Season. The panel is created after
      // initial page load, so native hash scrolling may have happened too soon.
      if(location.hash==='#raIntelPanel'){
        requestAnimationFrame(()=>ui.panel.scrollIntoView({block:'start'}));
      }
    }catch{
      ui.status.textContent='Inschrijfradar tijdelijk niet beschikbaar.';
      ui.list.append(el('p','raIntelEmpty','De gewone evenementenkalender blijft werken. Bekijk de organisatorsite voor inschrijfgegevens.'));
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});
  else load();
})();
