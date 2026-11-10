'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..','docs','raceatlas');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const dataStart=html.indexOf('const EVENTS=')+'const EVENTS='.length;
const dataEnd=html.indexOf(';\nwindow.RACEATLAS_EVENTS',dataStart);
const events=JSON.parse(html.slice(dataStart,dataEnd));
test('RaceAtlas contains enough valid event records',()=>{
  assert.ok(events.length>=400);
  const ids=new Set();
  for(const e of events) {
    assert.equal(typeof e.id,'string');
    assert.ok(!ids.has(e.id),'Duplicate ID: '+e.id);ids.add(e.id);
    assert.ok(e.name&&e.place&&e.sport);
    if(e.date)assert.match(e.date,/^20\d{2}-\d{2}-\d{2}$/);
    else assert.ok(!e.date);
    if(e.registrationUrl)assert.match(e.registrationUrl,/^https:\/\//);
  }
});
test('RaceAtlas HTML scripts have valid JavaScript syntax',()=>{
  for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)){
    if(match[1].trim())new vm.Script(match[1]);
  }
  for(const name of ['distance.js','alerts.js','details.js'])new vm.Script(fs.readFileSync(path.join(root,name),'utf8'));
});
test('Event details, radius search and notifications are wired',()=>{
  assert.match(html,/src="details\.js"/);
  assert.match(html,/src="distance\.js"/);
  assert.match(html,/src="alerts\.js"/);
  assert.match(html,/data-ra-detail/);
  assert.match(html,/data-ra-alert/);
  assert.match(html,/window\.RACEATLAS_EVENTS=EVENTS/);
  assert.match(html,/RaceAtlasRadius\.matches/);
});
test('Unconfirmed events have no invented event date',()=>{
  const pending=events.filter(e=>e.status==='date_pending');
  assert.ok(pending.length>0);
  for(const e of pending)if(e.expectedMonth)assert.match(e.expectedMonth,/^(0[1-9]|1[0-2])$/);
});

test('Runtime rendering helper is declared and not swallowed by a comment',()=>{
  assert.match(html,/\/\/ Keep the default view scannable; preferences remain on this device only\.\s*\nconst safe=\(s\)=>/);
  assert.match(html,/function render\(\)\{/);
  assert.match(html,/render\(\);\s*<\/script>/);
});
test('Upcoming filter excludes records without an event date or expected month',()=>{
  assert.match(html,/function isFuture\(e\)\{if\(!e\.date&&!e\.expectedMonth\)return false;/);
});
test('Empty saved season gives clear guidance instead of an irrelevant filter warning',()=>{
  assert.match(html,/id==='savedCards'\?'Je hebt nog geen evenementen bewaard/);
  assert.match(html,/id==='savedCards'\?'Bekijk evenementen'/);
});

test('One-click officially confirmed date filter is wired and clearable',()=>{
  assert.match(html,/id="onlyVerified" type="checkbox"/);
  assert.match(html,/\$\('onlyVerified'\)\.checked\|\|e\.dateEvidence==='official'/);
  assert.match(html,/\$\('onlyVerified'\)\.checked=false/);
  assert.match(html,/Officieel bevestigde datums/);
});
test('Expected-month events respect their explicit expected year when present',()=>{
  assert.match(html,/e\.expectedYear\|\|'2027'/);
  assert.match(html,/\(e\.expectedYear\|\|'2027'\)===year/);
});

test('Event results distinguish verified from unverified event dates',()=>{
  assert.match(html,/id="verificationSummary"/);
  assert.match(html,/all\.filter\(e=>e\.dateEvidence==='official'\)\.length/);
  assert.match(html,/met nog te controleren datum/);
});

test('Data quality separates official organizer URLs from calendar citations',()=>{
  assert.match(html,/met officiële evenementwebsite/);
  assert.match(html,/Een kalenderbron is geen officiële bevestiging/);
  assert.match(html,/EVENTS\.filter\(e=>!!e\.officialEventUrl\)/);
});
test('Uncertain dates remain visible through the end of their expected month',()=>{
  assert.match(html,/const lastDay=new Date\(year,month,0\)\.getDate\(\)/);
});

test('Verified registration updates are grounded in organizer sources',()=>{
  const egmond=events.find(e=>e.id==='ra-0');
  assert.equal(egmond.registrationDate,'2026-07-27');
  assert.equal(egmond.preregistrationDate,'2026-07-13');
  assert.match(egmond.registrationInfoUrl,/lechampion\.nl/);
  const schoorl=events.find(e=>e.id==='ra-2');
  assert.equal(schoorl.registrationStatus,'mixed');
  assert.match(schoorl.registrationInfoUrl,/lechampion\.nl/);
  const westfriesland=events.find(e=>e.id==='ra-11');
  assert.equal(westfriesland.registrationStatus,'sold_out');
  assert.equal(typeof westfriesland.priceEur,'undefined','Do not present enhanced-package price as a general entry fee');
});

test('Conflicting official prices are not presented as verified amounts',()=>{
 const kids=events.find(e=>e.id==='ra-419');
 assert.equal(kids.priceStatus,'conflicting');
 assert.equal(kids.priceEur,undefined);
 assert.match(kids.priceNote,/7,50/);
 assert.match(kids.priceNote,/6,00/);
 const ronde=events.find(e=>e.id==='ra-355');
 assert.match(ronde.registrationUrl,/rondevannoordholland\.nl\/inschrijven/);
 assert.match(ronde.registrationStatusNote,/tegenstrijdige statusmeldingen/);
});
test('Detail display explains conflicting prices and exposes verification date',()=>{
 const details=fs.readFileSync(path.join(root,'details.js'),'utf8');
 assert.match(details,/e\.priceStatus==='conflicting'/);
 assert.match(details,/Laatst gecontroleerd/);
 assert.match(details,/Tegenstrijdige informatie op officiële bron/);
});

test('Price data filters distinguish sourced amounts from conflicting information',()=>{
  assert.match(html,/<option value="price">Prijs bekend<\/option>/);
  assert.match(html,/<option value="conflict">Prijs onduidelijk<\/option>/);
  assert.match(html,/registrationFilter==='price'&&typeof e\.priceEur==='number'/);
  assert.match(html,/registrationFilter==='conflict'&&e\.priceStatus==='conflicting'/);
  assert.match(html,/Prijs onduidelijk — zie details/);
});
