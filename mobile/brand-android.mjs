import {execFileSync} from 'node:child_process';
import {mkdir,readFile,writeFile,copyFile,rm,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const mobile=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(mobile,'..'),res=path.join(mobile,'android/app/src/main/res');
execFileSync(process.execPath,[path.join(root,'scripts/build-trizentro-app-icons.cjs'),'--android'],{stdio:'inherit'});
const source=size=>path.join(root,'docs/app-icons','icon-'+size+'.png');
for(const [density,size] of Object.entries({mdpi:48,hdpi:72,xhdpi:96,xxhdpi:144,xxxhdpi:192})){
 const dest=path.join(res,'mipmap-'+density);await mkdir(dest,{recursive:true});
 for(const name of ['ic_launcher','ic_launcher_round']){
  for(const ext of ['webp','jpg','xml'])await rm(path.join(dest,name+'.'+ext),{force:true});
  await copyFile(source(size),path.join(dest,name+'.png'));
 }
}
const drawable=path.join(res,'drawable-nodpi');await mkdir(drawable,{recursive:true});
await copyFile(source(512),path.join(drawable,'tz_launcher_logo.png'));
const adaptiveDir=path.join(res,'mipmap-anydpi-v26');await mkdir(adaptiveDir,{recursive:true});
const adaptive='<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android"><background android:drawable="@color/tz_launcher_background"/><foreground android:drawable="@drawable/tz_launcher_foreground"/></adaptive-icon>\n';
for(const name of ['ic_launcher','ic_launcher_round'])await writeFile(path.join(adaptiveDir,name+'.xml'),adaptive);
await mkdir(path.join(res,'values'),{recursive:true});
await writeFile(path.join(res,'values/tz_launcher_colors.xml'),'<resources><color name="tz_launcher_background">#071925</color></resources>\n');
await mkdir(path.join(res,'drawable'),{recursive:true});
await writeFile(path.join(res,'drawable/tz_launcher_foreground.xml'),'<inset xmlns:android="http://schemas.android.com/apk/res/android" android:drawable="@drawable/tz_launcher_logo" android:inset="16%" />\n');
const manifest=await readFile(path.join(mobile,'android/app/src/main/AndroidManifest.xml'),'utf8');
if(!manifest.includes('@mipmap/ic_launcher'))throw Error('Android template icon reference changed');
console.log('TriZentro legacy and adaptive launcher icons installed');
