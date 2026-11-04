/* Shared client-side goal pacing and race scenario cards. No networking. */
(function(g){
  'use strict';
  const core=g.RacePlannerCore;
  if(!core)return;
  const $=id=>document.getElementById(id);
  const legs=['swim','bike','run'],keys=['slower','base','faster'];
  const notes={
    possible:'Bij gelijkblijvende overige tempo’s en wissels. Pas dit rekenvoorbeeld toe met de knop.',
    already:'Ook met een rustiger tempo binnen het calculatorbereik kun je je doel halen, als de andere onderdelen gelijk blijven.',
    'outside-fast':'Met de andere onderdelen gelijk ligt de benodigde waarde buiten het invoerbereik.'
  };
  function delta(n){return Math.abs(n)<0.5?'Jouw invoer':(n<0?'−':'+')+core.formatDuration(Math.abs(n))+' ten opzichte van jouw invoer';}
  function render(v){
    const list=core.compareScenarios(v);
    keys.forEach((key,i)=>{
      $('scenario-'+key+'-time').textContent=core.formatDuration(list[i].total);
      $('scenario-'+key+'-delta').textContent=delta(list[i].deltaSeconds);
    });
    const goal=core.goalPacing(v);
    $('goal-analysis').hidden=goal===null;
    if(!goal)return;
    legs.forEach(leg=>{
      const r=goal[leg],unit=leg==='bike'?' km/u':leg==='swim'?' /100 m':' /km';
      $('goal-'+leg).textContent=r.status==='possible'?r.value+unit:r.value;
      $('goal-'+leg+'-note').textContent=notes[r.status];
      const btn=document.querySelector('[data-goal-apply="'+leg+'"]');
      if(btn)btn.hidden=r.status!=='possible';
    });
  }
  function clear(){
    $('goal-analysis').hidden=true;
    keys.forEach(key=>{
      $('scenario-'+key+'-time').textContent='—';
      $('scenario-'+key+'-delta').textContent='Controleer de invoer.';
    });
  }
  function bind(update,getValues){
    document.querySelectorAll('[data-goal-apply]').forEach(button=>
      button.addEventListener('click',()=>{
        try{
          const leg=button.dataset.goalApply;
          if(!legs.includes(leg))return;
          const result=core.goalPacing(getValues()),r=result?.[leg];
          if(!r||r.status!=='possible')return;
          $(leg==='swim'?'swim-pace':leg==='bike'?'bike-speed':'run-pace').value=leg==='bike'?r.value.replace(',','.'):r.value;
          update();
        }catch(e){$('validation-error').textContent=e.message;}
      })
    );
  }
  g.RaceInsights={render,clear,bind};
})(window);
