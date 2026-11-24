#!/usr/bin/env node
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('docs/raceatlas/index.html','utf8');
test('legacy RaceAtlas calendar redirects to the canonical Events route without being indexed',()=>{
  const canonical=[...html.matchAll(/<link\b[^>]*rel="canonical"[^>]*>/g)];
  assert.equal(canonical.length,1,'Legacy page must have exactly one canonical URL');
  assert.ok(canonical[0][0].includes('href="https://trizentro.com/events/"'),'Canonical must point to public Events');
  assert.ok(html.includes('<meta name="robots" content="noindex,follow">'),'Legacy route must be noindex');
  assert.ok(!/<meta\b[^>]*property="og:url"/.test(html),'Legacy page must not publish a second social share URL');
  assert.ok(!/<(?:link rel="canonical"|meta property="og:url")[^>]*samknook\.github\.io/.test(html),'Old GitHub Pages domain must not be indexed');
});
