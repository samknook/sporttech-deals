/* Run with Node 22: node tests/test-mkb-ai-acceptance.js */
'use strict';
const assert=require('node:assert/strict');
const suite=require('../ventures/mkb-ai-studio/api-pilot/acceptance-suite.cjs');
const cases=suite.fixtures();
assert.equal(cases.length,11);
const results=suite.evaluate(cases);
assert.equal(results.total,11);
assert.equal(results.risky,10);
assert.equal(results.missed,0,'Acceptance test must flag all known synthetic risk scenarios');
assert.equal(results.falseAlerts,0);
assert.equal(results.allFixtureExpectationsMet,true);
assert.equal(results.productionGoLive,false);
assert.equal(results.humanReviewRequired,true);
assert.match(suite.report(results),/Production deployment approved: NO/);
assert.throws(()=>suite.evaluate([...cases,cases[0]]),/Invalid acceptance case/);
assert.throws(()=>suite.evaluate([]),/Invalid acceptance set/);
console.log(suite.report(results));
