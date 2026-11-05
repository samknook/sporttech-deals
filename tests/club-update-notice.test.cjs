const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const core=require('../docs/club-brief-core.js');
const template=require('../docs/club-template.js');
const notice=require('../docs/club-update-notice.js');
const fixture=()=>({event:'Sample Triathlon',date:'2027-06-20',venue:'Example',guide:'https://example.org/guide',checkin:'06:00',bikeClose:'07:00',transitionClose:'07:30',briefing:'07:40',waveA:'08:00',waveB:'08:15',waveC:'08:30',waveD:'08:45',waveE:'09:00',waveF:'09:15',notes:'Guide is source of truth'});
test('generates Dutch and English changes from previous to current event versions',()=>{
 const old=fixture(),current={...old,waveC:'08:35',transitionClose:'07:25'};
 const nl=notice.build(old,current,'v2.1',core,template,'nl');
 const en=notice.build(old,current,'v2.1',core,template,'en');
 assert.equal(nl.changes.length,2);
 assert.match(nl.text,/Startgroep C: 08:30 → 08:35/);
 assert.match(nl.text,/Wisselzone sluit: 07:30 → 07:25/);
 assert.match(en.text,/Wave C: 08:30 → 08:35/);
 assert.match(en.text,/DRAFT EVENT UPDATE/);
 assert.match(en.text,/https:\/\/example\.org\/guide/);
 assert.match(nl.text,/Niet automatisch verstuurd of gepubliceerd/);
});
test('does not produce a new change notice when no difference or schedule conflicts remain',()=>{
 const old=fixture();
 assert.throws(()=>notice.build(old,old,'v2',core,template));
 assert.throws(()=>notice.build(old,{...old,waveD:'08:15'},'v2',core,template));
 assert.throws(()=>notice.build(old,{...old,guide:''},'v2',core,template));
 assert.throws(()=>notice.build(old,{...old,waveC:'08:35'},'not-a-version',core,template));
});
test('browser update export requires manual review and is never sent automatically',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../docs/club-race-brief.html'),'utf8');
 for(const id of ['update-review','download-update','copy-update','template-update','update-status']){
  assert.match(html,new RegExp('id="'+id+'"'));
 }
 assert.match(html,/id="download-update" disabled/);
 assert.match(html,/src="club-update-notice.js"/);
 assert.match(html,/updateNoticeAvailability/);
 assert.match(html,/el\('update-review'\)\.checked=false/);
 assert.match(html,/window\.TriZentroClubUpdateNotice\.build/);
});
