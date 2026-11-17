'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../docs/raceatlas');
const html=fs.readFileSync(path.join(root,'organizer-review-admin.html'),'utf8');
const js=fs.readFileSync(path.join(root,'organizer-review-admin.js'),'utf8');
test('grant form is available only inside admin-gated panel',()=>{
 new vm.Script(js);
 assert.ok(html.indexOf('id="app" hidden')>=0);
 assert.ok(html.indexOf('id="grantForm"')>html.indexOf('id="app" hidden'));
 assert.match(html,/id="grantEmail" required type="email"/);
 assert.match(html,/id="grantEvent" required pattern="ra-\[0-9\]/);
});
test('access requires explicit review confirmation and existing admin session',()=>{
 assert.match(js,/window\.confirm\('Heb je de relatie met de organisator onafhankelijk gecontroleerd/);
 assert.match(js,/api\('POST',null,\{action:'grant_access',email,event_id\}\)/);
 assert.match(js,/session\.session\.access_token/);
 assert.doesNotMatch(js,/service_role|SUPABASE_SERVICE_ROLE_KEY|sb_secret_/i);
});
test('after error no successful account assignment is claimed',()=>{
 assert.match(js,/Toegang niet toegekend/);
 assert.match(js,/finally\{busy=false;button\.disabled=false\}/);
});
