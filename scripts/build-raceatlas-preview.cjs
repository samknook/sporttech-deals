'use strict';
/* Build an isolated RaceAtlas preview from the raceatlas-staging branch.
 * Copies the whole raceatlas site into the published /raceatlas-preview/ path.
 * Staging is public but noindexed; no contact submissions or analytics are sent.
 */
const fs=require('node:fs');
const path=require('node:path');
const src=path.resolve(process.argv[2]||'.raceatlas-staging/docs/raceatlas');
const dst=path.resolve(process.argv[3]||'docs/raceatlas-preview');
if(!fs.existsSync(path.join(src,'index.html')))throw Error('Staging source does not contain docs/raceatlas/index.html');
if(dst===src||src.startsWith(dst+path.sep))throw Error('Invalid staging paths');
fs.rmSync(dst,{recursive:true,force:true});
fs.cpSync(src,dst,{recursive:true,force:true});
let edited=0;
function traverse(dir){
 for(const d of fs.readdirSync(dir,{withFileTypes:true})){
  const file=path.join(dir,d.name);
  if(d.isDirectory()){traverse(file);continue}
  if(!d.isFile()||!d.name.endsWith('.html'))continue;
  let html=fs.readFileSync(file,'utf8');
  if(!/<head(?:\s[^>]*)?>/i.test(html)||!/<body(?:\s[^>]*)?>/i.test(html))continue;
  html=html.replace(/<head(\s[^>]*)?>/i,m=>m+'<meta name="robots" content="noindex,nofollow,noarchive"><meta name="googlebot" content="noindex,nofollow">');
  const banner='<aside id="raStagingNotice" aria-label="Testomgeving">🧪 TESTOMGEVING · <a href="../raceatlas/">Bekijk de live site</a> · Wijzigingen zijn nog niet definitief</aside>';
  const style='<style>#raStagingNotice{position:relative;z-index:99999;background:#f7dc6f;color:#243020;text-align:center;font:700 13px/1.4 system-ui,sans-serif;padding:11px 15px}#raStagingNotice a{color:#18412a;text-decoration:underline}</style>';
  html=html.replace(/<\/head\s*>/i,style+'</head>');
  html=html.replace(/<body(\s[^>]*)?>/i,m=>m+banner);
  const guard='<script>document.addEventListener("submit",function(e){if(e.target.closest("form")){e.preventDefault();e.stopImmediatePropagation();alert("Dit is de testomgeving. Formulieren versturen hier geen berichten. Gebruik de live website.");}},true);</script>';
  html=html.replace(/<\/body\s*>/i,guard+'</body>');
  fs.writeFileSync(file,html);edited++;
 }
}
traverse(dst);
if(!edited)throw Error('No HTML pages were annotated');
console.log('RaceAtlas preview prepared: '+edited+' HTML pages, isolated from public analytics and production forms.');
