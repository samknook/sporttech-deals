const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const docs=path.join(__dirname,'..','docs');
const modules=['translations-bundle.js'];
const script=name=>fs.readFileSync(path.join(docs,name),'utf8');
function loadCatalog(){
 const context={};
 context.window=context;
 vm.createContext(context);
 for(const name of modules)vm.runInContext(script(name),context,{filename:name});
 return context.window.TriZentroTranslations;
}
test('all eighteen public pages load the single bilingual bundle before calculators and navigation',()=>{
 const sitemap=script('sitemap.xml');
 const names=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1]).pathname.split('/').at(-1)||'index.html');
 assert.equal(names.length,18);
 const scripts=[...modules,'i18n.js','navigation.js'];
 for(const name of names){
  const html=script(name);
  let last=-1;
  for(const file of scripts){
   const needle='src="'+file+'"';
   const i=html.indexOf(needle);
   assert.ok(i>last,name+' missing or misordered '+file);
   if(file!=='navigation.js')assert.ok(html.includes('<script src="'+file+'"></script>'),name+' must load the locale before inline application scripts: '+file);
   assert.equal((html.match(new RegExp('src="'+file.replace(/\./g,'\\.')+'"','g'))||[]).length,1,name+' duplicated '+file);
   last=i;
  }
 }
});
test('all public pages have local translations for the non-native locale',()=>{
 const catalog=loadCatalog();
 for(const url of [...script('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1])){
  const page=new URL(url).pathname.split('/').at(-1)||'index.html';
  const native=(script(page).match(/<html lang="([^"]+)"/)||[])[1];
  const target=native==='en'?'nl':'en';
  assert.ok(catalog[page],page+' has no translation bundle');
  assert.ok(Object.keys(catalog[page][target]).length>10,page+' needs substantial '+target+' translation');
  assert.ok(catalog.pageTitles[page]?.nl&&catalog.pageTitles[page]?.en,page+' needs bilingual title');
 }
});
test('user choice persists locally and is reflected in links without external translation',()=>{
 const source=script('i18n.js'),nav=script('navigation.js');
 assert.match(source,/trizentro\.language/);
 assert.match(source,/URLSearchParams/);
 assert.match(source,/localStorage\.setItem/);
 assert.match(source,/searchParams\.set\('lang',current\)/);
 assert.match(source,/searchParams\.set\('lang',lang\)/);
 assert.doesNotMatch(source,/fetch\(|XMLHttpRequest|google\.translate|translate\.google/);
 assert.match(nav,/aria-pressed/);
 assert.match(nav,/switchLanguage\(lang\)/);
 assert.match(nav,/Choose language/);
});
test('translation catalogs and switching scripts parse',()=>{
 for(const name of [...modules,'i18n.js','navigation.js'])assert.doesNotThrow(()=>new Function(script(name)),name);
});
test('dynamic readiness and race-pack exports support Dutch and English',()=>{
 const readiness=require('../docs/readiness-core.js');
 const dossier=require('../docs/race-pack-dossier.js');
 const core=require('../docs/race-planner-core.js');
 const arr=Array.from({length:12},(_,i)=>({status:i===0?'not':'done',topic:'Test',action:'Action',url:'race-dashboard.html'}));
 const english=readiness.summarize(arr,'en');
 const dutch=readiness.summarize(arr,'nl');
 assert.match(english.summary,/planning tasks/);
 assert.match(dutch.summary,/voorbereidingstaken/);
 assert.match(readiness.exportText(arr,dutch,'nl'),/VOLGENDE STAPPEN/);
 const base=core.calculate({distance:'half',swimPace:'2:00',bikeSpeed:30,runPace:'5:00',t1Minutes:4,t2Minutes:3,start:'08:00',target:'05:30'});
 assert.equal(dossier.checkpoints(base,core,'08:00','nl')[0].label,'Uit het water');
 assert.equal(dossier.checkpoints(base,core,'08:00','en')[0].label,'Swim exit');
 const morning=dossier.morningSchedule({date:'2027-06-20',start:'08:00',travel:35,parking:20,setup:40,warmup:30,buffer:20,locale:'nl'});
 assert.match(morning[0].label,/Vertrek/);
 const exportNl=dossier.textDossier({name:'Race',date:'2027-06-20',start:'08:00',target:'05:30',scenarios:[base,base,base],checks:[],notes:'',morning,core,locale:'nl'});
 assert.match(exportNl,/VOORBEELD RACEDOSSIER/);
 assert.match(exportNl,/WEDSTRIJDOCHTEND/);
});
