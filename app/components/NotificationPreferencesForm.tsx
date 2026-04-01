"use client";

import { useEffect, useState } from "react";
import type { ForumDigestPreference, UserRole } from "@/models/User";

interface NotificationPreferencesFormProps {
  userRole: UserRole;
}

const OPTION_COPY: Record<ForumDigestPreference, { title: string; description: string }> = {
  off: {
    title: "No digest emails",
    description: "Turns off forum digest emails for your account.",
  },
  weekly: {
    title: "Weekly forum digest",
    description:
      "Sends a weekly summary of general forum activity plus any working group threads you are allowed to see.",
  },
  daily: {
    title: "Daily forum digest",
    description:
      "Sends a daily update when forum discussions you can access have moved. Available to super admins only.",
  },
};

function getAvailableOptions(userRole: UserRole): ForumDigestPreference[] {
  return userRole === "super_admin"
    ? ["off", "weekly", "daily"]
    : ["off", "weekly"];
}

export default function NotificationPreferencesForm({
  userRole,
}: NotificationPreferencesFormProps) {
  const [forumDigest, setForumDigest] = useState<ForumDigestPreference>("weekly");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewThreadCount, setPreviewThreadCount] = useState<number | null>(null);
  const [previewPeriodLabel, setPreviewPeriodLabel] = useState("");

  const getErrorMessage = (value: unknown, fallback: string) =>
    value instanceof Error ? value.message : fallback;

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("en-IE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const availableOptions = getAvailableOptions(userRole);

  const loadPreview = async () => {
    try {
      setPreviewLoading(true);
      const response = await fetch(
        `/api/users/me/notifications/preview?forumDigest=${forumDigest}`
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to load digest preview");
      }

      const summary = result.data?.summary;
      setPreviewHtml(result.data?.html || "");
      setPreviewThreadCount(summary?.threadCount ?? 0);
      setPreviewPeriodLabel(
        summary?.periodStart && summary?.periodEnd
          ? `${formatDate(summary.periodStart)} to ${formatDate(summary.periodEnd)}`
          : ""
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load digest preview"));
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setLoading(true);
        const availableOptionsForUser = getAvailableOptions(userRole);
        const response = await fetch("/api/users/me/notifications");
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Failed to load notification settings");
        }

        const nextForumDigest = result.data?.forumDigest as
          | ForumDigestPreference
          | undefined;
        setForumDigest(
          nextForumDigest && availableOptionsForUser.includes(nextForumDigest)
            ? nextForumDigest
            : "weekly"
        );

        const previewResponse = await fetch(
          `/api/users/me/notifications/preview?forumDigest=${
            nextForumDigest && availableOptionsForUser.includes(nextForumDigest)
              ? nextForumDigest
              : "weekly"
          }`
        );
        const previewResult = await previewResponse.json();

        if (!previewResponse.ok || !previewResult.success) {
          throw new Error(previewResult.error || "Failed to load digest preview");
        }

        const summary = previewResult.data?.summary;
        setPreviewHtml(previewResult.data?.html || "");
        setPreviewThreadCount(summary?.threadCount ?? 0);
        setPreviewPeriodLabel(
          summary?.periodStart && summary?.periodEnd
            ? `${formatDate(summary.periodStart)} to ${formatDate(summary.periodEnd)}`
            : ""
        );
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Failed to load notification settings"));
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [userRole]);

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
        Choose whether you want a forum email round-up of activity you can
        access.
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
          display: "grid",
          gap: "0.875rem",
        }}
      >
        {availableOptions.map((option) => {
          const selected = forumDigest === option;
          const copy = OPTION_COPY[option];

          return (
            <label
              key={option}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.875rem",
                cursor: loading ? "default" : "pointer",
                opacity: loading ? 0.6 : 1,
                border: selected
                  ? "1px solid var(--color-ijf-accent)"
                  : "1px solid #e5e7eb",
                borderRadius: "0.75rem",
                padding: "1rem",
                backgroundColor: selected ? "#fffaf0" : "#fafafa",
              }}
            >
              <input
                type="radio"
                name="forumDigest"
                checked={selected}
                disabled={loading || saving}
                onChange={() => setForumDigest(option)}
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
                  {copy.title}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    color: "#6b7280",
                    lineHeight: 1.6,
                  }}
                >
                  {copy.description}
                </span>
              </span>
            </label>
          );
        })}
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
        <button
          type="button"
          onClick={loadPreview}
          disabled={loading || previewLoading}
          style={{
            padding: "0.75rem 1.25rem",
            borderRadius: "0.5rem",
            backgroundColor: "white",
            color: "#1f2937",
            fontWeight: 600,
            border: "1px solid #d1d5db",
            cursor: loading || previewLoading ? "not-allowed" : "pointer",
            opacity: loading || previewLoading ? 0.6 : 1,
          }}
        >
          {previewLoading ? "Loading Preview..." : "Refresh Digest Preview"}
        </button>
      </div>

      <div
        style={{
          marginTop: "2rem",
          borderTop: "1px solid #e5e7eb",
          paddingTop: "2rem",
        }}
      >
        <div style={{ marginBottom: "1rem" }}>
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "#111827",
              marginBottom: "0.35rem",
            }}
          >
            Current Digest Preview
          </h3>
          <p style={{ fontSize: "0.9rem", color: "#6b7280", lineHeight: 1.6 }}>
            This shows the email your account would receive right now based on
            the currently selected digest window.
          </p>
          {previewThreadCount !== null && previewPeriodLabel ? (
            <p
              style={{
                marginTop: "0.6rem",
                fontSize: "0.85rem",
                color: "#374151",
                fontWeight: 600,
              }}
            >
              {previewThreadCount} thread{previewThreadCount === 1 ? "" : "s"} for {previewPeriodLabel}
            </p>
          ) : null}
        </div>

        <div
          style={{
            border: "1px solid #d1d5db",
            borderRadius: "0.75rem",
            overflow: "hidden",
            backgroundColor: "#f8fafc",
          }}
        >
          {previewHtml ? (
            <iframe
              title="Forum digest preview"
              srcDoc={previewHtml}
              style={{
                width: "100%",
                minHeight: "820px",
                border: "0",
                backgroundColor: "white",
              }}
            />
          ) : (
            <div style={{ padding: "1.25rem", color: "#6b7280" }}>
              No preview available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
