import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

import { getTheme, ThemeDefinition, ThemeName, themes } from "./themes";

type ThemeContextValue = {
  theme: ThemeDefinition;
  supportedThemes: ThemeDefinition[];
  setTheme: (name: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const CSS_VARIABLE_PREFIX = "--pps";

function applyThemeTokens(theme: ThemeDefinition) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.setAttribute("data-theme", theme.name);

  const entries: Array<[string, string]> = [
    [`${CSS_VARIABLE_PREFIX}-color-background`, theme.colors.background],
    [`${CSS_VARIABLE_PREFIX}-color-surface`, theme.colors.surface],
    [`${CSS_VARIABLE_PREFIX}-color-surface-muted`, theme.colors.surfaceMuted],
    [`${CSS_VARIABLE_PREFIX}-color-primary`, theme.colors.primary],
    [`${CSS_VARIABLE_PREFIX}-color-primary-contrast`, theme.colors.primaryContrast],
    [`${CSS_VARIABLE_PREFIX}-color-secondary`, theme.colors.secondary],
    [`${CSS_VARIABLE_PREFIX}-color-accent`, theme.colors.accent],
    [`${CSS_VARIABLE_PREFIX}-color-success`, theme.colors.success],
    [`${CSS_VARIABLE_PREFIX}-color-warning`, theme.colors.warning],
    [`${CSS_VARIABLE_PREFIX}-color-danger`, theme.colors.danger],
    [`${CSS_VARIABLE_PREFIX}-color-info`, theme.colors.info],
    [`${CSS_VARIABLE_PREFIX}-color-text`, theme.colors.text],
    [`${CSS_VARIABLE_PREFIX}-color-text-muted`, theme.colors.textMuted],
    [`${CSS_VARIABLE_PREFIX}-color-outline`, theme.colors.outline],
    [`${CSS_VARIABLE_PREFIX}-font-family`, theme.tokens.typography.fontFamily],
    [`${CSS_VARIABLE_PREFIX}-font-monospace`, theme.tokens.typography.monospace],
    [`${CSS_VARIABLE_PREFIX}-radius-xs`, theme.tokens.radius.xs],
    [`${CSS_VARIABLE_PREFIX}-radius-sm`, theme.tokens.radius.sm],
    [`${CSS_VARIABLE_PREFIX}-radius-md`, theme.tokens.radius.md],
    [`${CSS_VARIABLE_PREFIX}-radius-lg`, theme.tokens.radius.lg],
    [`${CSS_VARIABLE_PREFIX}-radius-full`, theme.tokens.radius.full],
    [`${CSS_VARIABLE_PREFIX}-motion-fast`, theme.tokens.motion.fast],
    [`${CSS_VARIABLE_PREFIX}-motion-base`, theme.tokens.motion.base],
    [`${CSS_VARIABLE_PREFIX}-motion-slow`, theme.tokens.motion.slow],
    [`${CSS_VARIABLE_PREFIX}-motion-easing`, theme.tokens.motion.easingStandard],
    [`${CSS_VARIABLE_PREFIX}-motion-easing-emphasized`, theme.tokens.motion.easingEmphasized],
    ["--app-bg", theme.colors.background],
    ["--app-fg", theme.colors.text],
    ["--card-bg", theme.colors.surface],
    ["--card-border", theme.colors.outline],
    ["--accent", theme.colors.accent],
  ];

  const spacing = theme.tokens.spacing;
  Object.entries(spacing).forEach(([key, value]) => {
    entries.push([`${CSS_VARIABLE_PREFIX}-space-${key}`, `${value}px`]);
  });

  Object.entries(theme.tokens.typography.headings).forEach(([tag, def]) => {
    entries.push([`${CSS_VARIABLE_PREFIX}-type-${tag}-size`, def.size]);
    entries.push([`${CSS_VARIABLE_PREFIX}-type-${tag}-line`, def.lineHeight]);
    entries.push([`${CSS_VARIABLE_PREFIX}-type-${tag}-weight`, `${def.weight}`]);
  });

  Object.entries(theme.tokens.typography.body).forEach(([label, def]) => {
    entries.push([`${CSS_VARIABLE_PREFIX}-type-body-${label}-size`, def.size]);
    entries.push([`${CSS_VARIABLE_PREFIX}-type-body-${label}-line`, def.lineHeight]);
    entries.push([`${CSS_VARIABLE_PREFIX}-type-body-${label}-weight`, `${def.weight}`]);
  });

  entries.forEach(([name, value]) => {
    root.style.setProperty(name, value);
  });
}

const THEME_STORAGE_KEY = "pps.theme";

export function ThemeProvider({ children, defaultTheme = "daybreak" }: { children: ReactNode; defaultTheme?: ThemeName }) {
  const initialTheme = useMemo(() => {
    if (typeof window === "undefined") return getTheme(defaultTheme);
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeName | null;
    if (stored && themes[stored]) {
      return getTheme(stored);
    }
    return getTheme(defaultTheme);
  }, [defaultTheme]);

  const [theme, setThemeState] = useState<ThemeDefinition>(initialTheme);

  useEffect(() => {
    applyThemeTokens(theme);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme.name);
    }
  }, [theme]);

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    supportedThemes: Object.values(themes),
    setTheme: (name) => {
      if (!themes[name]) return;
      setThemeState(getTheme(name));
    },
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

