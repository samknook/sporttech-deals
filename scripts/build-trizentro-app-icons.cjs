/* Generate square app icons from the official TriZentro vector mark.
 * Dependency-free PNG generation; source mark currently uses absolute M/Z polygons. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'../docs');
const mark=fs.readFileSync(path.join(root,'trizentro-app-mark.svg'),'utf8');
const shapes=[...mark.matchAll(/<path fill="(#[0-9a-f]{6})" fill-rule="evenodd" d="([^"]+)"/gi)].map(m=>{
 const polygons=m[2].trim().split(/Z/i).filter(x=>x.trim()).map(part=>{
  if(!/^\s*M[\d\s.-]+$/i.test(part))throw Error('Unsupported brand path; review icon renderer');
  const nums=part.match(/-?\d+(?:\.\d+)?/g).map(Number);
  if(nums.length%2)throw Error('Invalid brand polygon');
  return Array.from({length:nums.length/2},(_,i)=>[nums[i*2],nums[i*2+1]]);
 });
 return {color:m[1].slice(1).match(/../g).map(x=>parseInt(x,16)),polygons};
});
if(shapes.length!==2)throw Error('Official mark changed; review icon generation');
const crc32=buffer=>{let c=0xffffffff;for(const b of buffer){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0)}return (c^0xffffffff)>>>0};
function chunk(type,data){const tag=Buffer.from(type),len=Buffer.alloc(4),crc=Buffer.alloc(4);len.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(Buffer.concat([tag,data])));return Buffer.concat([len,tag,data,crc])}
function icon(size){
 const scale=2,n=size*scale,pixels=Buffer.alloc(n*n*3),bg=[7,25,37];
 for(let i=0;i<pixels.length;i+=3){pixels[i]=bg[0];pixels[i+1]=bg[1];pixels[i+2]=bg[2]}
 // Keep all of the mark within the central maskable-icon safe area.
 const factor=n*.76/256,ox=(n-256*factor)/2,oy=(n-256*factor)/2;
 for(const shape of shapes){
  const edges=shape.polygons.flatMap(poly=>poly.map((p,i)=>{const q=poly[(i+1)%poly.length];return [ox+p[0]*factor,oy+p[1]*factor,ox+q[0]*factor,oy+q[1]*factor]}));
  for(let y=0;y<n;y++){
   const cy=y+.5,xs=[];
   for(const [x1,y1,x2,y2] of edges)if((y1<=cy&&y2>cy)||(y2<=cy&&y1>cy))xs.push(x1+(cy-y1)*(x2-x1)/(y2-y1));
   xs.sort((a,b)=>a-b);
   for(let j=0;j+1<xs.length;j+=2)for(let x=Math.max(0,Math.ceil(xs[j]-.5));x<Math.min(n,Math.ceil(xs[j+1]-.5));x++){
    const i=(y*n+x)*3;for(let k=0;k<3;k++)pixels[i+k]=shape.color[k];
   }
  }
 }
 const rows=Buffer.alloc(size*(size*3+1));
 for(let y=0;y<size;y++)for(let x=0;x<size;x++)for(let k=0;k<3;k++){
  let sum=0;for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++)sum+=pixels[((2*y+dy)*n+2*x+dx)*3+k];
  rows[y*(size*3+1)+1+x*3+k]=Math.round(sum/4);
 }
 const header=Buffer.alloc(13);header.writeUInt32BE(size,0);header.writeUInt32BE(size,4);header[8]=8;header[9]=2;
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',zlib.deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]);
}
const out=path.join(root,'app-icons');fs.mkdirSync(out,{recursive:true});
const sizes=process.argv.includes('--android')?[48,72,96,144,192,180,512,1024]:[180,192,512,1024];
for(const size of sizes)fs.writeFileSync(path.join(out,'icon-'+size+'.png'),icon(size));
console.log('Generated TriZentro app icons: 180, 192, 512 and 1024 px');
