import { useState } from "react";
import { keyboardShortcuts } from "@/utils/keyboard-shortcuts";

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const shortcuts = keyboardShortcuts.getAll();

  if (shortcuts.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="neon-focus bg-slate-800 hover:bg-slate-700 duration-200 text-white rounded-lg px-3 py-1 text-sm"
        aria-label="Show keyboard shortcuts"
        title="Keyboard shortcuts (? or Ctrl+/)"
      >
        ⌨️ Shortcuts
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="neon-card rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl neon-accent font-bold">Keyboard Shortcuts</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="neon-focus bg-slate-700 hover:bg-slate-600 duration-200 text-white rounded-lg px-3 py-1"
                aria-label="Close shortcuts"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-2 text-sm">
              {shortcuts.map((shortcut, idx) => {
                const keys: string[] = [];
                if (shortcut.ctrlKey || shortcut.metaKey) keys.push("Ctrl");
                if (shortcut.shiftKey) keys.push("Shift");
                if (shortcut.altKey) keys.push("Alt");
                keys.push(shortcut.key.toUpperCase());

                return (
                  <div key={idx} className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                    <span className="text-slate-300">{shortcut.description}</span>
                    <kbd className="px-2 py-1 bg-slate-800 rounded text-xs font-mono">
                      {keys.join(" + ")}
                    </kbd>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

