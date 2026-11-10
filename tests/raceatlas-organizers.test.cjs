'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const dir=path.join(__dirname,'..','docs','raceatlas');
const page=fs.readFileSync(path.join(dir,'organisatoren.html'),'utf8');
const index=fs.readFileSync(path.join(dir,'index.html'),'utf8');
test('Organizer page is informational without public pricing offers',()=>{
  assert.match(page,/Voor organisatoren/);
  assert.match(page,/id="contactForm"/);
  assert.match(page,/id="eventForm"/);
  assert.doesNotMatch(page,/€\s*(?:49|79|199)|RaceAtlas Boost|RaceAtlas Pro|Pilot Boost/);
});
test('Organizer contact collects necessary fields, does not send business email to public issues',()=>{
  for(const id of ['contactName','contactEmail','contactSubject','contactMessage'])assert.match(page,new RegExp('id="'+id+'"'));
  const start=page.indexOf('function publicContactText()');
  const stop=page.indexOf('function privateContactText()',start);
  assert.ok(start>=0&&stop>start);
  assert.doesNotMatch(page.slice(start,stop),/contactEmail/);
  assert.match(page,/function privateContactText/);
  assert.match(page,/mailto:trizentro\.team@gmail\.com/);
  assert.match(page,/id="contactSend"/);
  assert.doesNotMatch(page,/contactGithub/);
});
test('Main navigation points to organizer info, not pricing',()=>{
  assert.match(index,/Voor organisatoren/);
  assert.match(index,/href="organisatoren\.html"/);
  assert.doesNotMatch(index,/promoot\.html|pakketten\.html/);
});
test('Organizer form posts to external form backend without opening user mail app',()=>{
 assert.match(page,/id="contactForm" action="https:\/\/formsubmit\.co\/ajax\/trizentro\.team@gmail\.com" method="POST"/);
 assert.match(page,/fetch\(CONTACT_ENDPOINT/);
 assert.match(page,/id="contactWebsite"/);
 assert.match(page,/_template:'table'/);
 assert.match(page,/formSubmitResult\(data\)/);
 assert.match(page,/isPendingActivation\(data\)/);
 assert.doesNotMatch(page,/window\.location\.href=mailto/);
});
test('Submission success checks explicit boolean and string true, never a false string',()=>{
 const match=page.match(/function formSubmitResult\(data\)\{[^}]+\}/);
 assert.ok(match);
 const ok=new Function(match[0]+';return formSubmitResult')();
 assert.equal(ok({success:true}),true);
 assert.equal(ok({success:'true'}),true);
 assert.equal(ok({success:'false'}),false);
 assert.equal(ok({success:false}),false);
 assert.equal(ok({message:'This form needs Activation',success:'false'}),false);
});

test('Race event submission is private and requires no Github account',()=>{
 assert.match(page,/id="eventContactEmail" type="email" required/);
 assert.match(page,/email:\$\('eventContactEmail'\)\.value\.trim\(\)/);
 assert.match(page,/we publiceren het niet op de evenementpagina/);
 assert.match(page,/id="eventForm" action="https:\/\/formsubmit\.co\/ajax\/trizentro\.team@gmail\.com" method="POST"/);
 assert.match(page,/id="eventSend"/);
 assert.match(page,/id="eventWebsiteTrap"/);
 assert.match(page,/\$\('eventForm'\)\.addEventListener\('submit',async e=>/);
 assert.match(page,/formSubmitResult\(result\)/);
 assert.match(page,/isPendingActivation\(result\)/);
 assert.doesNotMatch(page,/issues\/new|GitHub-account nodig|GitHub-venster/);
 assert.match(page,/ter beoordeling ingediend/);
});

test('Organizer FAQ and duathlon choice are available',()=>{
 assert.match(page,/id="orgFaqTitle"/);
 assert.match(page,/Duatlon \/ run-bike-run/);
 assert.match(page,/Wanneer staat mijn evenement online\?/);
 assert.match(page,/formulier is dus niet hetzelfde als publicatie/);
 assert.match(page,/We delen eventuele mogelijkheden en afspraken persoonlijk/);
});

test('Organizer submission captures verifiable source and confirmation',()=>{
  assert.match(page,/id="sourceUrl" type="url" pattern="https:\/\/\.\*"/);
  assert.match(page,/id="dataConfirmed" type="checkbox" required/);
  assert.match(page,/bron_datum_inschrijving_prijs:/);
  assert.match(page,/gegevens_gecontroleerd:/);
});
