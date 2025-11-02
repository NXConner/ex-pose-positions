/**
 * Keyboard shortcuts utility
 * Provides keyboard navigation for common actions
 */

export type KeyboardShortcut = {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
};

export class KeyboardShortcutsManager {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private enabled = true;

  /**
   * Register a keyboard shortcut
   */
  register(shortcut: KeyboardShortcut): () => void {
    const key = this.getKeyString(shortcut);
    this.shortcuts.set(key, shortcut);
    
    // Return unregister function
    return () => {
      this.shortcuts.delete(key);
    };
  }

  /**
   * Unregister a keyboard shortcut
   */
  unregister(key: string): void {
    this.shortcuts.delete(key);
  }

  /**
   * Enable/disable all shortcuts
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Handle keyboard event
   */
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.enabled) return;

    const key = this.getKeyStringFromEvent(event);
    const shortcut = this.shortcuts.get(key);

    if (shortcut) {
      event.preventDefault();
      event.stopPropagation();
      shortcut.action();
    }
  }

  private getKeyString(shortcut: KeyboardShortcut): string {
    const parts: string[] = [];
    if (shortcut.ctrlKey || shortcut.metaKey) parts.push("ctrl");
    if (shortcut.shiftKey) parts.push("shift");
    if (shortcut.altKey) parts.push("alt");
    parts.push(shortcut.key.toLowerCase());
    return parts.join("+");
  }

  private getKeyStringFromEvent(event: KeyboardEvent): string {
    const parts: string[] = [];
    if (event.ctrlKey || event.metaKey) parts.push("ctrl");
    if (event.shiftKey) parts.push("shift");
    if (event.altKey) parts.push("alt");
    parts.push(event.key.toLowerCase());
    return parts.join("+");
  }

  /**
   * Get all registered shortcuts
   */
  getAll(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }
}

// Global instance
export const keyboardShortcuts = new KeyboardShortcutsManager();

// Initialize on window load
if (typeof window !== "undefined") {
  window.addEventListener("keydown", (e) => {
    keyboardShortcuts.handleKeyDown(e);
  });
}

