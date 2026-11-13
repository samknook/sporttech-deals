#!/usr/bin/env node
'use strict';
// One deployment-time shell for every public TriZentro visitor journey.
// Retains existing tools, data, forms, Events state, and noindex flags.
const fs=require('node:fs'),path=require('node:path');
const base=path.resolve(__dirname,'../docs');
const pages=[
 'raceatlas/index.html','raceatlas/organisatoren.html','raceatlas/over.html',
 'raceatlas/privacy.html','raceatlas/gegevenskwaliteit.html','raceatlas/alerts-beheren.html',
 'performance.html','pace-calculator.html','triathlon-calculator.html',
 'race-dashboard.html','race-fuel-planner.html','race-planner.html',
 '70-3-raceplan.html','70-3-readiness-check.html','goal-feasibility.html',
 'race-day-timeline.html','triatlon-afstanden.html','first-70-3-race-week-checklist.html'
];
const eventsDir=path.join(base,'raceatlas/wedstrijden');
if(fs.existsSync(eventsDir))for(const filename of fs.readdirSync(eventsDir)){if(filename.endsWith('.html'))pages.push('raceatlas/wedstrijden/'+filename)}
const version='20261113-platform3';
function shell(prefix){
 const home=prefix+'raceatlas/';
 return '<header class="tz-site-header"><nav class="tz-site-nav" aria-label="Hoofdnavigatie">'+
 '<a class="tz-site-brand" href="'+home+'" aria-label="TriZentro Events"><img class="tz-logo-image" src="'+prefix+'trizentro-mark.svg" alt="TriZentro" width="48" height="48"></a>'+
 '<div class="tz-site-links" aria-label="TriZentro onderdelen"></div></nav></header>';
}
let modified=0;
for(const rel of pages){
 const file=path.join(base,rel);if(!fs.existsSync(file))throw Error('Missing public TriZentro page: '+rel);
 let html=fs.readFileSync(file,'utf8');
 const depth=rel.split('/').length-1,prefix='../'.repeat(depth);
 if(!/<body\b/i.test(html)||!/<\/head>/i.test(html))throw Error('Invalid public HTML: '+rel);
 // Keep Events-specific buttons, language switch and season state intact.
 if(rel!=='raceatlas/index.html'){
  const first=html.match(/<header\b[^>]*>[\s\S]*?<\/header>/i);
  if(first&&first[0].length<1600){html=html.replace(first[0],shell(prefix))}
  else if(!first){html=html.replace(/(<body\b[^>]*>)/i,'$1'+shell(prefix))}
  else throw Error('Unsafe non-standard header; review '+rel);
 }
 const css='<link rel="stylesheet" href="'+prefix+'shared-ui.css?v='+version+'">';
 const js='<script src="'+prefix+'shared-ui.js?v='+version+'" defer></script>';
 html=html.replace(/<link\b[^>]*href=["'][^"']*shared-ui\.css(?:\?[^"']*)?["'][^>]*>/gi,'');
 html=html.replace(/<script\b[^>]*src=["'][^"']*shared-ui\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>/gi,'');
 html=html.replace(/<\/head>/i,css+'</head>');
 html=html.replace(/<\/body>/i,js+'</body>');
 fs.writeFileSync(file,html);modified++;
}
console.log('Centralized TriZentro platform shell on '+modified+' pages');
