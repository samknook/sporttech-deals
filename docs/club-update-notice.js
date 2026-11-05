/* Local, organizer-reviewed change notice. No publishing or network access. */
(function(root){
'use strict';
const labels={
 event:['Evenement','Event'],date:['Datum','Date'],venue:['Locatie','Venue'],guide:['Officiële bron','Official source'],
 checkin:['Registratie opent','Registration opens'],bikeClose:['Fietsincheck sluit','Bike check-in closes'],
 transitionClose:['Wisselzone sluit','Transition closes'],briefing:['Briefing','Briefing'],
 waveA:['Startgroep A','Wave A'],waveB:['Startgroep B','Wave B'],waveC:['Startgroep C','Wave C'],
 waveD:['Startgroep D','Wave D'],waveE:['Startgroep E','Wave E'],waveF:['Startgroep F','Wave F'],
 notes:['Bijzonderheden','Notes']
};
function build(previous,current,revision,core,template,locale='nl'){
 const nl=locale!=='en', analysis=core.analyze(current);
 if(analysis.warnings.length)throw Error('Resolve all event warnings before generating an update.');
 const changes=template.differences(previous,current,core);
 if(!changes.length)throw Error('There are no changes to announce.');
 if(typeof revision!=='string'||!/^v[0-9]{1,3}(?:\.[0-9]{1,3})?$/.test(revision))throw Error('Enter a valid revision.');
 const v=analysis.values;
 const out=[
 'TRIZENTRO — '+(nl?'CONCEPT WIJZIGINGSBERICHT':'DRAFT EVENT UPDATE'),
 (nl?'Evenement: ':'Event: ')+v.event,
 (nl?'Wedstrijddatum: ':'Race date: ')+v.date,
 (nl?'Nieuwe versie: ':'New version: ')+revision,
 '',
 nl?'WIJZIGINGEN SINDS HET VORIGE TEMPLATE':'CHANGES FROM PREVIOUS TEMPLATE',
 ...changes.map(x=>{
  const title=labels[x.key]?.[nl?0:1]||x.label;
  return title+': '+(x.before||'—')+' → '+(x.after||'—');
 }),
 '',
 (nl?'Officiële bron: ':'Official source: ')+v.guide,
 '',
 nl?'CONCEPT — Niet automatisch verstuurd of gepubliceerd. De organisator moet de tijden en wijzigingen zelf controleren en de publicatie goedkeuren.':'DRAFT — Not automatically sent or published. The organizer must verify all times and changes and approve publication.'
 ];
 return {text:out.join('\n'),changes,revision};
}
const api={build};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.TriZentroClubUpdateNotice=api;
})(typeof window!=='undefined'?window:globalThis);