import { setDoc as fsSetDoc, updateDoc as fsUpdateDoc, DocumentReference } from "firebase/firestore";
import { logger } from "@/services/logging";

const QUEUE_KEY = 'offline-db-queue';
type QueuedOp = { type: 'set' | 'update'; path: string[]; data: any };

function loadQueue(): QueuedOp[] {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch { return []; }
}
function saveQueue(q: QueuedOp[]) { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); }

export async function processQueue(db: any) {
  const q = loadQueue();
  if (q.length === 0) return;
  const remain: QueuedOp[] = [];
  for (const op of q) {
    try {
      // Lazy import to avoid circulars
      const { doc } = await import('firebase/firestore');
      const ref = doc(db, ...op.path);
      if (op.type === 'set') await fsSetDoc(ref as unknown as DocumentReference, op.data, { merge: true });
      else await fsUpdateDoc(ref as unknown as DocumentReference, op.data);
    } catch (e) {
      logger.warn('queue-op-failed', { e: String(e), op });
      remain.push(op);
    }
  }
  saveQueue(remain);
}

function enqueue(op: QueuedOp) {
  const q = loadQueue();
  q.push(op);
  saveQueue(q);
}

export async function setDocSafe(db: any, path: string[], data: any) {
  const { doc } = await import('firebase/firestore');
  if (!navigator.onLine) { enqueue({ type: 'set', path, data }); return; }
  try {
    const ref = doc(db, ...path);
    await fsSetDoc(ref as unknown as DocumentReference, data, { merge: true });
  } catch (e) {
    enqueue({ type: 'set', path, data });
  }
}

export async function updateDocSafe(db: any, path: string[], data: any) {
  const { doc } = await import('firebase/firestore');
  if (!navigator.onLine) { enqueue({ type: 'update', path, data }); return; }
  try {
    const ref = doc(db, ...path);
    await fsUpdateDoc(ref as unknown as DocumentReference, data);
  } catch (e) {
    enqueue({ type: 'update', path, data });
  }
}

