"use client";

import { useEffect, useState } from "react";

export default function NotificationPreferencesForm() {
  const [forumDigest, setForumDigest] = useState<"off" | "weekly">("weekly");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getErrorMessage = (value: unknown, fallback: string) =>
    value instanceof Error ? value.message : fallback;

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/users/me/notifications");
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Failed to load notification settings");
        }

        setForumDigest(result.data?.forumDigest === "off" ? "off" : "weekly");
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Failed to load notification settings"));
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch("/api/users/me/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forumDigest }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to save notification settings");
      }

      setMessage("Notification settings saved.");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to save notification settings"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "0.75rem",
        padding: "1.5rem",
        maxWidth: "42rem",
      }}
    >
      <h2
        style={{
          fontSize: "1.25rem",
          fontWeight: 700,
          color: "#111827",
          marginBottom: "0.5rem",
        }}
      >
        Forum Email Notifications
      </h2>
      <p
        style={{
          fontSize: "0.95rem",
          color: "#6b7280",
          lineHeight: 1.6,
          marginBottom: "1.5rem",
        }}
      >
        Choose whether you want a weekly email round-up of forum activity you
        can access.
      </p>

      {error && (
        <div
          style={{
            marginBottom: "1rem",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            borderRadius: "0.5rem",
            padding: "0.875rem 1rem",
          }}
        >
          {error}
        </div>
      )}

      {message && (
        <div
          style={{
            marginBottom: "1rem",
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            color: "#166534",
            borderRadius: "0.5rem",
            padding: "0.875rem 1rem",
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "0.75rem",
          padding: "1rem",
          backgroundColor: "#fafafa",
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "0.875rem",
            cursor: loading ? "default" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          <input
            type="checkbox"
            checked={forumDigest === "weekly"}
            disabled={loading || saving}
            onChange={(event) =>
              setForumDigest(event.target.checked ? "weekly" : "off")
            }
            style={{
              width: "1rem",
              height: "1rem",
              marginTop: "0.2rem",
              accentColor: "var(--color-ijf-accent)",
            }}
          />
          <span>
            <span
              style={{
                display: "block",
                fontSize: "1rem",
                fontWeight: 600,
                color: "#111827",
                marginBottom: "0.25rem",
              }}
            >
              Weekly forum digest
            </span>
            <span
              style={{
                display: "block",
                fontSize: "0.9rem",
                color: "#6b7280",
                lineHeight: 1.6,
              }}
            >
              Sends a weekly summary of general forum activity plus any working
              group threads you are allowed to see.
            </span>
          </span>
        </label>
      </div>

      <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem" }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={loading || saving}
          style={{
            padding: "0.75rem 1.25rem",
            borderRadius: "0.5rem",
            backgroundColor: "var(--color-ijf-accent)",
            color: "var(--color-ijf-bg)",
            fontWeight: 600,
            cursor: loading || saving ? "not-allowed" : "pointer",
            opacity: loading || saving ? 0.6 : 1,
          }}
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
