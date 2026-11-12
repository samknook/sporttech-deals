'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('docs/raceatlas/i18n.js','utf8');
class El{
 constructor(tag){this.nodeType=1;this.tag=tag;this.children=[];this.attributes={};this.dataset={};this.classList={toggle(){}}}
 append(...children){for(const child of children){child.parentElement=this;this.children.push(child)}}
 setAttribute(name,value){this.attributes[name]=String(value)}
 getAttribute(name){return this.attributes[name]??null}
 hasAttribute(name){return Object.hasOwn(this.attributes,name)}
 closest(selector){return selector.split(',').includes(this.tag)?this:this.parentElement?.closest(selector)||null}
 addEventListener(type,cb){this['on'+type]=cb}
}
const text=value=>({nodeType:3,nodeValue:value,parentElement:null});
const body=new El('body'),nav=new El('nav'),option=new El('option'),optionText=text('Hardlopen'),title=new El('h1'),titleText=text('Mijn seizoen');
option.append(optionText);title.append(titleText);body.append(nav,option,title);
const document={
 body,documentElement:{lang:''},readyState:'complete',title:'',
 createElement:tag=>new El(tag),
 getElementById:id=>nav.children.find(n=>n.id===id)||null,
 querySelector:q=>q==='.navright'?nav:null,
 querySelectorAll:q=>q==='a[href]'?[]:q==='#raLanguageSwitch button'?(nav.children.find(n=>n.id==='raLanguageSwitch')?.children||[]):[],
 createTreeWalker(root){const nodes=[];const collect=n=>(n.children||[]).forEach(c=>{nodes.push(c);collect(c)});collect(root);let index=0;return {get currentNode(){return nodes[index-1]},nextNode(){if(index<nodes.length){index++;return true}return false}}}
};
const store={};
const context={
 window:{dispatchEvent(){}},document,location:{href:'https://example.com/raceatlas/',pathname:'/raceatlas/'},
 history:{state:null,replaceState(){}},
 localStorage:{getItem:key=>store[key]??null,setItem:(key,value)=>{store[key]=value}},
 URL:class{constructor(){this.searchParams={get:()=>null}}},
 NodeFilter:{SHOW_ELEMENT:1,SHOW_TEXT:4},
 MutationObserver:class{disconnect(){}observe(){}},
 CustomEvent:class{},
 queueMicrotask:cb=>cb()
};
vm.runInNewContext(source,context,{filename:'i18n.js'});
context.window.RaceAtlasI18n.setLanguage('en',false);
assert.equal(optionText.nodeValue,'Running');
assert.equal(option.getAttribute('value'),'Hardlopen','Filters must retain their original form values');
assert.equal(titleText.nodeValue,'My season');
assert.equal(document.documentElement.lang,'en');
assert.equal(document.title,'RaceAtlas — Discover. Plan. Race.');
assert.equal(store['raceatlas-language-v1'],'en');
context.window.RaceAtlasI18n.setLanguage('nl',false);
assert.equal(optionText.nodeValue,'Hardlopen');
assert.equal(option.getAttribute('value'),'Hardlopen');
assert.equal(titleText.nodeValue,'Mijn seizoen');
assert.equal(document.documentElement.lang,'nl');
assert.equal(document.title,'RaceAtlas — Vind jouw volgende wedstrijd');
console.log('RaceAtlas NL/EN language switching tests passed');
