## Intimacy Companion Suite UI Library

The UI layer is composed of reusable, accessibility-reviewed primitives that sit on top of the design system token set. This page documents the available building blocks and illustrates how to integrate them into connection-centric experiences.

### Design System Tokens

- Location: `src/styles/design-system/`
- Themes: `midnight`, `aurora`, `ember`, `clarity`
- Tokens exposed as CSS custom properties (`--ics-*`) for colors, spacing, typography, motion, radii, and elevations.
- `ThemeProvider` automatically loads stored preference from `localStorage` (`ics.theme`) and writes tokens to the document root.

### CSS Imports

```ts
import "@/styles/design-system.css"; // baseline variables & theme palettes
import "@/styles/ui.css";            // component-level utility classes
```

These files are imported in `src/main.tsx` and must remain globally available.

### React Providers

```tsx
<ThemeProvider>
  <ToastProvider>
    <App />
    <ToastViewport />
  </ToastProvider>
</ThemeProvider>
```

The theme provider may be nested deeper for multi-shell experiences. Use `useTheme()` to read the active theme or present the personalization panel.

### Core Components (`src/components/ui`)

| Component | Description | Notes |
|-----------|-------------|-------|
| `Button` | Variants `primary`, `secondary`, `accent`, `outline`, `ghost`, `danger`; sizes `sm|md|lg`; optional leading/trailing icons | Keyboard/focus styles and loading states baked in |
| `Input` | Labeled form control with description/error slots and adornments | Handles `aria-describedby` and `aria-invalid` automatically |
| `Card`, `CardHeader`, `CardContent`, `CardFooter` | Surface container with optional elevations | Elevation levels map to design-system shadows |
| `Modal` | Portal-backed dialog with ESC and body-scroll locking | Provide `isOpen`, `onClose`, `title` |
| `Tabs`, `TabsList`, `TabsTrigger`, `TabsPanel` | Keyboard-navigable tabs with automatic default selection | Ensure `value` props are unique |
| `Badge` | Tone-based pill elements (`info`, `success`, `warning`, `danger`) | Supports leading/trailing icons |
| `ToastProvider`, `useToast`, `ToastViewport` | Toast notifications with tone and timeout control | `publish({ title, description, tone })` returns dismiss id |
| `Stack`, `Inline`, `Surface`, `VisuallyHidden` | Layout primitives, tokens-backed spacing | Use `spacing="lg"` etc. |

### Accessibility Checklist

- All interactive primitives expose focus states and ARIA attributes where applicable.
- `Tabs` implements arrow-key roving focus; `Modal` binds `Escape` and traps focus.
- `ToastViewport` announces messages via `aria-live="polite"`.
- Use `VisuallyHidden` component for hidden labels instead of custom CSS.
- Respect reduced motion preferences via `prefers-reduced-motion` tokens.

### Extending Themes

1. Add a new theme definition to `src/styles/design-system/themes.ts`.
2. Extend CSS custom properties in `src/styles/design-system.css` with matching `[data-theme='new']` section.
3. `ThemeProvider` will automatically expose the theme in `supportedThemes`.
4. Update `ThemeCustomizer` copy to highlight the new palette and accessibility profile.

### Usage Example

```tsx
import {
  Card,
  CardContent,
  CardHeader,
  Badge,
  Button,
  Stack,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsPanel,
  useToast,
} from "@/components/ui";

function ConnectionSummaryCard() {
  const { publish } = useToast();

  return (
    <Card elevation="level2">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Evening Connection Ritual</h3>
            <Stack as="span" direction="horizontal" spacing="xs">
              <Badge tone="success">Scheduled</Badge>
              <Badge tone="accent">Playful</Badge>
            </Stack>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => publish({ title: "Shared plan exported", tone: "info" })}
          >
            Export Plan
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="segments">
          <TabsList>
            <TabsTrigger value="segments">Segments</TabsTrigger>
            <TabsTrigger value="aftercare">Aftercare</TabsTrigger>
          </TabsList>
          <TabsPanel value="segments">
            <Stack spacing="sm">
              <span>Breathwork Warm-Up · 10 min</span>
              <span>Discovery Prompt · 35 min</span>
              <span>Intentional Touch · 30 min</span>
            </Stack>
          </TabsPanel>
          <TabsPanel value="aftercare">
            <Stack spacing="sm">
              <span>Hydrate and stretch together</span>
              <span>Share one appreciation each</span>
              <span>Queue calm playlist in Private Gallery</span>
            </Stack>
          </TabsPanel>
        </Tabs>
      </CardContent>
    </Card>
  );
}
```

### Linting & Testing

- ESLint (`pnpm lint`) enforces JSX a11y rules.
- Include unit tests for custom component composites in `src/components/ui/__tests__` when extending functionality.
- Add Storybook stories or visual regression coverage for new primitives to ensure accessibility parity.
