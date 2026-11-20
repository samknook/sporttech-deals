'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const track=fs.readFileSync(path.join(root,'docs/raceatlas/tracking.js'),'utf8');
const collect=fs.readFileSync(path.join(root,'supabase/functions/raceatlas-track-outbound/index.ts'),'utf8');
const admin=fs.readFileSync(path.join(root,'supabase/functions/trizentro-organizer-review-admin/index.ts'),'utf8');
const ui=fs.readFileSync(path.join(root,'docs/raceatlas/organizer-review-admin.js'),'utf8');
const html=fs.readFileSync(path.join(root,'docs/raceatlas/organizer-review-admin.html'),'utf8');
const seo=fs.readFileSync(path.join(root,'scripts/build-trizentro-seo-hubs.cjs'),'utf8');
test('anonymous client tracker compiles, uses only coarse acquisition fields',()=>{
 new vm.Script(track,{filename:'tracking.js'});
 assert.match(track,/utm_source/);assert.match(track,/utm_campaign/);
 assert.match(track,/kind==='site_view'\?\{eventId,kind,\.\.\.conversionSource\(\)\}/);
 assert.doesNotMatch(track,/localStorage|document\.cookie|userAgent|clientId|visitorId/);
 assert.match(track,/sessionStorage\.setItem\(ATTRIBUTION_KEY/);
 assert.match(track,/30\*60\*1000/);
});
test('site-view collector uses service-only aggregate RPC and preserves existing view tracking',()=>{
 assert.match(collect,/kind==="site_view"/);
 assert.match(collect,/trizentro_record_acquisition/);
 assert.match(collect,/raceatlas_record_outbound_click/);
 assert.match(collect,/allowedChannels/);
 assert.doesNotMatch(collect,/referrer|utm_source|visitor_id|session_id/);
});
test('channel reports are secured by the existing verified-admin auth before reporting',()=>{
 const auth=admin.indexOf('user.app_metadata?.trizentro_admin!==true');
 const data=admin.indexOf('view")==="acquisition"');
 assert.ok(auth>=0&&data>auth,'Admin check precedes channel data');
 assert.match(admin,/trizentro_acquisition_daily/);
 assert.match(admin,/metric:"pageviews_not_unique_visitors"/);
 assert.match(ui,/api\('GET',\{view:'acquisition'\}\)/);
 assert.match(ui,/replaceChildren\(\)/);
 new vm.Script(ui);
 assert.match(html,/id="acquisitionChannels"/);
});
test('each generated SEO hub reports anonymous site views',()=>{
 assert.match(seo,/raceatlas\/tracking\.js/);
 assert.match(seo,/Officiële organisator/);
});
