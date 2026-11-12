/* Fast triathlon calculator — reuses RacePlannerCore; offline and tracking-free. */
(function(){
  'use strict';
  const core=window.RacePlannerCore;if(!core)return;
  const $=id=>document.getElementById(id);
  const english=window.TriZentroI18n&&window.TriZentroI18n.lang==='en';
  const tr=(nl,en)=>english?en:nl;
  const distName=id=>id==='olympic'?tr('Olympisch','Olympic'):id==='half'?tr('70.3 / Halve','70.3 / Half'):id==='custom'?tr('Eigen afstand','Custom distance'):core.DISTANCES[id].name;
  const selector=$('distance-selector'),buttons=[...selector.querySelectorAll('[data-distance]')];
  let selected='half';
  const inputIds=['swim-pace','bike-speed','run-pace','t1-minutes','t2-minutes','target-time','swim-meters','bike-km','run-km'];
  function values(){return {distance:selected,start:'08:00',swimPace:$('swim-pace').value,bikeSpeed:$('bike-speed').value,
    runPace:$('run-pace').value,t1Minutes:$('t1-minutes').value,t2Minutes:$('t2-minutes').value,
    swimMeters:$('swim-meters').value,bikeKm:$('bike-km').value,runKm:$('run-km').value,target:$('target-time').value};}
  function changeDistance(key){
    if(key!=='custom'&&!Object.prototype.hasOwnProperty.call(core.DISTANCES,key))return;
    selected=key;
    buttons.forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.distance===key)));
    $('custom-distances').hidden=key!=='custom';
    $('target-time').value='';
    $('distance-label').textContent=distName(key);
    update();
  }
  function update(){
    try{
      const p=core.calculate(values());
      $('validation-error').textContent='';
      $('time-total').textContent=core.formatDuration(p.total);
      $('goal-status').textContent=p.targetDifference===null
        ? tr('Vul eventueel een doeltijd in voor een vergelijking.','Optionally enter a finish target for comparison.')
        : p.targetDifference>=0?tr('Binnen doel: ','Within target: ')+core.formatDuration(p.targetDifference)+tr(' sneller',' faster')
          :tr('Boven doel: ','Above target: ')+core.formatDuration(-p.targetDifference)+tr(' langzamer',' slower');
      $('goal-status').classList.toggle('neutral',p.targetDifference===null);
      $('distance-description').textContent=core.formatKm(p.distance.swimMeters,0)+tr(' m zwemmen · ',' m swim · ')+core.formatKm(p.distance.bikeKm)+tr(' km fietsen · ',' km bike · ')+core.formatKm(p.distance.runKm)+tr(' km hardlopen',' km run');
      for(const [key,time] of [['swim',p.swim],['t1',p.t1],['bike',p.bike],['t2',p.t2],['run',p.run]]){
        $('split-'+key).textContent=core.formatDuration(time);
        $('bar-'+key).style.width=(time/p.total*100).toFixed(2)+'%';
      }
      $('planner-link').href='race-dashboard.html';
      window.RaceInsights.render(values());
    }catch(e){
      $('validation-error').textContent=e.message;
      $('time-total').textContent='—';
      $('goal-status').textContent=tr('Controleer je tempo’s of afstand','Check your paces or distance');
      window.RaceInsights.clear();
      for(const key of ['swim','t1','bike','t2','run']){
        $('split-'+key).textContent='—';$('bar-'+key).style.width='0%';
      }
    }
  }
  buttons.forEach(x=>x.addEventListener('click',()=>changeDistance(x.dataset.distance)));
  inputIds.forEach(id=>$(id).addEventListener('input',update));
  $('sub5').addEventListener('click',()=>{
    changeDistance('half');
    $('swim-pace').value='1:50';$('bike-speed').value='36';$('run-pace').value='4:55';
    $('t1-minutes').value='3';$('t2-minutes').value='2';$('target-time').value='05:00';update();
  });
  $('reset').addEventListener('click',()=>{
    $('swim-pace').value='2:00';$('bike-speed').value='33';$('run-pace').value='5:00';
    $('t1-minutes').value='4';$('t2-minutes').value='3';
    $('swim-meters').value='1900';$('bike-km').value='90';$('run-km').value='21.0975';
    changeDistance('half');
  });
  window.RaceInsights.bind(update,values);
  const fromUrl=new URLSearchParams(window.location.search).get('distance');
  changeDistance(fromUrl==='custom'||Object.prototype.hasOwnProperty.call(core.DISTANCES,fromUrl||'')?fromUrl:'half');
})();
