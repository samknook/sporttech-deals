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
  assert.match(config,/previewEnabled:true/);
  assert.match(moduleCode,/if\(cfg\.enabled!==true&&!previewActive\)return/);
  assert.match(moduleCode,/ra_account_preview/);
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

test('Late cloud responses cannot restore a logged-out or switched account',()=>{
  assert.match(moduleCode,/const owner=user\.id,version=authVersion/);
  assert.match(moduleCode,/if\(owner!==user\?\.id\|\|version!==authVersion\)return/);
  assert.match(moduleCode,/if\(owner===user\?\.id&&version===authVersion\)await chooseCloud\(\)/);
  assert.match(moduleCode,/if\(currentUser!==user\?\.id\|\|version!==authVersion\)return/);
});
test('Unsynced changes require an explicit logout decision',()=>{
  assert.match(moduleCode,/if\(\(saving\|\|pending\.size\)&&!window\.confirm\(/);
  assert.match(moduleCode,/Niet alle wijzigingen zijn gesynchroniseerd/);
  assert.match(moduleCode,/authVersion\+\+;pending\.clear\(\);cloudEvents=\[\];alertPrefs\.clear\(\);user=null;mode='local';savedApi\(\)\.useGuest\(\)/);
});
test('Account lookup errors clear stale cloud data from shared device',()=>{
  assert.match(moduleCode,/catch\{authVersion\+\+;pending\.clear\(\);cloudEvents=\[\];alertPrefs\.clear\(\);user=null;mode='local';savedApi\(\)\.useGuest\(\);showAuth\(\)/);
});

test('Configured accounts are discoverable but unavailable without backend credentials',()=>{
  assert.match(config,/previewEnabled:true/);
  assert.match(moduleCode,/if\(cfg\.enabled!==true&&!previewActive\)return/);
  assert.match(moduleCode,/ra_account_preview/);
  assert.match(moduleCode,/accountNav\.id='raAccountNav'/);
  assert.match(moduleCode,/document\.querySelector\('\.navright'\)\?\.append\(accountNav\)/);
  assert.match(moduleCode,/\.raAccountNav\{display:none\}/);
});
test('Failed writes from a previous account cannot contaminate the new account',()=>{
  assert.match(moduleCode,/if\(version===authVersion&&user\?\.id===owner&&mode==='cloud'\)\{\s*if\(!pending\.has\(id\)\)pending\.set\(id,active\)/);
  assert.match(moduleCode,/window\.addEventListener\('beforeunload'/);
  assert.match(moduleCode,/Herlaad de pagina niet voordat je opnieuw hebt gesynchroniseerd/);
});
test('Status updates handle rejected requests without revealing stale account data',()=>{
  assert.match(moduleCode,/catch\{error=new Error\('Netwerkfout'\)\}/);
  assert.match(moduleCode,/if\(currentUser!==user\?\.id\|\|version!==authVersion\)return/);
});
test('Email alerts are described as unavailable until opt-in and sending are implemented',()=>{
  assert.match(moduleCode,/E-mailmeldingen zijn nog niet actief/);
  assert.match(moduleCode,/aparte, expliciete aanmelding/);
});

test('Users can export their own cloud season without private auth tokens',()=>{
 assert.match(moduleCode,/function exportSeason\(\)/);
 assert.match(moduleCode,/raceatlas-mijn-seizoen\.json/);
 assert.match(moduleCode,/cloudEvents\.map\(item=>\(\{eventId:item\.event_id,status:item\.season_status\}\)\)/);
 assert.match(moduleCode,/Download mijn seizoensgegevens/);
});
test('Cloud season deletion requires confirmation and removes alert preferences before saved events',()=>{
 assert.match(moduleCode,/async function eraseCloudSeason\(\)/);
 assert.match(moduleCode,/if\(!window\.confirm\('Wil je al jouw opgeslagen wedstrijden/);
 const section=moduleCode.slice(moduleCode.indexOf('async function eraseCloudSeason'),moduleCode.indexOf('async function disconnect'));
 assert.ok(section.indexOf("'raceatlas_alert_preferences'")<section.indexOf("'raceatlas_saved_events'"));
 assert.match(section,/\.delete\(\)\.eq\('user_id',owner\)/);
 assert.match(section,/if\(owner!==user\?\.id\|\|version!==authVersion\)return/);
 assert.match(moduleCode,/Verwijder cloudseizoen/);
});

test('Cloud alert preferences require explicit event-specific email opt-in',()=>{
  assert.match(moduleCode,/async function readAlertPrefs\(owner\)/);
  assert.match(moduleCode,/function renderAlertControls\(\)/);
  assert.match(moduleCode,/async function saveAlertPreference\(eventId,preference\)/);
  assert.match(moduleCode,/consented_at:enabled\?new Date\(\)\.toISOString\(\):null/);
  assert.match(moduleCode,/email_enabled:enabled/);
  assert.match(moduleCode,/registration_open:enabled&&preference\.registration_open===true/);
  assert.match(moduleCode,/date_change:enabled&&preference\.date_change===true/);
  assert.match(moduleCode,/race_reminder:enabled&&preference\.race_reminder===true/);
  assert.match(moduleCode,/if\(enabled&&!next\.registration_open&&!next\.date_change&&!next\.race_reminder\)/);
  assert.match(moduleCode,/E-mails worden nog niet verstuurd/);
});
test('Alert preferences are scoped to user and automatically cleared from local view',()=>{
  assert.match(moduleCode,/\.from\('raceatlas_alert_preferences'\)\.select\(/);
  assert.match(moduleCode,/\.eq\('user_id',owner\)/);
  assert.match(moduleCode,/onConflict:'user_id,event_id'/);
  assert.match(moduleCode,/if\(owner!==user\?\.id\|\|version!==authVersion\)return/);
  assert.match(moduleCode,/alertPrefs\.clear\(\)/);
  assert.match(moduleCode,/alertPrefs\.delete\(id\)/);
});
const sql=fs.readFileSync(path.join(dir,'account-schema.sql'),'utf8');
test('Server enforces saved event link and notification type consent',()=>{
  assert.match(sql,/raceatlas_alert_requires_saved_event/);
  assert.match(sql,/references public\.raceatlas_saved_events\(user_id,event_id\)/);
  assert.match(sql,/on delete cascade/);
  assert.match(sql,/raceatlas_enabled_alert_needs_type/);
});

const deleteFn=fs.readFileSync(path.resolve(__dirname,'..','supabase','functions','raceatlas-delete-account','index.ts'),'utf8');
test('Account deletion must verify caller identity server-side',()=>{
  assert.match(deleteFn,/req\.method !== "POST"/);
  assert.match(deleteFn,/Authorization/);
  assert.match(deleteFn,/\/auth\/v1\/user/);
  assert.match(deleteFn,/if \(!who\.ok\) return response\(401/);
  assert.match(deleteFn,/VERWIJDER MIJN ACCOUNT/);
  assert.match(deleteFn,/\/auth\/v1\/admin\/users\//);
  assert.match(deleteFn,/encodeURIComponent\(user\.id\)/);
  assert.doesNotMatch(deleteFn,/query\?\.user_id|body\.user_id|body\?\.user_id/);
});
test('Account UI exposes explicit deletion, not an unverified browser admin action',()=>{
  assert.match(moduleCode,/async function deleteAccount\(\)/);
  assert.match(moduleCode,/window\.prompt\('Account definitief verwijderen/);
  assert.match(moduleCode,/client\.functions\.invoke\('raceatlas-delete-account'/);
  assert.match(moduleCode,/if\(error\|\|data\?\.deleted!==true\)throw/);
  assert.match(moduleCode,/Verwijder mijn account definitief/);
  assert.doesNotMatch(moduleCode,/auth\.admin\.deleteUser/);
});

test('Magic link callback retains opt-in test access without turning on public accounts',()=>{
 assert.match(moduleCode,/previewActive=cfg\.previewEnabled===true&&new URLSearchParams/);
 assert.match(moduleCode,/callback\.searchParams\.set\('ra_account_preview','1'\)/);
 assert.match(moduleCode,/emailRedirectTo:callback\.toString\(\)/);
 assert.match(config,/enabled:false/);
});
