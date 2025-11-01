declare const __APP_VERSION__: string;

export function VersionBadge() {
  return (
    <span className="text-xs text-slate-400">v{__APP_VERSION__}</span>
  );
}

