import { useEffect, useState } from "react";

export function UpdateToast() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;
      reg.addEventListener('updatefound', () => {
        const sw = reg.installing;
        if (!sw) return;
        sw.addEventListener('statechange', () => {
          if (sw.state === 'installed' && navigator.serviceWorker.controller) {
            setWaiting(sw);
            setShow(true);
          }
        });
      });
    });
  }, []);

  if (!show) return null;
  return (
    <div className="fixed bottom-4 left-4 bg-slate-800 text-white text-sm rounded px-3 py-2 shadow flex items-center gap-2">
      <span>Update available</span>
      <button className="neon-focus bg-pink-700 rounded px-2 py-0.5" onClick={() => {
        waiting?.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }}>Reload</button>
      <button className="neon-focus bg-slate-700 rounded px-2 py-0.5" onClick={() => setShow(false)}>Later</button>
    </div>
  );
}

