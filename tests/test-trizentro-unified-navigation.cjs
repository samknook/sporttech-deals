'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const src=fs.readFileSync('docs/shared-ui.js','utf8');
new Function(src);
const pages=['docs/raceatlas/index.html','docs/performance.html','docs/raceatlas/organisatoren.html'];
for(const file of pages){
 const html=fs.readFileSync(file,'utf8');
 assert.ok(html.includes('shared-ui.js?v=20261113-platform3'),file+' missing shared navigation');
 assert.ok(html.includes('shared-ui.css?v=20261113-platform3'),file+' missing shared style');
 assert.ok(html.includes('tz-logo-image'),file+' missing shared brand');
}
for(const id of ['events','season','performance','account','organizers'])assert.ok(src.includes("id:'"+id+"'"),'missing destination '+id);
assert.ok(src.includes('const preservedLanguage='),'language selector lost');
assert.ok(src.includes('if(!isEvents){\nconst bottom='),'Events mobile filter bar must be retained');
assert.ok(src.includes("document.getElementById('navSaved')?.click()"),'saved season functionality lost');
assert.ok(src.includes("document.getElementById('raAccountNav')"),'account navigation lost');
assert.ok(src.includes('if(item.id===\'organizers\')'),'organizers must be the final nav destination');
console.log('PASS: TriZentro pages share functional and mobile-safe navigation');
