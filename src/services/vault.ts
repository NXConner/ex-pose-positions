// Simple local vault using localStorage with base64 data URLs
// Not secure encryption; for true security integrate a secure storage backend.

export type VaultItem = {
  id: string;
  name: string;
  type: 'image' | 'video';
  dataUrl: string; // base64
  createdAt: number;
};

const KEY = 'private_vault_items';

export function loadVault(): VaultItem[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function saveVault(items: VaultItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

