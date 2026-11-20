'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),details=fs.readFileSync(path.join(root,'docs/raceatlas/details.js'),'utf8');
test('Event details sharing has safe platform link for WhatsApp',()=>{
 new vm.Script(details,{filename:'details.js'});
 assert.match(details,/https:\/\/wa\.me\/\?text=/);
 assert.match(details,/encodeURIComponent\('Bekijk '\+e\.name/);
 assert.match(details,/whatsapp\.rel='noopener noreferrer'/);
 assert.match(details,/Deel via WhatsApp/);
});
test('Generated canonical race pages share the correct race URL',()=>{
 cp.execFileSync(process.execPath,[path.join(root,'scripts/build-trizentro-event-pages.cjs')],{cwd:root,env:{...process.env,TRIZENTRO_DOMAIN_CONFIRMED:'true'},encoding:'utf8'});
 const html=fs.readFileSync(path.join(root,'docs/raceatlas/wedstrijden/kerstmannenrun-schoorl-ra-347.html'),'utf8');
 assert.match(html,/Deel via WhatsApp/);
 const url=html.match(/href="(https:\/\/wa\.me\/\?text=[^"]+)"/)?.[1];
 assert.ok(url);
 const message=new URL(url.replace(/&amp;/g,'&')).searchParams.get('text');
 assert.match(message,/Kerstmannenrun Schoorl/);
 assert.match(message,/https:\/\/trizentro\.com\/events\/wedstrijden\/kerstmannenrun-schoorl-ra-347\.html/);
});
