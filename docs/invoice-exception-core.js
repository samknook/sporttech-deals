/* Invoice Exception Desk — standalone, local-only calculations.
 * All amounts in EUR cents internally to avoid floating point drift.
 * A payment difference is NOT automatically a valid customer dispute.
 */
(function(root){'use strict';
const COLUMNS=['invoice_id','customer','invoice_total','paid_amount','disputed_amount','due_date','reason'];
function parseCsv(text){
 if(typeof text!=='string'||text.length>100000)throw Error('CSV exceeds 100 KB or is missing');
 const rows=[];let row=[],cell='',quoted=false;
 const s=text.replace(/\r\n?/g,'\n');
 for(let i=0;i<s.length;i++){const ch=s[i];
  if(quoted){if(ch==='"'&&s[i+1]==='"'){cell+='"';i++}else if(ch==='"')quoted=false;else cell+=ch;}
  else if(ch==='"') {if(cell.trim()!=='')throw Error('Invalid quote');quoted=true;}
  else if(ch===','){row.push(cell.trim());cell='';}
  else if(ch==='\n'){row.push(cell.trim());if(row.some(x=>x!==''))rows.push(row);row=[];cell='';}
  else cell+=ch;
 }
 if(quoted)throw Error('Unclosed CSV quotation');
 if(row.length||cell){row.push(cell.trim());if(row.some(x=>x!==''))rows.push(row);}
 if(rows.length<2||rows.length>501)throw Error('Provide a header and at most 500 rows');
 const hdr=rows.shift();if(hdr.length!==COLUMNS.length||COLUMNS.some((x,i)=>hdr[i]!==x))throw Error('Required columns: '+COLUMNS.join(','));
 return rows.map((arr,i)=>{if(arr.length!==COLUMNS.length)throw Error('CSV columns differ at line '+(i+2));
 return Object.fromEntries(COLUMNS.map((k,j)=>[k,arr[j]]));});
}
function cents(v){if(typeof v!=='string'||!/^\d+(?:\.\d{1,2})?$/.test(v))throw Error('Invalid EUR amount: '+v);const [a,b='']=v.split('.');const n=Number(a)*100+Number(b.padEnd(2,'0'));if(!Number.isSafeInteger(n)||n>1e11)throw Error('Amount too large');return n}
function dateStrict(v){if(!/^\d{4}-\d{2}-\d{2}$/.test(v))throw Error('Invalid date: '+v);const [y,m,d]=v.split('-').map(Number),dt=new Date(Date.UTC(y,m-1,d));if(dt.getUTCFullYear()!==y||dt.getUTCMonth()+1!==m||dt.getUTCDate()!==d)throw Error('Invalid date: '+v);return dt}
function analyze(records,today){if(!Array.isArray(records)||records.length>500)throw Error('Invalid records');const now=dateStrict(today),used=new Set(),items=[];
 for(const r of records){
  const id=String(r.invoice_id||'').trim(),customer=String(r.customer||'').trim(),reason=String(r.reason||'').trim();
  if(!id||id.length>60||!customer||customer.length>100||reason.length>250||used.has(id))throw Error('Missing, long or duplicate invoice ID/customer');
  used.add(id);
  const total=cents(r.invoice_total),paid=cents(r.paid_amount),disputed=cents(r.disputed_amount);
  if(paid>total)throw Error('Paid exceeds invoice for '+id);
  const remaining=total-paid;if(disputed>remaining)throw Error('Disputed exceeds outstanding for '+id);
  const due=dateStrict(r.due_date),daysPastDue=Math.max(0,Math.floor((now-due)/86400000));
  const collectible=remaining-disputed;
  const status=remaining===0?'paid':disputed===remaining?'fully-disputed':disputed>0?'partially-disputed':daysPastDue>0?'overdue':'open';
  items.push({id,customer,reason,invoiceTotal:total,paid,remaining,disputed,collectible,dueDate:r.due_date,daysPastDue,status,
    priority:disputed>0?'resolve-dispute':daysPastDue>0?'follow-up':'monitor'});
 }
 const totals=items.reduce((a,i)=>{a.invoiced+=i.invoiceTotal;a.paid+=i.paid;a.outstanding+=i.remaining;a.disputed+=i.disputed;a.collectible+=i.collectible;
 if(i.daysPastDue>0)a.overdue+=i.collectible;if(i.disputed)a.cases++;return a},{invoiced:0,paid:0,outstanding:0,disputed:0,collectible:0,overdue:0,cases:0});
 return {items:items.sort((a,b)=>b.disputed-a.disputed||b.daysPastDue-a.daysPastDue),totals,today};
}
function eur(n){return new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR'}).format(n/100)}
function escapeCsv(v){const s=String(v==null?'':v);const guarded=/^[\s]*[=+@\-\t\r]/.test(s)?"'"+s:s;return '"'+guarded.replace(/"/g,'""')+'"'}
function exportCsv(analysis){const hdr=['invoice_id','customer','outstanding_eur','disputed_eur','collectible_eur','days_overdue','status','next_action','reason'];
 const lines=[hdr.join(',')];for(const i of analysis.items){lines.push([i.id,i.customer,(i.remaining/100).toFixed(2),(i.disputed/100).toFixed(2),(i.collectible/100).toFixed(2),i.daysPastDue,i.status,i.priority,i.reason].map(escapeCsv).join(','));}
 return lines.join('\r\n')+'\r\n'}
function caseSummary(item,locale='nl'){const nl=locale!=='en';return [
 nl?'FACTUURUITZONDERING — CONCEPTDOSSIER':'INVOICE EXCEPTION — CASE DRAFT',
 (nl?'Factuur: ':'Invoice: ')+item.id,(nl?'Klant: ':'Customer: ')+item.customer,
 (nl?'Openstaand: ':'Outstanding: ')+eur(item.remaining),
 (nl?'Betwist (zelf ingevoerd): ':'Disputed (user-entered): ')+eur(item.disputed),
 (nl?'Niet betwist openstaand: ':'Undisputed outstanding: ')+eur(item.collectible),
 (nl?'Vervaldatum: ':'Due date: ')+item.dueDate,
 (nl?'Achterstallige dagen op controledatum: ':'Overdue days as of review date: ')+item.daysPastDue,
 (nl?'Reden: ':'Reason: ')+(item.reason||'—'),
 nl?'Controleer onderliggende contracten, betaling, creditnota’s en klantcorrespondentie. Geen automatische incasso of juridisch advies.':'Verify contracts, receipts, credit notes and correspondence. No automatic collection or legal advice.'
 ].join('\n')}
const api={COLUMNS,parseCsv,cents,dateStrict,analyze,eur,exportCsv,caseSummary};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.InvoiceExceptionDesk=api;
})(typeof window!=='undefined'?window:globalThis);
