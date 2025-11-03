# Random Positions App (Enhanced)

## Setup

1. pnpm install
2. Copy `.env.example` to `.env` and fill in Firebase keys:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your Firebase configuration:
   - VITE_FIREBASE_API_KEY
   - VITE_FIREBASE_AUTH_DOMAIN
   - VITE_FIREBASE_PROJECT_ID
   - VITE_FIREBASE_STORAGE_BUCKET
   - VITE_FIREBASE_MESSAGING_SENDER_ID
   - VITE_FIREBASE_APP_ID
   
   Get these from: https://console.firebase.google.com/project/ex-pose-positions/settings/general
3. pnpm dev (refresh if already running)
   
   **Note**: App will work without Firebase keys, but partner features will be disabled.

## Features

### Core Features
- **Partner Linking** - Anonymous linking with real-time sync
- **Shared Randomizer** - Simultaneous pose suggestions for partners
- **Tonight's Plans** - Proposal/response system with notes
- **Shared/Custom Lists** - Favorites, Let's Try, Done It + custom lists with merged view
- **Real-Time Game** - Timer, streak counter, session tracking with pause/resume
- **Stats & Achievements** - Track longest time, streak, total poses tried
- **Photo Ideas** - Solo/Couples/Tips boudoir photography prompts
- **Positions Gallery** - Browse all positions with search and quick jump

### Security & Privacy
- **PIN Lock** - 4-6 digit PIN with auto-lock on screen off
- **Private Gallery** - PIN-locked personal media storage
- **Input Sanitization** - Comprehensive XSS and injection prevention
- **Firestore Security Rules** - Hardened with comprehensive validation
- **Privacy-First Analytics** - Opt-in only, no PII tracking

### UI/UX Features
- **Advanced Search** - Search by title, ID, description, pros, cons with history
- **Theme System** - Dark/Neon/High-Contrast themes with full customization
- **Drag-and-Drop** - Drop positions onto Tonight's Plans or lists
- **Keyboard Shortcuts** - Full keyboard navigation (see below)
- **Skeleton Loaders** - Loading states for all async operations
- **Error Toasts** - Categorized, user-friendly error messages with retry
- **Responsive Design** - Mobile-first with tablet and desktop optimization
- **Enhanced Accessibility** - WCAG AAA compliance, ARIA labels, screen reader support

### Performance & Offline
- **Offline Support** - Service Worker with smart caching
- **Offline Queue** - Auto-retry queued actions when back online
- **Code Splitting** - Intelligent chunking for optimal bundle size
- **Lazy Loading** - Components and images loaded on demand
- **Image Optimization** - WebP support, responsive images, lazy loading
- **Performance Monitoring** - Built-in performance tracking (dev mode)

### Developer Features
- **TypeScript Strict Mode** - Full type safety enabled
- **Comprehensive Testing** - Unit, integration, and E2E test coverage
- **Error Boundaries** - Enhanced error handling with categorization
- **Environment Validation** - Build-time and runtime env var validation
- **Dev Tools** - Performance monitor, analytics viewer, shortcuts help

## Keyboard Shortcuts

- `Ctrl+F` or `Ctrl+Shift+F` - Toggle filters
- `Ctrl+,` - Toggle settings
- `Ctrl+K` or `/` - Focus search
- `R` - Get random position
- `ArrowLeft` - Previous position
- `ArrowRight` - Next random position
- `L` - Open manage lists
- `Escape` - Close modals/dropdowns
- `Enter` - Submit search (when in search box)

## Search Features

- **Multi-field Search** - Searches title, ID, description, pros, and cons
- **Search History** - Recent searches saved automatically
- **Search Suggestions** - Dropdown with history and suggestions
- **Relevance Sorting** - Exact matches first, then title matches
- **Result Counter** - Shows matches/total positions

## Development

### Code Quality
- **Lint**: `pnpm lint` - Run ESLint with accessibility rules
- **Type Check**: `pnpm build` - TypeScript compilation check
- **Format**: Code is auto-formatted with ESLint

### Testing
- **Unit Tests**: `pnpm test` - Run all unit tests (Vitest)
- **Test UI**: `pnpm test:ui` - Interactive test runner
- **Test Coverage**: `pnpm test:coverage` - Generate coverage report
- **Watch Mode**: `pnpm test:watch` - Watch mode for TDD
- **Integration Tests**: `pnpm test:integration` - Run integration tests
- **E2E Tests**: `pnpm e2e` - Run Playwright end-to-end tests
- **All Tests**: `pnpm test:all` - Run unit, integration, and E2E tests

### CI/CD
- GitHub Actions workflow `ci.yml` runs on every PR
- Automated linting, type checking, and testing
- Firebase deployment on merge to `main`

### Firebase Emulator
- `firebase emulators:start` - Run local Firebase emulator (requires Firebase CLI)

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
