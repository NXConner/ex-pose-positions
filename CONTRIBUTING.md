# Contributing

## Setup
- pnpm install
- Create `.env` with Firebase keys
- pnpm dev (or refresh if already running)

## Workflow
- Branch from `main`
- Run `pnpm lint` and fix issues
- Ensure build passes: `pnpm build`
- Open PR; CI runs lint/build

## Testing (future)
- Unit/Integration tests with Firebase Emulator (planned)
- E2E smoke tests (planned)

## Code style
- TypeScript, React
- ESLint with jsx-a11y; prefer accessibility-first components
- Keep functions small and well-named
