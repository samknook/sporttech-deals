/* TriZentro shared navigation, progressive enhancement.
 * Every page keeps its original links if JavaScript is disabled.
 * No analytics, network requests, cookies or local storage.
 */
(function(){
'use strict';
const navContainer=document.querySelector('.top .nav');
if(!navContainer)return;
const oldNav=navContainer.querySelector('nav');
if(!oldNav)return;
const path=decodeURIComponent(location.pathname.split('/').pop()||'index.html');
const locale=(window.TriZentroI18n&&window.TriZentroI18n.lang)||'nl';
const english=locale==='en';
const tr=(nl,en)=>english?en:nl;
const urlFor=href=>href+(href.includes('?')?'&':'?')+'lang='+locale;
const groups=[
  {title:tr('Tools','Tools'),items:[
    [tr('Race Dashboard','Race Dashboard'),'race-dashboard.html'],
    [tr('Race Planner','Race Planner'),'race-planner.html'],
    [tr('Eindtijdcalculator','Finish Time Calculator'),'triathlon-calculator.html'],
    [tr('Voedingscalculator','Fuel Planner'),'race-fuel-planner.html'],
    [tr('Wedstrijddagplanning','Race Day Timeline'),'race-day-timeline.html']
  ]},
  {title:tr('Voorbereiding','Preparation'),items:[
    [tr('70.3 Readiness Check','70.3 Readiness Check'),'70-3-readiness-check.html'],
    [tr('Raceweek-checklist','Race-Week Checklist'),'first-70-3-race-week-checklist.html'],
    [tr('70.3-racegids','70.3 Race Guide'),'70-3-raceplan.html'],
    [tr('Triatlonafstanden','Triathlon Distances'),'triatlon-afstanden.html']
  ]},
  {title:tr('Guides & Race Packs','Guides & Race Packs'),items:[
    [tr('Alle producten','All Products'),'products.html'],
    [tr('70.3 Race Pack-preview','70.3 Race Pack Preview'),'race-pack-preview.html'],
    [tr('Triathlon Blueprint','Triathlon Blueprint'),'blueprint-preview.html'],
    [tr('Geef feedback','Share Feedback'),'tester-feedback.html']
  ]},
  {title:tr('Materiaal','Equipment'),items:[
    [tr('Fietscomputer-koopgids','Bike Computer Buying Guide'),'koopgids.html'],
    [tr('Fietscomputers vergelijken','Compare Bike Computers'),'fietscomputer-triatlon.html'],
    [tr('Fietscomputer-aanbiedingen','Bike Computer Deals'),'fietscomputer-aanbieding.html']
  ]}
];
const extra=[[tr('Over & privacy','About & Privacy'),'transparantie.html']];
function linkHtml(label,href){
 const current=href===path?' aria-current="page"':'';
 return '<a href="'+urlFor(href)+'"'+current+'>'+label+'</a>';
}
const groupsDesktop=groups.map(g=>
 '<details class="tz-nav-dropdown"><summary>'+g.title+'</summary><div class="tz-nav-submenu">'
 +g.items.map(([label,href])=>linkHtml(label,href)).join('')
 +'</div></details>'
).join('');
const groupsMobile=groups.map(g=>
 '<div class="tz-mobile-group"><div class="tz-mobile-heading">'+g.title+'</div>'
 +g.items.map(([label,href])=>linkHtml(label,href)).join('')
 +'</div>'
).join('');
const nav=document.createElement('nav');
nav.className='tz-navigation';
nav.setAttribute('aria-label',tr('Hoofdnavigatie','Main navigation'));
nav.innerHTML=
 '<div class="tz-nav-desktop">'+linkHtml('Home','index.html')+
 groupsDesktop+linkHtml('Race Dashboard','race-dashboard.html')+'</div>'+
 '<details class="tz-mobile-menu"><summary aria-label="'+tr('Open navigatiemenu','Open navigation menu')+'"><span class="tz-menu-bars" aria-hidden="true">☰</span> '+tr('Menu','Menu')+'</summary>'+
 '<div class="tz-mobile-panel"><div class="tz-mobile-intro">'+tr('Waar wil je naartoe?','Where would you like to go?')+'</div>'+
 linkHtml('🏠 Home','index.html')+
 linkHtml('🏁 Race Dashboard','race-dashboard.html')+
 groupsMobile+
 '<div class="tz-mobile-group tz-mobile-bottom">'+extra.map(([label,href])=>linkHtml(label,href)).join('')+'</div>'+
 '</div></details>';
oldNav.replaceWith(nav);
const switcher=document.createElement('div');
switcher.className='tz-lang-switch';
switcher.setAttribute('role','group');
switcher.setAttribute('aria-label',tr('Taal kiezen','Choose language'));
for(const lang of ['nl','en']){
  const button=document.createElement('button');
  button.type='button';
  button.textContent=lang.toUpperCase();
  button.setAttribute('lang',lang);
  button.setAttribute('aria-label',lang==='nl'?'Nederlands':'English');
  button.setAttribute('aria-pressed',String(lang===locale));
  button.addEventListener('click',()=>window.TriZentroI18n&&window.TriZentroI18n.switchLanguage(lang));
  switcher.appendChild(button);
}
navContainer.appendChild(switcher);
const menu=nav.querySelector('.tz-mobile-menu');
const dropdowns=[...nav.querySelectorAll('.tz-nav-dropdown')];
dropdowns.forEach(d=>d.addEventListener('toggle',()=>{
 if(!d.open)return;
 dropdowns.forEach(other=>{if(other!==d)other.open=false;});
 menu.open=false;
}));
menu.addEventListener('toggle',()=>{if(menu.open)dropdowns.forEach(d=>d.open=false);});
document.addEventListener('keydown',event=>{
 if(event.key!=='Escape')return;
 if(menu.open){menu.open=false;menu.querySelector('summary').focus();}
 dropdowns.forEach(d=>{if(d.open){d.open=false;d.querySelector('summary').focus();}});
});
document.addEventListener('click',event=>{
 if(!nav.contains(event.target)){
  menu.open=false;
  dropdowns.forEach(d=>d.open=false);
 }
});
})();
