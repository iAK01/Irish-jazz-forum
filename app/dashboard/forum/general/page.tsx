"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

interface Thread {
  _id: string;
  title: string;
  slug: string;
  createdBy: {
    name: string;
    image?: string;
    email: string;
  };
  createdAt: string;
  lastActivityAt: string;
  status: string;
  pinned: boolean;
  replyCount: number;
  viewCount: number;
  tags: string[];
  reactionSummary: ReactionSummary;
}

export default function GeneralDiscussionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (session?.user) fetchThreads();
  }, [session]);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/threads?workingGroup=general");
      if (res.ok) {
        const data = await res.json();
        setThreads(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching threads:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" });
  };

  const statusStyles: Record<string, React.CSSProperties> = {
    resolved: { backgroundColor: "#dbeafe", color: "#1e40af" },
    archived: { backgroundColor: "#f3f4f6", color: "#374151" },
    stalled: { backgroundColor: "#fef9c3", color: "#854d0e" },
    abandoned: { backgroundColor: "#fee2e2", color: "#991b1b" },
  };

  if (!session) {
    return (
      <DashboardLayout title="IJF General Discussion" userName="Guest">
        <div className="p-8"><p>Please sign in to access the forum.</p></div>
      </DashboardLayout>
    );
  }

  const pinnedThreads = threads.filter((t) => t.pinned);
  const regularThreads = threads.filter((t) => !t.pinned);

  const ThreadRow = ({ thread }: { thread: Thread }) => {
    const isNonActive = thread.status && thread.status !== "active" && thread.status !== "open";

    return (
      <Link href={`/dashboard/forum/general/${thread.slug}`} style={{ textDecoration: "none" }}>
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            backgroundColor: "white",
            borderRadius: "0.625rem",
            border: thread.pinned ? "1.5px solid var(--color-ijf-accent)" : "1px solid #e5e7eb",
            borderLeft: thread.pinned ? "4px solid var(--color-ijf-accent)" : "1px solid #e5e7eb",
            overflow: "hidden",
            transition: "box-shadow 0.15s, transform 0.15s",
            cursor: "pointer",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
            (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
          }}
        >
          {/* Left: title + meta */}
          <div style={{ flex: 1, padding: isMobile ? "0.875rem" : "1rem 1.25rem", minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.5rem" }}>
              {thread.pinned && <span style={{ fontSize: "0.875rem", flexShrink: 0, marginTop: "0.1rem" }}>📌</span>}
              <h3 style={{
                fontSize: isMobile ? "0.9375rem" : "1rem",
                fontWeight: 600,
                color: "#111827",
                lineHeight: 1.4,
                margin: 0,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical" as React.CSSProperties["WebkitBoxOrient"],
              }}>
                {thread.title}
              </h3>
            </div>

            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.375rem" }}>
              {thread.createdBy.image ? (
                <img src={thread.createdBy.image} alt={thread.createdBy.name} style={{ width: "1.125rem", height: "1.125rem", borderRadius: "9999px", flexShrink: 0 }} />
              ) : (
                <div style={{ width: "1.125rem", height: "1.125rem", borderRadius: "9999px", backgroundColor: "var(--color-ijf-accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-ijf-bg)", fontSize: "0.5rem", fontWeight: 700, flexShrink: 0 }}>
                  {thread.createdBy.name.charAt(0)}
                </div>
              )}
              <span style={{ fontSize: "0.8125rem", color: "#4b5563", fontWeight: 500 }}>{thread.createdBy.name}</span>
              <span style={{ color: "#d1d5db", fontSize: "0.75rem" }}>·</span>
              <span style={{ fontSize: "0.8125rem", color: "#9ca3af" }}>{formatDate(thread.lastActivityAt || thread.createdAt)}</span>

              {!isMobile && thread.tags.slice(0, 3).map((tag, idx) => (
                <span key={idx} style={{ padding: "0.1rem 0.45rem", backgroundColor: "#f3f4f6", borderRadius: "0.25rem", fontSize: "0.7rem", fontWeight: 500, color: "#6b7280" }}>
                  {tag}
                </span>
              ))}

              {isNonActive && (
                <span style={{
                  ...(statusStyles[thread.status] || statusStyles.archived),
                  padding: "0.1rem 0.5rem",
                  borderRadius: "9999px",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                }}>
                  {thread.status}
                </span>
              )}
            </div>

            {thread.reactionSummary?.total > 0 && (
              <div style={{ marginTop: "0.55rem" }}>
                <ReactionSummaryInline reactionSummary={thread.reactionSummary} />
              </div>
            )}
          </div>

          {/* Right: stats */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.25rem",
            padding: isMobile ? "0.875rem 0.75rem" : "1rem 1.5rem",
            borderLeft: "1px solid #f3f4f6",
            backgroundColor: "#fafafa",
            minWidth: isMobile ? "5rem" : "6.5rem",
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", gap: isMobile ? "0.75rem" : "1.25rem", alignItems: "flex-end" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: isMobile ? "1rem" : "1.25rem", fontWeight: 700, color: "var(--color-ijf-primary)", lineHeight: 1 }}>
                  {thread.replyCount}
                </div>
                <div style={{ fontSize: "0.65rem", color: "#9ca3af", marginTop: "0.1rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>replies</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: isMobile ? "1rem" : "1.25rem", fontWeight: 700, color: "#9ca3af", lineHeight: 1 }}>
                  {thread.viewCount}
                </div>
                <div style={{ fontSize: "0.65rem", color: "#9ca3af", marginTop: "0.1rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>views</div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <DashboardLayout title="IJF General Discussion" userName={session.user?.name || ""}>
      <div style={{ maxWidth: "72rem", margin: "0 auto" }}>

        {/* Breadcrumb */}
        <div style={{ marginBottom: "1.25rem" }}>
          <Link href="/dashboard/forum" className="hover:underline" style={{ color: "var(--color-ijf-accent)", fontSize: "0.875rem" }}>
            ← Back to Forum
          </Link>
        </div>

        {/* Header */}
        <div style={{
          marginBottom: "1.5rem",
          padding: isMobile ? "1.25rem" : "1.5rem 2rem",
          borderRadius: "0.75rem",
          background: "linear-gradient(135deg, var(--color-ijf-bg) 0%, #1a1f2e 100%)",
        }}>
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: "1rem", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
              <div style={{ width: "2.75rem", height: "2.75rem", borderRadius: "0.625rem", backgroundColor: "var(--color-ijf-accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg style={{ color: "var(--color-ijf-bg)", width: "1.25rem", height: "1.25rem" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <div>
                <h1 style={{ fontSize: isMobile ? "1.25rem" : "1.5rem", fontWeight: 700, color: "white", margin: 0 }}>General Discussion</h1>
                {!isMobile && (
                  <p style={{ color: "#9ca3af", marginTop: "0.2rem", fontSize: "0.8125rem" }}>
                    Open forum for all members — announcements, general topics, and cross-group discussions
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => router.push("/dashboard/forum/new?workingGroup=general")}
              style={{
                padding: "0.625rem 1.25rem",
                borderRadius: "0.5rem",
                fontWeight: 600,
                backgroundColor: "var(--color-ijf-accent)",
                color: "var(--color-ijf-bg)",
                width: isMobile ? "100%" : "auto",
                cursor: "pointer",
                fontSize: "0.875rem",
                whiteSpace: "nowrap",
              }}
            >
              + New Thread
            </button>
          </div>

          <div style={{ display: "flex", gap: "1.5rem", paddingTop: "0.875rem", borderTop: "1px solid rgba(255,255,255,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <svg style={{ color: "#9ca3af", width: "0.875rem", height: "0.875rem" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <span style={{ color: "white", fontWeight: 600, fontSize: "0.8125rem" }}>{threads.length} {threads.length === 1 ? "thread" : "threads"}</span>
            </div>
            {pinnedThreads.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ fontSize: "0.8125rem" }}>📌</span>
                <span style={{ color: "white", fontWeight: 600, fontSize: "0.8125rem" }}>{pinnedThreads.length} pinned</span>
              </div>
            )}
          </div>
        </div>

        {/* Thread list */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: "var(--color-ijf-accent)" }} />
            <p style={{ color: "#6b7280", marginTop: "1rem" }}>Loading threads...</p>
          </div>
        ) : threads.length === 0 ? (
          <div style={{ backgroundColor: "#f9fafb", borderRadius: "0.75rem", padding: "3rem", textAlign: "center", border: "2px dashed #d1d5db" }}>
            <div style={{ width: "4rem", height: "4rem", backgroundColor: "#e5e7eb", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
              <svg style={{ color: "#9ca3af", width: "2rem", height: "2rem" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>No threads yet</h3>
            <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>Be the first to start a discussion with the community.</p>
            <button
              onClick={() => router.push("/dashboard/forum/new?workingGroup=general")}
              style={{ padding: "0.75rem 2rem", borderRadius: "0.5rem", fontWeight: 600, backgroundColor: "var(--color-ijf-accent)", color: "var(--color-ijf-bg)", cursor: "pointer" }}
            >
              Create First Thread
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {pinnedThreads.map((thread) => <ThreadRow key={thread._id} thread={thread} />)}

            {pinnedThreads.length > 0 && regularThreads.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.25rem 0" }}>
                <div style={{ flex: 1, height: "1px", backgroundColor: "#e5e7eb" }} />
                <span style={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 500 }}>All threads</span>
                <div style={{ flex: 1, height: "1px", backgroundColor: "#e5e7eb" }} />
              </div>
            )}

            {regularThreads.map((thread) => <ThreadRow key={thread._id} thread={thread} />)}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
