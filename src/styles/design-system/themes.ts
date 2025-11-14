import { elevationScale, motionScale, radiusScale, spacingScale, typographyScale } from "./tokens";

export type ThemeName = "daybreak" | "nightshift" | "sunset" | "contrast";

export interface ThemeDefinition {
  name: ThemeName;
  description: string;
  colors: {
    background: string;
    surface: string;
    surfaceMuted: string;
    primary: string;
    primaryContrast: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    text: string;
    textMuted: string;
    outline: string;
  };
  tokens: {
    spacing: typeof spacingScale;
    radius: typeof radiusScale;
    motion: typeof motionScale;
    elevation: typeof elevationScale;
    typography: typeof typographyScale;
  };
}

export const themes: Record<ThemeName, ThemeDefinition> = {
  daybreak: {
    name: "daybreak",
    description: "Bright daylight palette optimized for outdoor operations dashboards.",
    colors: {
      background: "#f4f6fb",
      surface: "#ffffff",
      surfaceMuted: "#eef1f8",
      primary: "#2c6eeb",
      primaryContrast: "#ffffff",
      secondary: "#f97316",
      accent: "#0ea5e9",
      success: "#16a34a",
      warning: "#d97706",
      danger: "#dc2626",
      info: "#2563eb",
      text: "#0f172a",
      textMuted: "#4b5563",
      outline: "#d0d9ee",
    },
    tokens: {
      spacing: spacingScale,
      radius: radiusScale,
      motion: motionScale,
      elevation: {
        ...elevationScale,
        level1: "0 4px 18px rgba(15, 23, 42, 0.08)",
        level2: "0 16px 32px rgba(15, 23, 42, 0.12)",
        level3: "0 24px 48px rgba(15, 23, 42, 0.16)",
      },
      typography: typographyScale,
    },
  },
  nightshift: {
    name: "nightshift",
    description: "High-contrast dark mode tuned for low-light fieldwork tablets.",
    colors: {
      background: "#050810",
      surface: "#101828",
      surfaceMuted: "#1f2937",
      primary: "#60a5fa",
      primaryContrast: "#050810",
      secondary: "#fbbf24",
      accent: "#14b8a6",
      success: "#34d399",
      warning: "#f59e0b",
      danger: "#f87171",
      info: "#38bdf8",
      text: "#f8fafc",
      textMuted: "#94a3b8",
      outline: "#1e293b",
    },
    tokens: {
      spacing: spacingScale,
      radius: radiusScale,
      motion: motionScale,
      elevation: {
        level0: "none",
        level1: "0 12px 24px rgba(15, 23, 42, 0.45)",
        level2: "0 18px 32px rgba(15, 23, 42, 0.55)",
        level3: "0 28px 48px rgba(15, 23, 42, 0.6)",
      },
      typography: typographyScale,
    },
  },
  sunset: {
    name: "sunset",
    description: "Warm amber palette inspired by golden-hour connection rituals.",
    colors: {
      background: "#fff8f1",
      surface: "#fff1e6",
      surfaceMuted: "#ffe4d5",
      primary: "#ea580c",
      primaryContrast: "#fff8f1",
      secondary: "#0f766e",
      accent: "#8b5cf6",
      success: "#15803d",
      warning: "#c2410c",
      danger: "#b91c1c",
      info: "#2563eb",
      text: "#3b1f0a",
      textMuted: "#7c3f16",
      outline: "#f2bfa3",
    },
    tokens: {
      spacing: spacingScale,
      radius: radiusScale,
      motion: motionScale,
      elevation: elevationScale,
      typography: typographyScale,
    },
  },
  contrast: {
    name: "contrast",
    description: "WCAG AAA compliant palette for maximum accessibility.",
    colors: {
      background: "#000000",
      surface: "#101010",
      surfaceMuted: "#181818",
      primary: "#ffbf00",
      primaryContrast: "#000000",
      secondary: "#34d399",
      accent: "#60a5fa",
      success: "#22c55e",
      warning: "#facc15",
      danger: "#f87171",
      info: "#38bdf8",
      text: "#ffffff",
      textMuted: "#e5e5e5",
      outline: "#262626",
    },
    tokens: {
      spacing: spacingScale,
      radius: radiusScale,
      motion: motionScale,
      elevation: {
        level0: "none",
        level1: "0 0 0 2px #ffffff",
        level2: "0 0 0 3px #ffffff",
        level3: "0 0 0 4px #ffffff",
      },
      typography: {
        ...typographyScale,
        body: {
          base: { ...typographyScale.body.base, weight: 500 },
          sm: { ...typographyScale.body.sm, weight: 500 },
          xs: { ...typographyScale.body.xs, weight: 600 },
        },
      },
    },
  },
};

export function getTheme(theme: ThemeName): ThemeDefinition {
  return themes[theme];
}

