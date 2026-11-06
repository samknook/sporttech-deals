/* Run: node tests/test-mkb-ai-offer.js */
'use strict';
const assert=require('node:assert/strict');
const api=require('../docs/ai-studio/offer-core.js');
const starter=api.quote({package:'starter',workflows:['inbox'],extras:[],care:false});
assert.equal(starter.status,'standard-candidate');
assert.equal(starter.price,995);assert.equal(starter.recurring,0);
assert.equal(starter.firstYearIllustration,995);
const care=api.quote({package:'business',workflows:['inbox','documents','finance'],extras:[],care:true});
assert.equal(care.status,'standard-candidate');
assert.equal(care.firstYearIllustration,2495+12*199);
assert.match(api.format(care,'nl'),/GEEN OFFERTE/);
assert.match(api.format(care,'en'),/NOT A QUOTE/);
assert.equal(api.quote({package:'starter',workflows:['inbox','documents'],extras:[],care:false}).status,'custom-review');
assert.equal(api.quote({package:'quickscan',workflows:['inbox'],extras:[],care:false}).status,'custom-review');
assert.equal(api.quote({package:'quickscan',workflows:[],extras:[],care:false}).status,'standard-candidate');
for(const code of ['api','erp','autonomous','sensitive','multisite'])
 assert.equal(api.quote({package:'starter',workflows:['inbox'],extras:[code],care:false}).status,'custom-review');
assert.throws(()=>api.quote({package:'wrong',workflows:[],extras:[],care:false}));
assert.throws(()=>api.quote({package:'starter',workflows:['inbox','inbox'],extras:[],care:false}));
assert.throws(()=>api.quote({package:'starter',workflows:['inbox'],extras:['unknown'],care:false}));
assert.throws(()=>api.quote({package:'starter',workflows:['inbox'],extras:[],care:'false'}));
console.log('MKB AI Studio offer scope tests passed.');
