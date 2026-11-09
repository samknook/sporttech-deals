'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {webcrypto}=require('node:crypto');
const source=fs.readFileSync(path.join(__dirname,'..','raceatlas-backend','worker.js'),'utf8').replace('export default {','globalThis.__worker = {');
const BASE='https://raceatlas-worker.example.test';
function harness(opts={}){
 const mail=[],calls=[],signed=[],verified=[],unsubscribed=[];
 const events=opts.events||[{id:'ra-10',name:'Verified Race',date:'2027-01-20',dateEvidence:'official',place:'Edam',source:'https://example.org/race'}];
 const catalog='const EVENTS='+JSON.stringify(events)+';\nwindow.RACEATLAS_EVENTS=EVENTS;';
 const db={
   prepare(sql){const q={sql,args:[],bind(...values){this.args=values;return this},
   async first(){if(sql.startsWith('SELECT * FROM subscriptions WHERE email='))return null;if(sql.startsWith('SELECT * FROM event_snapshots'))return null;throw Error('Unexpected first SQL: '+sql)},
   async all(){if(sql.startsWith('SELECT * FROM subscriptions WHERE event_id='))return {results:opts.subscribers||[]};throw Error('Unexpected all SQL: '+sql)},
   async run(){calls.push({sql,args:this.args});if(sql.startsWith('UPDATE subscriptions')){verified.push(this.args);return {meta:{changes:1}}}if(sql.startsWith('DELETE FROM subscriptions')){unsubscribed.push(this.args);return {meta:{changes:1}}}return {meta:{changes:1}}}
   };return q}
 };
 const fetch=async(url,options={})=>{
  if(String(url).startsWith('https://challenges.cloudflare.com/turnstile/'))return Response.json({success:opts.captcha!==false});
  if(String(url).startsWith('https://api.resend.com/emails')){mail.push(JSON.parse(options.body));return Response.json({id:'fake-email-id'})}
  if(String(url)==='https://example.org/events')return new Response(catalog,{status:200});
  throw Error('Unexpected network request '+url)
 };
 const context={URL,URLSearchParams,TextEncoder,TextDecoder,Response,Request,Headers,crypto:webcrypto,fetch,atob,btoa,console,Date,Uint8Array,setTimeout,clearTimeout};
 vm.runInNewContext(source,context);
 const env={DB:db,TURNSTILE_SECRET:'unit-test',TOKEN_SECRET:'test-secret-for-hmac',RESEND_API_KEY:'fake-provider-api-key',MAIL_FROM:'RaceAtlas <test@example.org>',PUBLIC_ORIGIN:'https://samknook.github.io',BASE_URL:BASE,EVENTS_URL:'https://example.org/events'};
 return {worker:context.__worker,env,mail,calls,verified,unsubscribed};
}
function request(body,origin='https://samknook.github.io'){return new Request(BASE+'/subscribe',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(body)})}
const valid={email:'participant@example.org',eventId:'ra-10',consent:true,turnstileToken:'fake-turnstile',preferences:{date:true,registration:true,race:true}};
test('RaceAtlas email service rejects missing opt-in',async()=>{
 const h=harness();const res=await h.worker.fetch(request({...valid,consent:false}),h.env);assert.equal(res.status,400);assert.equal(h.mail.length,0);assert.equal(h.calls.length,0);
});
test('RaceAtlas email service rejects cross-origin web requests',async()=>{
 const h=harness();const res=await h.worker.fetch(request(valid,'https://untrusted.example'),h.env);assert.equal(res.status,403);assert.equal(h.mail.length,0);
});
test('RaceAtlas email service rejects invalid Turnstile',async()=>{
 const h=harness({captcha:false});const res=await h.worker.fetch(request(valid),h.env);assert.equal(res.status,403);assert.equal(h.mail.length,0);
});
test('RaceAtlas email subscription sends ONLY a confirmation message before opt-in',async()=>{
 const h=harness();const res=await h.worker.fetch(request(valid),h.env);assert.equal(res.status,200);assert.equal(h.mail.length,1);assert.match(h.mail[0].subject,/Bevestig RaceAtlas/);assert.match(h.mail[0].html,/\/verify\?token=/);assert.equal(h.calls.some(c=>c.sql.startsWith('INSERT INTO subscriptions')),true);
});
test('RaceAtlas email service rejects forged verify tokens',async()=>{
 const h=harness();const res=await h.worker.fetch(new Request(BASE+'/verify?token=not.a.valid.signature'),h.env);assert.equal(res.status,400);assert.equal(h.verified.length,0);
});
test('RaceAtlas cron skips emails if no verified subscribers exist',async()=>{
 const h=harness();const tasks=[];await h.worker.scheduled({},h.env,{waitUntil(p){tasks.push(p)}});await Promise.all(tasks);assert.equal(h.mail.length,0);
});
test('RaceAtlas event calendar retains pricing source and placeholders',()=>{
 const page=fs.readFileSync(path.join(__dirname,'..','docs','raceatlas','index.html'),'utf8');
 const data=JSON.parse(page.slice(page.indexOf('const EVENTS=')+13,page.indexOf(';\nwindow.RACEATLAS_EVENTS')));
 assert.equal(data.length>=420,true);
 const palingrun=data.find(x=>x.name==='Palingrun Volendam — 10 Engelse Mijl');
 const kids=data.find(x=>x.name==='Palingrun Volendam — Kidsrun');
 assert.equal(palingrun.priceEur,29.95);assert.equal(kids.priceEur,6);
 assert.doesNotMatch(page,/id="priceFilter"/);assert.doesNotMatch(page,/id="discipline"/);assert.match(page,/id="registrationFilter"/);assert.match(page,/id="distanceCategory"/);
 assert.match(page,/dateEvidence/);
 const cards=page.slice(page.indexOf('function eventCard(e)'),page.indexOf('function renderCards('));
 assert.doesNotMatch(cards,/priceEur/);
 assert.doesNotMatch(cards,/registrationDate/);
 const details=fs.readFileSync(path.join(__dirname,'..','docs','raceatlas','details.js'),'utf8');
 assert.match(details,/Inschrijfprijs/);assert.match(details,/Opening inschrijving/);assert.match(details,/Bron inschrijfgegevens/);
 const egmond=data.find(x=>x.name==='Egmond Halve Marathon');
 assert.equal(egmond.registrationWindow,'medio augustus 2026');
 const rotterdam=data.find(x=>x.name==='Marathon Rotterdam');
 assert.equal(rotterdam.registrationDate,'2026-11-04');
 const ronde=data.find(x=>x.name==='Ronde van Noord-Holland');
 assert.match(ronde.registrationOpenInfo,/editie 2026/);
 assert.match(page,/isDuathlon/);
 const styles=fs.readFileSync(path.join(__dirname,'..','docs','raceatlas','sport-edition.css'),'utf8');
 assert.match(styles,/pexels-photo-18457222/);
});
