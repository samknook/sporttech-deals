#!/usr/bin/env node
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('docs/raceatlas/index.html','utf8');
test('advanced options disclose active count and clear action is contextual',()=>{
 assert.match(html,/id="raAdvancedCount"[^>]*hidden/);
 assert.match(html,/function updateFilterOverview\(\)/);
 assert.match(html,/advancedIds\.filter\(id=>Boolean\(\$\(id\)\.value\)\)/);
 assert.match(html,/\$\('reset'\)\.hidden=!anyFilter/);
 assert.match(html,/id="reset"[^>]*hidden/);
});
test('reset restores the expected upcoming event default',()=>{
 assert.match(html,/\$\('reset'\)\.onclick=\(\)=>\{[^\n]*\$\('future'\)\.checked=true/);
 assert.match(html,/if\(!\$\('future'\)\.checked\)chips\.push/);
 assert.doesNotMatch(html,/if\(\$\('future'\)\.checked\)chips\.push/);
});
test('mobile quick filters remain reachable and finger-sized',()=>{
 assert.match(html,/@media\(max-width:700px\)\{\.toolbar \.quick\{flex-wrap:nowrap;overflow-x:auto/);
 assert.match(html,/\.toolbar \.quick \.pill\{flex:0 0 auto;scroll-snap-align:start;min-height:44px/);
 assert.match(html,/\.raFilterChip:focus-visible/);
});
test('no-results state offers recovery without deleting saved races',()=>{
 assert.match(html,/Geen wedstrijden gevonden\. Probeer een andere maand, sport of zoekterm/);
 assert.match(html,/Wis filters en bekijk alle evenementen/);
});
