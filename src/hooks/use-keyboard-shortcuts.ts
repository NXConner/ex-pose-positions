import { useEffect } from "react";
import { keyboardShortcuts, KeyboardShortcut } from "@/utils/keyboard-shortcuts";

/**
 * Hook to register keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const unregisterFunctions = shortcuts.map(shortcut =>
      keyboardShortcuts.register(shortcut)
    );

    return () => {
      unregisterFunctions.forEach(unregister => unregister());
    };
  }, [shortcuts]);
}

