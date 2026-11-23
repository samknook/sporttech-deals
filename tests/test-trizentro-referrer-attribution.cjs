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
  assert.equal(channel('www.bing.com'),'bing');
  assert.equal(channel('duckduckgo.com'),'search_other');
  assert.equal(channel('www.linkedin.com'),'social_other');
});
test('lookalike domains do not spoof campaign attribution',()=>{
  for(const hostname of ['fakeinstagram.com','instagram.com.attacker.example','notgoogle.nl','www.facebook.com.evil.test']){
    assert.equal(channel(hostname),'referral',hostname);
  }
});
