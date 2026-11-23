#!/usr/bin/env node
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('docs/raceatlas/event-share.js','utf8');
const builder=fs.readFileSync('scripts/build-trizentro-event-pages.cjs','utf8');

test('all generated race detail pages include native share and accessible copy status',()=>{
  assert.match(builder,/id="shareRace"/);
  assert.match(builder,/id="shareRaceStatus" role="status" aria-live="polite"/);
  assert.match(builder,/event-share\.js/);
});

function scenario({share,writeText}={}){
  let click;
  const items=[];
  const button={textContent:'Deel wedstrijd',disabled:false,addEventListener:(type,handler)=>{if(type==='click')click=handler}};
  const status={textContent:'',replaceChildren:(item)=>{items.length=0;items.push(item)},append:(item)=>items.push(item)};
  const document={
    getElementById:id=>id==='shareRace'?button:id==='shareRaceStatus'?status:null,
    querySelector:()=>({textContent:'Testwedstrijd'}),
    createElement:()=>({value:'',readOnly:false,setAttribute(){},style:{},select(){},focus(){}}),
    createTextNode:text=>({text})
  };
  const navigator={};
  if(share)navigator.share=share;
  if(writeText)navigator.clipboard={writeText};
  vm.runInNewContext(source,{document,navigator,location:{pathname:'/events/wedstrijden/test-ra-1.html',origin:'https://trizentro.com'},URL});
  return {click,button,status,items};
}
test('copies a canonical event URL without a tracking query string',async()=>{
  const copied=[];
  const h=scenario({writeText:async value=>{copied.push(value)}});
  await h.click();
  assert.deepEqual(copied,['https://trizentro.com/events/wedstrijden/test-ra-1.html']);
  assert.equal(h.status.textContent,'Wedstrijdlink gekopieerd.');
  assert.equal(h.button.disabled,false);
});
test('honours native share cancellations without forcing the clipboard',async()=>{
  let copied=false;
  const h=scenario({share:async()=>{throw {name:'AbortError'}},writeText:async()=>{copied=true}});
  await h.click();
  assert.equal(h.status.textContent,'Delen geannuleerd.');
  assert.equal(copied,false);
});
test('offers a selectable link when clipboard is unavailable',async()=>{
  const h=scenario();
  await h.click();
  assert.equal(h.items[0].value,'https://trizentro.com/events/wedstrijden/test-ra-1.html');
  assert.equal(h.button.disabled,false);
});
