'use strict';
// RaceAtlas pre-launch static smoke test. No external dependencies or credentials.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(process.cwd(),'docs/raceatlas');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const index=read('index.html'),organizers=read('organisatoren.html'),quality=read('gegevenskwaliteit.html'),about=read('over.html');
const pages=[['index.html',index],['organisatoren.html',organizers],['gegevenskwaliteit.html',quality],['over.html',about]];
const errors=[];
const check=(ok,msg)=>{if(!ok)errors.push(msg)};
const start=index.indexOf('const EVENTS=');
check(start>=0,'Missing event dataset');
let events=[];
if(start>=0){
 const p=start+'const EVENTS='.length,e=index.indexOf(';\n',p);
 check(e>p,'Event dataset must terminate');
 if(e>p){try{events=JSON.parse(index.slice(p,e))}catch(error){errors.push('Invalid events JSON: '+error.message)}}
}

// TriZentro cross-platform navigation regression checks.
const siteRoot=path.join(process.cwd(),'docs');
const coreTools=['performance.html','pace-calculator.html','race-dashboard.html','triathlon-calculator.html','race-fuel-planner.html'];
const legacyPaths=['race-planner.html','race-day-timeline.html','70-3-raceplan.html','triatlon-afstanden.html'];
for(const filename of coreTools){
 const html=fs.readFileSync(path.join(siteRoot,filename),'utf8');
 check(html.includes('tz-site-header')&&html.includes('tz-site-links'),'Shared TriZentro header missing: '+filename);
 check(html.includes('performance-theme.css'),'Shared Performance styling missing: '+filename);
 check(!html.includes('src="navigation.js"'),'Legacy navigation injection must not appear: '+filename);
 for(const legacy of legacyPaths)check(!html.includes('href="'+legacy),'Hidden tool linked from '+filename+': '+legacy);
 check(html.indexOf('>Voor organisatoren</a>')>html.indexOf('>Performance</a>'),'Organizer destination must remain last: '+filename);
}
const performanceCss=fs.readFileSync(path.join(siteRoot,'performance-theme.css'),'utf8');
const performanceNavigation=fs.readFileSync(path.join(siteRoot,'performance-navigation.js'),'utf8');
const performanceTranslations=fs.readFileSync(path.join(siteRoot,'performance-translations.js'),'utf8');
check(performanceCss.includes('.raLanguageSwitch button.active'),'Events-compatible NL/EN button styling missing');
check(performanceCss.includes('.tz-page-hero:before'),'Events-compatible photo hero missing');
check(performanceCss.includes('.tz-site-links>a.tz-organizers'),'Organizer nav CTA styling missing');
check(performanceNavigation.includes("eventsKey='raceatlas-language-v1'"),'Events and Performance language keys not synchronized');
check(performanceTranslations.includes("TriZentroAddTranslations('pace-calculator.html'"),'Multisport translations missing');
for(const filename of coreTools){
 const html=fs.readFileSync(path.join(siteRoot,filename),'utf8');
 check(html.includes('src="performance-navigation.js"'),'Language control not loaded: '+filename);
 check(html.includes('src="performance-translations.js"'),'English translations not loaded: '+filename);
 check(html.includes('class="raLogoMark"'),'Shared TriZentro sport logo missing: '+filename);
}
const performanceHome=fs.readFileSync(path.join(siteRoot,'performance.html'),'utf8');
const multisportCalculator=fs.readFileSync(path.join(siteRoot,'pace-calculator.html'),'utf8');
for(const sport of ['running','cycling','triathlon']){
 check(performanceHome.includes('id="sport-'+sport+'"'),'Missing Performance selector: '+sport);
 check(performanceHome.includes('id="tools-'+sport+'"'),'Missing Performance panel: '+sport);
}
check(performanceHome.includes('pace-calculator.html#running'),'Running calculator destination missing');
check(performanceHome.includes('pace-calculator.html#cycling'),'Cycling calculator destination missing');
check(multisportCalculator.includes('id="run-time"')&&multisportCalculator.includes('id="bike-time"'),'Multisport results missing');
check(multisportCalculator.includes('aria-selected="true"'),'Multisport tab accessibility missing');
for(const [name,html] of [['Performance',performanceHome],['Pace calculator',multisportCalculator]]){
 for(const script of [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]){
  try{new Function(script[1])}catch(e){errors.push(name+' inline JS syntax error: '+e.message)}
 }
}
const calculatorApp=fs.readFileSync(path.join(siteRoot,'triathlon-calculator-app.js'),'utf8');
check(calculatorApp.includes("'planner-link').href='race-dashboard.html'"),'Finish calculator must route to Race Dashboard, not old Race Planner');

