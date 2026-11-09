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
