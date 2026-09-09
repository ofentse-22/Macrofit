import { useEffect, useState } from "react";
import { getQueueSize, subscribeQueue } from "../services/offlineQueue";

export default function SyncIndicator() {
  const [offline, setOffline] = useState(() => !navigator.onLine);
  const [queued, setQueued] = useState(() => getQueueSize());

  useEffect(() => {
    const update = () => {
      setOffline(!navigator.onLine);
      setQueued(getQueueSize());
    };
    const unsubscribe = subscribeQueue(update);
    return unsubscribe;
  }, []);

  if (!offline && queued === 0) return null;

  return (
    <div className="sync-indicator" role="status" aria-live="polite">
      {offline ? "Offline - changes will sync" : `Syncing ${queued} change${queued === 1 ? "" : "s"}`}
    </div>
  );
}
