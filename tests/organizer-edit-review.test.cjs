'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../docs/raceatlas');
const ui=fs.readFileSync(path.join(root,'organizer-dashboard.html'),'utf8');
const js=fs.readFileSync(path.join(root,'organizer-dashboard.js'),'utf8');
test('request code parses and form contains required organizer evidence fields',()=>{
 new vm.Script(js,{filename:'organizer-dashboard.js'});
 for(const id of ['editPanel','editForm','editEventId','editField','editValue','editSource','editReason','editHistory','editMessage'])assert.ok(ui.includes('id="'+id+'"'),id);
});
test('organizer must be linked to event and logged in before submitting',()=>{
 assert.match(js,/report\?\.events\?\.some\(row=>row\.event_id===event_id\)/);
 assert.match(js,/client\.auth\.getUser\(\)/);
 assert.match(js,/auth\.user\.email_confirmed_at/);
 assert.match(js,/raceatlas_organizer_change_requests/);
 assert.match(js,/\.insert\(\{user_id:activeUser,event_id,field_name,proposed_value,evidence_url,explanation\}\)/);
});
test('only proposed changes go into review queue, never directly into public event tables',()=>{
 assert.doesNotMatch(js,/from\(['"]raceatlas_event_intelligence['"]\)\.update/);
 assert.match(js,/De publieke wedstrijdinformatie is niet gewijzigd/);
 assert.match(ui,/Je voorstel wordt eerst gecontroleerd/);
 assert.match(js,/review_status/);
});
test('user input is rendered as text, not inserted as markup',()=>{
 assert.match(js,/li\.textContent=/);
 assert.match(js,/evidence_url/);
 assert.doesNotMatch(js,/innerHTML\s*=/);
});
