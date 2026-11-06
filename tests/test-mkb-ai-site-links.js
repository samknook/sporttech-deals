/* Static navigation integrity checks, Node 22, no HTTP or visitor data.
 * Verify relative targets in the static site itself, not deployment uptime.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../docs/ai-studio');
const entrypoints=[
 'index.html','wat-krijg-je.html','pakketten.html','pilot.html',
 'kennismaking.html','businesscase.html','pilot-meten.html','prospecten.html','hulpmiddelen.html'
];
let checked=0;
for(const entry of entrypoints){
 const origin=path.join(root,entry);
 const content=fs.readFileSync(origin,'utf8');
 const links=[...content.matchAll(/\b(?:href|src)\s*=\s*["']([^"'#?]+)(?:[?#][^"']*)?["']/gi)].map(x=>x[1]);
 for(const href of links){
  if(/^(?:https?:|mailto:|tel:|data:|javascript:|\/\/)/i.test(href))continue;
  const target=path.resolve(path.dirname(origin),decodeURIComponent(href));
  assert.ok(target.startsWith(root+path.sep),'Site link escapes public site root: '+href);
  assert.ok(fs.existsSync(target),'Broken relative asset or page: '+entry+' -> '+href);
  checked++;
 }
 assert.match(content,/<meta[^>]*name=["']viewport["']/i,'Mobile viewport missing: '+entry);
}
assert.ok(checked>=25,'Suspiciously few internal links checked');
console.log('Static site internal links verified: '+checked+' references across '+entrypoints.length+' pages. No network check.');
