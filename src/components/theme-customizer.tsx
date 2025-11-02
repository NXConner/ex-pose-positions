import { useState, useCallback, useEffect } from "react";

interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  glowIntensity: number;
  blurIntensity: number;
  animationSpeed: number;
  enableAnimations: boolean;
}

const DEFAULT_THEME: ThemeConfig = {
  primaryColor: '#e60076',
  secondaryColor: '#9b5cff',
  glowIntensity: 20,
  blurIntensity: 6,
  animationSpeed: 1,
  enableAnimations: true,
};

export function ThemeCustomizer() {
  const [config, setConfig] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('theme_config');
    return saved ? { ...DEFAULT_THEME, ...JSON.parse(saved) } : DEFAULT_THEME;
  });

  useEffect(() => {
    localStorage.setItem('theme_config', JSON.stringify(config));
    applyTheme(config);
  }, [config]);

  const applyTheme = useCallback((cfg: ThemeConfig) => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', cfg.primaryColor);
    root.style.setProperty('--secondary-color', cfg.secondaryColor);
    root.style.setProperty('--glow-intensity', `${cfg.glowIntensity}px`);
    root.style.setProperty('--blur-intensity', `${cfg.blurIntensity}px`);
    root.style.setProperty('--animation-speed', `${cfg.animationSpeed}s`);
    
    if (cfg.enableAnimations) {
      root.classList.add('animations-enabled');
    } else {
      root.classList.remove('animations-enabled');
    }
  }, []);

  const resetTheme = useCallback(() => {
    setConfig(DEFAULT_THEME);
    applyTheme(DEFAULT_THEME);
  }, [applyTheme]);

  return (
    <div className="w-full neon-card rounded-md p-4 flex flex-col gap-4">
      <h4 className="text-lg neon-accent">Theme Customization</h4>

      {/* Primary Color */}
      <div className="grid gap-2">
        <label className="text-sm text-slate-300">Primary Color</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={config.primaryColor}
            onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
            className="w-16 h-10 rounded border border-slate-600 cursor-pointer"
          />
          <input
            type="text"
            value={config.primaryColor}
            onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
            className="flex-1 bg-slate-900 text-white rounded px-3 py-2 border border-slate-600"
          />
        </div>
      </div>

      {/* Secondary Color */}
      <div className="grid gap-2">
        <label className="text-sm text-slate-300">Secondary Color</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={config.secondaryColor}
            onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
            className="w-16 h-10 rounded border border-slate-600 cursor-pointer"
          />
          <input
            type="text"
            value={config.secondaryColor}
            onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
            className="flex-1 bg-slate-900 text-white rounded px-3 py-2 border border-slate-600"
          />
        </div>
      </div>

      {/* Glow Intensity */}
      <div className="grid gap-2">
        <label className="text-sm text-slate-300">
          Glow Intensity: {config.glowIntensity}px
        </label>
        <input
          type="range"
          min="0"
          max="50"
          value={config.glowIntensity}
          onChange={(e) => setConfig({ ...config, glowIntensity: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Blur Intensity */}
      <div className="grid gap-2">
        <label className="text-sm text-slate-300">
          Blur Intensity: {config.blurIntensity}px
        </label>
        <input
          type="range"
          min="0"
          max="30"
          value={config.blurIntensity}
          onChange={(e) => setConfig({ ...config, blurIntensity: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Animation Speed */}
      <div className="grid gap-2">
        <label className="text-sm text-slate-300">
          Animation Speed: {config.animationSpeed}x
        </label>
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.1"
          value={config.animationSpeed}
          onChange={(e) => setConfig({ ...config, animationSpeed: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Enable Animations */}
      <div className="flex items-center justify-between">
        <label className="text-sm text-slate-300">Enable Animations</label>
        <input
          type="checkbox"
          checked={config.enableAnimations}
          onChange={(e) => setConfig({ ...config, enableAnimations: e.target.checked })}
          className="w-5 h-5"
        />
      </div>

      {/* Reset Button */}
      <button
        onClick={resetTheme}
        className="neon-focus bg-slate-700 hover:bg-slate-600 duration-200 text-white rounded-lg px-4 py-2"
      >
        Reset to Default
      </button>
    </div>
  );
}

