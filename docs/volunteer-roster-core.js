/* TriZentro offline volunteer roster optimizer.
 * All identifiers are organizer-supplied aliases. No cloud processing.
 * Input delimiters: CSV (no multiline cells); UTC-independent same-day HH:MM.
 */
(function(root){
'use strict';
const MAX_ROWS=300;
function parseCsv(text,columns){
 if(typeof text!=='string'||text.length>50000)throw Error('CSV is empty or too large.');
 const lines=text.replace(/\r\n?/g,'\n').trim().split('\n');
 if(lines.length<2||lines.length>MAX_ROWS+1)throw Error('CSV row count out of range.');
 function cells(line){
  const values=[];let cell='',quoted=false;
  for(let i=0;i<line.length;i++){
   const c=line[i];
   if(c==='"'){if(quoted&&line[i+1]==='"'){cell+='"';i++}else quoted=!quoted;}
   else if(c===','&&!quoted){values.push(cell.trim());cell='';}
   else cell+=c;
  }
  if(quoted)throw Error('Unclosed quoted CSV field.');
  values.push(cell.trim());return values;
 }
 const headings=cells(lines[0]).map(x=>x.toLowerCase());
 if(headings.length!==columns.length||columns.some((x,i)=>headings[i]!==x))throw Error('Expected CSV headers: '+columns.join(','));
 return lines.slice(1).filter(x=>x.trim()).map((line,i)=>{
  const parts=cells(line);if(parts.length!==columns.length)throw Error('Invalid columns on row '+(i+2));
  const result={};columns.forEach((k,j)=>{result[k]=parts[j]});return result;
 });
}
function mins(str){
 if(typeof str!=='string'||!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(str))throw Error('Invalid HH:MM: '+str);
 return Number(str.slice(0,2))*60+Number(str.slice(3));
}
function normalize(volunteers,shifts){
 if(!Array.isArray(volunteers)||!Array.isArray(shifts)||volunteers.length>MAX_ROWS||shifts.length>MAX_ROWS)throw Error('Too many rows.');
 const ids=new Set(),shiftIds=new Set();
 const people=volunteers.map(v=>{
  const id=String(v.id||'').trim();
  if(!/^[\w-]{1,32}$/.test(id)||ids.has(id))throw Error('Volunteer ID missing, duplicated or invalid: '+id);
  ids.add(id);
  const start=mins(v.available_from),end=mins(v.available_to);
  if(start>=end)throw Error('Availability must end after it starts for '+id);
  const skills=String(v.skills||'').split('|').map(x=>x.trim().toLowerCase()).filter(Boolean);
  if(skills.some(x=>!/^[a-z0-9_-]{1,30}$/.test(x)))throw Error('Invalid skill for '+id);
  return {id,availableFrom:start,availableTo:end,skills:new Set(skills)};
 });
 const slots=shifts.map(s=>{
  const id=String(s.id||'').trim();
  if(!/^[\w-]{1,32}$/.test(id)||shiftIds.has(id))throw Error('Shift ID missing, duplicated or invalid: '+id);
  shiftIds.add(id);
  const start=mins(s.from),end=mins(s.to),needed=Number(s.needed);
  if(start>=end)throw Error('Shift must end after start for '+id);
  if(!Number.isInteger(needed)||needed<1||needed>100)throw Error('Invalid volunteer count for '+id);
  const skill=String(s.skill||'').trim().toLowerCase();
  if(skill&&!/^[a-z0-9_-]{1,30}$/.test(skill))throw Error('Invalid shift skill for '+id);
  return {id,from:start,to:end,needed,skill};
 });
 return {people,slots};
}
function assign(volunteers,shifts){
 const {people,slots}=normalize(volunteers,shifts);
 const records=new Map(people.map(p=>[p.id,[]]));
 const result=slots.map(s=>({...s,assigned:[],unfilled:s.needed}));
 const eligible=(p,s)=>p.availableFrom<=s.from&&p.availableTo>=s.to&&(!s.skill||p.skills.has(s.skill));
 const overlaps=(a,b)=>a.from<b.to&&b.from<a.to;
 // Hardest duties first (fewest qualified volunteers per requested place).
 const prioritized=[...result].sort((a,b)=>{
  const count=s=>people.filter(p=>eligible(p,s)).length/s.needed;
  return count(a)-count(b)||a.from-b.from||a.id.localeCompare(b.id);
 });
 for(const shift of prioritized){
  const candidates=people.filter(p=>eligible(p,shift)&&records.get(p.id).every(x=>!overlaps(x,shift)));
  candidates.sort((a,b)=>{
   const total=p=>records.get(p.id).reduce((n,x)=>n+x.to-x.from,0);
   const scarcity=p=>people.filter(other=>other.skills.size>0&&[...p.skills].every(skill=>other.skills.has(skill))).length;
   return total(a)-total(b)||scarcity(b)-scarcity(a)||a.id.localeCompare(b.id);
  });
  for(const p of candidates.slice(0,shift.needed)){shift.assigned.push(p.id);records.get(p.id).push(shift)}
  shift.unfilled=shift.needed-shift.assigned.length;
 }
 const uncovered=result.filter(x=>x.unfilled>0);
 const assigned=result.reduce((n,s)=>n+s.assigned.length,0);
 const required=result.reduce((n,s)=>n+s.needed,0);
 return {shifts:result,required,assigned,unfilled:required-assigned,uncovered,volunteers:people.length,utilized:[...records.values()].filter(x=>x.length>0).length};
}
function exportCsv(plan){
 const rows=[['shift_id','from','to','skill','needed','assigned_ids','unfilled']];
 const clock=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
 for(const s of plan.shifts)rows.push([s.id,clock(s.from),clock(s.to),s.skill,s.needed,s.assigned.join('|'),s.unfilled]);
 const safe=value=>{
  const str=String(value);
  const escaped=/^[=+\-@]/.test(str)?"'"+str:str;
  return '"'+escaped.replace(/"/g,'""')+'"';
 };
 return rows.map(r=>r.map(safe).join(',')).join('\n');
}
const api={parseCsv,mins,normalize,assign,exportCsv};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.TriZentroVolunteerRoster=api;
})(typeof window!=='undefined'?window:globalThis);