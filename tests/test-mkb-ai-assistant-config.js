/* Run: node tests/test-mkb-ai-assistant-config.js */
'use strict';
const assert=require('node:assert/strict');
const cfg=require('../docs/ai-studio/assistant-config-core.js');
for(const type of Object.keys(cfg.TYPES)){
 const x=cfg.build({type,team:'Demo Team',policy:'Approved policy v1',details:'Draft only'});
 assert.equal(x.type,type);
 assert.equal(x.requiresHumanReview,true);
 assert.match(x.text,/Never send a customer email/);
 assert.match(x.text,/untrusted/i);
 assert.match(x.text,/TO VERIFY/);
 assert.match(x.text,/human employee/i);
 assert.ok(x.text.length>1000);
}
const finance=cfg.build({type:'finance'});
assert.match(finance.text,/disputed/i);
assert.match(finance.text,/duplicate/i);
const document=cfg.build({type:'documents'});
assert.match(document.text,/illegible scan/i);
const inbox=cfg.build({type:'inbox'});
assert.match(inbox.text,/promise delivery dates/i);
assert.throws(()=>cfg.build({type:'unknown'}));
assert.throws(()=>cfg.build({type:'inbox',team:'x'.repeat(81)}));
const safe=cfg.build({type:'inbox',team:'Test\nDepartment'});
assert.doesNotMatch(safe.title,/\n/);
console.log('MKB AI Studio assistant configuration tests passed.');
