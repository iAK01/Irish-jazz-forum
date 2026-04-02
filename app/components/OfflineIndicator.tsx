"use client";

import { useEffect, useState } from "react";
import { WifiOff, Send } from "lucide-react";
import { attachSyncListeners, count as queueCount } from "@/lib/offlineQueue";

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [queued, setQueued] = useState(0);
  const [justSynced, setJustSynced] = useState(0);

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => {
      setIsOffline(false);
      queueCount().then(setQueued);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    // Refresh queue count when going offline so banner shows accurate number
    window.addEventListener("offline", () => {
      queueCount().then(setQueued);
    });

    attachSyncListeners((sent) => {
      setQueued(0);
      setJustSynced(sent);
      setTimeout(() => setJustSynced(0), 4000);
    });

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (justSynced > 0) {
    return (
      <div
        style={{
          position: "fixed",
          bottom: "1.25rem",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.5rem 1rem",
          borderRadius: "9999px",
          backgroundColor: "#166534",
          color: "white",
          fontSize: "0.8125rem",
          fontWeight: 600,
          boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
          pointerEvents: "none",
        }}
      >
        <Send size={14} />
        {justSynced === 1 ? "1 post sent" : `${justSynced} posts sent`}
      </div>
    );
  }

  if (!isOffline) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.25rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem 1rem",
        borderRadius: "9999px",
        backgroundColor: "#1f2937",
        color: "#f9fafb",
        fontSize: "0.8125rem",
        fontWeight: 600,
        boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
        whiteSpace: "nowrap",
      }}
    >
      <WifiOff size={14} />
      {queued > 0
        ? `Offline — ${queued} post${queued === 1 ? "" : "s"} queued`
        : "You're offline — posts will send when reconnected"}
    </div>
  );
}
