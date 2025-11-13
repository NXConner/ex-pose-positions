# Intimacy Companion Suite

> Intimacy Companion Suite (ICS) is a privacy-first partner experience platform that blends playful discovery with intentional connection. It combines guided exploration, shared planning, contextual journaling, and personal wellness tracking in a single hybrid web/mobile application. Every surface is designed for consent, safety, and delight.

## Setup

1. **Install dependencies** (idempotent):
   ```powershell
   pwsh -File ./install_dependencies.ps1
   ```
2. **Configure environment variables**:
   ```powershell
   Copy-Item .env.example .env
   ```
   Populate Supabase (`intimacy` project), optional Firebase, AI, and analytics keys as needed. Prefer vault-backed secrets for production environments (see `PROTECT_ENV.md`).
3. **Launch the dev server**:
   ```powershell
   pnpm dev
   ```
   Refresh your running dev instance after environment changes.

### Containers

Prefer containers for a clean, reproducible environment:

```bash
docker compose up --build
```

- App served on http://localhost:5173
- Supabase Postgres (`intimacy` database) exposed on `localhost:54322`
- Supabase Studio UI on http://localhost:54323
- Update `.env` or environment overrides before starting for custom credentials

Production build image:

```bash
docker build --target production -t intimacy-suite:prod .
```

## Branching Strategy

- **Default branch**: `main` (production ready)
- **Ongoing platform work**: `develop`
- **Feature branches**: `feat/<scope>-<summary>` (e.g., `feat/partner-shared-journal`)
- **Fix branches**: `fix/<scope>-<summary>`
- **Release branches**: `release/<version>` prepared before production deploys

Always branch from `develop`, open PRs into `develop`, and merge `develop → main` only after successful CI and release readiness checks.

## Experiences & Feature Highlights

### Core Experiences
- **Partner Sync** – Secure partner pairing with online presence state, conflict resolution, and shared journaling
- **AI-Guided Randomizer** – Collaborative picker that adapts to preferences, moods, and boundaries
- **Tonight's Plans** – Consent-aware proposals with scheduling, shared notes, and safety reminders
- **Curated Lists** – Personalized favorites, experiments, aftercare routines, with shared and private scopes
- **Connection Game** – Cooperative missions, streak tracking, and custom challenges with pause/resume controls
- **Insights & Achievements** – Wellness dashboards, habit trends, mood logging, and badge systems
- **Creative Prompts** – Photo ideas, conversation starters, reflection prompts, and guided programs
- **Camera Sync Studio** – Multi-angle capture with Supabase realtime mesh, synchronized recording, and shareable join links for additional cameras
- **Positions Gallery** – Searchable atlas with filters, tags, and customizable metadata

### Security & Privacy
- **PIN & Device Lock** – 4-6 digit PIN with automated inactivity lockouts
- **Private Gallery Vault** – Zero-knowledge storage with biometric unlock on supported devices
- **Consent & Boundaries Hub** – Shared agreements with reminders, version history, and export options
- **Redaction Layer** – Input sanitization, secure logging, and configurable retention policies
- **Privacy-First Analytics** – Opt-in telemetry, anonymised aggregation, per-connection controls

### UI/UX Surface
- **Adaptive Search** – Multi-field search with history, relevance scoring, and quick actions
- **Multi-Theme Engine** – Dark, glow, high-contrast, and user-defined theme packs with background uploads
- **Drag-and-Drop Workflows** – Move cards between lists, sessions, and archives effortlessly
- **Keyboard & Voice Shortcuts** – Full keyboard navigation plus optional voice command pilot (feature-flagged)
- **Skeletons & Microcopy** – Graceful loading states and contextual guidance throughout
- **Robust Accessibility** – WCAG 2.2 AA+ with high-contrast themes, semantic regions, and screen-reader focus management

### Performance & Offline
- **Offline Support** – Service worker caching, queue replay, and conflict reconciliation
- **Predictive Prefetch** – Learns navigation patterns to warm caches proactively
- **Granular Code Splitting** – Route and feature-based chunking with prioritised hydration
- **Media Optimization** – Responsive images, AVIF/WebP support, and background worker processing
- **Performance Monitoring** – Dev-mode telemetry overlay and metrics export hooks

