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

test('Calendar exports derive end date from the same start date',()=>{
  assert.match(html,/const d=new Date\(start\+'T12:00:00'\)/);
  assert.doesNotMatch(html,/const d=new Date\(e\.date\+'T12:00:00'\);d\.setDate\(d\.getDate\(\)\+1\);lines\.push/);
  assert.match(html,/'DTSTAMP:'\+stamp/);
  const alertScript=fs.readFileSync(path.join(root,'alerts.js'),'utf8');
  assert.match(alertScript,/'DTSTAMP:'\+stamp/);
});
test('No region-specific quick filter is displayed, but existing events remain searchable',()=>{
  assert.doesNotMatch(html,/data-quick="nh"/);
  assert.doesNotMatch(html,/quick==='nh'/);
  for(const id of ['ra-0','ra-22','ra-277','ra-305'])assert.ok(events.some(e=>e.id===id));
  const radiusScript=fs.readFileSync(path.join(root,'distance.js'),'utf8');
  assert.doesNotMatch(radiusScript,/placeholder="[^"]*Oosthuizen/);
  assert.match(radiusScript,/placeholder="Bijv. Utrecht, Rotterdam, Amsterdam"/);
});
test('Search selection can be shared and safely restored from URL',()=>{
 assert.match(html,/id="shareSearch"/);
 assert.match(html,/function restoreSearchFromUrl\(\)/);
 assert.match(html,/function searchUrl\(\)/);
 assert.match(html,/history\.replaceState\(history\.state/);
 assert.match(html,/url\.searchParams\.delete\('event'\)/);
 assert.match(html,/input\.tagName==='SELECT'&&![\s\S]*?Array\.from\(input\.options\)/);
 assert.match(html,/restoreSearchFromUrl\(\);/);
 assert.match(html,/\$\('shareSearch'\)\.onclick=shareSearch/);
});

test('Shared link round-trip restores valid selections and preserves deep links',()=>{
 const start=html.indexOf('const SHARE_FIELDS=');
 const end=html.indexOf('function render(){',start);
 assert.ok(start>=0&&end>start);
 const inputs={};
 const fields=['q','sport','country','year','month','certainty','distanceCategory','registrationFilter','sort'];
 for(const id of fields)inputs[id]={tagName:'INPUT',value:''};
 for(const id of ['sport','month','sort']){
   const permitted=id==='sport'?['','Triatlon']:id==='month'?['','06']:['date','name'];
   inputs[id]={tagName:'SELECT',value:permitted[0],options:permitted.map(value=>({value}))};
 }
 inputs.future={checked:true};
 inputs.onlyVerified={checked:false};
 const buttons=[{dataset:{quick:'all'}},{dataset:{quick:'major'}}];
 const sandbox={
   URL,URLSearchParams,
   location:{href:'https://example.test/raceatlas/?event=ra-11&ra_sport=Triatlon&ra_month=06&ra_quick=major&ra_future=0&other=ok',search:'?event=ra-11&ra_sport=Triatlon&ra_month=06&ra_quick=major&ra_future=0&other=ok'},
   document:{getElementById:id=>inputs[id],querySelectorAll:()=>buttons},
   $:id=>inputs[id],
   history:{state:null,replaceState(){}},
   setPills(){},quick:'all'
 };
 vm.runInNewContext(html.slice(start,end)+';restoreSearchFromUrl();sharedUrl=searchUrl().toString();',sandbox);
 assert.equal(inputs.sport.value,'Triatlon');
 assert.equal(inputs.month.value,'06');
 assert.equal(inputs.future.checked,false);
 assert.equal(sandbox.quick,'major');
 const url=sandbox.sharedUrl;
 assert.match(url,/event=ra-11/);
 assert.match(url,/other=ok/);
 assert.match(url,/ra_sport=Triatlon/);
 assert.match(url,/ra_month=06/);
 assert.match(url,/ra_future=0/);
 assert.match(url,/ra_quick=major/);
});

test('Amsterdam Marathon is a confirmed major with official 2027 information',()=>{
 const amsterdam=events.find(e=>e.id==='ra-418');
 assert.equal(amsterdam.name,'TCS Amsterdam Marathon');
 assert.equal(amsterdam.major,true);
 assert.equal(amsterdam.featuredTier,'major');
 assert.equal(amsterdam.date,'2027-10-31');
 assert.equal(amsterdam.dateEvidence,'official');
 assert.equal(amsterdam.registrationDate,'2026-12-19');
 assert.match(amsterdam.officialEventUrl,/tcsamsterdammarathon\.nl/);
 assert.equal(amsterdam.eventWeekendStart,'2027-10-30');
 assert.equal(amsterdam.eventStartDate,undefined,'The marathon itself is on Sunday, not Saturday');
});
test('Regional runs are not all automatically promoted to major',()=>{
 for(const id of ['ra-307','ra-310','ra-312','ra-316','ra-323','ra-327','ra-332','ra-355','ra-361']){
  const e=events.find(e=>e.id===id);
  assert.ok(e,id);
  assert.equal(e.major,false,id);
  assert.equal(e.featuredTier,'regional');
 }
});
test('Major event artwork is per-event and clearly not represented as licensed photography',()=>{
 assert.match(html,/function raceArtwork\(e\)/);
 assert.match(html,/const key=e\.id\+'\|'\+e\.name/);
 assert.match(html,/data:image\/svg\+xml;charset=UTF-8/);
 assert.match(html,/RaceAtlas-illustratie/);
 assert.match(html,/e\.imageRights==='licensed'/);
 const details=fs.readFileSync(path.join(root,'details.js'),'utf8');
 assert.match(details,/window\.RaceAtlasArtwork\(e\)/);
 assert.match(details,/ra-detail-artwork/);
 assert.match(details,/geen officiële evenementfoto/);
});

test('Rotterdam Marathon photography has explicit CC license and an attribution source',()=>{
 const rotterdam=events.find(e=>e.id==='ra-5');
 assert.ok(rotterdam&&rotterdam.major);
 assert.equal(rotterdam.imageRights,'licensed');
 assert.match(rotterdam.imageCredit,/Peter van der Sluijs/);
 assert.match(rotterdam.imageSourceUrl,/commons\.wikimedia\.org/);
 assert.match(rotterdam.imageLicenseUrl,/creativecommons\.org\/licenses\/by-sa\/3\.0/);
 assert.match(html,/raArtworkCredit isLicensed/);
});

test('National championships have their own tier rather than automatic major status',()=>{
 for(const id of ['ra-150','ra-151','ra-152','ra-153','ra-154','ra-155','ra-156','ra-157','ra-158','ra-159']){
  const e=events.find(e=>e.id===id);
  assert.ok(e,id);
  assert.equal(e.major,false,id);
  assert.equal(e.featuredTier,'championship',id);
 }
 const details=fs.readFileSync(path.join(root,'details.js'),'utf8');
 assert.match(details,/not_open:'Inschrijving nog niet geopend/);
});

test('Priority majors have original event-specific hero images instead of generic placeholders',()=>{
 const expected={
  'ra-418':'images/amsterdam-marathon.svg',
  'ra-8':'images/dam-tot-damloop.svg',
  'ra-11':'images/westfriesland-triathlon.svg',
  'ra-0':'images/egmond-half-marathon.svg'
 };
 for(const [id,filename] of Object.entries(expected)){
  const race=events.find(e=>e.id===id);
  assert.ok(race&&race.major);
  assert.equal(race.imageRights,'original');
  assert.equal(race.imageUrl,filename);
  const asset=fs.readFileSync(path.join(root,filename),'utf8');
  assert.match(asset,/<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(asset,/<\/svg>\s*$/);
  assert.doesNotMatch(asset,/http:\/\/images\.unsplash\.com|data:image\/png;base64/);
 }
 assert.match(html,/e\.imageRights==='original'/);
});

test('Every major event has a dedicated and documented image source',()=>{
 for(const e of events.filter(e=>e.major)){
  assert.ok(e.imageUrl,'Missing imageUrl '+e.id);
  assert.ok(e.imageRights==='original'||e.imageRights==='licensed','Unknown rights '+e.id);
  if(e.imageRights==='original'){
   assert.match(e.imageUrl,/^images\/featured\/ra-\d+\.svg$/);
   const asset=fs.readFileSync(path.join(root,e.imageUrl),'utf8');
   assert.match(asset,/<svg /);
   assert.match(asset,/<title>/);
   assert.match(asset,/<\/svg>\s*$/);
  }else{
   assert.ok(e.imageCredit&&e.imageSourceUrl&&e.imageLicenseUrl);
  }
 }
 assert.equal(new Set(events.filter(e=>e.major).map(e=>e.imageUrl)).size,events.filter(e=>e.major).length);
});
