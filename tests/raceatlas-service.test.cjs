'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
test('RaceAtlas organizer submission form has required fields',()=>{
 const c=fs.readFileSync(path.join(root,'docs/raceatlas/organisatoren.html'),'utf8');
 for(const id of ['name','sport','city','country','url','confirm'])assert.match(c,new RegExp('id="'+id+'"'));
 assert.match(c,/id="eventForm" action="https:\/\/formsubmit\.co\/ajax\/trizentro\.team@gmail\.com"/);
 assert.doesNotMatch(c,/GitHub-account nodig|issues\/new/);
 assert.match(c,/organisator/i);
});
test('RaceAtlas backend is gated behind setup and includes opt-in primitives',()=>{
 const c=fs.readFileSync(path.join(root,'raceatlas-backend/worker.js'),'utf8');
 for(const fragment of ['/subscribe','/verify','/unsubscribe','TURNSTILE_SECRET','RESEND_API_KEY','verified=1','deliverOnce','registrationOpenAt'])assert.ok(c.includes(fragment),fragment);
 assert.match(c,/Explicit consent required/);
 assert.match(c,/dateEvidence==='official'/);
 const transformed=c.replace('export default {','return {');
 new Function(transformed);
});
test('RaceAtlas source checker labels link checks independently of dates',()=>{
 const c=fs.readFileSync(path.join(root,'scripts/raceatlas_check_sources.py'),'utf8');
 assert.match(c,/Does NOT verify event dates/);
 assert.match(c,/checked_urls/);
});
