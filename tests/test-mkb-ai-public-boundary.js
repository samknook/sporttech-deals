/* CI guardrail: public marketing pages must not reintroduce free paid assets.
 * This protects current published files only; git history is not purged.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../docs/ai-studio');
const sales=fs.readFileSync(path.join(root,'index.html'),'utf8');
const assistant=fs.readFileSync(path.join(root,'assistant-configurator.html'),'utf8');
const offer=fs.readFileSync(path.join(root,'pakketten.html'),'utf8');
assert.equal(fs.existsSync(path.join(root,'assistant-config-core.js')),false,'Public assistant config engine must not return');
assert.equal(assistant.includes('assistant-config-core.js'),false,'Do not load commercial config generator');
assert.equal(assistant.includes('id="instructions"'),false,'Do not publish full assistant prompts in public page');
assert.equal(assistant.includes('id="download"'),false,'No free commercial configuration download');
assert.match(sales,/betaalde implementatie/i);
assert.match(offer,/geen offerte|geen bestelpagina/i);
assert.match(offer,/offer-core\.js/);
console.log('MKB AI Studio public/private boundary guardrail passed.');
