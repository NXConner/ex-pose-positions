# Testing Guide

## Overview

This project uses a comprehensive testing strategy with unit, integration, and E2E tests.

## Test Structure

```
tests/
├── e2e/              # End-to-end tests (Playwright)
│   ├── smoke.spec.ts
│   ├── keyboard-shortcuts.spec.ts
│   └── ...
├── integration/      # Integration tests
│   ├── partner-linking.test.ts
│   ├── game-flow.test.ts
│   └── ...
└── load/             # Load tests (k6)
    └── k6_smoke.js

src/
├── components/
│   └── __tests__/    # Component unit tests
├── hooks/
│   └── __tests__/    # Hook unit tests
├── services/
│   └── __tests__/    # Service unit tests
└── utils/
    └── __tests__/    # Utility unit tests
```

## Running Tests

### All Tests
```bash
pnpm test:all
```

### Unit Tests Only
```bash
pnpm test              # Run once
pnpm test:watch       # Watch mode
pnpm test:ui          # Interactive UI
pnpm test:coverage    # With coverage report
```

### Integration Tests
```bash
pnpm test:integration
```

### E2E Tests
```bash
pnpm e2e              # Run E2E tests
pnpm e2e:install      # Install Playwright browsers (first time)
```

## Writing Tests

### Unit Tests (Vitest)

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

describe("MyComponent", () => {
  it("should render correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("should handle user interaction", () => {
    const handleClick = vi.fn();
    render(<MyComponent onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Tests

Integration tests verify multiple components/services working together:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

describe("Partner Linking Flow", () => {
  it("should link two users and sync data", async () => {
    // Test complete workflow
  });
});
```

### E2E Tests (Playwright)

```typescript
import { test, expect } from "@playwright/test";

test("should navigate to position", async ({ page }) => {
  await page.goto("/");
  await page.click('[aria-label="Next position"]');
  // Assertions...
});
```

## Test Coverage

### Coverage Thresholds
- Lines: 80%
- Functions: 80%
- Branches: 75%
- Statements: 80%

### View Coverage
```bash
pnpm test:coverage
```
Open `coverage/index.html` in browser for detailed report.

## Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on what users see/do
   - Avoid testing internal state directly

2. **Use Descriptive Names**
   - `should display error message when network fails`
   - Not: `test error`

3. **Follow AAA Pattern**
   - **Arrange**: Set up test data
   - **Act**: Perform action
   - **Assert**: Verify result

4. **Mock External Dependencies**
   - Firebase, localStorage, APIs
   - Use Vitest's `vi.mock()` or `vi.fn()`

5. **Keep Tests Fast**
   - Unit tests should be < 100ms
   - Use `vi.useFakeTimers()` for time-dependent tests

6. **Test Accessibility**
   - Verify ARIA labels
   - Test keyboard navigation
   - Check screen reader compatibility

## Common Patterns

### Mocking Firebase
```typescript
vi.mock("@/services/firebase", () => ({
  getFirebase: () => ({
    auth: mockAuth,
    db: mockDb,
  }),
}));
```

### Mocking localStorage
```typescript
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});
```

### Testing Async Operations
```typescript
await waitFor(() => {
  expect(screen.getByText("Loaded")).toBeInTheDocument();
});
```

### Testing Hooks
```typescript
const { result } = renderHook(() => useMyHook());
expect(result.current.value).toBe(expected);
```

## Debugging Tests

### In Watch Mode
- Press `p` to filter by filename
- Press `t` to filter by test name
- Press `u` to update snapshots

### In VS Code
- Use Vitest extension for inline test running
- Set breakpoints in test files
- Use debugger statement

## CI/CD

Tests run automatically on:
- Every PR creation/update
- Merge to `main`
- Manual workflow triggers

All tests must pass before merging.

