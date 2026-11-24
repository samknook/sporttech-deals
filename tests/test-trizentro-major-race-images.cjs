#!/usr/bin/env node
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const builder=fs.readFileSync('scripts/build-trizentro-event-pages.cjs','utf8');
const html=fs.readFileSync('docs/raceatlas/index.html','utf8');
const start=html.indexOf('const EVENTS=')+'const EVENTS='.length;
const end=html.indexOf(';\n',start);
assert.ok(end>start,'Event catalogue missing');
const events=JSON.parse(html.slice(start,end));
const dir='docs/raceatlas';
test('generated major race images resolve to their real extension and public directory',()=>{
  assert.match(builder,/generatedImagePath=.*fs\.existsSync\(path\.join\(dir,e\.imageUrl\)\)/);
  assert.match(builder,/\?['"]\.\.\/\.\.\/raceatlas\/['"]\+e\.imageUrl/);
  assert.doesNotMatch(builder, /images\/featured\/['"]\+e\.id\+['"]\.webp/);
  const usable=events.filter(e=>e.major&&e.imageRights==='generated'&&/^images\/featured\/ra-\d+\.(?:webp|jpe?g|png)$/.test(e.imageUrl||'')&&fs.existsSync(path.join(dir,e.imageUrl)));
  assert.ok(usable.some(e=>/\.jpg$/.test(e.imageUrl)),'A real jpg cover must be retained');
  assert.ok(usable.some(e=>/\.webp$/.test(e.imageUrl)),'A real webp cover must be retained');
  for(const e of usable){
    const relative='../../raceatlas/'+e.imageUrl;
    assert.ok(fs.existsSync(path.resolve('docs/events/wedstrijden',relative)),e.id+' cover path missing');
  }
});
test('events with no available cover retain a meaningful sport illustration',()=>{
  assert.match(builder,/!hasLicensedImage&&!generatedImagePath\?illustration/);
});

test('sharing metadata uses only existing race covers',()=>{
  assert.match(builder,/socialImage=generatedImagePath\?/);
  assert.match(builder,/property="og:image"/);
  assert.match(builder,/summary_large_image/);
  assert.match(builder,/twitter:card/);
});
