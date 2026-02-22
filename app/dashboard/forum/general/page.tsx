"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";

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
    if (session?.user) {
      fetchThreads();
    }
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
    active: { backgroundColor: "#dcfce7", color: "#166534" },
    resolved: { backgroundColor: "#dbeafe", color: "#1e40af" },
    archived: { backgroundColor: "#f3f4f6", color: "#374151" },
    stalled: { backgroundColor: "#fef9c3", color: "#854d0e" },
    abandoned: { backgroundColor: "#fee2e2", color: "#991b1b" },
  };

  if (!session) {
    return (
      <DashboardLayout title="IJF General Discussion" userName="Guest">
        <div className="p-8">
          <p>Please sign in to access the forum.</p>
        </div>
      </DashboardLayout>
    );
  }

  const pinnedThreads = threads.filter((t) => t.pinned);
  const regularThreads = threads.filter((t) => !t.pinned);

  const ThreadCard = ({ thread, pinned }: { thread: Thread; pinned?: boolean }) => (
    <Link href={`/dashboard/forum/general/${thread.slug}`}>
      <div
        className="group bg-white rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg"
        style={{
          padding: isMobile ? "1rem" : "1.5rem",
          border: pinned ? `2px solid var(--color-ijf-accent)` : "1px solid #e5e7eb",
        }}
      >
        {/* Title row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <h3
            style={{
              fontSize: isMobile ? "1rem" : pinned ? "1.25rem" : "1.125rem",
              fontWeight: 700,
              color: "#111827",
              flex: 1,
              lineHeight: 1.4,
            }}
          >
            {thread.title}
          </h3>
          <span
            style={{
              ...(statusStyles[thread.status] || statusStyles.archived),
              padding: "0.2rem 0.6rem",
              borderRadius: "9999px",
              fontSize: "0.7rem",
              fontWeight: 600,
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            {thread.status}
          </span>
        </div>

        {/* Author + date */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
          {thread.createdBy.image ? (
            <img src={thread.createdBy.image} alt={thread.createdBy.name} style={{ width: "1.25rem", height: "1.25rem", borderRadius: "9999px" }} />
          ) : (
            <div style={{ width: "1.25rem", height: "1.25rem", borderRadius: "9999px", backgroundColor: "var(--color-ijf-accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-ijf-bg)", fontSize: "0.6rem", fontWeight: 700, flexShrink: 0 }}>
              {thread.createdBy.name.charAt(0)}
            </div>
          )}
          <span style={{ fontSize: "0.8rem", color: "#4b5563", fontWeight: 500 }}>{thread.createdBy.name}</span>
          <span style={{ color: "#d1d5db" }}>•</span>
          <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>{formatDate(thread.lastActivityAt)}</span>
        </div>

        {/* Tags — hidden on mobile, shown on desktop */}
        {!isMobile && thread.tags.length > 0 && (
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
            {thread.tags.map((tag, idx) => (
              <span key={idx} style={{ padding: "0.2rem 0.5rem", backgroundColor: "#f3f4f6", borderRadius: "0.25rem", fontSize: "0.75rem", fontWeight: 500, color: "#374151" }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats — pills on mobile, columns on desktop */}
        {isMobile ? (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <span style={{ padding: "0.2rem 0.6rem", backgroundColor: "#f3f4f6", borderRadius: "9999px", fontSize: "0.75rem", color: "#374151", fontWeight: 500 }}>
              {thread.replyCount} {thread.replyCount === 1 ? "reply" : "replies"}
            </span>
            <span style={{ padding: "0.2rem 0.6rem", backgroundColor: "#f3f4f6", borderRadius: "9999px", fontSize: "0.75rem", color: "#374151", fontWeight: 500 }}>
              {thread.viewCount} views
            </span>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-ijf-primary)" }}>{thread.replyCount}</div>
              <div style={{ fontSize: "0.7rem", color: "#6b7280" }}>replies</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#9ca3af" }}>{thread.viewCount}</div>
              <div style={{ fontSize: "0.7rem", color: "#6b7280" }}>views</div>
            </div>
          </div>
        )}
      </div>
    </Link>
  );

  return (
    <DashboardLayout title="IJF General Discussion" userName={session.user.name}>
      <div style={{ maxWidth: "72rem", margin: "0 auto" }}>

        {/* Breadcrumb */}
        <div style={{ marginBottom: "1.5rem" }}>
          <Link href="/dashboard/forum" className="text-sm hover:underline" style={{ color: "var(--color-ijf-accent)" }}>
            ← Back to Forum
          </Link>
        </div>

        {/* Header */}
        <div
          style={{
            marginBottom: "2rem",
            padding: isMobile ? "1.25rem" : "2rem",
            borderRadius: "0.75rem",
            background: "linear-gradient(135deg, var(--color-ijf-bg) 0%, #1a1f2e 100%)",
          }}
        >
          {/* Title + button */}
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: "3rem", height: "3rem", borderRadius: "0.75rem", backgroundColor: "var(--color-ijf-accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg className="w-6 h-6" style={{ color: "var(--color-ijf-bg)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <div>
                <h1 style={{ fontSize: isMobile ? "1.5rem" : "1.875rem", fontWeight: 700, color: "white" }}>General Discussion</h1>
                {!isMobile && (
                  <p style={{ color: "#d1d5db", marginTop: "0.25rem", fontSize: "0.875rem" }}>
                    Open forum for all members — announcements, general topics, and cross-group discussions
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => router.push("/dashboard/forum/new?workingGroup=general")}
              style={{
                padding: isMobile ? "0.625rem 1rem" : "0.75rem 1.5rem",
                borderRadius: "0.5rem",
                fontWeight: 600,
                backgroundColor: "var(--color-ijf-accent)",
                color: "var(--color-ijf-bg)",
                width: isMobile ? "100%" : "auto",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              + New Thread
            </button>
          </div>

          {/* Stats bar */}
          <div style={{ display: "flex", gap: "1.5rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <svg className="w-4 h-4" style={{ color: "#d1d5db" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <span style={{ color: "white", fontWeight: 600, fontSize: "0.875rem" }}>{threads.length} {threads.length === 1 ? "thread" : "threads"}</span>
            </div>
            {pinnedThreads.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>📌</span>
                <span style={{ color: "white", fontWeight: 600, fontSize: "0.875rem" }}>{pinnedThreads.length} pinned</span>
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
            <div style={{ width: "5rem", height: "5rem", backgroundColor: "#e5e7eb", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
              <svg className="w-10 h-10" style={{ color: "#9ca3af" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>No threads yet</h3>
            <p style={{ color: "#4b5563", marginBottom: "1.5rem", maxWidth: "28rem", margin: "0 auto 1.5rem" }}>
              Be the first to start a discussion! Share announcements, ideas, or questions with the community.
            </p>
            <button
              onClick={() => router.push("/dashboard/forum/new?workingGroup=general")}
              style={{ padding: "0.75rem 2rem", borderRadius: "0.5rem", fontWeight: 600, backgroundColor: "var(--color-ijf-accent)", color: "var(--color-ijf-bg)", cursor: "pointer" }}
            >
              Create First Thread
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {pinnedThreads.length > 0 && (
              <div>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#111827", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span>📌</span> Pinned Threads
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {pinnedThreads.map((thread) => <ThreadCard key={thread._id} thread={thread} pinned />)}
                </div>
              </div>
            )}

            {regularThreads.length > 0 && (
              <div>
                {pinnedThreads.length > 0 && (
                  <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#111827", margin: "1rem 0 0.75rem" }}>All Threads</h2>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {regularThreads.map((thread) => <ThreadCard key={thread._id} thread={thread} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}