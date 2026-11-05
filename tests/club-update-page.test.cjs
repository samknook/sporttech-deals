const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const core=require('../docs/club-brief-core.js');
const templates=require('../docs/club-template.js');
const notices=require('../docs/club-update-notice.js');
const page=require('../docs/club-update-page.js');
const fixture=()=>({event:'Sample Race',date:'2027-06-20',venue:'Demo town',guide:'https://example.org/guide',checkin:'06:00',bikeClose:'07:00',transitionClose:'07:30',briefing:'07:40',waveA:'08:00',waveB:'08:15',waveC:'08:30',waveD:'08:45',waveE:'09:00',waveF:'09:15',notes:'Check guide'});
test('printable bilingual update page includes exact revisions and source review date',()=>{
 const prev=fixture(),cur={...prev,waveC:'08:35',transitionClose:'07:25'};
 const html=page.html(prev,cur,'v2.1',core,templates,notices,{organizerConfirmed:true,checkedOn:'2026-11-05'});
 for(const expected of ['<!doctype html>','<html lang="nl">','id="set-nl"','id="set-en"','id="print-page"','2026-11-05','v2.1','08:30','08:35','07:25','noindex,nofollow','https://example.org/guide','Vorige versie','Previous version'])assert.ok(html.includes(expected),expected);
 assert.match(html,/@media print/);
 assert.match(html,/niet automatisch verstuurd of gepubliceerd/);
 assert.doesNotMatch(html,/fetch\(|localStorage|XMLHttpRequest/);
});
test('update export is blocked on unconfirmed review, invalid date or invalid event',()=>{
 const before=fixture(),after={...before,waveC:'08:35'};
 const run=(current,opts)=>page.html(before,current,'v2',core,templates,notices,opts);
 assert.throws(()=>run(after,{}),/approval/i);
 assert.throws(()=>run(after,{organizerConfirmed:true,checkedOn:'2026-02-30'}),/date/i);
 assert.throws(()=>run(after,{organizerConfirmed:true,checkedOn:'invalid'}),/date/i);
 assert.throws(()=>run(before,{organizerConfirmed:true,checkedOn:'2026-11-05'}),/no changes/i);
 assert.throws(()=>run({...after,waveD:'08:20'},{organizerConfirmed:true,checkedOn:'2026-11-05'}),/warnings/i);
});
test('organizer-entered details cannot inject script tags or markup into update HTML',()=>{
 const before=fixture(),after={...before,event:'<script>alert(1)</script>',notes:'<img src=x onerror=alert(1)>'};
 const html=page.html(before,after,'v2',core,templates,notices,{organizerConfirmed:true,checkedOn:'2026-11-05'});
 assert.doesNotMatch(html,/<script>alert\(1\)<\/script>/);
 assert.doesNotMatch(html,/<img src=x/);
 assert.match(html,/&lt;script&gt;/);
 assert.match(html,/&lt;img/);
});
test('builder requires source review and exposes a separate formatted download',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../docs/club-race-brief.html'),'utf8');
 for(const id of ['source-checked-on','download-update-html','update-review'])assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(html,/src="club-update-page.js"/);
 assert.match(html,/el\('source-checked-on'\)\.addEventListener\('input'/);
 assert.match(html,/el\('download-update-html'\)\.disabled=!permitted/);
 assert.match(html,/organizerConfirmed:true,checkedOn:/);
});
