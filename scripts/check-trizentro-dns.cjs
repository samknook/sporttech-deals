'use strict';
const dns=require('node:dns').promises;
const https=require('node:https');
const assert=require('node:assert/strict');
const expected=['185.199.108.153','185.199.109.153','185.199.110.153','185.199.111.153'];
const host='trizentro.com';
async function getUrl(url){
 return new Promise((resolve,reject)=>{
  const request=https.get(url,{timeout:10000,headers:{'User-Agent':'TriZentro-domain-readiness/1.0'}},response=>{
   response.resume();resolve({status:response.statusCode,location:response.headers.location||''});
  });
  request.on('timeout',()=>request.destroy(new Error('Timeout')));
  request.on('error',reject);
 });
}
(async()=>{
 const errors=[];
 let addresses=[];
 try{addresses=await dns.resolve4(host);const unknown=addresses.filter(x=>!expected.includes(x));if(unknown.length)errors.push('Unexpected A records: '+unknown.join(', '));if(!addresses.length)errors.push('No IPv4 addresses resolved');}
 catch(e){errors.push('A lookup failed: '+e.message)}
 let cname=[];
 try{cname=await dns.resolveCname('www.'+host);if(!cname.some(x=>x.replace(/\\.$/,'').toLowerCase()==='samknook.github.io'))errors.push('www CNAME does not point to samknook.github.io');}
 catch(e){errors.push('www CNAME lookup failed: '+e.message)}
 let main=null,web=null;
 try{main=await getUrl('https://'+host+'/raceatlas/');if(main.status!==200)errors.push('Main race page returned '+main.status);}
 catch(e){errors.push('HTTPS on main domain failed: '+e.message)}
 try{web=await getUrl('https://www.'+host+'/raceatlas/');if(![301,302,307,308].includes(web.status)||!web.location.startsWith('https://'+host+'/'))errors.push('www redirect to apex domain failed');}
 catch(e){errors.push('HTTPS www check failed: '+e.message)}
 console.log(JSON.stringify({domain:host,addresses,cname,apex:main,www:web,errors},null,2));
 if(errors.length)process.exitCode=1;
 else console.log('PASS: TriZentro DNS, HTTPS and redirect are ready for canonical cutover.');
})().catch(e=>{console.error(e);process.exitCode=1});
