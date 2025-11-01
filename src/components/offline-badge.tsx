import { useOnline } from "@/hooks/use-online";

export function OfflineBadge() {
  const online = useOnline();
  if (online) return null;
  return (
    <div role="status" aria-live="polite" className="fixed bottom-4 right-4 bg-yellow-600 text-white text-sm rounded px-3 py-1 shadow">
      Offline mode
    </div>
  );
}

