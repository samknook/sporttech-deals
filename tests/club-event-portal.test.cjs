const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const brief=require('../docs/club-brief-core.js');
const portal=require('../docs/club-event-portal.js');
const valid=()=>({event:'Fictional Race',date:'2027-06-20',venue:'Example Town',guide:'https://example.org/fictional-guide',checkin:'06:00',bikeClose:'07:00',transitionClose:'07:30',briefing:'07:40',waveA:'08:00',waveB:'08:15',notes:'Welcome'});
test('a reviewed, conflict-free briefing generates a standalone responsive bilingual HTML page',()=>{
 const data=portal.documentHtml(brief.analyze(valid()),{organizerConfirmed:true,issuedAt:'2026-11-05'});
 for(const needle of ['<!doctype html>','<html lang="nl">','name="viewport"','noindex,nofollow','id="set-nl"','id="set-en"','2026-11-05','Wisselzone sluit','Transition closes','https://example.org/fictional-guide','static snapshot']){
  assert.ok(data.toLowerCase().includes(needle.toLowerCase()),'Missing: '+needle);
 }
 assert.match(data,/no tracking/i);
 assert.doesNotMatch(data,/<script[^>]*\bsrc=/i);
 assert.doesNotMatch(data,/localStorage|fetch\(|XMLHttpRequest/);
});
test('known conflicts, missing source or missing review block export',()=>{
 const base=brief.analyze(valid());
 assert.throws(()=>portal.documentHtml(base),/confirmation/);
 assert.throws(()=>portal.documentHtml(base,{organizerConfirmed:false}),/confirmation/);
 assert.throws(()=>portal.documentHtml(brief.analyze({...valid(),transitionClose:'08:20'}),{organizerConfirmed:true}),/warnings/);
 assert.throws(()=>portal.documentHtml(brief.analyze({...valid(),guide:''}),{organizerConfirmed:true}),/warnings/);
});
test('untrusted organizer input is HTML-escaped and never executable',()=>{
 const values={...valid(),event:'<img src=x onerror=alert(1)>',notes:'</script><script>alert(1)</script>',venue:'" onclick="oops'};
 const html=portal.documentHtml(brief.analyze(values),{organizerConfirmed:true,issuedAt:'2026-11-05'});
 assert.doesNotMatch(html,/<img src=x/);
 assert.doesNotMatch(html,/<script>alert\(1\)<\/script>/);
 assert.doesNotMatch(html, /onclick="oops/);
 assert.match(html,/&lt;img/);
 assert.match(html,/&lt;\/script&gt;/);
});
test('club builder asks for review and makes publication a separate user action',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../docs/club-race-brief.html'),'utf8');
 for(const id of ['download-portal','organizer-review','portal-status'])assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(html,/download-portal" disabled/);
 assert.match(html,/src="club-event-portal.js"/);
 assert.match(html,/organizerConfirmed:true/);
 assert.match(html,/el\('club-form'\)\.addEventListener\('input'/);
 assert.match(html,/publiceert niets automatisch/);
});
