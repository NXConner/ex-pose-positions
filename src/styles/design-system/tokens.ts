export type FontWeight = 300 | 400 | 500 | 600 | 700 | 800;

export interface TypographyScale {
  fontFamily: string;
  headings: {
    h1: { size: string; lineHeight: string; weight: FontWeight };
    h2: { size: string; lineHeight: string; weight: FontWeight };
    h3: { size: string; lineHeight: string; weight: FontWeight };
    h4: { size: string; lineHeight: string; weight: FontWeight };
    h5: { size: string; lineHeight: string; weight: FontWeight };
    h6: { size: string; lineHeight: string; weight: FontWeight };
  };
  body: {
    base: { size: string; lineHeight: string; weight: FontWeight };
    sm: { size: string; lineHeight: string; weight: FontWeight };
    xs: { size: string; lineHeight: string; weight: FontWeight };
  };
  monospace: string;
}

export interface ElevationScale {
  level0: string;
  level1: string;
  level2: string;
  level3: string;
}

export interface SpacingScale {
  "3xs": number;
  "2xs": number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  "2xl": number;
  "3xl": number;
}

export interface RadiusScale {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  full: string;
}

export interface MotionScale {
  fast: string;
  base: string;
  slow: string;
  easingStandard: string;
  easingEmphasized: string;
}

export const spacingScale: SpacingScale = {
  "3xs": 2,
  "2xs": 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
};

export const radiusScale: RadiusScale = {
  xs: "2px",
  sm: "4px",
  md: "8px",
  lg: "16px",
  full: "999px",
};

export const motionScale: MotionScale = {
  fast: "120ms",
  base: "180ms",
  slow: "300ms",
  easingStandard: "cubic-bezier(0.4, 0, 0.2, 1)",
  easingEmphasized: "cubic-bezier(0.35, 0, 0.25, 1)",
};

export const elevationScale: ElevationScale = {
  level0: "none",
  level1: "0 4px 12px rgba(0,0,0,0.08)",
  level2: "0 12px 32px rgba(0,0,0,0.16)",
  level3: "0 20px 48px rgba(0,0,0,0.2)",
};

export const typographyScale: TypographyScale = {
  fontFamily: "'InterVariable', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  headings: {
    h1: { size: "2.75rem", lineHeight: "3rem", weight: 700 },
    h2: { size: "2.25rem", lineHeight: "2.5rem", weight: 700 },
    h3: { size: "1.875rem", lineHeight: "2.25rem", weight: 600 },
    h4: { size: "1.5rem", lineHeight: "2rem", weight: 600 },
    h5: { size: "1.25rem", lineHeight: "1.75rem", weight: 600 },
    h6: { size: "1.125rem", lineHeight: "1.5rem", weight: 600 },
  },
  body: {
    base: { size: "1rem", lineHeight: "1.6rem", weight: 400 },
    sm: { size: "0.875rem", lineHeight: "1.4rem", weight: 400 },
    xs: { size: "0.75rem", lineHeight: "1.2rem", weight: 500 },
  },
  monospace: "'JetBrains Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', monospace",
};

