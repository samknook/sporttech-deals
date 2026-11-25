# TriZentro native app prototype

This is a local-first Capacitor 8 app, separate from the production website. No paid developer account is needed for the prototype.

## Local development
Requires Node 22+. From this directory:
```
npm install
npm test
npm run build
npm run android:init
node brand-android.mjs
npx cap open android
```
For iOS, on macOS with Xcode 26 or newer:
```
npm run ios:init
node brand-ios.mjs # requires Ruby xcodeproj
npx cap open ios
```
Subsequent builds use android:sync / ios:sync. The native projects and www output are generated; do not edit them as canonical source yet. The app pull request runs Android debug APK and unsigned iOS simulator builds. Download their artifacts from the native app workflow when successful. Store signing is not configured.

## Implemented
- Bundled public race snapshot from the website's event catalogue; search and sport filters without network.
- Local guest season using Capacitor Preferences, not yet synchronized to web or user accounts.
- Native share and Browser links to canonical race pages.
- Supplied circular logo in the app UI, native icon generation, and a public calendar refresh with validated local fallback. The live feed is not published until this release merges.

## Before a store release
- Verify the generated native launcher icons on real phones and customize the splash screens.
- Verify the generated Preferences privacy manifest; audit permissions, accessibility and dependency lockfile.
- Test the production public catalogue refresh on devices, add authenticated account sync and push registration/opt-in.
- Final application ID ownership, signing, provisioning and store review. No production keys or credentials in this repository.
- Do not claim registration availability from the bundled snapshot. Open the official live detail page for up-to-date information.