### Developer Experience
- **TypeScript Strict Mode** – Full typing across app and supporting scripts
- **Robust Testing** – Unit, integration, E2E, accessibility, and load testing suites
- **Structured Error Boundaries** – Categorised recoveries with feature flag gating
- **Environment Validation** – Build and runtime validation of required secrets
- **Dev Mode Utilities** – Performance monitor, analytics viewer, and feature flag inspector

## Keyboard Shortcuts

- `Ctrl+F` or `Ctrl+Shift+F` – Toggle filters
- `Ctrl+,` – Toggle settings
- `Ctrl+K` or `/` – Focus search
- `R` – Trigger randomizer
- `ArrowLeft` – Previous position
- `ArrowRight` – Next random position
- `L` – Open manage lists
- `Escape` – Close modals/dropdowns
- `Enter` – Submit search (when in search box)

## Search Features

- **Multi-field Search** – Searches title, ID, description, pros, and cons
- **Search History** – Recent searches saved automatically
- **Search Suggestions** – Dropdown with history and suggestions
- **Relevance Sorting** – Exact matches first, then title matches
- **Result Counter** – Shows matches/total positions

## Development

### Code Quality
- **Lint (TypeScript/React)**: `pnpm lint`
- **Lint (Styles)**: `pnpm lint:styles`
- **Formatting**: `pnpm format` (Prettier + Tailwind plugin)
- **Type Check**: `pnpm build`
- **Pre-commit**: Husky runs `pnpm exec lint-staged` to gate staged changes

### UI Tooling & Design System
- Design tokens + themes: `src/styles/design-system/`
- UI primitives: `src/components/ui/` (see `docs/UI_LIBRARY.md`)
- Global CSS: `@/styles/design-system.css` and `@/styles/ui.css`
- Providers: `ThemeProvider`, `ToastProvider`, `ToastViewport` in `src/main.tsx`

### Database & Supabase
- Project database name: `intimacy`
- Default Supabase endpoint: `https://qvbjdxlatawfkqfvpfsd.supabase.co` (override with `VITE_SUPABASE_URL`)
- Migrations: `pnpm migrate:up` / `pnpm migrate:down` (requires `DATABASE_URL`)
- Create new migration: `pnpm migrate:create -- <name>`
- Seed baseline data, flags, and demo content: `pnpm db:seed`
- Detailed setup & roles workflow: see `docs/SUPABASE_SETUP.md`

### Testing
- **Unit Tests**: `pnpm test`
- **Test UI**: `pnpm test:ui`
- **Test Coverage**: `pnpm test:coverage`
- **Watch Mode**: `pnpm test:watch`
- **Integration Tests**: `pnpm test:integration`
- **E2E Tests**: `pnpm e2e`
- **All Tests**: `pnpm test:all`

### CI/CD
- GitHub Actions workflow `ci.yml` runs on every PR
- Automated linting, type checking, tests, and security scans
- Container image build + push gated by release channel

### Data Linter Workflow
- Run: `pnpm data:lint`
- Reports missing `description/pros/cons` or missing images per `data/data.json`
- Fill in fields directly in `data/data.json`; rerun until clean

## Camera Sync
- Local-only mode (default): recordings stay on device
- TURN relay can be disabled in Settings
- Save location: prompt each time or auto-download
- Auto-delete local blob after export (optional)

## Drag-and-Drop
- Drag the main position image and drop on:
  - Tonight's Plans → adds to draft list
  - My Lists chips → adds to that list instantly

## Deployment

### Manual Deployment
1. Build the app: `pnpm build`
2. Deploy static assets to your hosting provider of choice (e.g., Vercel, Netlify, Cloudflare Pages)
3. Provision environment variables in the hosting dashboard before go-live

### Automatic Deployments (GitHub Actions)
1. Store deployment credentials (e.g., Vercel token, Supabase service role) in GitHub Secrets
2. Update `.github/workflows/ci.yml` with host-specific deploy steps
3. Push to `main` branch → automatic deployment pipeline runs

## Mobile (Capacitor)
- Sync web assets: `pnpm run cap:sync`
- Open Android Studio: `pnpm run cap:android`
- Ensure Supabase and feature flag values exist in `.env` before building

## Security
- Firestore rules in `firestore.rules` (legacy compatibility)
- Supabase RLS policies defined in `supabase/migrations`
- Data docs stamped with `schemaVersion`

## License
MIT – see [LICENSE](./LICENSE)
