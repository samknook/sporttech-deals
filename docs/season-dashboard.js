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
 const upcoming=items.filter(item=>DATE.test(item.date||'')&&item.date>=date).sort((a,b)=>a.date.localeCompare(b.date));
 const next=upcoming[0];
 const registered=items.filter(item=>states[item.id]==='registered').length;
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
  race.append(e('strong',next.name,'tz-dashboard-value'),
   e('p',new Date(next.date+'T12:00:00').toLocaleDateString(document.documentElement.lang==='en'?'en-GB':'nl-NL',{day:'numeric',month:'long',year:'numeric'})+' · '+next.place),
   e('small',next.dateEvidence==='official'?text('Wedstrijddatum officieel bevestigd','Race date officially confirmed'):text('Datum controleren bij organisator','Verify date with organizer')));
  const link=e('a',text('Wedstrijddetails →','Race details →'),'tz-dashboard-text-link');
  link.href=pageFor(next);race.append(link);
 }else{
  race.append(e('strong',text('Nog geen aankomende wedstrijd met exacte datum','No upcoming race with an exact date'),'tz-dashboard-value'),
   e('p',text('Controleer de datum van je opgeslagen wedstrijden.','Check the date of your saved races.')));
 }
 const registration=card('✓',text('Inschrijvingen','Registrations'));
 registration.append(e('strong',pending+' '+text('nog te regelen','to arrange'),'tz-dashboard-value'),
  e('p',text('Dit zijn jouw eigen notities, geen bevestigingen van organisatoren.','These are your own notes, not organizer confirmations.')));
 if(next){
  const label=e('label',text('Mijn status voor volgende wedstrijd','My status for next race'),'tz-dashboard-form');
  const select=e('select');select.setAttribute('aria-label',label.textContent);
  for(const [value,nl,en] of [['planned','Nog te regelen','Not registered'],['registered','Ingeschreven','Registered'],['waitlist','Wachtlijst','Waitlisted']]){
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