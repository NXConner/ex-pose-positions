# Contributing Guide

Thank you for contributing! This guide will help you get started.

## Setup

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Add your Firebase configuration keys
   - App works without Firebase, but partner features will be disabled

3. **Start Development Server**
   ```bash
   pnpm dev
   ```
   If server is already running, just refresh your browser.

## Development Workflow

### Branching
- Branch from `main` for new features
- Use descriptive branch names: `feature/search-history`, `fix/game-pause`
- Keep branches focused on a single feature or fix

### Code Quality
- **Lint**: Run `pnpm lint` before committing
- **Type Check**: Run `pnpm build` to verify TypeScript compilation
- **Tests**: Run `pnpm test` to ensure all tests pass
- **Coverage**: Run `pnpm test:coverage` to check test coverage (target: 80%+)

### Before Submitting PR
- ✅ All tests pass: `pnpm test:all`
- ✅ Linting passes: `pnpm lint`
- ✅ Build succeeds: `pnpm build`
- ✅ TypeScript compiles without errors
- ✅ New features have tests
- ✅ Accessibility checked (ARIA labels, keyboard nav)

## Testing

### Unit Tests
- **Location**: `src/**/__tests__/*.test.{ts,tsx}`
- **Run**: `pnpm test` or `pnpm test:watch`
- **Coverage**: `pnpm test:coverage`
- **Framework**: Vitest with React Testing Library

### Integration Tests
- **Location**: `tests/integration/*.test.ts`
- **Run**: `pnpm test:integration`
- **Tests**: Partner linking, game flow, plans workflow, lists sync

### E2E Tests
- **Location**: `tests/e2e/*.spec.ts`
- **Run**: `pnpm e2e`
- **Framework**: Playwright
- **Setup**: `pnpm e2e:install` (first time only)

### Writing Tests
- Follow AAA pattern: Arrange, Act, Assert
- Test user behavior, not implementation details
- Use descriptive test names: `should display error when network fails`
- Mock external dependencies (Firebase, localStorage, etc.)

## Code Style

### TypeScript
- Use strict mode (enabled)
- Prefer type inference where possible
- Use interfaces for object shapes
- Export types when used externally

### React
- Use functional components with hooks
- Prefer `useMemo` and `useCallback` for expensive operations
- Use `React.memo` for expensive components
- Keep components under 300 lines (refactor if needed)

### Accessibility
- Always include ARIA labels for interactive elements
- Ensure keyboard navigation works
- Test with screen readers
- Follow WCAG AAA guidelines

### File Organization
- Components: `src/components/`
- Hooks: `src/hooks/`
- Utils: `src/utils/`
- Services: `src/services/`
- Tests: Co-located in `__tests__/` directories

## Commit Messages

Use clear, descriptive commit messages:
- `feat: add search history functionality`
- `fix: correct game pause time calculation`
- `test: add tests for error toast component`
- `docs: update README with keyboard shortcuts`
- `refactor: extract search logic to custom hook`

## Pull Request Process

1. **Create PR** with clear description
2. **CI Checks** will run automatically (lint, tests, build)
3. **Code Review** - Address any feedback
4. **Merge** when approved and all checks pass

## Questions?

- Check existing issues and PRs
- Ask in discussions or create an issue
- Review code examples in the codebase

Thank you for contributing! 🎉
