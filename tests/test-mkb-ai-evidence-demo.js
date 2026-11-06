/* Run: node tests/test-mkb-ai-evidence-demo.js */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const browser=fs.readFileSync(path.join(root,'docs/ai-studio/evidence-demo-core.js'),'utf8');
const node=fs.readFileSync(path.join(root,'ventures/mkb-ai-studio/api-pilot/source-evidence.cjs'),'utf8');
const html=fs.readFileSync(path.join(root,'docs/ai-studio/broncontrole.html'),'utf8');
assert.equal(browser,node,'Browser and Node evidence logic must stay synchronized');
assert.match(html,/src="evidence-demo-core.js"/);
assert.match(html,/href="pakketten.html"/);
assert.doesNotMatch(html,/fetch\s*\(|XMLHttpRequest|navigator\.sendBeacon|localStorage\./);
assert.match(html,/fictieve/i);
assert.match(html,/geen AI-model/i);
const dates=[{value:'2026-02-28',valid:true},{value:'2026-02-30',valid:false},{value:'2026-13-01',valid:false}];
const ev=require('../ventures/mkb-ai-studio/api-pilot/source-evidence.cjs');
for(const d of dates){const rec={kind:'order',reference:'ORD-007',field:'delivery_date',value:d.value,source:'Synthetic',checkedOn:'2026-11-06'};if(d.valid)assert.equal(ev.normalizeRecord(rec).value,d.value);else assert.throws(()=>ev.normalizeRecord(rec))}
console.log('MKB AI Studio evidence demo consistency checks passed.');
