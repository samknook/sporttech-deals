#!/usr/bin/env node
'use strict';
// One deployment-time shell for every public TriZentro visitor journey.
// Retains existing tools, data, forms, Events state, and noindex flags.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const base=path.resolve(__dirname,'../docs');
const pages=JSON.parse(fs.readFileSync(path.join(__dirname,'../config/trizentro-public-pages.json'),'utf8')).pages;
const eventsDir=path.join(base,'raceatlas/wedstrijden');
if(fs.existsSync(eventsDir))for(const filename of fs.readdirSync(eventsDir)){if(filename.endsWith('.html'))pages.push('raceatlas/wedstrijden/'+filename)}
// Content-derived asset versions prevent browser caches from serving old shared navigation.
const versionFor=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(base,file))).digest('hex').slice(0,12);
const cssVersion=versionFor('shared-ui.css'),jsVersion=versionFor('shared-ui.js');
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
  if(first&&first[0].length<1600&&!/<h1\b/i.test(first[0])){html=html.replace(first[0],shell(prefix))}
  else if(!first){html=html.replace(/(<body\b[^>]*>)/i,'$1'+shell(prefix))}
  else{
    // Hero-bearing legacy headers contain actual content. Preserve their
    // introduction and controls instead of deleting them.
    html=html.replace(first[0],first[0].replace(/^<header\b/i,'<header data-tz-legacy-content'));
    html=html.replace(/(<body\b[^>]*>)/i,'$1'+shell(prefix));
  }
 }
 const css='<link rel="stylesheet" href="'+prefix+'shared-ui.css?v='+cssVersion+'">';
 const js='<script src="'+prefix+'shared-ui.js?v='+jsVersion+'" defer></script>';
 html=html.replace(/<link\b[^>]*href=["'][^"']*shared-ui\.css(?:\?[^"']*)?["'][^>]*>/gi,'');
 html=html.replace(/<script\b[^>]*src=["'][^"']*shared-ui\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>/gi,'');
 html=html.replace(/<\/head>/i,css+'</head>');
 html=html.replace(/<\/body>/i,js+'</body>');
 fs.writeFileSync(file,html);modified++;
}
// Clean public destinations. Each is built from the same source as its legacy
// address, rather than maintaining independent copies of page content.
const routes=[
 {source:'raceatlas/index.html',destination:'events/index.html',base:'../raceatlas/',canonical:'events/'},
 {source:'performance.html',destination:'performance/index.html',base:'../',canonical:'performance/'},
 {source:'raceatlas/organisatoren.html',destination:'organisatoren/index.html',base:'../raceatlas/',canonical:'organisatoren/'}
];
for(const route of routes){
 let html=fs.readFileSync(path.join(base,route.source),'utf8');
 const target=path.join(base,route.destination);
 fs.mkdirSync(path.dirname(target),{recursive:true});
 // Keep the exact existing data, forms and functionality; only relative
 // assets resolve through the original source directory.
 html=html.replace(/<head\b[^>]*>/i,match=>match+'<base href="'+route.base+'">');
 const canonical='https://trizentro.com/'+route.canonical;
 html=html.replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi,'');
 html=html.replace(/<meta\b[^>]*property=["']og:url["'][^>]*>/gi,'');
 html=html.replace(/<\/head>/i,'<link rel="canonical" href="'+canonical+'"><meta property="og:url" content="'+canonical+'"></head>');
 fs.writeFileSync(target,html);
}
console.log('Built '+routes.length+' clean TriZentro routes from shared source pages');
console.log('Centralized TriZentro platform shell on '+modified+' pages');
