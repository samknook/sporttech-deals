'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../docs/raceatlas');
const html=fs.readFileSync(path.join(root,'organizer-review-admin.html'),'utf8');
const js=fs.readFileSync(path.join(root,'organizer-review-admin.js'),'utf8');
const org=fs.readFileSync(path.join(root,'organisatoren.html'),'utf8');
test('admin page and JS parse, no search-engine indexing',()=>{
 new vm.Script(js);
 assert.match(html,/name="robots" content="noindex,nofollow"/);
 assert.match(html,/organizer-review-admin\.js/);
 assert.match(org,/organizer-review-admin\.html/);
});
test('admin API requires real Supabase session and never exposes service-role credentials',()=>{
 assert.match(js,/client\.auth\.getUser\(\)/);
 assert.match(js,/session\.session\.access_token/);
 assert.match(js,/trizentro-organizer-review-admin/);
 assert.doesNotMatch(js,/SUPABASE_SERVICE_ROLE_KEY|sb_secret_|service_role/i);
});
test('admin UI requires review notes, approval confirmation and safe text rendering',()=>{
 assert.match(js,/v\.length<10/);
 assert.match(js,/window\.confirm/);
 assert.match(js,/textContent=content/);
 assert.doesNotMatch(js,/innerHTML\s*=/);
});
test('review requests can approve or reject but do not write to public events directly',()=>{
 assert.match(js,/decision,note:v/);
 assert.match(js,/\['approve','reject'\]/);
 assert.doesNotMatch(js,/from\(['"]raceatlas_event_intelligence['"]\)\.update/);
});
