'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('docs/raceatlas/index.html');
const a=html.indexOf('const EVENTS=')+'const EVENTS='.length,b=html.indexOf('];',a)+1;
const races=JSON.parse(html.slice(a,b));
test('four verified 2027 run-bike-run races are uniquely available',()=>{
 for(const [id,date,host] of [
  ['ra-206','2027-02-06','www.veluwserunbikerun.nl'],
  ['ra-210','2027-03-06','www.veluwserunbikerun.nl'],
  ['ra-214','2027-04-03','rbr-rotterdam.nl'],
  ['ra-459','2027-04-17','www.veluwserunbikerun.nl']]){
   const matches=races.filter(e=>e.id===id);
   assert.equal(matches.length,1,'unique '+id);
   const e=matches[0];assert.equal(e.date,date);
   assert.equal(e.sport,'Triatlon');assert.equal(e.dateEvidence,'official');
   assert.equal(new URL(e.officialEventUrl).hostname,host);
   assert.equal(e.registrationStatus,'check');
   assert.ok(!e.registrationUrl,'unverified registration availability is not invented');
 }
});
test('a real save is recorded only after storage success, with a link to My Season',()=>{
 const save=read('docs/raceatlas/event-save.js');
 new vm.Script(save,{filename:'event-save.js'});
 const success=save.indexOf("saved=target;busy=false");
 const telemetry=save.indexOf("if(target)window.RaceAtlasTracking?.track(id,'season_save')");
 assert.ok(telemetry>success&&success>0);
 assert.match(save,/next\.href='\/seizoen\/'/);
 assert.match(save,/next\.style\.display=!busy&&saved/);
 assert.match(save,/upsert\(/);
 assert.match(save,/Opgeslagen op dit apparaat/);
});
test('radar is recorded as an opening click, not a verified subscription',()=>{
 const tracking=read('docs/raceatlas/tracking.js');
 const edge=read('supabase/functions/raceatlas-track-outbound/index.ts');
 new vm.Script(tracking,{filename:'tracking.js'});
 assert.match(tracking,/radar_intent/);
 assert.match(tracking,/a\[data-ra-radar\]/);
 assert.match(tracking,/sessionStorage\.setItem\(ATTRIBUTION_KEY/);
 assert.match(tracking,/30\*60\*1000/);
 assert.match(edge,/trizentro_record_conversion/);
 assert.match(edge,/kind==="season_save"\|\|kind==="radar_intent"/);
 assert.match(edge,/NOT an email/);
});
test('admin reporting restricts access and labels conversion totals accurately',()=>{
 const edge=read('supabase/functions/trizentro-organizer-review-admin/index.ts');
 const ui=read('docs/raceatlas/organizer-review-admin.js');
 const page=read('docs/raceatlas/organizer-review-admin.html');
 assert.ok(edge.indexOf('trizentro_admin!==true')<edge.indexOf('trizentro_conversion_daily'));
 assert.match(edge,/save_actions_and_radar_entry_clicks_not_unique_users_or_confirmed_subscriptions/);
 new vm.Script(ui);
 assert.match(ui,/acquisitionSaves/);assert.match(ui,/acquisitionRadar/);
 assert.match(page,/geen unieke sporters of bevestigde e-mailaanmeldingen/);
});
test('all new race pages, save and radar CTAs, and sitemap are generated',()=>{
 cp.execFileSync(process.execPath,[path.join(root,'scripts/build-trizentro-event-pages.cjs')],{cwd:root,env:{...process.env,TRIZENTRO_DOMAIN_CONFIRMED:'true'},encoding:'utf8'});
 cp.execFileSync(process.execPath,[path.join(root,'scripts/build-trizentro-seo-hubs.cjs')],{cwd:root,encoding:'utf8'});
 cp.execFileSync(process.execPath,[path.join(root,'scripts/build-trizentro-platform-shell.cjs')],{cwd:root,encoding:'utf8'});
 const sitemap=read('docs/sitemap.xml'),index=read('docs/events/index.html');
 for(const e of races.filter(x=>['ra-206','ra-210','ra-214','ra-459'].includes(x.id))){
  const slug=e.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,75);
  const file=slug+'-'+e.id+'.html';
  const item=read('docs/events/wedstrijden/'+file);
  assert.match(item,/id="saveRace"/);
  assert.match(item,/data-ra-radar="ra-/);
  assert.match(item,/ra_alert=ra-/);
  assert.match(item,/event-save\.js/);
  assert.ok(sitemap.includes(file));
  assert.ok(index.includes(e.name));
 }
});
