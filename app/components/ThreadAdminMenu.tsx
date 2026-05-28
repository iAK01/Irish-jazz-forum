"use client";

import { useState, useRef, useEffect } from "react";

interface Thread {
  _id: string;
  pinned: boolean;
  status: string;
  publicToMembers?: boolean;
  workingGroups?: string[];
}

interface Props {
  thread: Thread;
  isWorkingGroup?: boolean; // show visibility toggle
  isSuperAdmin: boolean;
  onThreadUpdated: (updatedThread: Partial<Thread>) => void;
  onDeleteRequested: () => void;
}

const STATUSES = [
  { value: "active", label: "Active", color: "#166534", bg: "#dcfce7" },
  { value: "paused", label: "Paused", color: "#6b21a8", bg: "#f3e8ff" },
  { value: "stalled", label: "Stalled", color: "#854d0e", bg: "#fef9c3" },
  { value: "resolved", label: "Resolved", color: "#1e40af", bg: "#dbeafe" },
  { value: "declined", label: "Declined", color: "#9f1239", bg: "#fff1f2" },
  { value: "archived", label: "Archived", color: "#374151", bg: "#f3f4f6" },
  { value: "abandoned", label: "Abandoned", color: "#991b1b", bg: "#fee2e2" },
];

export default function ThreadAdminMenu({ thread, isWorkingGroup, isSuperAdmin, onThreadUpdated, onDeleteRequested }: Props) {
  const [open, setOpen] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowStatusPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const patch = async (body: Record<string, any>, optimisticUpdate: Partial<Thread>) => {
    setLoading(body.action);
    setError("");
    try {
      const res = await fetch(`/api/threads/${thread._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Action failed");
      onThreadUpdated(optimisticUpdate);
      setOpen(false);
      setShowStatusPicker(false);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  const handlePin = () => patch(
    { action: thread.pinned ? "unpin" : "pin" },
    { pinned: !thread.pinned }
  );

  const handleStatus = (status: string) => patch(
    { action: "setStatus", status },
    { status }
  );

  const handleVisibility = () => patch(
    { action: "setVisibility", publicToMembers: !thread.publicToMembers },
    { publicToMembers: !thread.publicToMembers }
  );

  const currentStatus = STATUSES.find(s => s.value === thread.status);

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      {/* Trigger button */}
      <button
        onClick={() => { setOpen(!open); setShowStatusPicker(false); }}
        style={{
          padding: "0.5rem",
          borderRadius: "0.5rem",
          backgroundColor: "rgba(255,255,255,0.1)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        title="Thread options"
      >
        <svg width="20" height="20" style={{ color: "white" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute",
          right: 0,
          marginTop: "0.5rem",
          width: "16rem",
          backgroundColor: "white",
          borderRadius: "0.625rem",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          border: "1px solid #e5e7eb",
          zIndex: 50,
          overflow: "hidden",
        }}>

          {/* Error */}
          {error && (
            <div style={{ padding: "0.625rem 1rem", backgroundColor: "#fef2f2", borderBottom: "1px solid #fecaca" }}>
              <p style={{ fontSize: "0.8125rem", color: "#991b1b" }}>{error}</p>
            </div>
          )}

          {/* Pin / Unpin */}
          <button
            onClick={handlePin}
            disabled={loading === "pin" || loading === "unpin"}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "0.75rem 1rem",
              fontSize: "0.875rem",
              color: "#111827",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              opacity: loading ? 0.6 : 1,
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            <span style={{ fontSize: "1rem" }}>📌</span>
            <span>{thread.pinned ? "Unpin thread" : "Pin to top"}</span>
            {(loading === "pin" || loading === "unpin") && (
              <div style={{ marginLeft: "auto", width: "0.875rem", height: "0.875rem", border: "2px solid #d1d5db", borderTopColor: "var(--color-ijf-accent)", borderRadius: "9999px", animation: "spin 0.7s linear infinite" }} />
            )}
          </button>

          {/* Change Status */}
          {!showStatusPicker ? (
            <button
              onClick={() => setShowStatusPicker(true)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "0.75rem 1rem",
                fontSize: "0.875rem",
                color: "#111827",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              <span
                style={{
                  width: "0.75rem",
                  height: "0.75rem",
                  borderRadius: "9999px",
                  backgroundColor: currentStatus?.bg || "#f3f4f6",
                  border: `2px solid ${currentStatus?.color || "#374151"}`,
                  flexShrink: 0,
                }}
              />
              <span>Change status</span>
              <span style={{ marginLeft: "auto", color: "#9ca3af", fontSize: "0.75rem" }}>
                {currentStatus?.label}
              </span>
              <svg width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <div style={{ borderBottom: "1px solid #f3f4f6" }}>
              <button
                onClick={() => setShowStatusPicker(false)}
                style={{ width: "100%", textAlign: "left", padding: "0.625rem 1rem", fontSize: "0.8125rem", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", borderBottom: "1px solid #f3f4f6" }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => handleStatus(s.value)}
                  disabled={!!loading}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "0.625rem 1rem",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    backgroundColor: thread.status === s.value ? "#f9fafb" : "white",
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  <span
                    style={{
                      width: "0.75rem",
                      height: "0.75rem",
                      borderRadius: "9999px",
                      backgroundColor: s.bg,
                      border: `2px solid ${s.color}`,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: s.color, fontWeight: thread.status === s.value ? 600 : 400 }}>{s.label}</span>
                  {thread.status === s.value && (
                    <svg width="14" height="14" fill="none" stroke={s.color} strokeWidth={2.5} viewBox="0 0 24 24" style={{ marginLeft: "auto" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {loading === "setStatus" && thread.status !== s.value && (
                    <div style={{ marginLeft: "auto", width: "0.75rem", height: "0.75rem", border: "2px solid #d1d5db", borderTopColor: "var(--color-ijf-accent)", borderRadius: "9999px", animation: "spin 0.7s linear infinite" }} />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Visibility toggle — working group threads only */}
          {isWorkingGroup && (
            <button
              onClick={handleVisibility}
              disabled={!!loading}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "0.75rem 1rem",
                fontSize: "0.875rem",
                color: "#111827",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                borderBottom: "1px solid #f3f4f6",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {thread.publicToMembers ? (
                <>
                  <svg width="16" height="16" fill="none" stroke="#92701a" strokeWidth={2} viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  <span>Make group-only</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" fill="none" stroke="#374151" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
                  </svg>
                  <span>Make public to all members</span>
                </>
              )}
              {loading === "setVisibility" && (
                <div style={{ marginLeft: "auto", width: "0.875rem", height: "0.875rem", border: "2px solid #d1d5db", borderTopColor: "var(--color-ijf-accent)", borderRadius: "9999px", animation: "spin 0.7s linear infinite" }} />
              )}
            </button>
          )}

          {/* Delete — super admin only */}
          {isSuperAdmin && (
            <button
              onClick={() => { onDeleteRequested(); setOpen(false); }}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "0.75rem 1rem",
                fontSize: "0.875rem",
                color: "#dc2626",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
              }}
            >
              <svg width="16" height="16" fill="none" stroke="#dc2626" strokeWidth={2} viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
              </svg>
              <span>Delete thread</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}