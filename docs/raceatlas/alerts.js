(() => {
  'use strict';
  const KEY = 'raceatlas-alert-preferences-v1';
  let prefs = {};
  try { const v = JSON.parse(localStorage.getItem(KEY) || '{}'); if(v && typeof v === 'object' && !Array.isArray(v)) prefs=v; } catch {}
  const savePrefs = () => { try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch {} };
  const pad = n => String(n).padStart(2,'0');
  const fmt = s => s.replace(/-/g,'');
  const nextDate = s => {const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+1);return d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())};
  const icsEscape = s => String(s||'').replace(/([,;\\])/g,'\\$1').replace(/\n/g,'\\n');
  function downloadIcs(event, settings) {
    const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//RaceAtlas//Alerts//NL'];
    function eventEntry(date, title, alarms) {
      lines.push('BEGIN:VEVENT','UID:raceatlas-alert-'+event.id+'-'+date+'@raceatlas','DTSTAMP:20261109T120000Z',
        'DTSTART;VALUE=DATE:'+fmt(date),'DTEND;VALUE=DATE:'+nextDate(date),
        'SUMMARY:'+icsEscape(title),'DESCRIPTION:'+icsEscape('Controleer officiële details: '+(event.source||'RaceAtlas')));
      alarms.forEach(([trigger,description]) => lines.push('BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+icsEscape(description),'TRIGGER:'+trigger,'END:VALARM'));
      lines.push('END:VEVENT');
    }
    if(event.date && event.dateEvidence==='official' && settings.date) {
      const alarms=settings.race ? [['-P7D','Over 1 week: '+event.name],['-P1D','Morgen: '+event.name],['PT0S','Vandaag: '+event.name]] : [];
      const start=event.eventStartDate&&/^20\d{2}-\d{2}-\d{2}$/.test(event.eventStartDate)?event.eventStartDate:event.date;
      eventEntry(start, 'Wedstrijd: '+event.name, alarms);
    }
    if(event.registrationDate && settings.registration) {
      eventEntry(event.registrationDate,'Inschrijving opent: '+event.name,[['-P7D','Inschrijving opent over 1 week'],['-P1D','Inschrijving opent morgen'],['PT0S','Inschrijving opent vandaag']]);
    }
    if(lines.length===3) {alert('Er is nog geen officieel bevestigde wedstrijddatum of exacte inschrijfdatum voor dit evenement. Je voorkeuren kunnen wel worden bewaard.');return;}
    lines.push('END:VCALENDAR');
    const blob=new Blob([lines.join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='raceatlas-alert-'+event.id+'.ics';
    document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
  }
  function openDialog(event) {
    const current=prefs[event.id]||{date:true,registration:true,race:true};
    const overlay=document.createElement('div');overlay.className='ra-overlay';
    const dialog=document.createElement('section');dialog.className='ra-dialog';dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');
    const h=document.createElement('h2');h.textContent='Meldingen voor '+event.name;
    const p=document.createElement('p');p.textContent='Bewaar je voorkeuren en voeg bekende wedstrijd- en inschrijfdatums toe aan je eigen agenda.';
    const fields={};
    const options=[['date','Officiële wedstrijddatum bekend'],['registration','Inschrijfdatum bekend'],['race','Herinnering: 1 week, 1 dag en op de dag zelf']];
    const form=document.createElement('div');form.className='ra-fields';
    options.forEach(([key,label])=>{
      const line=document.createElement('label');const input=document.createElement('input');input.type='checkbox';input.checked=current[key]!==false;fields[key]=input;
      const text=document.createElement('span');text.textContent=label;line.append(input,text);form.append(line);
    });
    if(event.dateEvidence!=='official'){
      const verification=document.createElement('p');verification.className='ra-notice';verification.textContent='De wedstrijddatum is nog niet officieel bevestigd. Daarom maken we hiervoor geen kalenderherinnering. Een bevestigde openingsdatum voor inschrijving kan wel apart worden toegevoegd.';dialog.append(verification);
    }
    const notice=document.createElement('p');notice.className='ra-notice';
    notice.textContent='Automatische e-mails zijn nog niet actief: daarvoor moeten een beveiligde verzenddienst, bevestiging van e-mailadressen en afmeldfunctie worden aangesloten. We verzamelen nu geen e-mailadressen. Voorkeuren blijven op dit apparaat.';
    const actions=document.createElement('div');actions.className='ra-actions';
    const close=document.createElement('button');close.type='button';close.textContent='Sluiten';
    const calendar=document.createElement('button');calendar.type='button';calendar.textContent='Download agenda-alarmen';
    const save=document.createElement('button');save.type='button';save.textContent='Bewaar voorkeuren';save.className='ra-primary';
    const settings=()=>({date:fields.date.checked,registration:fields.registration.checked,race:fields.race.checked});
    close.onclick=()=>overlay.remove();save.onclick=()=>{prefs[event.id]=settings();savePrefs();overlay.remove();syncButtons();};
    calendar.onclick=()=>downloadIcs(event,settings());
    overlay.onclick=e=>{if(e.target===overlay)overlay.remove();};
    actions.append(close,calendar,save);dialog.append(h,p,form,notice,actions);overlay.append(dialog);document.body.append(overlay);save.focus();
  }
  function syncButtons(){document.querySelectorAll('[data-ra-alert]').forEach(b=>{b.classList.toggle('ra-set',!!prefs[b.dataset.raAlert]);b.title=prefs[b.dataset.raAlert]?'Meldingsvoorkeuren opgeslagen':'Meldingen instellen';});}
  document.addEventListener('click',e=>{
    const button=e.target.closest('[data-ra-alert]');
    if(!button)return;
    const id=button.dataset.raAlert;
    const event=(window.RACEATLAS_EVENTS||[]).find(x=>x.id===id);
    if(event)openDialog(event);
  });
  const css=document.createElement('style');css.textContent=
    '.ra-alert-btn{border-radius:9px;border:1px solid #a9d8b7;background:#eef9ef;padding:9px 11px;color:#195a3f;font-size:12px;font-weight:800;cursor:pointer}.ra-alert-btn.ra-set{background:#cfffbd}.cardActions{flex-wrap:wrap}.ra-overlay{position:fixed;inset:0;background:#061719bd;z-index:100;display:flex;justify-content:center;align-items:center;padding:16px}.ra-dialog{width:min(530px,100%);max-height:90vh;overflow:auto;background:white;color:#163328;border-radius:18px;padding:25px;box-shadow:0 30px 80px #0006}.ra-dialog h2{font-size:24px;margin:0 0 10px}.ra-dialog p{line-height:1.55;color:#52685d;font-size:13px}.ra-fields{display:grid;gap:9px;margin:20px 0}.ra-fields label{display:flex;align-items:center;gap:12px;background:#f3f7f2;padding:13px;border-radius:10px;font-size:13px;font-weight:650}.ra-fields input{width:19px;height:19px;accent-color:#197b45}.ra-notice{padding:12px;background:#edf5e9;border-radius:10px}.ra-actions{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}.ra-actions button{border-radius:9px;padding:10px 12px;border:1px solid #c8dac9;background:white;color:#204331;font-weight:700;cursor:pointer}.ra-actions button.ra-primary{background:#c6ff46;border-color:#c6ff46;color:#14251a}';
  document.head.append(css);
  window.RaceAtlasAlerts={syncButtons,openForEvent(id){const event=(window.RACEATLAS_EVENTS||[]).find(x=>x.id===id);if(event)openDialog(event)}};
})();