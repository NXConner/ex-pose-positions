import { useEffect, useState } from "react";

const PIN_KEY = 'app_pin';
const LOCK_KEY = 'app_locked';

export function useLock() {
  const [locked, setLocked] = useState<boolean>(() => localStorage.getItem(LOCK_KEY) === '1');
  const [hasPin, setHasPin] = useState<boolean>(() => Boolean(localStorage.getItem(PIN_KEY)));

  useEffect(() => {
    function lock() {
      if (localStorage.getItem(PIN_KEY)) {
        localStorage.setItem(LOCK_KEY, '1');
        setLocked(true);
      }
    }
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') lock();
    });
    window.addEventListener('blur', lock);
    return () => {
      window.removeEventListener('blur', lock);
    };
  }, []);

  function setPin(pin: string) {
    if (pin.length < 4 || pin.length > 6) return false;
    localStorage.setItem(PIN_KEY, pin);
    setHasPin(true);
    return true;
  }
  function clearPin() {
    localStorage.removeItem(PIN_KEY);
    setHasPin(false);
  }
  function tryUnlock(input: string) {
    const pin = localStorage.getItem(PIN_KEY);
    if (!pin) { setLocked(false); return true; }
    const ok = input === pin;
    if (ok) {
      localStorage.setItem(LOCK_KEY, '0');
      setLocked(false);
    }
    return ok;
  }

  return { locked, hasPin, setPin, clearPin, tryUnlock };
}

