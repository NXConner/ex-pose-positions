## Pavement Performance Suite UI Library

The UI layer is now composed of reusable, accessibility-reviewed primitives that sit on top of the design system token set. This page documents the available building blocks and how to integrate them.

### Design System Tokens

- Location: `src/styles/design-system/`
- Themes: `daybreak`, `nightshift`, `sunset`, `contrast`
- Tokens exposed as CSS custom properties (`--pps-*`) for colors, spacing, typography, motion, radii, and elevations.
- `ThemeProvider` automatically loads stored preference from `localStorage` (`pps.theme`) and writes tokens to the document root.

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

The theme provider may be nested deeper for multi-app shells. Use `useTheme()` to read the active theme or present a picker.

### Core Components (`src/components/ui`)

| Component | Description | Notes |
|-----------|-------------|-------|
| `Button` | Variants `primary`, `secondary`, `accent`, `outline`, `ghost`, `danger`; sizes `sm|md|lg`; optional leading/trailing icons | Keyboard/focus styles baked in |
| `Input` | Labeled form control with description/error slots and adornments | Handles `aria-describedby` and `aria-invalid` automatically |
| `Card`, `CardHeader`, `CardContent`, `CardFooter` | Surface container with optional elevations | Elevation levels map to design-system shadows |
| `Modal` | Portal-backed dialog with ESC and body-scroll locking | Provide `isOpen`, `onClose`, `title` |
| `Tabs`, `TabsList`, `TabsTrigger`, `TabsPanel` | Keyboard-navigable tabs with automatic default selection | Ensure `value` props are unique |
| `Badge` | Tone-based pill elements (`info`, `success`, `warning`, `danger`) | Supports leading/trailing icons |
| `ToastProvider`, `useToast`, `ToastViewport` | Toast notifications with tone and timeout control | `publish({ title, description, tone })` returns dismiss id |
| `Stack`, `Inline`, `Surface`, `VisuallyHidden` | Layout primitives, tokens-backed spacing | Use `spacing="lg"` etc. |

### Accessibility Checklist

- All interactive primitives expose focus states and ARIA attributes where applicable.
- `Tabs` implements arrow-key roving focus; `Modal` binds `Escape`.
- `ToastViewport` announces messages via `aria-live="polite"`.
- Use `VisuallyHidden` component for hidden labels instead of custom CSS.

### Extending Themes

1. Add a new theme definition to `src/styles/design-system/themes.ts`.
2. Extend CSS custom properties in `src/styles/design-system.css` with matching `[data-theme='new']` section.
3. `ThemeProvider` will automatically expose the theme in `supportedThemes`.

### Usage Example

```tsx
import { Card, CardContent, CardHeader, Button, Stack, Tabs, TabsList, TabsTrigger, TabsPanel, useToast } from "@/components/ui";

function EstimateSummary() {
  const { publish } = useToast();

  return (
    <Card elevation="level2">
      <CardHeader>
        <h3>Sealcoat Summary</h3>
        <Button size="sm" variant="outline" onClick={() => publish({ title: "Export queued", tone: "info" })}>
          Export PDF
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="materials">
          <TabsList>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="labor">Labor</TabsTrigger>
          </TabsList>
          <TabsPanel value="materials">
            <Stack spacing="sm">
              <span>Asphalt Emulsion: 1,250 gal</span>
              <span>Aggregate: 8,400 lbs</span>
            </Stack>
          </TabsPanel>
          <TabsPanel value="labor">
            <span>4 crew members · 2 nights</span>
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