check(events.length>=400,'Expect at least 400 real event entries');
const ids=new Set(events.map(e=>e.id));
check(ids.size===events.length,'Duplicate event IDs');
check(events.every(e=>/^ra-\d+$/.test(e.id)&&e.name&&e.place&&e.sport),'Missing essential event data');
check(!events.some(e=>e.dateEvidence==='official'&&!/^20\d{2}-\d{2}-\d{2}$/.test(e.date||'')),'Officially dated event missing valid ISO date');
const nav=index.match(/<div class="navright">([\s\S]+?)<\/div><\/nav>/)?.[1]||'';
check(nav.indexOf('navExplore')>=0&&nav.indexOf('navSaved')>nav.indexOf('navExplore')&&nav.indexOf('organizerNav')>nav.indexOf('navSaved'),'Main navigation must put visitor actions before organizer link');
check(index.includes('id="cards"')&&index.includes('id="more"'),'Discover result cards missing');
check(index.indexOf('id="cards"')<index.indexOf('id="more"')&&index.indexOf('id="more"')<index.indexOf('class="raSeasonPreview"'),'Event results must be above season preview');
check(read('intelligence.js').includes('resultsMore.after(panel)'),'Registration radar must appear below results');
check(!index.includes('id="raQualitySummary"')&&!index.includes('<strong>Transparantie:</strong>'),'Hide internal audit blocks from public homepage');
check(read('account-config.js').includes('enabled:false'),'Account feature must remain disabled until ready');
check(index.includes('auto-events.js?v='),'Auto-discovery feed loader is required');
check(fs.existsSync(path.join(root,'auto-events.json')),'Auto-event feed must exist');
for(const [filename,html] of pages){
 const assetMatches=[...html.matchAll(/<(?:script|link)\b[^>]*?\b(?:src|href)="([^"]+)"/g)].map(m=>m[1]);
 for(const asset of assetMatches){
  if(!/^(?:[\w.-]+\.(?:js|css|svg))(?:\?[^#]*)?$/.test(asset))continue;
  const file=asset.split('?')[0];
  check(fs.existsSync(path.join(root,file)),filename+' references missing asset '+file);
 }
 check(html.includes('i18n.js?v='),filename+' missing language script');
 check(html.includes('brand.css'),filename+' missing shared brand CSS');
}
check(organizers.includes('id="eventForm"')&&organizers.includes('id="contactForm"'),'Organizer forms missing');
check(organizers.includes('formsubmit.co/ajax/'),'Organizer contact delivery endpoint missing');
const i18n=read('i18n.js');
check(i18n.includes("nav.insertBefore(group,organizer)"),'NL/EN switch must precede organizer destination');
check(i18n.includes('raceatlas-language-v1'),'Language selection must persist');
const scripts=['i18n.js','intelligence.js','details.js','alerts.js','organizer-sync.js','auto-events.js'];
for(const file of scripts){try{new Function(read(file))}catch(err){errors.push(file+' syntax error: '+err.message)}}
const body=index.match(/<script>([\s\S]*?)<\/script>/)?.[1];
check(Boolean(body),'Homepage inline JS missing');
if(body){try{new Function(body)}catch(err){errors.push('Homepage inline JS syntax error: '+err.message)}}
if(errors.length){for(const e of errors)console.error('FAIL: '+e);process.exitCode=1}
else console.log('PASS: RaceAtlas static launch smoke test — '+events.length+' unique events, '+pages.length+' pages, essential workflows, assets and JS syntax.');
