import {execFileSync} from 'node:child_process';
import {readFile,writeFile,copyFile,rm,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const mobile=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(mobile,'..');
const app=path.join(mobile,'ios/App/App'),assets=path.join(app,'Assets.xcassets/AppIcon.appiconset');
execFileSync(process.execPath,[path.join(root,'scripts/build-trizentro-app-icons.cjs')],{stdio:'inherit'});
for(const name of await readdir(assets))if(/\.(png|jpg|jpeg)$/i.test(name))await rm(path.join(assets,name));
await copyFile(path.join(root,'docs/app-icons/icon-1024.png'),path.join(assets,'TriZentro-1024.png'));
await writeFile(path.join(assets,'Contents.json'),JSON.stringify({images:[{filename:'TriZentro-1024.png',idiom:'universal',platform:'ios',size:'1024x1024'}],info:{author:'xcode',version:1}},null,2));
const manifest='<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0"><dict><key>NSPrivacyAccessedAPITypes</key><array><dict><key>NSPrivacyAccessedAPIType</key><string>NSPrivacyAccessedAPICategoryUserDefaults</string><key>NSPrivacyAccessedAPITypeReasons</key><array><string>CA92.1</string></array></dict></array><key>NSPrivacyTracking</key><false/></dict></plist>\n';
await writeFile(path.join(app,'PrivacyInfo.xcprivacy'),manifest);
// Add the privacy manifest to the App target; never assume copying alone includes it in the bundle.
execFileSync('ruby',['-rxcodeproj','-e',`
project = Xcodeproj::Project.open(ARGV[0])
target = project.targets.find { |t| t.name == 'App' } or abort 'App target missing'
group = project.main_group.find_subpath('App', false) or abort 'App group missing'
ref = group.files.find { |f| f.path == 'PrivacyInfo.xcprivacy' } || group.new_file('PrivacyInfo.xcprivacy')
target.resources_build_phase.add_file_reference(ref, true)
project.save
`,path.join(mobile,'ios/App/App.xcodeproj')],{stdio:'inherit'});
console.log('TriZentro iOS icon and Preferences privacy manifest applied');
