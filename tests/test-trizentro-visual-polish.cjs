#!/usr/bin/env node
'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const html=fs.readFileSync('docs/raceatlas/index.html','utf8');
const css=fs.readFileSync('docs/raceatlas/visual-polish.css','utf8');
test('visual polish loads after existing styles and preserves semantic card actions',()=>{
 const style=html.indexOf('href="sport-edition.css');
 const brand=html.indexOf('href="brand.css');
 const polish=html.indexOf('href="visual-polish.css');
 assert.ok(style>0&&brand>style&&polish>brand,'Visual layer must override older styles');
 assert.ok(html.includes('<details class="raCardMore"><summary>Meer opties</summary>'));
 assert.ok(html.includes('ra-card-save'));
 assert.ok(html.includes('data-ra-outbound="registration"'));
});
test('cards have accessible minimum touch targets and meaningful small-screen layout',()=>{
 assert.match(css,/min-height:48px!important/);
 assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important/);
 assert.match(css,/\.raCardMore summary/);
 assert.match(css,/@media\(max-width:600px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/:focus-within/);
});
test('style is scoped to TriZentro event cards and has no hidden content rules',()=>{
 assert.match(css,/#explore \.card/);
 assert.match(css,/#savedCards \.card/);
 assert.doesNotMatch(css,/(?:display\s*:\s*none|visibility\s*:\s*hidden)\s*!important/);
});
