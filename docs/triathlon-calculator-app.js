/* Fast triathlon calculator — reuses RacePlannerCore; offline and tracking-free. */
(function(){
  'use strict';
  const core=window.RacePlannerCore;if(!core)return;
  const $=id=>document.getElementById(id);
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
    $('distance-label').textContent=key==='custom'?'Eigen afstand':core.DISTANCES[key].name;
    update();
  }
  function update(){
    try{
      const p=core.calculate(values());
      $('validation-error').textContent='';
      $('time-total').textContent=core.formatDuration(p.total);
      $('goal-status').textContent=p.targetDifference===null
        ? 'Vul eventueel een doeltijd in voor een vergelijking.'
        : p.targetDifference>=0?'Binnen doel: '+core.formatDuration(p.targetDifference)+' sneller'
          :'Boven doel: '+core.formatDuration(-p.targetDifference)+' langzamer';
      $('goal-status').classList.toggle('neutral',p.targetDifference===null);
      $('distance-description').textContent=core.formatKm(p.distance.swimMeters,0)+' m zwemmen · '+core.formatKm(p.distance.bikeKm)+' km fietsen · '+core.formatKm(p.distance.runKm)+' km hardlopen';
      for(const [key,time] of [['swim',p.swim],['t1',p.t1],['bike',p.bike],['t2',p.t2],['run',p.run]]){
        $('split-'+key).textContent=core.formatDuration(time);
        $('bar-'+key).style.width=(time/p.total*100).toFixed(2)+'%';
      }
      $('planner-link').href='race-planner.html?distance='+encodeURIComponent(selected);
    }catch(e){
      $('validation-error').textContent=e.message;
      $('time-total').textContent='—';
      $('goal-status').textContent='Controleer je tempo’s of afstand';
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
  const fromUrl=new URLSearchParams(window.location.search).get('distance');
  changeDistance(fromUrl==='custom'||Object.prototype.hasOwnProperty.call(core.DISTANCES,fromUrl||'')?fromUrl:'half');
})();
