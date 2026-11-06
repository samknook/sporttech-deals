#!/usr/bin/env node
/* Public integration harness. Default: local dry-run, no provider request.
 * Never pass customer data or API secrets in shell arguments.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const api=require('./inbox-adapter.cjs');
async function main(){
 const args=process.argv.slice(2);
 const live=args.includes('--live');
 const file=path.join(__dirname,'synthetic-sample.json');
 if(args.some(x=>x!=='--live'))throw Error('Only --live is accepted. Input is fixed to bundled synthetic sample.');
 if(live&&process.env.AI_STUDIO_APPROVED_DATA!=='yes')throw Error('Set AI_STUDIO_APPROVED_DATA=yes after reviewing exact sample and provider terms');
 const sample=JSON.parse(fs.readFileSync(file,'utf8'));
 const result=await api.run({sample,mode:live?'live':'dry-run',
  model:process.env.OPENAI_MODEL,apiKey:process.env.OPENAI_API_KEY,
  approvedData:live&&process.env.AI_STUDIO_APPROVED_DATA==='yes'});
 console.log('\nCASE '+result.id+' | '+result.mode.toUpperCase()+' | HUMAN APPROVAL REQUIRED | SENT: NO');
 console.log(result.text);
 if(result.quality)console.log('Format warnings: '+(result.quality.flagged.join(', ')||'none')+'; employee review required.');
 if(result.claims)console.log('Content flags: '+(result.claims.flagged.map(x=>x.key).join(', ')||'none detected')+'; no source verification performed.');
 if(live)console.log('No customer email has been sent. Review the result against approved records.');
}
main().catch(e=>{console.error('Pilot stopped: '+e.message);process.exitCode=1});
