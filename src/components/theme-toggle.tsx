import { useEffect, useState } from "react";

type ThemeOption = "system" | "dark" | "neon";

const STORAGE_KEY = "app-theme";

function applyTheme(theme: ThemeOption) {
  const root = document.documentElement;
  root.classList.remove("theme-dark", "theme-neon");

  if (theme === "dark") {
    root.classList.add("theme-dark");
  } else if (theme === "neon") {
    root.classList.add("theme-neon");
  } else {
    // system: no explicit class, rely on defaults
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeOption>(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as ThemeOption) || "system";
    return saved;
  });

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="hidden max-sm:inline neon-accent">Theme</span>
      <select
        aria-label="Select theme"
        value={theme}
        onChange={(e) => setTheme(e.target.value as ThemeOption)}
        className="neon-focus bg-slate-800 text-white rounded-md px-2 py-1 border border-slate-600"
      >
        <option value="system">System</option>
        <option value="dark">Dark</option>
        <option value="neon">High-Contrast Neon</option>
      </select>
    </div>
  );
}

