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
    assert.equal(obj.publisher.name,'TriZentro');
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

test('TriZentro identity is consistent and asset links point to real local SVG files',()=>{
  for(const asset of ['trizentro-icon.svg','trizentro-wordmark.svg']){
    const svg=read(asset);
    assert.match(svg,/<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    assert.match(svg,/<title[^>]*>TriZentro/);
  }
  for(const name of [
    'index.html','race-planner.html','triathlon-calculator.html','triatlon-afstanden.html',
    'koopgids.html','fietscomputer-aanbieding.html','fietscomputer-triatlon.html','transparantie.html'
  ]){
    const html=read(name);
    assert.ok(html.includes('href="trizentro-icon.svg"'),name+' lacks favicon');
    assert.ok(html.includes('TriZentro')||html.includes('TRI<span>ZENTRO.'),name+' lacks brand');
    assert.ok(!html.includes('TRI<span>KOERS.'),name+' still has old wordmark');
  }
  assert.match(read('index.html'),/name="3045ec1a300a1b5" content="e43119facc31c6d54302cec101a02834"/);
});


test('Google Search Console and Daisycon ownership tokens coexist safely',()=>{
  const homepage=read('index.html');
  assert.match(homepage,/<meta name="google-site-verification" content="hMpAY4xSz1BBjiImUwCtvE_1hKk0XD56l4AEnsk7W14"\s*\/>/);
  assert.match(homepage,/<meta name="3045ec1a300a1b5" content="e43119facc31c6d54302cec101a02834"\s*\/>/);
  assert.equal(read('google36c6913874a61b33.html').trim(),
    'google-site-verification: google36c6913874a61b33.html');
});
