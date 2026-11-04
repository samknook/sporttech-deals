/* SportTech Deals — clientside race planner preview; geen data naar servers. */
(function () {
  'use strict';
  const core = window.RacePlannerCore;
  if (!core) return;
  const $ = id => document.getElementById(id);
  const inputIds = ['event-name','race-date','start-time','swim-pace','bike-speed','run-pace','t1-minutes','t2-minutes','race-notes'];
  const fields = () => ({
    eventName: $('event-name').value.trim().slice(0,80),
    raceDate: $('race-date').value,
    start: $('start-time').value,
    swimPace: $('swim-pace').value,
    bikeSpeed: $('bike-speed').value,
    runPace: $('run-pace').value,
    t1Minutes: $('t1-minutes').value,
    t2Minutes: $('t2-minutes').value,
    notes: $('race-notes').value.trim().slice(0,2000)
  });
  const groups = [
    {name:'Voor vertrek',items:['Startdocumenten en locatie gecontroleerd','Materiaal en fiets gecontroleerd','Route en vertrektijd gepland','Weer en actuele wedstrijdregels bekeken']},
    {name:'Zwemmen en wissel 1',items:['Zwembril en reservebril','Badmuts volgens wedstrijdregels','Wetsuit indien toegestaan en gewenst','Timingchip en eventuele raceband','Handdoek en wisselspullen']},
    {name:'Fietsen en wissel 2',items:['Fiets, bandenspanning en remmen gecontroleerd','Helm en fietsschoenen','Fietscomputer opgeladen en parcours geladen','Bidons en eigen getest voedingsplan','Reserveonderdelen en gereedschap','Loopschoenen en startnummer']},
    {name:'Na de finish',items:['Droge kleding en schoenen','Vervoer en spullen ophalen','Herstelmaaltijd of -snack voor eigen voorkeur']}
  ];

  function drawChecklist() {
    const parent = $('checklist');
    for (const group of groups) {
      const section = document.createElement('section'); section.className='check-group';
      const heading = document.createElement('h3'); heading.textContent=group.name; section.appendChild(heading);
      const ul=document.createElement('ul');
      for (const item of group.items) {
        const li=document.createElement('li'),label=document.createElement('label'),checkbox=document.createElement('input'),span=document.createElement('span');
        checkbox.type='checkbox'; checkbox.className='check-item'; checkbox.addEventListener('change',updateChecked);
        span.textContent=item; label.append(checkbox,span);li.appendChild(label);ul.appendChild(li);
      }
      section.appendChild(ul);parent.appendChild(section);
    }
    updateChecked();
  }
  function updateChecked() {
    const nodes=[...document.querySelectorAll('.check-item')];
    const count=nodes.filter(el=>el.checked).length;
    $('check-progress').textContent=count+' van '+nodes.length+' afgevinkt';
  }
  function render() {
    const values=fields();
    const body=$('timeline');
    body.replaceChildren();
    try {
      const result=core.calculate(values);
      $('validation-error').textContent='';
      $('time-total').textContent=core.formatDuration(result.total);
      $('goal-status').textContent=result.targetDifference >= 0
        ? 'Onder 5 uur: '+core.formatDuration(result.targetDifference)+' marge'
        : 'Boven 5 uur: '+core.formatDuration(-result.targetDifference)+' verschil';
      $('splits').textContent='Zwemmen '+core.formatDuration(result.swim)+' · T1 '+core.formatDuration(result.t1)+
        ' · Fietsen '+core.formatDuration(result.bike)+' · T2 '+core.formatDuration(result.t2)+
        ' · Hardlopen '+core.formatDuration(result.run);
      $('race-name-view').textContent=values.eventName||'Mijn 70.3 race';
      $('race-date-view').textContent=values.raceDate?' · '+values.raceDate:'';
      for (const point of result.checkpoints) {
        const tr=document.createElement('tr');
        for (const cell of [point.label,point.distance,core.formatDuration(point.elapsed),point.clock]) {
          const td=document.createElement('td');td.textContent=cell;tr.appendChild(td);
        }
        body.appendChild(tr);
      }
      $('download-plan').disabled=false;
      $('print-plan').disabled=false;
    } catch(error) {
      $('validation-error').textContent=error.message;
      $('time-total').textContent='—';
      $('goal-status').textContent='Controleer de invoer';
      $('splits').textContent='';
      $('download-plan').disabled=true;
      $('print-plan').disabled=true;
    }
  }
  function textPlan() {
    const values=fields(),plan=core.calculate(values);
    const checked=[...document.querySelectorAll('.check-item')];
    const lines=[
      'SPORTTECH DEALS — MIJN 70.3 RACEPLAN',
      'Conceptplanning, geen voorspelling of persoonlijk sportadvies.',
      '',
      'Wedstrijd: '+(values.eventName||'Mijn 70.3 race'),
      'Datum: '+(values.raceDate||'Nog niet ingevuld'),
      'Starttijd: '+values.start,
      'Zwemtempo: '+values.swimPace+' /100 m',
      'Fietssnelheid: '+values.bikeSpeed+' km/u',
      'Looptempo: '+values.runPace+' /km',
      'Verwachte totaalduur: '+core.formatDuration(plan.total),
      '',
      'PLANNING / THEORETISCHE DOORKOMSTTIJDEN',
      ...plan.checkpoints.map(p=>p.label+' | '+p.distance+' | '+core.formatDuration(p.elapsed)+' | '+p.clock),
      '',
      'MATERIAALCHECKLIST'
    ];
    let j=0;
    for(const group of groups) {
      lines.push('',group.name);
      for(const item of group.items){lines.push((checked[j++]?.checked?'[x] ':'[ ] ')+item);}
    }
    lines.push('','EIGEN NOTITIES',values.notes||'(geen)','',
      'Controleer omstandigheden, lokale regels, parcours, wissels en benodigdheden bij de organisator.',
      'SportTech Deals — gratis prototype. Alle ingevulde gegevens blijven in deze browser tot je ze zelf exporteert.');
    return lines.join('\n');
  }
  function download() {
    try {
      const text=textPlan();
      const blob=new Blob([text],{type:'text/plain;charset=utf-8'});
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');a.href=url;a.download='mijn-70-3-raceplan.txt';document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1000);
    }catch(err){$('validation-error').textContent=err.message;}
  }
  inputIds.forEach(id=>$(id).addEventListener('input',render));
  $('download-plan').addEventListener('click',download);
  $('print-plan').addEventListener('click',()=>{try{core.calculate(fields());window.print();}catch(err){$('validation-error').textContent=err.message;}});
  $('reset-plan').addEventListener('click',()=>{
    $('event-name').value='Mijn 70.3 race';$('race-date').value='';$('start-time').value='08:00';
    $('swim-pace').value='2:00';$('bike-speed').value='33';$('run-pace').value='5:00';
    $('t1-minutes').value='4';$('t2-minutes').value='3';$('race-notes').value='';
    document.querySelectorAll('.check-item').forEach(el=>{el.checked=false;});
    updateChecked();render();
  });
  drawChecklist();
  render();
})();
