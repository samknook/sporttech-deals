'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../docs/raceatlas');
const details=fs.readFileSync(path.join(root,'details.js'),'utf8');
const form=fs.readFileSync(path.join(root,'organisatoren.html'),'utf8');
test('organizers can claim a canonical event directly from race details',()=>{
 assert.match(details,/Ik organiseer dit evenement/);
 assert.match(details,/searchParams\.set\('onderwerp','Claim je evenement'\)/);
 assert.match(details,/searchParams\.set\('eventId',e\.id\)/);
 assert.match(form,/option value="Claim je evenement"/);
 assert.match(form,/verifieert je relatie met het evenement/);
});
test('organizer report requests preserve the race context',()=>{
 assert.match(details,/Vraag evenementenrapport aan/);
 assert.match(details,/searchParams\.set\('onderwerp','Evenementrapport aanvragen'\)/);
 assert.match(form,/option value="Evenementrapport aanvragen"/);
 assert.match(form,/report=subject==='Evenementrapport aanvragen'/);
 assert.match(form,/contactEvent'\)\.required=claim\|\|report/);
 assert.match(form,/correctionNotes'\)\.required=active/);
});
test('report requests are private, verified and do not claim unique users',()=>{
 assert.match(form,/geaggregeerd, geen unieke bezoekers of bevestigde inschrijvingen/);
 assert.match(form,/controleert je relatie met het evenement/);
 assert.match(form,/\.addEventListener\('submit',async e=>/);
 assert.match(form,/const CONTACT_ENDPOINT='https:\/\/formsubmit\.co\/ajax\//);
 assert.doesNotMatch(form,/window\.location\.href\s*=\s*\S+admin/);
});
