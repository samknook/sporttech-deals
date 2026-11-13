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
 {source:'raceatlas/index.html',destination:'seizoen/index.html',base:'../raceatlas/',canonical:'seizoen/'},
 {source:'account-profile.html',destination:'account/index.html',base:'../',canonical:'account/'},
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
 if(['seizoen/','account/'].includes(route.canonical))html=html.replace(/<\/head>/i,'<meta name="robots" content="noindex,follow"></head>');
 const canonical='https://trizentro.com/'+route.canonical;
 html=html.replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi,'');
 html=html.replace(/<meta\b[^>]*property=["']og:url["'][^>]*>/gi,'');
 html=html.replace(/<\/head>/i,'<link rel="canonical" href="'+canonical+'"><meta property="og:url" content="'+canonical+'"></head>');
 fs.writeFileSync(target,html);
}
// Event detail pages also live below Events, with the same data and save
// actions as the generated legacy pages.
const cleanDetailsDir=path.join(base,'events/wedstrijden');
fs.mkdirSync(cleanDetailsDir,{recursive:true});
let detailCount=0;
for(const filename of fs.readdirSync(eventsDir)){
 if(!filename.endsWith('.html'))continue;
 const original=path.join(eventsDir,filename);
 let html=fs.readFileSync(original,'utf8');
 html=html.replaceAll('/raceatlas/wedstrijden/'+filename,'/events/wedstrijden/'+filename);
 html=html.replaceAll('https://samknook.github.io/sporttech-deals/events/wedstrijden/'+filename,'https://trizentro.com/events/wedstrijden/'+filename);
 html=html.replace(/<head\b[^>]*>/i,match=>match+'<base href="../../raceatlas/wedstrijden/">');
 const canonical='https://trizentro.com/events/wedstrijden/'+filename;
 html=html.replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi,'');
 html=html.replace(/<meta\b[^>]*property=["']og:url["'][^>]*>/gi,'');
 html=html.replace(/<\/head>/i,'<link rel="canonical" href="'+canonical+'"><meta property="og:url" content="'+canonical+'"></head>');
 fs.writeFileSync(path.join(cleanDetailsDir,filename),html);
 detailCount++;
 // Keep old shared links working, but move the visitor to the uniform URL.
 const redirect='<script>location.replace(new URL("../../events/wedstrijden/'+filename+'",location.href).pathname+location.search+location.hash)</script>';
 const legacy=fs.readFileSync(original,'utf8').replace(/<head\b[^>]*>/i,match=>match+redirect);
 fs.writeFileSync(original,legacy);
}
// Search engines should index real, canonical trizentro.com routes. Generate
// the entire sitemap from the pages actually published, including each race.
const urls=[
 {pathname:'/events/',priority:'1.0',frequency:'daily'},
 {pathname:'/performance/',priority:'0.9',frequency:'weekly'},
 {pathname:'/organisatoren/',priority:'0.5',frequency:'monthly'}
];
const publicTools=[
 'triathlon-calculator.html','race-planner.html','triatlon-afstanden.html',
 'first-70-3-race-week-checklist.html','70-3-readiness-check.html',
 '70-3-eindtijd-calculator.html','race-day-timeline.html',
 'race-fuel-planner.html','pace-calculator.html','goal-feasibility.html'
];
for(const p of publicTools)if(fs.existsSync(path.join(base,p)))urls.push({pathname:'/'+p,priority:'0.7',frequency:'monthly'});
for(const filename of fs.readdirSync(cleanDetailsDir))if(filename.endsWith('.html'))
 urls.push({pathname:'/events/wedstrijden/'+filename,priority:'0.7',frequency:'weekly'});
const escapeXml=value=>value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const today=new Date().toISOString().slice(0,10);
const sitemap='<?xml version="1.0" encoding="UTF-8"?>\n'+
 '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+
 urls.map(u=>'  <url><loc>'+escapeXml('https://trizentro.com'+u.pathname)+
 '</loc><lastmod>'+today+'</lastmod><changefreq>'+u.frequency+
 '</changefreq><priority>'+u.priority+'</priority></url>').join('\n')+
 '\n</urlset>\n';
fs.writeFileSync(path.join(base,'sitemap.xml'),sitemap);
fs.writeFileSync(path.join(base,'robots.txt'),'User-agent: *\nAllow: /\nSitemap: https://trizentro.com/sitemap.xml\n');
console.log('Published '+urls.length+' canonical URLs in sitemap.xml');
console.log('Published '+detailCount+' consistent Events detail URLs');
// Redirect only the three legacy entry URLs. Query parameters and fragments
// (including account callbacks) are preserved; generated event-detail pages stay intact.
const redirects=[
 {file:'raceatlas/index.html',target:'../events/'},
 {file:'performance.html',target:'./performance/'},
 {file:'raceatlas/organisatoren.html',target:'../organisatoren/'},
 {file:'account-profile.html',target:'./account/'}
];
for(const item of redirects){
 const file=path.join(base,item.file);
 let html=fs.readFileSync(file,'utf8');
 const redirect=item.file==='raceatlas/index.html'
  ?'<script>(function(){const target=new URL("../events/",location.href);const q=new URLSearchParams(location.search);const auth=q.has("code")||q.has("ra_password_reset")||/access_token=|type=recovery|error=/.test(location.hash);if(auth)target.pathname=target.pathname.replace(/events\\/$/,"account/");location.replace(target.pathname+location.search+location.hash)})()</script>'
  :'<script>location.replace(new URL('+JSON.stringify(item.target)+',location.href).pathname+location.search+location.hash)</script>';
 html=html.replace(/<head\b[^>]*>/i,match=>match+redirect);
 fs.writeFileSync(file,html);
}
console.log('Built '+routes.length+' clean TriZentro routes from shared source pages');
console.log('Centralized TriZentro platform shell on '+modified+' pages');
