/* TriZentro personal race dashboard: reuses the existing season engine. */
(()=>{'use strict';
const host=document.getElementById('tzPersonalDashboard');
if(!host)return;
const text=(nl,en)=>document.documentElement.lang==='en'?en:nl;
const e=(tag,value,className)=>{const node=document.createElement(tag);if(value!==undefined)node.textContent=value;if(className)node.className=className;return node};
const DATE=/^20\d{2}-\d{2}-\d{2}$/;
function render(items,states,pageFor,setRegistration){
 host.replaceChildren();
 const today=new Date(),date=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
 // Never elevate a speculative race date above a verified one.
 // Keep unconfirmed races visible in the season, but clearly separate them.
 const upcoming=items.filter(item=>DATE.test(item.date||'')&&item.date>=date).sort((a,b)=>a.date.localeCompare(b.date));
 const confirmed=upcoming.filter(item=>item.dateEvidence==='official');
 const tentative=upcoming.filter(item=>item.dateEvidence!=='official');
 const next=confirmed[0]||tentative[0];
 const registered=items.filter(item=>states[item.id]==='registered').length;
 const completed=items.filter(item=>states[item.id]==='completed').length;
 const waitlist=items.filter(item=>states[item.id]==='waitlist').length;
 const pending=items.filter(item=>!states[item.id]||states[item.id]==='planned').length;
 const intro=e('div',undefined,'tz-dashboard-head');
 intro.append(e('span',text('MIJN DASHBOARD','MY DASHBOARD'),'tz-dashboard-eyebrow'),
  e('h3',text('Jouw seizoen in één oogopslag','Your season at a glance')),
  e('p',items.length+' '+text('wedstrijden bewaard','saved races')+' · '+registered+' '+text('zelf als ingeschreven gemarkeerd','marked as registered by you')));
 host.append(intro);
 if(!items.length){
  const empty=e('div',undefined,'tz-dashboard-empty');
  empty.append(e('p',text('Bewaar een wedstrijd en hier verschijnt jouw persoonlijke voorbereiding.','Save a race and your personal preparation will appear here.')));
  const link=e('a',text('Ontdek wedstrijden →','Discover races →'),'tz-dashboard-primary-link');link.href='/events/';
  empty.append(link);host.append(empty);return;
 }
 const grid=e('div',undefined,'tz-dashboard-grid');
 const card=(symbol,label)=>{const c=e('article',undefined,'tz-dashboard-card');c.append(e('span',symbol+' '+label,'tz-dashboard-label'));grid.append(c);return c};
 const race=card('🏁',text('Eerstvolgende wedstrijd','Next race'));
 if(next){
  const daysUntil=Math.max(0,Math.round((Date.parse(next.date+'T12:00:00')-Date.parse(date+'T12:00:00'))/86400000));
  race.append(e('strong',next.name,'tz-dashboard-value'),
   e('p',new Date(next.date+'T12:00:00').toLocaleDateString(document.documentElement.lang==='en'?'en-GB':'nl-NL',{day:'numeric',month:'long',year:'numeric'})+' · '+next.place),
   e('small',(daysUntil===0?text('Vandaag','Today'):daysUntil===1?text('Morgen','Tomorrow'):text('Over '+daysUntil+' dagen','In '+daysUntil+' days'))+' · '+(next.dateEvidence==='official'?text('datum officieel bevestigd','date officially confirmed'):text('datum nog te controleren','date not yet verified'))));
  const link=e('a',text('Wedstrijddetails →','Race details →'),'tz-dashboard-text-link');
  link.href=pageFor(next);race.append(link);
  if(tentative.length){
   race.append(e('small',tentative.length+' '+(tentative.length===1?text('opgeslagen wedstrijd met onbevestigde datum','saved race with an unconfirmed date'):text('opgeslagen wedstrijden met onbevestigde datum','saved races with unconfirmed dates'))));
  }
 }else{
  race.append(e('strong',text('Nog geen aankomende wedstrijd met exacte datum','No upcoming race with an exact date'),'tz-dashboard-value'),
   e('p',text('Controleer de datum van je opgeslagen wedstrijden.','Check the date of your saved races.')));
 }
 const registration=card('✓',text('Inschrijvingen','Registrations'));
 registration.append(e('strong',pending+' '+text('nog te regelen','to arrange'),'tz-dashboard-value'),
  e('p',registered+' '+text('ingeschreven','registered')+' · '+completed+' '+text('voltooid','completed')+' · '+waitlist+' '+text('op wachtlijst','waitlisted')+'. '+text('Dit zijn jouw eigen notities, geen bevestigingen van organisatoren.','These are your notes, not organizer confirmations.')));
 const radarLink=e('a',text('Bekijk Inschrijfradar →','View registration radar →'),'tz-dashboard-text-link');
 radarLink.href='/events/#raIntelPanel';registration.append(radarLink);
 if(next){
  const label=e('label',text('Mijn status voor volgende wedstrijd','My status for next race'),'tz-dashboard-form');
  const select=e('select');select.setAttribute('aria-label',label.textContent);
  const cloud=window.RaceAtlasSaved?.isCloud?.()===true;
  const options=[['planned','Nog te regelen','Not registered'],['registered','Ingeschreven','Registered'],['completed','Voltooid','Completed']];
  if(!cloud)options.splice(2,0,['waitlist','Wachtlijst','Waitlisted']);
  for(const [value,nl,en] of options){
   const option=e('option',text(nl,en));option.value=value;select.append(option);
  }
  select.value=states[next.id]||'planned';
  select.addEventListener('change',()=>setRegistration(next.id,select.value));
  label.append(select);registration.append(label);
 }
 const preparation=card('⚡',text('Voorbereiding','Preparation'));
 const sport=next?.sport||items[0]?.sport;
 const type=sport==='Triatlon'?'triathlon':sport==='Fietsen'?'cycling':'running';
 preparation.append(e('strong',type==='triathlon'?text('Plan je triatlon','Plan your triathlon'):type==='cycling'?text('Bereid je fietsrit voor','Prepare your ride'):text('Bereken je looptempo','Calculate your pace'),'tz-dashboard-value'),
  e('p',text('Hulpmiddelen voor de sport van jouw eerstvolgende wedstrijd.','Tools matched to the sport of your next race.')));
 const tools=e('a',text('Open Performance →','Open Performance →'),'tz-dashboard-primary-link');
 tools.href='/performance/?sport='+type+(document.documentElement.lang==='en'?'&lang=en':'');
 preparation.append(tools);
 host.append(grid);
}
window.TriZentroDashboard={render};
window.addEventListener('raceatlas:languagechange',()=>{window.RaceAtlasRefresh?.()});
window.RaceAtlasRefresh?.();
})();