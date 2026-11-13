#!/usr/bin/env node
'use strict';
/*
 * Safe GitHub Pages cutover. Defaults to legacy URLs until the custom domain
 * is registered, verified in GitHub Pages settings and explicitly enabled.
 * This changes only the generated deployment artifact, not the live source
 * or independent staging branch.
 */
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../docs');
const settings=JSON.parse(fs.readFileSync(path.join(__dirname,'../.github/trizentro-domain.json'),'utf8'));
const old='https://samknook.github.io/sporttech-deals';
const domain='https://trizentro.com';
if(settings.enabled!==true){
 console.log('TriZentro custom domain is not activated. Keeping existing GitHub Pages canonical URLs.');
 process.exit(0);
}
if(settings.domain!=='trizentro.com'||settings.verifiedByOwner!==true){
 throw Error('Custom domain cutover blocked: explicit owner verification missing.');
}
if(process.env.TRIZENTRO_DOMAIN_CONFIRMED!=='true'){
 throw Error('Custom domain cutover blocked: GitHub Pages domain and DNS verification not confirmed.');
}
const sitemapPath=path.join(root,'sitemap.xml');
const robotsPath=path.join(root,'robots.txt');
let count=0;
function update(file,fn){
 const previous=fs.readFileSync(file,'utf8'),next=fn(previous);
 if(next!==previous){fs.writeFileSync(file,next);count++}
}
update(sitemapPath,s=>s.split(old).join(domain));
update(robotsPath,s=>s.replace(old,domain));
for(const p of [path.join(root,'index.html'),path.join(root,'raceatlas/index.html')]){
 update(p,s=>s.replaceAll(old,domain));
}
for(const file of fs.readdirSync(path.join(root,'raceatlas'))){
 if(!file.endsWith('.html')||file==='index.html')continue;
 const full=path.join(root,'raceatlas',file);
 update(full,s=>s.replaceAll(old,domain));
}
console.log('TriZentro custom-domain deployment: updated '+count+' HTML/SEO files.');
