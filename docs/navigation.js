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
const groups=[
  {title:'Tools',items:[
    ['Race Dashboard','race-dashboard.html'],
    ['Race Planner','race-planner.html'],
    ['Eindtijdcalculator','triathlon-calculator.html'],
    ['Voedingscalculator','race-fuel-planner.html'],
    ['Wedstrijddagplanning','race-day-timeline.html']
  ]},
  {title:'Voorbereiding',items:[
    ['70.3 Readiness Check','70-3-readiness-check.html'],
    ['Raceweek-checklist','first-70-3-race-week-checklist.html'],
    ['70.3-racegids','70-3-raceplan.html'],
    ['Triatlonafstanden','triatlon-afstanden.html']
  ]},
  {title:'Guides & Race Packs',items:[
    ['Alle producten','products.html'],
    ['70.3 Race Pack-preview','race-pack-preview.html'],
    ['Triathlon Blueprint','blueprint-preview.html'],
    ['Geef feedback','tester-feedback.html']
  ]},
  {title:'Materiaal',items:[
    ['Fietscomputer-koopgids','koopgids.html'],
    ['Fietscomputers vergelijken','fietscomputer-triatlon.html'],
    ['Fietscomputer-aanbiedingen','fietscomputer-aanbieding.html']
  ]}
];
const extra=[['Over & privacy','transparantie.html']];
function linkHtml(label,href){
 const current=href===path?' aria-current="page"':'';
 return '<a href="'+href+'"'+current+'>'+label+'</a>';
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
nav.setAttribute('aria-label','Hoofdnavigatie');
nav.innerHTML=
 '<div class="tz-nav-desktop">'+linkHtml('Home','index.html')+
 groupsDesktop+linkHtml('Race Dashboard','race-dashboard.html')+'</div>'+
 '<details class="tz-mobile-menu"><summary aria-label="Open navigatiemenu"><span class="tz-menu-bars" aria-hidden="true">☰</span> Menu</summary>'+
 '<div class="tz-mobile-panel"><div class="tz-mobile-intro">Waar wil je naartoe?</div>'+
 linkHtml('🏠 Home','index.html')+
 linkHtml('🏁 Race Dashboard','race-dashboard.html')+
 groupsMobile+
 '<div class="tz-mobile-group tz-mobile-bottom">'+extra.map(([label,href])=>linkHtml(label,href)).join('')+'</div>'+
 '</div></details>';
oldNav.replaceWith(nav);
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
