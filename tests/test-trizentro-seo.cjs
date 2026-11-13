'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const base='docs/';
const events=fs.readFileSync(base+'events/index.html','utf8');
const robots=fs.readFileSync(base+'robots.txt','utf8');
const sitemap=fs.readFileSync(base+'sitemap.xml','utf8');
assert.ok(events.includes('TriZentro | Hardloopwedstrijden, triatlons en wielerevenementen 2027'),'Search title missing');
assert.ok(events.includes('https://trizentro.com/events/'),'Missing canonical Events URL');
assert.ok(events.includes('"@type":"WebSite"'),'Structured WebSite identity missing');
assert.ok(events.includes('"@type":"Organization"'),'Organization schema missing');
assert.ok(!events.includes('meta name="robots" content="noindex'),'Events must be indexable');
assert.ok(robots.includes('Sitemap: https://trizentro.com/sitemap.xml'),'Incorrect sitemap URL');
assert.ok(!robots.includes('samknook.github.io'),'Old domain must not be promoted');
assert.ok(!sitemap.includes('samknook.github.io'),'Old sitemap URL found');
assert.ok(!sitemap.includes('/raceatlas/wedstrijden/'),'Old race detail URLs found');
const detailFiles=fs.readdirSync(base+'events/wedstrijden').filter(n=>n.endsWith('.html'));
assert.ok(detailFiles.length>=400,'Some races missing from canonical index');
for(const name of detailFiles)assert.ok(sitemap.includes('<loc>https://trizentro.com/events/wedstrijden/'+name+'</loc>'),'Sitemap missing '+name);
for(const name of ['seizoen','account'])assert.ok(!sitemap.includes('<loc>https://trizentro.com/'+name+'/</loc>'),'Private route must be excluded: '+name);
for(const [oldName,canonical] of [
 ['raceatlas/index.html','events/'],['performance.html','performance/'],
 ['raceatlas/organisatoren.html','organisatoren/']]){
 const old=fs.readFileSync(base+oldName,'utf8');
 assert.ok(old.includes('<meta name="robots" content="noindex,follow">'),'Legacy route must not be indexed: '+oldName);
 assert.ok(old.includes('https://trizentro.com/'+canonical),'Legacy route must point to canonical: '+oldName);
}
for(const oldName of detailFiles.slice(0,5)){
 const legacy=fs.readFileSync(base+'raceatlas/wedstrijden/'+oldName,'utf8');
 assert.ok(legacy.includes('noindex,follow'),'Legacy race page must be noindex: '+oldName);
}
console.log('SEO PASS: canonical brand identity, robots, sitemap and '+detailFiles.length+' race pages');
