/* Run with Node: node tests/test-mkb-ai-pilot-intake.js */
'use strict';
const assert=require('node:assert/strict');
const intake=require('../docs/ai-studio/intake-core.js');
const base={company:'Example Ltd',owner:'Process lead',tools:'M365',workflow:'inbox',volume:80,before:8,after:4,hourly:35,
 sensitive:false,external:false,writeback:false,approvedWorkspace:true,humanApproval:true,sourceOwner:true};
const a=intake.assess(base);
assert.equal(a.status,'candidate');
assert.ok(a.netHours>23&&a.netHours<24);
assert.equal(a.proposedPrice,995);
assert.equal(intake.assess({...base,external:true}).status,'blocked');
assert.equal(intake.assess({...base,writeback:true}).status,'blocked');
assert.equal(intake.assess({...base,approvedWorkspace:false}).status,'blocked');
assert.equal(intake.assess({...base,humanApproval:false}).status,'blocked');
assert.equal(intake.assess({...base,sourceOwner:false}).status,'blocked');
assert.equal(intake.assess({...base,sensitive:true}).status,'review');
const negative=intake.assess({...base,after:12});
assert.equal(negative.status,'review');assert.ok(negative.netHours<0);
assert.ok(negative.capacityValue<0);
assert.match(intake.textReport(base,'nl'),/CONCEPT INTAKERAPPORT/);
assert.match(intake.textReport(base,'en'),/DRAFT INTAKE REPORT/);
assert.throws(()=>intake.assess({...base,workflow:'unknown'}));
assert.throws(()=>intake.assess({...base,volume:6000}));
assert.throws(()=>intake.assess({...base,humanApproval:'true'}));
console.log('MKB AI Studio pilot intake regression tests passed.');
