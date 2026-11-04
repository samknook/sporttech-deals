/* Triathlon Race Planner v2 — fully offline, no storage, cookies or network. */
(function () {
  'use strict';
  const core=window.RacePlannerCore;
  if (!core) return;
  const $=id=>document.getElementById(id);
  const english=window.TriZentroI18n&&window.TriZentroI18n.lang==='en';
  const tr=(nl,en)=>english?en:nl;
  const distName=id=>id==='olympic'?tr('Olympisch','Olympic'):id==='half'?tr('70.3 / Halve','70.3 / Half'):id==='custom'?tr('Eigen afstand','Custom distance'):core.DISTANCES[id].name;
  const ids=['event-name','race-date','start-time','swim-pace','bike-speed','run-pace','t1-minutes','t2-minutes','target-time','swim-meters','bike-km','run-km','race-notes'];
  const selector=$('distance-selector');
  const buttons=[...selector.querySelectorAll('[data-distance]')];
  let selected='half';

  const groups=[
    {name:'Voor vertrek',sport:'general',icon:'📋',items:['Starttijd, parcours en locatie gecontroleerd','Aanmelding, startnummer en timingchip geregeld','Spullen ingepakt en vervoer geregeld','Weer, racebriefing en actuele regels bekeken']},
    {name:'Zwemmen',sport:'swim',icon:'🏊',items:['Zwembril en eventueel reservebril','Badmuts volgens organisator','Wetsuit indien toegestaan en gewenst','Zwemstart en route bekeken']},
    {name:'Wissels · T1/T2',sport:'transition',icon:'🔄',items:['Wisselzone en looproutes verkend','Handdoek en wisselspullen klaargelegd','Startnummer en bevestiging gecontroleerd']},
    {name:'Fietsen',sport:'bike',icon:'🚴',items:['Fiets, remmen en bandenspanning gecontroleerd','Helm en fietsschoenen gereed','Fietscomputer opgeladen en route voorbereid','Bidons en een eerder getest voedingsplan ingepakt','Reserveband, pomp of CO₂ en gereedschap']},
    {name:'Hardlopen',sport:'run',icon:'🏃',items:['Loopschoenen en sokken klaargelegd','Startnummer en raceband gereed','Pet of zonbescherming indien nodig','Eigen getest drink- en voedingsplan gecontroleerd']},
    {name:'Finish en terugreis',sport:'general',icon:'🏁',items:['Droge kleding en schoenen','Afspraak over vervoer en spullen ophalen','Herstelvoeding naar eigen voorkeur']}
  ];
  function values(){
    return {
      distance:selected,
      eventName:$('event-name').value.trim().slice(0,80),
      raceDate:$('race-date').value,
      start:$('start-time').value,
      swimPace:$('swim-pace').value,
      bikeSpeed:$('bike-speed').value,
      runPace:$('run-pace').value,
      t1Minutes:$('t1-minutes').value,
      t2Minutes:$('t2-minutes').value,
      target:$('target-time').value,
      swimMeters:$('swim-meters').value,
      bikeKm:$('bike-km').value,
      runKm:$('run-km').value,
      notes:$('race-notes').value.trim().slice(0,2000)
    };
  }
  function setDistance(key){
    if(key!=='custom'&&!Object.prototype.hasOwnProperty.call(core.DISTANCES,key))return;
    selected=key;
    buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.distance===key)));
    $('custom-distances').hidden=key!=='custom';
    $('distance-copy').textContent=key==='custom'
      ? tr('Vul hieronder zelf de zwem-, fiets- en loopafstand in.','Enter the swim, bike and run distances below.')
      : core.DISTANCES[key].swimMeters.toLocaleString(english?'en-GB':'nl-NL')+tr(' m zwemmen · ',' m swim · ')+core.formatKm(core.DISTANCES[key].bikeKm)+tr(' km fietsen · ',' km bike · ')+core.formatKm(core.DISTANCES[key].runKm)+tr(' km lopen',' km run');
    const target=$('target-time');
    // A target belongs to a distance: clearing avoids a misleading 70.3 sub-5 goal for Sprint or Full.
    target.value='';
    $('distance-label').textContent=distName(key);
    render();
  }
  function checklist(){
    const parent=$('checklist');
    for(const group of groups){
      const section=document.createElement('section');
      section.className='tri-check-group';section.dataset.sport=group.sport;
      const heading=document.createElement('h3');
      const emoji=document.createElement('span');emoji.setAttribute('aria-hidden','true');emoji.textContent=group.icon;
      heading.append(emoji,document.createTextNode(group.name));section.appendChild(heading);
      const ul=document.createElement('ul');
      for(const item of group.items){
        const li=document.createElement('li');
        const label=document.createElement('label');
        const input=document.createElement('input');input.type='checkbox';input.className='check-item';
        input.addEventListener('change',checked);
        const span=document.createElement('span');span.textContent=item;
        label.append(input,span);li.appendChild(label);ul.appendChild(li);
      }
      section.appendChild(ul);parent.appendChild(section);
    }
    checked();
  }
  function checked(){
    const nodes=[...document.querySelectorAll('.check-item')];
    const n=nodes.filter(x=>x.checked).length;
    $('check-progress').textContent=english?n+' of '+nodes.length+' items checked':n+' van '+nodes.length+' items afgevinkt';
  }
  function setSplits(p){
    const total=p.total;
    for(const [id,seconds] of [['swim',p.swim],['t1',p.t1],['bike',p.bike],['t2',p.t2],['run',p.run]]){
      $('split-'+id).textContent=core.formatDuration(seconds);
      $('bar-'+id).style.width=(seconds*100/total).toFixed(2)+'%';
    }
    $('swim-distance').textContent=core.formatKm(p.distance.swimMeters,0)+' m';
    $('bike-distance').textContent=core.formatKm(p.distance.bikeKm)+' km';
    $('run-distance').textContent=core.formatKm(p.distance.runKm)+' km';
    $('race-legs').textContent=core.formatKm(p.distance.swimMeters,0)+tr(' m zwem · ',' m swim · ')+core.formatKm(p.distance.bikeKm)+tr(' km fiets · ',' km bike · ')+core.formatKm(p.distance.runKm)+tr(' km loop',' km run');
  }
  function render(){
    const v=values();
    const tbody=$('timeline');tbody.replaceChildren();
    $('race-name-view').textContent=v.eventName||tr('Mijn triatlon','My triathlon');
    $('race-date-view').textContent=v.raceDate?' · '+v.raceDate:'';
    try{
      const p=core.calculate(v);
      $('validation-error').textContent='';
      $('time-total').textContent=core.formatDuration(p.total);
      $('goal-status').textContent=p.targetDifference===null
        ? tr('Voer optioneel een doeltijd in om te vergelijken.','Optionally enter a finish target to compare.')
        : p.targetDifference>=0
          ? tr('Op koers: ','On target: ')+core.formatDuration(p.targetDifference)+tr(' onder jouw doeltijd',' below your finish target')
          : core.formatDuration(-p.targetDifference)+tr(' boven jouw doeltijd',' above your finish target');
      $('goal-status').classList.toggle('neutral',p.targetDifference===null);
      setSplits(p);
      window.RaceInsights.render(v);
      for(const point of p.checkpoints){
        const tr=document.createElement('tr');tr.dataset.sport=point.discipline;
        for(const cell of [point.label,point.distance,core.formatDuration(point.elapsed),point.clock]){
          const td=document.createElement('td');td.textContent=cell;tr.appendChild(td);
        }
        tbody.appendChild(tr);
      }
      $('download-plan').disabled=false;$('print-plan').disabled=false;
    }catch(error){
      $('validation-error').textContent=error.message;
      $('time-total').textContent='—';
      $('goal-status').textContent=tr('Controleer de invoer','Check your input');
      window.RaceInsights.clear();
      for(const id of ['swim','bike','run','t1','t2']){
        $('split-'+id).textContent='—';$('bar-'+id).style.width='0%';
      }
      $('download-plan').disabled=true;$('print-plan').disabled=true;
    }
  }
  function textPlan(){
    const v=values(),p=core.calculate(v);
    const goals=core.goalPacing(v),scenarios=core.compareScenarios(v);
    const checks=[...document.querySelectorAll('.check-item')];
    const list=[
      'TRIZENTRO — TRIATHLON RACE PLAN',
      'Gratis planningsprototype. Scenario, geen gegarandeerde finishtijd.',
      '',
      'Wedstrijd: '+(v.eventName||'Mijn triatlon'),
      'Datum: '+(v.raceDate||'Niet ingevuld'),
      'Afstand: '+p.distance.name,
      'Disciplineafstanden: '+core.formatKm(p.distance.swimMeters,0)+' m / '+core.formatKm(p.distance.bikeKm)+' km / '+core.formatKm(p.distance.runKm)+' km',
      'Starttijd: '+v.start,
      'Zwemtempo per 100 m: '+v.swimPace,
      'Fietssnelheid: '+v.bikeSpeed+' km/u',
      'Hardlooptempo per km: '+v.runPace,
      'Wissel 1: '+v.t1Minutes+' minuten',
      'Wissel 2: '+v.t2Minutes+' minuten',
      'Optionele doeltijd: '+(v.target||'Niet ingevuld'),
      'Berekende finishtijd: '+core.formatDuration(p.total),
      '',
      'DOORKOMSTTIJDEN — THEORETISCH',
      ...p.checkpoints.map(cp=>[cp.label,cp.distance,core.formatDuration(cp.elapsed),cp.clock].join(' | ')),
      '',
      'SCENARIOVERGELIJKING — REKENVOORBEELDEN',
      ...scenarios.map(s=>s.label+': '+core.formatDuration(s.total)),
      ...(goals?['',
        'BENODIGDE DOELTEMPO’S — ELKE DISCIPLINE AFZONDERLIJK',
        'Zwemmen: '+goals.swim.value+(goals.swim.status==='possible'?' /100 m':''),
        'Fietsen: '+goals.bike.value+(goals.bike.status==='possible'?' km/u':''),
        'Hardlopen: '+goals.run.value+(goals.run.status==='possible'?' /km':''),
        'Alleen geldig bij gelijkblijvende overige disciplines en wisseltijden.'
      ]:[]),
      '',
      'MATERIAALCHECKLIST'
    ];
    let k=0;
    for(const group of groups){
      list.push('',group.name);
      for(const item of group.items)list.push((checks[k++]?.checked?'[x] ':'[ ] ')+item);
    }
    list.push('','NOTITIES',v.notes||'(geen)','',
      'Controleer parcours, starttijd, lokale wedstrijdregels en eventueel bekende cut-offs bij de organisator.',
      'Deze tool verstuurt geen ingevulde gegevens naar TriZentro.');
    return list.join('\n');
  }
  function download(){
    try{
      const blob=new Blob([textPlan()],{type:'text/plain;charset=utf-8'});
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=url;a.download='mijn-triathlon-raceplan.txt';
      document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1500);
    }catch(e){$('validation-error').textContent=e.message;}
  }
  buttons.forEach(btn=>btn.addEventListener('click',()=>setDistance(btn.dataset.distance)));
  ids.forEach(id=>$(id).addEventListener('input',render));
  $('download-plan').addEventListener('click',download);
  $('print-plan').addEventListener('click',()=>{try{core.calculate(values());window.print();}catch(e){$('validation-error').textContent=e.message;}});
  $('reset-plan').addEventListener('click',()=>{
    $('event-name').value='Mijn triatlon';$('race-date').value='';$('start-time').value='08:00';
    $('swim-pace').value='2:00';$('bike-speed').value='33';$('run-pace').value='5:00';
    $('t1-minutes').value='4';$('t2-minutes').value='3';
    $('swim-meters').value='1900';$('bike-km').value='90';$('run-km').value='21.0975';
    $('race-notes').value='';
    document.querySelectorAll('.check-item').forEach(x=>x.checked=false);
    checked();setDistance('half');
  });
  window.RaceInsights.bind(render,values);
  checklist();
  const param=new URLSearchParams(window.location.search).get('distance');
  setDistance(param==='custom'||Object.prototype.hasOwnProperty.call(core.DISTANCES,param||'')?param:'half');
})();
