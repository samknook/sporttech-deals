const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const core=require('../docs/club-brief-core.js');
const template=require('../docs/club-template.js');
const valid=()=>({event:'Fictional Event',date:'2027-06-20',venue:'Example Town',guide:'https://example.org/rules',checkin:'06:00',bikeClose:'07:00',transitionClose:'07:30',briefing:'07:40',waveA:'08:00',waveB:'08:15',waveC:'08:30',waveD:'08:45',waveE:'09:00',waveF:'09:15',notes:'Example only'});
test('six start groups appear in chronological order with both languages',()=>{
 const a=core.analyze(valid());
 assert.deepEqual(a.warnings,[]);
 assert.equal(a.events.length,10);
 assert.match(core.lines(a,'nl').join('\n'),/Startgroep F/);
 assert.match(core.lines(a,'en').join('\n'),/Wave F starts/);
});
test('out-of-order or duplicate later wave times produce explicit warning',()=>{
 const a=core.analyze({...valid(),waveC:'08:10'});
 assert.ok(a.warnings.includes('wave-order-waveC'));
 const b=core.analyze({...valid(),waveD:'08:30'});
 assert.ok(b.warnings.includes('wave-order-waveD'));
});
test('a valid template roundtrips with revision and normalized fields',()=>{
 const obj=template.create(valid(),'v2.1',core);
 assert.equal(obj.schema,'trizentro.club-template');
 assert.deepEqual(template.parse(JSON.stringify(obj),core),obj);
 assert.equal(template.filename('Example Race / 70.3','v2.1'),'trizentro-example-race-70-3-v2.1.json');
});
test('rejects oversized, corrupt, unsupported or malicious templates',()=>{
 for(const raw of ['{bad','x'.repeat(15001),JSON.stringify({schema:'other',version:1,revision:'v1',values:valid()}),JSON.stringify({schema:template.SCHEMA,version:2,revision:'v1',values:valid()}),JSON.stringify({schema:template.SCHEMA,version:1,revision:'../../oops',values:valid()})]){
  assert.throws(()=>template.parse(raw,core));
 }
 assert.throws(()=>template.create({...valid(),event:''},'v1',core));
});
test('browser form loads templates only after validation and makes review expire after edits',()=>{
 const page=fs.readFileSync(path.join(__dirname,'../docs/club-race-brief.html'),'utf8');
 for(const id of ['waveC','waveD','waveE','waveF','revision','import-template','export-template','template-status'])assert.match(page,new RegExp('id="'+id+'"'));
 assert.match(page,/src="club-template.js"/);
 assert.match(page,/organizer-review'\)\.checked=false/);
 const portal=require('../docs/club-event-portal.js');
 const html=portal.documentHtml(core.analyze(valid()),{organizerConfirmed:true,revision:'v3.2',issuedAt:'2026-11-05'});
 assert.match(html,/Version/);
 assert.match(html,/v3\.2/);
});
