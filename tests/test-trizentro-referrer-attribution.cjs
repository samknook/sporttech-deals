#!/usr/bin/env node
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('docs/raceatlas/tracking.js','utf8');
const matchers=[...source.matchAll(/(?:if|else if)\((\/.*?\/)\.test\(host\)\)/g)].map(match=>({line:match[0],regex:vm.runInNewContext(match[1])}));
function channel(host){
  const names=['instagram','facebook','whatsapp','google','bing','search_other','social_other'];
  const index=matchers.findIndex(m=>m.regex.test(host));
  return index>=0?names[index]:'referral';
}
test('recognized referrers match actual hostnames, not escaped backslashes',()=>{
  assert.equal(matchers.length,7);
  assert.equal(channel('www.instagram.com'),'instagram');
  assert.equal(channel('l.instagram.com'),'instagram');
  assert.equal(channel('m.facebook.com'),'facebook');
  assert.equal(channel('www.google.nl'),'google');
  assert.equal(channel('www.google.co.uk'),'google');
  assert.equal(channel('www.bing.com'),'bing');
  assert.equal(channel('duckduckgo.com'),'search_other');
  assert.equal(channel('www.linkedin.com'),'social_other');
});
test('lookalike domains do not spoof campaign attribution',()=>{
  for(const hostname of ['fakeinstagram.com','instagram.com.attacker.example','notgoogle.nl','www.facebook.com.evil.test','google.com.evil.test']){
    assert.equal(channel(hostname),'referral',hostname);
  }
});

function attributionHarness(){
  const beginning=source.indexOf('  function acquisition(){');
  const ending=source.indexOf('  function track(eventId,kind){',beginning);
  assert.ok(beginning>=0&&ending>beginning);
  const code=source.slice(beginning,ending);
  const memory=new Map();
  const location={search:''};
  const document={referrer:''};
  const sessionStorage={
    getItem:key=>memory.get(key)||null,
    setItem:(key,value)=>memory.set(key,value),
    removeItem:key=>memory.delete(key)
  };
  const context={location,document,sessionStorage,URLSearchParams,URL,Date};
  const evaluate=vm.runInNewContext('(()=>{'+
    "const CHANNELS=new Set(['instagram','facebook','whatsapp','google','bing','search_other','social_other','email','referral','direct','campaign_other']);"+
    code+';return conversionSource;})()',context);
  return {location,document,evaluate,memory};
}
test('organic source survives navigation and is not replaced with direct',()=>{
  const h=attributionHarness();
  h.document.referrer='https://www.google.nl/search?q=triathlon';
  assert.equal(h.evaluate().channel,'google');
  h.document.referrer='https://trizentro.com/events/';
  assert.equal(h.evaluate().channel,'google');
});
test('tagged campaign overrides earlier organic attribution and persists',()=>{
  const h=attributionHarness();
  h.document.referrer='https://www.google.nl/';
  assert.equal(h.evaluate().channel,'google');
  h.location.search='?utm_source=instagram&utm_campaign=winter_2027';
  assert.equal(h.evaluate().campaign,'winter_2027');
  h.location.search='';
  h.document.referrer='https://trizentro.com/events/';
  const result=h.evaluate();
  assert.equal(result.channel,'instagram');
  assert.equal(result.campaign,'winter_2027');
});
