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

test('language switch works at runtime and preserves language on internal links',()=>{
 const i18n=script('i18n.js');
 function simulate(selected,page,originalText){
  const callbacks={},store=new Map(),seen={};
  const node={nodeType:3,nodeValue:originalText,parentElement:{closest:()=>false}};
  const link={href:'products.html',getAttribute(){return this.href},setAttribute(_key,value){this.href=value},closest:()=>false};
  const document={
   readyState:'loading',body:{},title:'Original',
   documentElement:{lang:'nl',getAttribute:()=>page==='index.html'?'nl':'en'},
   addEventListener(name,cb){callbacks[name]=cb},
   createTreeWalker(){let consumed=false;return {currentNode:null,nextNode(){if(consumed)return false;consumed=true;this.currentNode=node;return true}}},
   querySelectorAll(selector){return selector==='a[href]'?[link]:[]}
  };
  const localStorage={getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)};
  const location={search:'?lang='+selected,pathname:'/sporttech-deals/'+page,href:'https://example.org/sporttech-deals/'+page+'?lang='+selected,origin:'https://example.org',assign(url){seen.redirect=url}};
  const context={document,localStorage,location,URL,URLSearchParams,NodeFilter:{SHOW_TEXT:4}};
  context.window=context;
  vm.createContext(context);
  vm.runInContext(script('translations-bundle.js'),context);
  vm.runInContext(i18n,context);
  callbacks.DOMContentLoaded();
  return {context,node,link,store,seen};
 }
 const dutch=simulate('nl','products.html','Learn smarter.');
 assert.equal(dutch.node.nodeValue,'Leer slimmer.');
 assert.equal(dutch.context.document.documentElement.lang,'nl');
 assert.ok(dutch.link.href.includes('lang=nl'));
 assert.equal(dutch.store.get('trizentro.language'),'nl');
 dutch.context.TriZentroI18n.switchLanguage('en');
 assert.ok(dutch.seen.redirect.includes('lang=en'));
 assert.equal(dutch.store.get('trizentro.language'),'en');
 const english=simulate('en','index.html','Race slimmer.');
 assert.equal(english.node.nodeValue,'Race smarter.');
 assert.equal(english.context.document.documentElement.lang,'en');
 assert.ok(english.link.href.includes('lang=en'));
});

test('prominent homepage messages stay in the selected language',()=>{
 const catalog=loadCatalog();
 const nl=catalog['index.html'].nl;
 const en=catalog['index.html'].en;
 const requiredNl=[
  'Start here · Free 70.3 assessment',
  'What should you prepare next?',
  'The race-week checklist you can actually follow',
  'Read the race-week guide',
  'Check your preparation'
 ];
 const requiredEn=[
  'Race slimmer.',
  'Kies waar je wilt beginnen',
  'Wat wil je vandaag doen?',
  'Koop met meer zekerheid',
  'Fietscomputer voor triatlon'
 ];
 for(const text of requiredNl)assert.ok(nl[text], 'Missing Dutch homepage translation for: '+text);
 for(const text of requiredEn)assert.ok(en[text], 'Missing English homepage translation for: '+text);
 assert.equal(nl['What should you prepare next?'],'Wat moet je nog voorbereiden?');
 assert.equal(en['Race slimmer.'],'Race smarter.');
});
