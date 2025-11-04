import { useMemo } from "react";

import { useTheme } from "@/styles/design-system";

export function ThemeToggle() {
  const { theme, supportedThemes, setTheme } = useTheme();

  const options = useMemo(
    () =>
      supportedThemes.map((definition) => ({
        value: definition.name,
        label: definition.name.replace(/^(.)/, (c) => c.toUpperCase()),
        description: definition.description,
      })),
    [supportedThemes]
  );

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="hidden max-sm:inline neon-accent">Theme</span>
      <select
        aria-label="Select theme"
        value={theme.name}
        onChange={(event) => setTheme(event.target.value as typeof theme.name)}
        className="neon-focus bg-slate-800 text-white rounded-md px-2 py-1 border border-slate-600"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} title={option.description}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

