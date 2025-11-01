import { useEffect, useState } from "react";

const KEY = 'app_pin_hash';
const UNLOCK_KEY = 'app_unlocked';

async function sha256(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

export function PinLock() {
  const [hasPin, setHasPin] = useState<boolean>(() => !!localStorage.getItem(KEY));
  const [unlocked, setUnlocked] = useState<boolean>(() => localStorage.getItem(UNLOCK_KEY) === '1');
  const [digits, setDigits] = useState<string>('');
  const [mode, setMode] = useState<'set'|'enter'>(() => (localStorage.getItem(KEY) ? 'enter' : 'set'));

  useEffect(() => {
    function onVis() {
      if (document.hidden) {
        localStorage.removeItem(UNLOCK_KEY);
        setUnlocked(false);
        setDigits('');
      }
    }
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  useEffect(() => {
    if (!hasPin) return;
    if (digits.length >= 4 && digits.length <= 6) {
      (async () => {
        const hash = await sha256(digits);
        const stored = localStorage.getItem(KEY);
        if (stored && stored === hash) {
          localStorage.setItem(UNLOCK_KEY, '1');
          setUnlocked(true);
          setDigits('');
        }
      })();
    }
  }, [digits, hasPin]);

  async function setPin() {
    if (digits.length < 4 || digits.length > 6) return;
    const hash = await sha256(digits);
    localStorage.setItem(KEY, hash);
    setHasPin(true);
    setMode('enter');
    setDigits('');
  }

  if (unlocked && hasPin) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center">
      <div className="neon-card rounded-md p-4 w-80 text-center">
        <div className="neon-accent mb-2">{mode === 'set' ? 'Set PIN (4-6 digits)' : 'Enter PIN'}</div>
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          className="bg-slate-900 text-white rounded px-3 py-2 w-full text-center tracking-widest text-xl"
          autoFocus
          value={digits}
          onChange={(e)=> setDigits(e.target.value.replace(/\D/g,''))}
        />
        {mode === 'set' && (
          <button className="mt-3 neon-focus bg-pink-700 hover:bg-pink-800 text-white rounded px-3 py-1" onClick={setPin} disabled={digits.length < 4 || digits.length > 6}>Save PIN</button>
        )}
      </div>
    </div>
  );
}
