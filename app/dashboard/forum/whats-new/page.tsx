"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import { ReactionSummaryInline } from "@/app/components/ReactionBar";

interface ReactionSummary {
  counts: {
    like: number;
    agree: number;
    thanks: number;
  };
  total: number;
}

interface WhatsNewThread {
  _id: string;
  title: string;
  slug: string;
  replyCount: number;
  viewCount: number;
  status: string;
  pinned: boolean;
  tags: string[];
  groupName: string;
  groupSlug: string;
  lastActivityAt: string;
  createdBy: {
    name: string;
    image?: string;
  };
  reactionSummary: ReactionSummary;
}

function formatRelative(dateString: string) {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${Math.max(diffMins, 1)}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function WhatsNewPage() {
  const { data: session } = useSession();
  const [threads, setThreads] = useState<WhatsNewThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchWhatsNew();
    }
  }, [session]);

  const groupedThreads = useMemo(() => {
    const groups = new Map<string, WhatsNewThread[]>();

    for (const thread of threads) {
      const key = `${thread.groupSlug}:${thread.groupName}`;
      const current = groups.get(key) || [];
      current.push(thread);
      groups.set(key, current);
    }

    return [...groups.entries()];
  }, [threads]);

  const fetchWhatsNew = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/forum/whats-new");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to load what's new");
      }

      setThreads(result.data || []);
      setLastCheckedAt(result.meta?.previousForumVisitAt || result.meta?.lastForumVisitAt || null);

      await fetch("/api/forum/visit", { method: "POST" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load what's new");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="What's New" userName={session?.user?.name || ""}>
      <div style={{ maxWidth: "72rem", margin: "0 auto" }}>
        <div style={{ marginBottom: "1.25rem" }}>
          <Link href="/dashboard/forum" className="hover:underline" style={{ color: "var(--color-ijf-accent)", fontSize: "0.875rem" }}>
            ← Back to Forum
          </Link>
        </div>

        <div
          style={{
            marginBottom: "1.5rem",
            padding: "1.5rem 2rem",
            borderRadius: "0.75rem",
            background: "linear-gradient(135deg, var(--color-ijf-bg) 0%, #1a1f2e 100%)",
          }}
        >
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "white", margin: 0 }}>
            What&apos;s New
          </h1>
          <p style={{ color: "#d1d5db", marginTop: "0.5rem" }}>
            Threads with activity since your last forum check.
          </p>
          {lastCheckedAt && (
            <p style={{ color: "#9ca3af", marginTop: "0.5rem", fontSize: "0.8rem" }}>
              Last checked: {new Date(lastCheckedAt).toLocaleString("en-IE")}
            </p>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem 0", color: "#6b7280" }}>
            Loading updates...
          </div>
        ) : error ? (
          <div style={{ padding: "1rem", borderRadius: "0.75rem", backgroundColor: "#fef2f2", color: "#991b1b" }}>
            {error}
          </div>
        ) : threads.length === 0 ? (
          <div style={{ padding: "2rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", backgroundColor: "white" }}>
            <p style={{ color: "#374151", fontWeight: 600, marginBottom: "0.5rem" }}>
              No new thread activity right now.
            </p>
            <p style={{ color: "#6b7280" }}>
              When someone posts or revives a discussion, it will show up here.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {groupedThreads.map(([key, groupThreads]) => {
              const [, groupName] = key.split(":");

              return (
                <section
                  key={key}
                  style={{
                    backgroundColor: "white",
                    borderRadius: "0.75rem",
                    border: "1px solid #e5e7eb",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f3f4f6", backgroundColor: "#fafafa" }}>
                    <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#111827" }}>
                      {groupName}
                    </h2>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {groupThreads.map((thread) => {
                      const href =
                        thread.groupSlug === "general"
                          ? `/dashboard/forum/general/${thread.slug}`
                          : `/dashboard/forum/${thread.groupSlug}/${thread.slug}`;

                      return (
                        <Link
                          key={thread._id}
                          href={href}
                          style={{
                            textDecoration: "none",
                            color: "inherit",
                            padding: "1rem 1.25rem",
                            borderTop: "1px solid #f9fafb",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.35rem" }}>
                                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#111827" }}>
                                  {thread.title}
                                </h3>
                                <span style={{ padding: "0.15rem 0.55rem", borderRadius: "9999px", backgroundColor: "rgba(34,197,94,0.12)", color: "#166534", fontSize: "0.72rem", fontWeight: 700 }}>
                                  New activity
                                </span>
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexWrap: "wrap", color: "#6b7280", fontSize: "0.82rem" }}>
                                <span>{thread.createdBy?.name || "Unknown author"}</span>
                                <span>•</span>
                                <span>{formatRelative(thread.lastActivityAt)}</span>
                                <span>•</span>
                                <span>{thread.replyCount} replies</span>
                                <span>•</span>
                                <span>{thread.viewCount} views</span>
                              </div>

                              {thread.reactionSummary?.total > 0 && (
                                <div style={{ marginTop: "0.55rem" }}>
                                  <ReactionSummaryInline reactionSummary={thread.reactionSummary} />
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
