'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const dir=path.resolve(__dirname,'../.github/workflows');
test('one authoritative GitHub Pages deployment workflow remains',()=>{
 const files=fs.readdirSync(dir).filter(x=>/\.ya?ml$/.test(x));
 const publishers=files.filter(x=>fs.readFileSync(path.join(dir,x),'utf8').includes('actions/deploy-pages@v4'));
 assert.deepEqual(publishers,['deploy-trizentro-pages.yml']);
 const canonical=fs.readFileSync(path.join(dir,publishers[0]),'utf8');
 assert.match(canonical,/Build official sport and regional search landing pages/);
 assert.match(canonical,/Verify latest retention and campaign release pages/);
 assert.match(canonical,/branches: \[main\]/);
 assert.match(canonical,/path: docs/);
});
test('outdated publisher workflows cannot override live custom-domain build',()=>{
 for(const legacy of ['publish-site.yml','deploy-trizentro.yml']){
  assert.ok(!fs.existsSync(path.join(dir,legacy)),legacy+' must remain retired');
 }
 const price=fs.readFileSync(path.join(dir,'publish.yml'),'utf8');
 assert.doesNotMatch(price,/deploy-pages|upload-pages-artifact|configure-pages/);
 assert.match(price,/STD_FEED_URLS/);
});
test('official event source audit preserves excluded research entries without publishing unverified races',()=>{
 const source=fs.readFileSync(path.resolve(__dirname,'test-trizentro-official-sources.cjs'),'utf8');
 assert.match(source,/Unverified draft wrongly restored/);
 assert.match(source,/research archive/);
 assert.doesNotMatch(source,/Official source found during research must be retained/);
});
