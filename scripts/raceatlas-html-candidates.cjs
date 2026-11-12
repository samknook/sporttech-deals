'use strict';
/* RaceAtlas plain HTML date signals.
 * REVIEW ONLY: no candidates from this module can become published races.
 * Source pages may contain historic editions, sale deadlines and training dates.
 */
const MONTHS={
 januari:1,februari:2,maart:3,april:4,mei:5,juni:6,juli:7,augustus:8,september:9,oktober:10,november:11,december:12,
 january:1,february:2,march:3,may:5,june:6,july:7,august:8,october:10,dec:12,sept:9,sep:9,oct:10,nov:11,april:4,
 jan:1,feb:2,mrt:3,mar:3,apr:4,jun:6,jul:7,aug:8,sept:9,oct:10,nov:11,december:12
};
const ENTITY={nbsp:' ',amp:'&',quot:'"',apos:"'",lsquo:"'",rsquo:"'",ldquo:'"',rdquo:'"',ndash:'-',mdash:'-',hellip:'…'};
function decode(str){
 return String(str||'').replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi,(full,v)=>{
  if(v[0]==='#'){
   const value=v[1]?.toLowerCase()==='x'?parseInt(v.slice(2),16):parseInt(v.slice(1),10);
   return Number.isInteger(value)&&value>=32&&value<=0x10ffff?String.fromCodePoint(value):' ';
  }
  return ENTITY[v.toLowerCase()]??' ';
 });
}
function flat(s){return decode(s).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()}
function removeHidden(html){
 return String(html).replace(/<(script|style|noscript|svg|template)\b[^>]*>[\s\S]*?<\/\1>/gi,' ')
  .replace(/<!--[\s\S]*?-->/g,' ')
  .replace(/<(?:header|footer|nav)\b[^>]*>[\s\S]*?<\/(?:header|footer|nav)>/gi,' ');
}
function heading(html){
 const clean=removeHidden(html);
 for(const pattern of [/<h1\b[^>]*>([\s\S]*?)<\/h1>/i,/<title\b[^>]*>([\s\S]*?)<\/title>/i,/<h2\b[^>]*>([\s\S]*?)<\/h2>/i]){
  const found=clean.match(pattern);
  if(found){const name=flat(found[1]).slice(0,140);if(name.length>=4)return name}
 }
 return '';
}
function dateISO(year,month,day){
 const date=String(year).padStart(4,'0')+'-'+String(month).padStart(2,'0')+'-'+String(day).padStart(2,'0');
 const obj=new Date(date+'T12:00:00Z');
 return Number.isFinite(obj.getTime())&&obj.toISOString().slice(0,10)===date?date:null;
}
function dateStrings(text){
 const matches=[];
 const add=(date,index,raw,kind)=>{if(date)matches.push({date,index,snippet:raw,kind})};
 const iso=/\b(20\d{2})[-/.](0?[1-9]|1[0-2])[-/.]([0-2]?\d|3[01])(?=$|T\d{2}:\d{2}|[^A-Za-z0-9])/g;
 for(const m of text.matchAll(iso))add(dateISO(+m[1],+m[2],+m[3]),m.index,m[0],'iso');
 const full=/\b([0-2]?\d|3[01])\s+(januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december|january|february|march|april|may|june|july|august|september|october|november|december)\s+(20\d{2})\b/gi;
 for(const m of text.matchAll(full))add(dateISO(+m[3],MONTHS[m[2].toLowerCase()],+m[1]),m.index,m[0],'written');
 const short=/\b([0-2]?\d|3[01])\s+(jan|feb|mrt|mar|apr|mei|may|jun|jul|aug|sep|sept|okt|oct|nov|dec)\.?\s+(20\d{2})\b/gi;
 for(const m of text.matchAll(short))add(dateISO(+m[3],MONTHS[m[2].toLowerCase()],+m[1]),m.index,m[0],'abbreviated');
 const european=/\b([0-2]?\d|3[01])[-.]([01]?\d)[-.](20\d{2})\b/g;
 for(const m of text.matchAll(european))add(dateISO(+m[3],+m[2],+m[1]),m.index,m[0],'numeric_european');
 // Slash-formatted dates are ambiguous across countries and never inferred.
 const english=/\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+([0-2]?\d|3[01])(?:st|nd|rd|th)?,?\s+(20\d{2})\b/gi;
 for(const m of text.matchAll(english))add(dateISO(+m[3],MONTHS[m[1].toLowerCase()],+m[2]),m.index,m[0],'written');
 return matches;
}
function extract(html,url,now='2026-11-12'){
 const body=removeHidden(html);
 const h=heading(html);
 // Extract real visible text AND literal <time datetime> tags. Date provenance remains provisional.
 const visible=flat(body);
 const matches=dateStrings(visible);
 for(const m of body.matchAll(/<time\b[^>]*datetime\s*=\s*["'](20\d{2}-\d\d-\d\d)(?:T[^"']*)?["'][^>]*>/gi)){
  const date=m[1],index=visible.indexOf(date);
  if(dateISO(+date.slice(0,4),+date.slice(5,7),+date.slice(8,10)))matches.push({date,index:Math.max(0,index),snippet:date,kind:'html_time'});
 }
 const limit=new Date(new Date(now+'T12:00:00Z').getTime()+730*86400000).toISOString().slice(0,10);
 const grouped=new Map();
 for(const match of matches){
  if(match.date<now||match.date>limit)continue;
  const left=visible.slice(Math.max(0,match.index-140),match.index);
  const right=visible.slice(match.index,Math.min(visible.length,match.index+155));
  const sentenceBreak=Math.max(left.lastIndexOf('. '),left.lastIndexOf('! '),left.lastIndexOf('? '));
  const afterBreak=[right.indexOf('. '),right.indexOf('! '),right.indexOf('? ')].filter(n=>n>=0);
  const stop=afterBreak.length?Math.min(...afterBreak)+1:right.length;
  const context=(left.slice(sentenceBreak>=0?sentenceBreak+2:0)+right.slice(0,stop)).slice(0,230);
  const nearby=context.toLowerCase();
  // Reject references explicitly tied to historic editions and non-race milestones.
  const discouraging=/(?:inschrij(?:f|v)|aanmeld|registration|register|deadline|startbewijzen|tickets|early.bird|loting|ballot|sluit|opens|geopend|opent|entry fee|uitslagen|results|archief)/i.test(nearby);
  const raceContext=/(?:wedstrijd|evenement|race|start|marathon|trail|toertocht|cross|loopt|run|triathlon|triatlon|duathlon|duatlon|verreden|plaats|edition|editie)/i.test(nearby);
  const signal={date:match.date,match:match.snippet,context:context.slice(0,210),kind:match.kind,rank:discouraging?0:raceContext?2:1};
  const old=grouped.get(signal.date);
  if(!old||old.rank<signal.rank)grouped.set(signal.date,signal);
 }
 const dates=[...grouped.values()].sort((a,b)=>b.rank-a.rank||a.date.localeCompare(b.date)).slice(0,8);
 return {title:h,url,candidates:dates,requiresHumanReview:true,extractionMethod:'visible_html_text'};
}
module.exports={decode,heading,dateStrings,dateISO,extract};
