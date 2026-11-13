'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const settings=JSON.parse(fs.readFileSync('.github/trizentro-domain.json','utf8'));
const builder=fs.readFileSync('scripts/build-trizentro-event-pages.cjs','utf8');
const cutover=fs.readFileSync('scripts/prepare-trizentro-domain.cjs','utf8');
const workflow=fs.readFileSync('.github/workflows/publish-site.yml','utf8');
assert.equal(settings.domain,'trizentro.com');
assert.equal(typeof settings.enabled,'boolean');
assert.equal(typeof settings.verifiedByOwner,'boolean');
assert.ok(builder.includes('customSettings.verifiedByOwner===true'));
assert.ok(builder.includes("process.env.TRIZENTRO_DOMAIN_CONFIRMED==='true'"));
assert.ok(cutover.includes('settings.verifiedByOwner!==true'));
assert.ok(cutover.includes('TRIZENTRO_DOMAIN_CONFIRMED'));
assert.ok(workflow.includes('node scripts/prepare-trizentro-domain.cjs'));
assert.ok(workflow.includes('TRIZENTRO_DOMAIN_CONFIRMED:'));
if(!settings.enabled){
 assert.equal(settings.verifiedByOwner,false,'Do not claim domain verified while disabled');
 assert.ok(fs.readFileSync('docs/raceatlas/index.html','utf8').includes('https://samknook.github.io/sporttech-deals/raceatlas/'));
}
console.log('PASS: domain migration is gated by verification and release flag');
