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
 const fields=['q','sport','country','year','month','certainty','timeWindow','distanceCategory','registrationFilter','sort'];
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
test('Major event covers show photo-style JPEGs and sources only in details',()=>{
 assert.match(html,/function raceArtwork\(e\)/);
 assert.match(html,/e\.imageRights==='generated'/);
 assert.doesNotMatch(html,/raArtworkCredit/);
 const details=fs.readFileSync(path.join(root,'details.js'),'utf8');
 assert.match(details,/window\.RaceAtlasArtwork\(e\)/);
 assert.match(details,/Bron: RaceAtlas/);
 assert.match(details,/geen officiële evenementfoto/);
});

test('Rotterdam now uses its requested AI race image',()=>{
 const race=events.find(e=>e.id==='ra-5');
 assert.ok(race&&race.major);
 assert.equal(race.imageRights,'generated');
 assert.equal(race.imageUrl,'images/featured/ra-5.webp');
 assert.doesNotMatch(html,/raArtworkCredit/);
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

test('First featured race images are actual optimized WebP files',()=>{
 const ids=['ra-418','ra-8','ra-11','ra-0','ra-5'];
 for(const id of ids){
  const race=events.find(e=>e.id===id);
  assert.ok(race&&race.major);
  assert.equal(race.imageRights,'generated');
  assert.equal(race.imageUrl,'images/featured/'+id+'.webp');
  const asset=fs.readFileSync(path.join(root,race.imageUrl));
  assert.equal(asset.subarray(0,4).toString(),'RIFF');
  assert.equal(asset.subarray(8,12).toString(),'WEBP');
 }
});

test('All major event covers have valid local or credited Wikimedia images',()=>{
 const majors=events.filter(e=>e.major);
 assert.equal(majors.length,73);
 for(const e of majors){
  if(e.imageRights==='licensed'){
   assert.match(e.imageUrl,/^https:\/\/upload\.wikimedia\.org\//);
   assert.match(e.imageSourceUrl,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
   assert.ok(e.imageCredit&&e.imageLicenseUrl,e.id);
  }else{
   assert.equal(e.imageRights,'generated',e.id);
   assert.match(e.imageUrl,/^images\/featured\/ra-\d+\.(?:webp|jpg)$/);
   const bytes=fs.readFileSync(path.join(root,e.imageUrl));
   if(e.imageUrl.endsWith('.webp')){
    assert.equal(bytes.subarray(0,4).toString(),'RIFF',e.id);
    assert.equal(bytes.subarray(8,12).toString(),'WEBP',e.id);
   }else{
    assert.equal(bytes[0],0xff,e.id);
    assert.equal(bytes[1],0xd8,e.id);
   }
   assert.ok(bytes.length>10000,e.id);
  }
 }
 assert.equal(new Set(majors.map(e=>e.imageUrl)).size,73);
});

test('Source credits and missing-source labels stay off overview cards',()=>{
 const start=html.indexOf('function eventCard(e)');
 const end=html.indexOf('function renderCards(',start);
 const cards=html.slice(start,end);
 assert.ok(start>=0&&end>start);
 assert.doesNotMatch(cards,/Kalenderbron ↗|Bron ontbreekt|raArtworkCredit/);
 assert.match(cards,/e\.registrationUrl\|\|e\.officialEventUrl\|\|null/);
 const details=fs.readFileSync(path.join(root,'details.js'),'utf8');
 assert.match(details,/Bron: RaceAtlas/);
 assert.match(details,/isValidUrl\(e\.imageSourceUrl\)/);
});

test('First 10 curated majors use dedicated new WebP assets',()=>{
 const first=[418,5,8,11,0,292,17,14,19,13];
 for(const id of first){
  const event=events.find(e=>e.id==='ra-'+id);
  assert.equal(event.imageUrl,'images/featured/ra-'+id+'.webp');
  assert.equal(event.imageRights,'generated');
 }
});

test('Second batch of 10 now uses locally hosted, event-specific AI WebP files',()=>{
 const ids=[12,18,15,16,9,3,265,260,244,248];
 for(const id of ids){
  const event=events.find(e=>e.id==='ra-'+id);
  assert.ok(event&&event.major,id);
  assert.equal(event.imageRights,'generated');
  assert.equal(event.imageUrl,'images/featured/ra-'+id+'.webp');
  assert.equal(event.imageSourceUrl,undefined);
  const image=fs.readFileSync(path.join(root,event.imageUrl));
  assert.equal(image.subarray(0,4).toString(),'RIFF',id);
  assert.equal(image.subarray(8,12).toString(),'WEBP',id);
 }
});

test('External event photographs have a local image fallback',()=>{
 assert.match(html,/if\(e\.imageRights==='licensed'&&\/\^ra-/);
 assert.match(html,/check\.onerror=/);
 const detail=fs.readFileSync(path.join(root,'details.js'),'utf8');
 assert.match(detail,/reserve-sfeerbeeld/);
 assert.match(detail,/image\.addEventListener\('error'/);
});

test('Third batch and newly added international marathons use distinct AI cover files',()=>{
 const ids=[420,218,421,281,422,294,11,226,296,220];
 for(const id of ids){
  const event=events.find(e=>e.id==='ra-'+id);
  assert.ok(event&&event.major,id);
  assert.equal(event.imageRights,'generated');
  assert.equal(event.imageUrl,'images/featured/ra-'+id+'.webp');
 }
 const paris=events.find(e=>e.id==='ra-420');
 const dublin=events.find(e=>e.id==='ra-421');
 const athens=events.find(e=>e.id==='ra-422');
 assert.equal(paris.date,'2027-04-04');
 assert.equal(paris.dateEvidence,'official');
 assert.equal(dublin.date,'2027-10-24');
 assert.equal(dublin.registrationDate,'2026-11-12');
 assert.equal(athens.date,null);
 assert.equal(athens.status,'date_pending');
 assert.equal(athens.expectedMonth,'11');
 assert.equal(new Set(events.map(e=>e.id)).size,423);
});

test('Midwinter Marathon has a dedicated winter race photograph',()=>{const event=events.find(e=>e.id==='ra-1');assert.equal(event.imageRights,'generated');assert.equal(event.imageUrl,'images/featured/ra-1.webp');const bytes=fs.readFileSync(path.join(root,event.imageUrl));assert.equal(bytes.subarray(0,4).toString(),'RIFF');assert.equal(bytes.subarray(8,12).toString(),'WEBP');});
