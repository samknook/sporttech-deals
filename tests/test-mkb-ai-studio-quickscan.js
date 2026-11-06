/* Run: node tests/test-mkb-ai-studio-quickscan.js */
'use strict';
const assert=require('node:assert/strict');
const q=require('../docs/ai-studio/quickscan-core.js');
const high=q.rank({type:'inbox',volume:80,minutes:8,reviewMinutes:4,hourly:35});
assert.equal(high.type,'inbox');
assert.equal(high.priority,'high');
assert.ok(high.hours>23&&high.hours<24);
assert.ok(high.capacityValue>800);
const fin=q.rank({type:'finance',volume:80,minutes:8,reviewMinutes:4,hourly:35});
assert.equal(fin.priority,'review-first');
const noGain=q.rank({type:'documents',volume:100,minutes:4,reviewMinutes:7,hourly:35});
assert.equal(noGain.hours,0);assert.equal(noGain.priority,'low');
assert.throws(()=>q.rank({type:'wrong',volume:3,minutes:8,reviewMinutes:4,hourly:35}));
assert.throws(()=>q.rank({type:'inbox',volume:-3,minutes:8,reviewMinutes:4,hourly:35}));
const combined=q.report([{type:'inbox',volume:80,minutes:8,reviewMinutes:4,hourly:35},{type:'documents',volume:40,minutes:6,reviewMinutes:4,hourly:35}]);
assert.equal(combined.ranked.length,2);
assert.ok(combined.totalHours>high.hours);
console.log('MKB AI Studio QuickScan tests passed.');
