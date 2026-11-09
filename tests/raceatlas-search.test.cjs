'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=path.resolve(__dirname,'..','docs','raceatlas');
const page=fs.readFileSync(path.join(base,'index.html'),'utf8');
const detail=fs.readFileSync(path.join(base,'details.js'),'utf8');
const alerts=fs.readFileSync(path.join(base,'alerts.js'),'utf8');
const dataset=JSON.parse(page.slice(page.indexOf('const EVENTS=')+13,page.indexOf(';\nwindow.RACEATLAS_EVENTS')));
const code=(page.match(/<script>([\s\S]*?)<\/script>/)||[])[1]||'';
function sourceFunction(name){
 const i=code.indexOf('function '+name+'(');
 assert.ok(i>=0,name+' must exist');
 const brace=code.indexOf('{',i);let depth=0,j=brace;
 for(;j<code.length;j++){if(code[j]==='{')depth++;else if(code[j]==='}'){depth--;if(depth===0)break}}
 return code.slice(i,j+1);
}
const normalize=new Function(sourceFunction('searchNormalized')+';return searchNormalized')();
const isDuo=new Function(sourceFunction('isDuathlon')+';return isDuathlon')();
test('All 420 events keep unique IDs after redesign',()=>{
 assert.ok(dataset.length>=420);
 assert.equal(new Set(dataset.map(e=>e.id)).size,dataset.length);
});
test('Search ignores case, diacritics, dash and extra spaces',()=>{
 assert.equal(normalize('  ÉGMOND–AAN ZEE  '),normalize('egmond–aan zee'));
 assert.equal(normalize('  Ronde  van Noord-Holland '),'ronde van noord holland');
});
test('Triathlons are not confused with duathlon or run-bike-run',()=>{
 assert.equal(isDuo({name:'Run Bike Run Pijnacker',discipline:'Duatlon'}),true);
 assert.equal(isDuo({name:'NK Duathlon Sprint',discipline:'Duathlon'}),true);
 assert.equal(isDuo({name:'IRONMAN 70.3 Westfriesland',discipline:'Middenafstand'}),false);
});
test('Favourites quick filter and alerts are linked to event cards',()=>{
 assert.match(page,/data-quick="saved"/);
 assert.match(page,/quick==='saved'&&saved.includes\(e.id\)/);
 assert.match(page,/RaceAtlasAlerts\?\.syncButtons/);
 assert.match(alerts,/openForEvent\(id\)/);
 assert.match(detail,/Meldingen instellen/);
});
test('Fees, signup dates and official fee source appear only in details',()=>{
 assert.doesNotMatch(page.slice(page.indexOf('function eventCard('),page.indexOf('function renderCards(')),/priceEur|registrationDate/);
 assert.match(detail,/Inschrijfprijs/);
 assert.match(detail,/Opening inschrijving/);
 assert.match(detail,/Bron prijs:/);
});

test('Missing source links are never silently replaced by generic calendars',()=>{
 const fn=sourceFunction('source');
 assert.match(fn,/e\.source\|\|null/);
 const card=page.slice(page.indexOf('function eventCard(e)'),page.indexOf('function renderCards('));
 assert.match(card,/raSourceMissing/);
 assert.match(card,/eventUrl\?/);
 assert.doesNotMatch(fn,/fietssport\.nl|triathlonbond\.nl|hardlopen\.nl/);
});
test('Data-quality summary is derived from records and source evidence',()=>{
 assert.match(page,/id="raQualitySummary"/);
 assert.match(page,/function renderQualitySummary/);
 assert.match(page,/Bron ontbreekt/);
 assert.match(detail,/specifieke bronlink/);
});
test('Registration-page filter only matches an actual registration link',()=>{
 const fn=sourceFunction('hasRegistrationPage');
 const hasLink=new Function(fn+';return hasRegistrationPage')();
 assert.equal(hasLink({registrationStatus:'sold_out'}),false);
 assert.equal(hasLink({registrationStatus:'link_available'}),false);
 assert.equal(hasLink({registrationUrl:'https://example.org/register'}),true);
});

test('All RaceAtlas events have a linked named event, club, or calendar source',()=>{
 for(const e of dataset)assert.match(e.officialEventUrl||e.source,/^https:\/\/[^/]+/,'Missing source for '+e.name);
});
test('Opening dates, price values and currency metadata are coherent',()=>{
 for(const e of dataset){
  if(e.registrationDate)assert.match(e.registrationDate,/^20\d{2}-\d{2}-\d{2}$/);
  if(e.registrationEndDate)assert.match(e.registrationEndDate,/^20\d{2}-\d{2}-\d{2}$/);
  if(e.priceEur!==undefined)assert.ok(Number.isFinite(e.priceEur)&&e.priceEur>=0,e.name);
  if(e.priceAmount!==undefined){assert.ok(Number.isFinite(e.priceAmount)&&e.priceAmount>=0,e.name);assert.match(e.priceCurrency,/^[A-Z]{3}$/)}
 }
});
test('Known London weekend and unconfirmed Groningen date are represented without false precision',()=>{
 const london=dataset.find(e=>e.name==='London Marathon');
 assert.equal(london.eventStartDate,'2027-04-24');
 assert.equal(london.date,'2027-04-25');
 const groningen=dataset.find(e=>e.name==='4 Mijl van Groningen');
 assert.equal(groningen.date,null);assert.equal(groningen.expectedMonth,'10');
});
test('Race detail shows different pricing models and enrollment windows',()=>{
 assert.match(detail,/priceCurrency/);
 assert.match(detail,/priceNote/);
 assert.match(detail,/registrationEndDate/);
 assert.match(detail,/eventStartDate/);
 assert.match(detail,/statuses=/);
});

test('New search matches words in any order and ignores punctuation',()=>{
 const fn=sourceFunction('searchMatches');
 const matches=new Function(sourceFunction('searchNormalized')+';'+fn+';return searchMatches')();
 const event={name:'Egmond Halve Marathon',place:'Egmond aan Zee',distance:'21,1 km',discipline:'Weg',country:'Nederland'};
 assert.equal(matches(event,normalize('marathon egmond')),true);
 assert.equal(matches(event,normalize('EGMOND  21,1')),true);
 assert.equal(matches(event,normalize('triathlon egmond')),false);
});
test('Upcoming is enabled on first load and active filters can be removed',()=>{
 assert.match(page,/id="future" type="checkbox" checked/);
 assert.match(page,/id="raActiveFilters"/);
 assert.match(page,/function renderActiveFilters/);
 assert.match(page,/Verwijder filter/);
 assert.match(page,/Wis filters en bekijk alle evenementen/);
});
