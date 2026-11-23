#!/usr/bin/env node
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('docs/raceatlas/index.html','utf8');
test('legacy calendar canonical and share URL point to one official domain',()=>{
  assert.match(html,/<link rel="canonical" href="https:\/\/trizentro\.com\/events\/"\s*\/>/);
  assert.match(html,/<meta property="og:url" content="https:\/\/trizentro\.com\/events\/"\s*\/>/);
  assert.doesNotMatch(html,/<(?:link rel="canonical"|meta property="og:url")[^>]*samknook\.github\.io/);
});
