'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const dir=path.join(__dirname,'../docs/ai-studio');
const pages=['index.html','wat-krijg-je.html','pakketten.html','pilot.html','kennismaking.html','businesscase.html','pilot-meten.html','quickscan.html','pilot-intake.html','inbox-workflow.html','broncontrole.html','assistant-configurator.html','prospecten.html'];
const required=['index.html','wat-krijg-je.html','pakketten.html','inbox-workflow.html','kennismaking.html'];
for(const filename of pages){
 const s=fs.readFileSync(path.join(dir,filename),'utf8');
 assert.match(s,/<html lang="nl">/,'Dutch language missing in '+filename);
 assert.match(s,/href="site-shell.css"/,'Shared shell missing in '+filename);
 assert.match(s,/<nav class="site-nav-links"/,'Desktop nav missing in '+filename);
 assert.match(s,/<details class="site-mobile">/,'Mobile disclosure menu missing in '+filename);
 assert.match(s,/<nav class="site-mobile-links"/,'Mobile navigation links missing in '+filename);
 for(const href of required)assert.ok(s.includes('href="'+href+'"'),'Core navigation missing '+href+' in '+filename);
}
const home=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const css=fs.readFileSync(path.join(dir,'site-shell.css'),'utf8');
assert.match(home,/AI Inbox Starter/);
assert.match(home,/€995/);
assert.match(home,/Prototypefase|Prototype met fictieve/);
assert.match(home,/aria-current="page"/);
assert.match(css,/@media\(max-width:860px\)/);
assert.match(css,/\.site-mobile\[open\]/);
assert.doesNotMatch(home,/id="message"|id="estimate"|id="scope-form"/);
assert.doesNotMatch(home,/<script/);
console.log('Unified navigation and focused mobile homepage verified across '+pages.length+' pages.');
