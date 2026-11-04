'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const docs=path.join(__dirname,'..','docs');
const base='https://samknook.github.io/sporttech-deals/';
const read=name=>fs.readFileSync(path.join(docs,name),'utf8');

test('homepage and tools declare exact public canonical URLs',()=>{
  for(const [page,url] of [
    ['index.html',base],
    ['race-planner.html',base+'race-planner.html'],
    ['triathlon-calculator.html',base+'triathlon-calculator.html'],
    ['triatlon-afstanden.html',base+'triatlon-afstanden.html']
  ]){
    const html=read(page);
    assert.ok(html.includes('<link rel="canonical" href="'+url+'">'),page+' canonical wrong');
    assert.match(html,/<meta name="description" content="[^"]{60,}">/);
    assert.match(html,/<title>[^<]+<\/title>/);
  }
});
test('tools describe only real free webapp offerings, no fake ratings',()=>{
  for(const name of ['race-planner.html','triathlon-calculator.html']){
    const html=read(name);
    const match=html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(match,name+' missing JSON-LD');
    const obj=JSON.parse(match[1]);
    assert.equal(obj['@type'],'WebApplication');
    assert.equal(obj.offers.price,0);
    assert.equal(obj.isAccessibleForFree,true);
    assert.equal(obj.publisher.name,'SportTech Deals');
    assert.equal('aggregateRating' in obj,false);
    assert.equal('review' in obj,false);
  }
});
test('sitemap lists meaningful public pages, not obsolete redirect',()=>{
  const xml=read('sitemap.xml');
  assert.ok(xml.includes(base+'triatlon-afstanden.html'));
  assert.ok(xml.includes(base+'triathlon-calculator.html'));
  assert.ok(xml.includes(base+'race-planner.html'));
  assert.ok(!xml.includes(base+'70-3-eindtijd-calculator.html'));
});
test('guide and main tools link to each other without sending visitor details',()=>{
  const guide=read('triatlon-afstanden.html');
  const home=read('index.html');
  assert.ok(home.includes('href="triatlon-afstanden.html"'));
  for(const name of ['race-planner.html','triathlon-calculator.html']){
    const c=read(name);
    assert.ok(c.includes('href="triatlon-afstanden.html"'));
    assert.ok(c.includes('https://wa.me/?text='));
    assert.ok(!c.includes('href="https://wa.me/?text=' + 'undefined'));
  }
  for(const key of ['sprint','olympic','half','full','custom'])
    assert.ok(guide.includes('triathlon-calculator.html?distance='+key));
});
