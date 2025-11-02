import { useEffect, useState, useCallback } from "react";
import { useOnline } from "./use-online";

type QueuedAction = {
  id: string;
  action: () => Promise<void>;
  timestamp: number;
  retries: number;
};

/**
 * Hook to queue actions when offline and execute when back online
 */
export function useOfflineQueue() {
  const isOnline = useOnline();
  const [queue, setQueue] = useState<QueuedAction[]>([]);
  const [processing, setProcessing] = useState(false);

  // Load queue from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("offline_queue");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only restore recent items (last 24 hours)
        const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const recent = parsed.filter((q: QueuedAction) => q.timestamp > dayAgo);
        setQueue(recent);
        if (recent.length < parsed.length) {
          localStorage.setItem("offline_queue", JSON.stringify(recent));
        }
      }
    } catch (error) {
      console.error("Failed to load offline queue:", error);
    }
  }, []);

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    if (queue.length > 0) {
      localStorage.setItem("offline_queue", JSON.stringify(queue));
    } else {
      localStorage.removeItem("offline_queue");
    }
  }, [queue]);

  // Process queue when coming back online
  useEffect(() => {
    if (isOnline && queue.length > 0 && !processing) {
      setProcessing(true);
      processQueue();
    }
  }, [isOnline, queue.length]);

  const processQueue = useCallback(async () => {
    const items = [...queue];
    setQueue([]);

    for (const item of items) {
      try {
        await item.action();
      } catch (error) {
        console.error(`Failed to execute queued action ${item.id}:`, error);
        // Re-queue if retries left
        if (item.retries < 3) {
          setQueue((prev) => [
            ...prev,
            { ...item, retries: item.retries + 1 },
          ]);
        }
      }
    }

    setProcessing(false);
  }, [queue]);

  const queueAction = useCallback(
    (action: () => Promise<void>, id?: string) => {
      const actionId = id || `action_${Date.now()}_${Math.random()}`;
      const newAction: QueuedAction = {
        id: actionId,
        action,
        timestamp: Date.now(),
        retries: 0,
      };

      if (isOnline) {
        // Try to execute immediately
        action().catch((error) => {
          console.error("Action failed, queueing:", error);
          setQueue((prev) => [...prev, newAction]);
        });
      } else {
        // Queue for later
        setQueue((prev) => [...prev, newAction]);
      }
    },
    [isOnline]
  );

  const clearQueue = useCallback(() => {
    setQueue([]);
    localStorage.removeItem("offline_queue");
  }, []);

  return {
    queue,
    queueAction,
    clearQueue,
    isProcessing: processing,
    queueLength: queue.length,
  };
}

