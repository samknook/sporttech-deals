#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const events=fs.readFileSync('docs/raceatlas/index.html','utf8');
const account=fs.readFileSync('docs/raceatlas/account.js','utf8');
const dashboard=fs.readFileSync('docs/season-dashboard.js','utf8');
assert.ok(events.includes('let myRegistrations=readRegistrationStates(),cloudRegistrations={}'),'Guest and cloud states must be separate');
assert.ok(events.includes('cloudSeasonActive?cloudRegistrations:myRegistrations'),'Dashboard must read active season statuses');
assert.ok(events.includes('window.TriZentroAccount.setSeasonStatus(id,state)'),'Cloud status changes must use account API');
assert.ok(events.includes("cloudRegistrations[id]=value==='registered'||value==='completed'?value:'planned'"),'Cloud status mapping must not accept unsupported waitlist');
assert.ok(events.includes('cloudRegistrations={}'), 'Cloud statuses must reset on sign-out');
assert.ok(!events.includes('window.TriZentroDashboard?.render(myEvents,myRegistrations,'),'Dashboard must not always use device-only statuses');
assert.ok(account.includes('Object.fromEntries(cloud.map(e=>[e.event_id,e.season_status]))'),'Account must pass authoritative statuses into season');
assert.ok(account.includes('window.TriZentroAccount={setSeasonStatus:'),'Account must expose authenticated status update');
assert.ok(account.includes('const statusWrites=new Set()'),'Concurrent account status updates must be guarded');
assert.ok(account.includes(".select('event_id').maybeSingle()"),'Status update must confirm database row exists');
assert.ok(account.includes("result.data?.event_id===eventId"),'A zero-row database update must never be considered saved');
assert.ok(account.includes('ignoreDuplicates:true'),'Saving existing races must preserve their status');
assert.ok(account.includes("confirmedRace={event_id:id,season_status:result.data.season_status||'interested'}"),
 'Cloud save must read the actual stored status instead of assuming interested');
assert.ok(account.includes('savedApi()?.setCloudStatus?.(id,confirmedRace.season_status)'),
 'Saving an existing race must preserve registered/completed in dashboard');
assert.ok(account.includes("now-lastVisibilityRefresh<15000"),
 'Cloud refresh on return must be rate-limited');
assert.ok(account.includes("document.addEventListener('visibilitychange',refreshVisibleCloudSeason)"),
 'Cloud statuses must refresh when user returns to tab');
assert.ok(account.includes("pending.size||saving||statusWrites.size"),
 'Cloud refresh must not overwrite in-flight edits');

assert.ok(account.includes("select.value=cloudEvents.find("),'Failed account status changes must restore saved selection');
assert.ok(account.includes('savedApi()?.setCloudStatus?.(eventId,statusValue)'),'Confirmed status changes must propagate to dashboard');
assert.ok(account.includes('return false}'),'Unsuccessful status changes should not be reported as saved');
assert.ok(dashboard.includes('const cloud=window.RaceAtlasSaved?.isCloud?.()===true'),'Dashboard must detect cloud mode');
assert.ok(dashboard.includes("if(!cloud)options.splice(2,0,['waitlist'"),'Unsupported cloud waitlist must be hidden');
assert.ok(dashboard.includes("states[item.id]==='completed'"),'Completed count must use account status');
console.log('PASS: cloud-season status separation, mapping, updates, logout and unsupported choices');
