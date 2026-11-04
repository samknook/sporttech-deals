'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..','docs');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const ids=html=>new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
const commonIds=['goal-analysis','goal-swim','goal-bike','goal-run',
  'goal-swim-note','goal-bike-note','goal-run-note',
  'scenario-slower-time','scenario-base-time','scenario-faster-time',
  'scenario-slower-delta','scenario-base-delta','scenario-faster-delta'];
test('planner has every split and distance element referenced by its app',()=>{
  const html=read('race-planner.html'),available=ids(html);
  for(const id of ['swim-distance','bike-distance','run-distance','race-legs','time-total','timeline']){
    assert.ok(available.has(id),'Planner missing dynamic display field '+id);
  }
});
test('both tools have complete goal and scenario UI',()=>{
  for(const page of ['race-planner.html','triathlon-calculator.html']){
    const html=read(page),present=ids(html);
    for(const id of commonIds)assert.ok(present.has(id),page+' lacks '+id);
    for(const sport of ['swim','bike','run'])
      assert.ok(html.includes('data-goal-apply="'+sport+'"'),page+' lacks apply button '+sport);
    assert.ok(html.indexOf('race-planner-core.js')<html.indexOf('race-insights.js'));
    assert.ok(html.indexOf('race-insights.js')<html.lastIndexOf('-app.js'));
  }
});
test('shared JavaScript functions and entrypoint hooks are present',()=>{
  const shared=read('race-insights.js');
  for(const fn of ['function render(','function clear(','function bind('])
    assert.ok(shared.includes(fn));
  for(const name of ['race-planner-app.js','triathlon-calculator-app.js']){
    const app=read(name);
    for(const call of ['RaceInsights.render(','RaceInsights.clear(','RaceInsights.bind('])
      assert.ok(app.includes(call),name+' lacks '+call);
  }
});
test('new calculator and planner do not require remote assets or registration',()=>{
  for(const page of ['race-planner.html','triathlon-calculator.html']){
    const html=read(page);
    assert.ok(!/<script[^>]*src="https?:/i.test(html));
    assert.ok(!/<form[^>]*action=/i.test(html));
    assert.ok(html.includes('triathlon.css'));
  }
});
