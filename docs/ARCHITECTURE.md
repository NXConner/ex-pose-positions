# Architecture Overview

## Project Structure

```
src/
├── components/          # React components
│   ├── __tests__/      # Component tests
│   └── index.ts        # Component exports
├── hooks/              # Custom React hooks
│   └── __tests__/      # Hook tests
├── services/           # External service integrations
│   ├── firebase.ts     # Firebase auth & Firestore
│   ├── analytics.ts   # Privacy-first analytics
│   └── ...
├── store/              # Global state management
│   └── app-context.tsx # Context API provider
├── utils/              # Utility functions
│   └── __tests__/      # Utility tests
├── styles/             # Global styles & animations
├── config/             # Configuration
│   └── env.ts          # Environment validation
├── constants/          # App constants
├── data/               # Static data
└── i18n/               # Internationalization

tests/
├── e2e/                # End-to-end tests
├── integration/        # Integration tests
└── load/               # Load tests
```

## Key Technologies

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Firebase** - Backend (Auth, Firestore)
- **Tailwind CSS** - Styling
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **Capacitor** - Mobile support

## State Management

### Context API
- `AppContext` - Global app state
- Provides filtered data, position state, filters
- Reduces prop drilling

### Local State
- Component-level `useState` for local UI state
- URL params for position/filter state (via `useActions` hook)

### Firebase
- Real-time sync for partner features
- Anonymous authentication
- Firestore for data persistence

## Data Flow

```
User Action
  ↓
Component
  ↓
Hook (useActions, useShared, etc.)
  ↓
Service (Firebase, Analytics)
  ↓
Backend (Firestore) / Local Storage
```

## Component Hierarchy

```
App
├── ErrorBoundary
├── Header
├── TopNavBar (Search, Filters, Settings)
├── SexPositionCard (Main position display)
├── Filters (Collapsible)
├── LazyWrapper (Suspense boundaries)
│   ├── EnhancedTonightPlans
│   ├── EnhancedPartnerConnection
│   ├── EnhancedGame
│   └── ...
└── Footer
```

## Key Features

### Search
- Client-side filtering
- Search history (localStorage)
- Multi-field matching (title, ID, description, pros, cons)
- Relevance sorting

### Offline Support
- Service Worker caching
- Offline action queue
- Auto-retry on reconnect

### Security
- Input sanitization (XSS prevention)
- Firestore security rules
- Environment variable validation
- PIN lock for private gallery

### Performance
- Code splitting (route & component level)
- Lazy loading with Suspense
- Image optimization (WebP, lazy loading)
- Memoization for expensive operations

## Design Patterns

### Custom Hooks
- Encapsulate logic and state
- Reusable across components
- Testable in isolation

### Compound Components
- Related components work together
- Example: `ErrorBoundary` + `ErrorToast`

### Render Props / HOCs
- Used sparingly, prefer hooks

## Error Handling

1. **Error Boundaries** - Catch render errors
2. **Error Toasts** - User-friendly notifications
3. **Retry Logic** - Exponential backoff
4. **Analytics** - Error tracking

## Testing Strategy

- **Unit Tests**: Components, hooks, utilities
- **Integration Tests**: Feature workflows
- **E2E Tests**: User journeys
- **Load Tests**: Performance under load

## Performance Optimization

1. **Code Splitting** - Lazy load routes/components
2. **Memoization** - `useMemo`, `useCallback`, `React.memo`
3. **Image Optimization** - WebP, responsive images
4. **Bundle Optimization** - Tree shaking, chunking
5. **Caching** - Service Worker, HTTP caching

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Color contrast (WCAG AAA)

## Mobile Support

- Capacitor for native builds
- Responsive design (mobile-first)
- Touch gesture support
- Haptic feedback
- PWA capabilities

