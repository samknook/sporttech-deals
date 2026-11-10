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
  assert.match(html,/useCloud:ids=>/);
  assert.match(html,/useGuest:\(\)=>/);
  assert.match(html,/raceatlas:saved-change/);
  assert.match(moduleCode,/Lokale favorieten toevoegen aan account/);
  assert.match(moduleCode,/Alleen cloudseizoen gebruiken/);
  assert.match(moduleCode,/pending\.set\(id,active\)/);
  assert.match(moduleCode,/async function flushPending\(\)/);
  assert.match(moduleCode,/if\(saving\|\|!user\|\|mode!=='cloud'\|\|!pending\.size\)return/);
});
test('Browser account code never accesses service-role credentials or sends email',()=>{
  assert.doesNotMatch(moduleCode,/service_role|supabase\.auth\.admin|resend\.emails\.send|SMTP_PASSWORD/);
  assert.match(moduleCode,/signInWithOtp/);
  assert.match(moduleCode,/auth\.signOut/);
});

test('Rapid event saves are queued, failed writes are retryable and account switches clear pending work',()=>{
  assert.match(moduleCode,/const pending=new Map\(\)/);
  assert.match(moduleCode,/pending\.delete\(id\)/);
  assert.match(moduleCode,/if\(!pending\.has\(id\)\)pending\.set\(id,active\)/);
  assert.match(moduleCode,/Synchronisatie opnieuw proberen/);
  assert.match(moduleCode,/authVersion\+\+;pending\.clear\(\)/);
  assert.match(moduleCode,/\^ra-\\d\{1,8\}\$/);
});

test('Logged-in season status has three explicit states and stays per-user',()=>{
  assert.match(moduleCode,/function renderStatusControls\(\)/);
  assert.match(moduleCode,/\['interested','Interesse'\]/);
  assert.match(moduleCode,/\['registered','Ingeschreven'\]/);
  assert.match(moduleCode,/\['completed','Voltooid'\]/);
  assert.match(moduleCode,/\.update\(\{season_status:statusValue,updated_at:/);
  assert.match(moduleCode,/\.eq\('user_id',currentUser\)\.eq\('event_id',eventId\)/);
  assert.match(moduleCode,/renderStatusControls\(\)/);
});
test('Cloud UI updates with successfully added and removed event preferences',()=>{
  assert.match(moduleCode,/cloudEvents\.push\(\{event_id:id,season_status:'interested'\}\)/);
  assert.match(moduleCode,/cloudEvents=cloudEvents\.filter\(item=>item\.event_id!==id\)/);
  assert.match(moduleCode,/if\(version===authVersion&&user\?\.id===owner\)/);
});

test('Guest favorites never become the locally persisted cloud season',()=>{
  assert.match(html,/let guestSaved=\[\.\.\.saved\],cloudSeasonActive=false/);
  assert.match(html,/if\(!cloudSeasonActive\)\{guestSaved=\[\.\.\.saved\]/);
  assert.match(html,/useCloud:ids=>/);
  assert.match(html,/cloudSeasonActive=true;render\(\)/);
  assert.match(html,/useGuest:\(\)=>\{cloudSeasonActive=false;saved=\[\.\.\.guestSaved\];render\(\)\}/);
  assert.match(moduleCode,/savedApi\(\)\.useCloud\(cloud\.map\(e=>e\.event_id\)\)/);
  assert.match(moduleCode,/savedApi\(\)\.guest\(\)\.filter/);
  assert.match(moduleCode,/savedApi\(\)\.useGuest\(\)/);
});
