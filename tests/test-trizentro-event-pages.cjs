'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.join(process.cwd(),'docs','raceatlas');
const page=fs.readFileSync(path.join(root,'index.html'),'utf8');
const from=page.indexOf('const EVENTS=')+'const EVENTS='.length;
assert.ok(from>20,'Catalogue marker must exist');
const events=JSON.parse(page.slice(from,page.indexOf(';\n',from)));
const dir=path.join(root,'wedstrijden');
assert.ok(fs.existsSync(dir),'Generated event pages directory missing');
const files=fs.readdirSync(dir).filter(x=>x.endsWith('.html'));
assert.ok(files.length>=events.length,'Every catalogue event must have a page');
const sitemap=fs.readFileSync(path.join(process.cwd(),'docs','sitemap.xml'),'utf8');
for(const e of [events[0],events[Math.floor(events.length/2)],events[events.length-1]]){
 const match=files.find(x=>x.endsWith('-'+e.id+'.html'));
 assert.ok(match,'Missing event '+e.id);
 const content=fs.readFileSync(path.join(dir,match),'utf8');
 assert.ok(content.includes('<title>')&&content.includes('SportsEvent'),'Page missing SEO markup '+e.id);
 assert.ok(content.includes('id="saveRace"'),'Save event action missing '+e.id);
 assert.ok(content.includes('rel="canonical"'),'Canonical missing '+e.id);
 assert.ok(content.includes('../tracking.js'),'Tracking missing '+e.id);
 assert.ok(sitemap.includes('/raceatlas/wedstrijden/'+match),'Sitemap entry missing '+e.id);
}
assert.ok(sitemap.includes('</urlset>'),'Sitemap must be well-formed');
console.log('TriZentro generated '+files.length+' standalone race pages; SEO and save actions verified');
