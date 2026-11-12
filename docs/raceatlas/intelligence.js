/* RaceAtlas event intelligence: published, read-only race facts. No account required. */
(() => {
  'use strict';
  const API = 'https://lpzndnxloykcthbsqcet.supabase.co/rest/v1/raceatlas_event_intelligence';
  const KEY = 'sb_publishable_AE_Qr8VLmWb2020QCOEAKQ_Nl5mZ5Sw';
  const el = (tag, className, value) => {
    const n = document.createElement(tag);
    if (className) n.className = className;
    if (value != null) n.textContent = value;
    return n;
  };
  const day = s => s ? new Date(s).toLocaleDateString('nl-NL',{day:'numeric',month:'short',year:'numeric',timeZone:'Europe/Amsterdam'}) : '';
  const validHttps = u => {
    try { return new URL(u).protocol === 'https:'; } catch { return false; }
  };
  function installPanel() {
    const summary = document.getElementById('verificationSummary');
    if (!summary || document.getElementById('raIntelPanel')) return null;
    const panel = el('section','raIntelPanel');
    panel.id = 'raIntelPanel';
    panel.setAttribute('aria-label','Inschrijfkalender met broninformatie');
    const head=el('div','raIntelHead');
    head.append(el('div','', 'INSCHRIJFRADAR'), el('h2','', 'Houd je volgende inschrijving in de gaten'));
    const info=el('p','raIntelNote','We tonen alleen bekende inschrijfdatums uit gepubliceerde brongegevens. Dit is geen live controle van vrije startbewijzen.');
    const status=el('p','raIntelStatus','Brongegevens laden…');
    status.setAttribute('role','status');
    const list=el('div','raIntelList');
    panel.append(head,info,status,list);
    summary.after(panel);
    return {status,list};
  }
  async function load() {
    const ui=installPanel();
    if(!ui) return;
    try {
      const response=await fetch(API+'?select=event_id,event_name,sport,start_date,registration_opens_at,registration_closes_at,registration_status,official_event_url,official_registration_url,verification_source_url,last_verified_at&publish_status=eq.published&order=start_date.asc&limit=500',{
        headers:{'apikey':KEY,'Accept':'application/json'},
        signal:AbortSignal.timeout(9000)
      });
      if(!response.ok) throw new Error('Racegegevens tijdelijk niet beschikbaar');
      const records=await response.json();
      if(!Array.isArray(records)) throw new Error('Ongeldig antwoord');
      const now=new Date(), soon=new Date(now.getTime()+120*86400000);
      const upcoming=records.filter(r=>{
        if(!r.registration_opens_at || !r.start_date)return false;
        const opens=new Date(r.registration_opens_at);
        const race=new Date(r.start_date+'T23:59:59Z');
        return opens>=new Date(now.getTime()-14*86400000) && opens<=soon && race>=now;
      }).sort((a,b)=>new Date(a.registration_opens_at)-new Date(b.registration_opens_at)).slice(0,6);
      ui.status.textContent=records.length+' wedstrijden met gepubliceerde brongegevens · '+upcoming.length+' relevante inschrijfdatums in beeld';
      if(!upcoming.length){
        ui.list.append(el('p','raIntelEmpty','Geen binnenkort openende inschrijvingen met bekende startdatum. Bekijk de wedstrijdkaart voor meer informatie.'));
        return;
      }
      for(const race of upcoming){
        const item=el('article','raIntelItem');
        const body=el('div','');
        const opens=new Date(race.registration_opens_at);
        const past=opens<=now;
        body.append(
          el('span','raIntelEyebrow',past?'Opening was op '+day(race.registration_opens_at):'Verwachte opening · '+day(race.registration_opens_at)),
          el('strong','',race.event_name),
          el('small','',race.start_date?'Wedstrijd '+new Date(race.start_date+'T12:00:00Z').toLocaleDateString('nl-NL',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}):'Wedstrijddatum onbekend')
        );
        const actions=el('div','raIntelActions');
        const detail=el('button','raIntelButton','Bekijk wedstrijd');
        detail.type='button';
        detail.addEventListener('click',()=>{
          const match=Array.from(document.querySelectorAll('.card')).find(c=>c.querySelector('[data-id="'+race.event_id+'"]'));
          if(match){const target=match.querySelector('[data-id="'+race.event_id+'"]');target.click();}
          else {
            const u=new URL(location.href);
            u.searchParams.set('event',race.event_id);
            location.href=u.toString();
          }
        });
        actions.append(detail);
        const url=race.verification_source_url||race.official_event_url;
        if(validHttps(url)){
          const link=el('a','raIntelSource','Bron ↗');
          link.href=url;link.target='_blank';link.rel='noopener noreferrer';
          actions.append(link);
        }
        item.append(body,actions);
        ui.list.append(item);
      }
    } catch (error) {
      ui.status.textContent='Inschrijfgegevens konden niet worden geladen.';
      ui.list.append(el('p','raIntelEmpty','De gewone wedstrijdkalender blijft beschikbaar. Controleer inschrijfdatums altijd bij de organisator.'));
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',load,{once:true});
  else load();
})();
