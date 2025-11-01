# Pavement Performance Suite - Random Positions App (Enhanced)

## Setup

1. pnpm install
2. Create .env with Firebase keys:
   - VITE_FIREBASE_API_KEY
   - VITE_FIREBASE_AUTH_DOMAIN
   - VITE_FIREBASE_PROJECT_ID
   - VITE_FIREBASE_STORAGE_BUCKET
   - VITE_FIREBASE_MESSAGING_SENDER_ID
   - VITE_FIREBASE_APP_ID
3. pnpm dev (refresh if already running)

## Features
- Partner linking (anonymous)
- Shared Randomizer (Tonight)
- Tonight's Plans (propose/respond/notes)
- Shared/Custom Lists + merged view
- Real-Time Game + Stats
- Photo Ideas (Solo/Couples/Tips)
- Theme selector (Dark/Neon)
- Offline support (SW) + indicator
- Drag-and-drop: drop the position image onto Tonight's Plans to add, or onto a list chip in My Lists to auto-add
- Positions Gallery to browse/search and jump to any position
- Camera Sync (local-only by default): enable camera, Start/Join with countdown; TURN relay optional; save to device
- PIN Lock (4–6 digits) with auto-lock on screen off

## Development
- Lint: pnpm lint
- Build: pnpm build
- CI: GitHub Actions workflow `ci.yml`
- Tests: `pnpm test` (Vitest)
- Firebase Emulator: `firebase emulators:start` (requires Firebase CLI)

### Data linter workflow
- Run: `npm run data:lint`
- It reports missing `description/pros/cons` or missing images per `data/data.json`.
- Fill in fields directly in `data/data.json`; rerun the linter until clean.

## Camera Sync
- Local-only mode (default): recordings stay on device. Enable in Settings.
- TURN relay can be disabled in Settings.
- Save location: prompt each time or auto-download.
- Auto-delete local blob after export (optional).

## Drag-and-Drop
- Drag the main position image and drop on:
  - Tonight's Plans → adds to draft list
  - My Lists chips → adds to that list instantly

## Deployment

### Firebase Hosting (Manual)
1. Build the app: `npm run build`
2. Deploy: `firebase deploy --only hosting`
3. Your app will be live at: `https://ex-pose-positions.web.app`

### Automatic Deployments (GitHub Actions)
1. Get Firebase service account key:
   - Go to: https://console.firebase.google.com/project/ex-pose-positions/settings/serviceaccounts/adminsdk
   - Click "Generate new private key"
   - Save the JSON file
2. Add to GitHub Secrets:
   - Go to: https://github.com/NXConner/ex-pose-positions/settings/secrets/actions
   - Click "New repository secret"
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: Paste entire contents of the JSON file
3. Push to `main` branch → automatic deployment!

### Firebase Project
- Project ID: `ex-pose-positions`
- Project Number: `847137742129`
- Repository: https://github.com/NXConner/ex-pose-positions

## Android (Capacitor)
- Sync web assets: `pnpm run cap:sync`
- Open Android Studio: `pnpm run cap:android`
- Ensure you set Firebase keys in `.env` before building.

## Security
- Firestore rules in `firestore.rules`
- Data docs stamped with `schemaVersion`

## License
MIT - see [LICENSE](./LICENSE)

## Credits
- Data inspiration and assets:
  - sexpositions.club
  - GitHub repositories:
    - https://github.com/raminr77/random-sex-position
    - https://github.com/adminlove520/Sex-Positions
- Photography prompt resources referenced for Photo Ideas:
  - shotkit.com, shotvoice.com, wikihow.com, boudoirbyrebeccalynn.com, aftershoot.com,
    betsymccuepictures.com, katebackdrop.com, unscriptedphotographers.com,
    rosesandscarsphotography.com, coutureboudoir.com
