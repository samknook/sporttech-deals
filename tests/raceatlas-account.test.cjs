'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const dir=path.resolve(__dirname,'..','docs','raceatlas');
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const moduleCode=fs.readFileSync(path.join(dir,'account.js'),'utf8');
const config=fs.readFileSync(path.join(dir,'account-config.js'),'utf8');
test('Accounts remain disabled until secure backend is commissioned',()=>{
  assert.match(config,/enabled:false/);
  assert.doesNotMatch(config,/service_role|sk_live_|re_[A-Za-z0-9]{16,}/);
  assert.match(moduleCode,/if\(cfg\.enabled!==true\)return/);
  assert.match(html,/src="account-config\.js" defer/);
  assert.match(html,/src="account\.js" defer/);
});
test('Account code and config are syntactically valid',()=>{
  new vm.Script(moduleCode);
  new vm.Script(config);
});
test('Season remains usable without an account and cloud import is explicit',()=>{
  assert.match(html,/window\.RaceAtlasSaved=\{/);
  assert.match(html,/raceatlas:saved-change/);
  assert.match(moduleCode,/Lokale favorieten toevoegen aan account/);
  assert.match(moduleCode,/Alleen cloudseizoen gebruiken/);
  assert.match(moduleCode,/if\(!user\|\|mode!=='cloud'\|\|saving\)return/);
});
test('Browser account code never accesses service-role credentials or sends email',()=>{
  assert.doesNotMatch(moduleCode,/service_role|supabase\.auth\.admin|resend\.emails\.send|SMTP_PASSWORD/);
  assert.match(moduleCode,/signInWithOtp/);
  assert.match(moduleCode,/auth\.signOut/);
});
