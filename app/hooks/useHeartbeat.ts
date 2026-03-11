// /app/hooks/useHeartbeat.ts

import { useEffect } from "react";
import { useSession } from "next-auth/react";

const INTERVAL_MS = 60 * 1000; // 60 seconds

export function useHeartbeat() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user) return;

    const beat = () => {
      fetch("/api/auth/heartbeat", { method: "POST" }).catch(() => {});
    };

    // Fire immediately on mount
    beat();

    const interval = setInterval(beat, INTERVAL_MS);
    return () => clearInterval(interval);
  }, [session?.user]);
}