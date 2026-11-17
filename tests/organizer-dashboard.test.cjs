'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const dir=path.resolve(__dirname,'../docs/raceatlas');
const page=fs.readFileSync(path.join(dir,'organizer-dashboard.html'),'utf8');
const js=fs.readFileSync(path.join(dir,'organizer-dashboard.js'),'utf8');
const organizers=fs.readFileSync(path.join(dir,'organisatoren.html'),'utf8');
test('dashboard JavaScript compiles and is linked by the organizer page',()=>{
 new vm.Script(js,{filename:'organizer-dashboard.js'});
 assert.match(page,/organizer-dashboard\.js/);
 assert.match(organizers,/href="organizer-dashboard\.html"/);
});
test('dashboard requires a verified signed-in account and never embeds a secret key',()=>{
 assert.match(js,/client\.auth\.getUser\(\)/);
 assert.match(js,/email_confirmed_at/);
 assert.match(js,/session\.session\.access_token/);
 assert.match(js,/Authorization:'Bearer '/);
 assert.doesNotMatch(js,/SUPABASE_SERVICE_ROLE_KEY|service_role|sb_secret_/i);
});
test('dashboard reads only its approved organizer endpoint and shows no hardcoded analytics',()=>{
 assert.match(js,/functions\/v1\/trizentro-organizer-dashboard\?days=/);
 assert.match(js,/\[7,30,90\]/);
 assert.match(page,/geen unieke bezoekers en geen bevestigde inschrijvingen/);
 assert.match(js,/Er zijn nog geen geverifieerde evenementen gekoppeld/);
 assert.doesNotMatch(js,/Math\.random/);
});
test('dashboard CSV escape protects spreadsheet formula injection',()=>{
 assert.match(js,/const csvValue=/);
 assert.match(js,/replace\(\/"\/g,'""'\)/);
 assert.match(js,/setTimeout\(\(\)=>URL\.revokeObjectURL/);
});
