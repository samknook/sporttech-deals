'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../docs/raceatlas');
const html=fs.readFileSync(path.join(root,'organizer-dashboard.html'),'utf8');
const js=fs.readFileSync(path.join(root,'organizer-dashboard.js'),'utf8');
test('trend visualization is valid Javascript and accessible',()=>{
 new vm.Script(js,{filename:'organizer-dashboard.js'});
 assert.match(html,/id="insightChart"/);
 assert.match(html,/id="eventFilter"/);
 assert.match(html,/aria-label="Dagelijkse gemeten inschrijfklikken"/);
});
test('reporting periods and organizer event filter are available',()=>{
 assert.match(html,/<option value="7">/);
 assert.match(html,/<option value="30" selected>/);
 assert.match(html,/<option value="90">/);
 assert.match(js,/selectedEvents\(\)/);
 assert.match(js,/filteredTotals\(\)/);
 assert.match(js,/\.filter\(e=>\$\('eventFilter'\)\.value==='all'/);
});
test('engagement figures come from real approved event API results',()=>{
 assert.match(js,/report\?\.trend\|\|\[\]/);
 assert.match(js,/r\.registration_clicks/);
 assert.match(js,/totals\.registration_clicks,totals\.detail_views/);
 assert.match(html,/geen conversieratio naar inschrijvingen/);
 assert.doesNotMatch(js,/Math\.random\(/);
});
test('CSV respects event filter and dangerous spreadsheet formulas are escaped',()=>{
 assert.match(js,/\.\.\.selectedEvents\(\)\.map\(e=>cols\.map/);
 assert.match(js,/const csvValue=/);
 assert.match(js,/setTimeout\(\(\)=>URL\.revokeObjectURL/);
});
test('sensitive backend access remains token based',()=>{
 assert.match(js,/client\.auth\.getSession\(\)/);
 assert.match(js,/Authorization:'Bearer '/);
 assert.doesNotMatch(js,/sb_secret_|SUPABASE_SERVICE_ROLE_KEY|service_role/);
 assert.doesNotMatch(js,/innerHTML\s*=/);
});
