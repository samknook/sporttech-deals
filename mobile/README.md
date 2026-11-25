# TriZentro native app prototype

This is a local-first Capacitor 8 app, separate from the production website. No paid developer account is needed for the prototype.

## Local development
Requires Node 22+. From this directory:
```
npm install
npm test
npm run build
npm run android:init
npx cap open android
```
For iOS, on macOS with Xcode 26 or newer:
```
npm run ios:init
npx cap open ios
```
Subsequent builds use android:sync / ios:sync. The native projects and www output are generated; do not edit them as canonical source yet. The manually triggered workflow can attempt an Android debug APK; store signing is not configured.

## Implemented
- Bundled public race snapshot from the website's event catalogue; search and sport filters without network.
- Local guest season using Capacitor Preferences, not yet synchronized to web or user accounts.
- Native share and Browser links to canonical race pages.
- Supplied circular brand logo in the app UI.

## Before a store release
- Replace native launcher/splash defaults with the verified TriZentro brand assets; test on real phones.
- Add a privacy manifest for Preferences on iOS, audit permissions, accessibility, and dependency lockfile.
- Live catalogue endpoint with safe offline snapshot refresh, authenticated account sync, and push registration/opt-in.
- Final application ID ownership, signing, provisioning and store review. No production keys or credentials in this repository.
- Do not claim registration availability from the bundled snapshot. Open the official live detail page for up-to-date information.
