"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";

interface Thread {
  _id: string;
  title: string;
  slug: string;
  createdBy: {
    name: string;
    email: string;
    image?: string;
  };
  status: string;
  pinned: boolean;
  replyCount: number;
  viewCount: number;
  tags: string[];
  createdAt: string;
  lastActivityAt: string;
  updatedAt: string;
}

interface WorkingGroup {
  _id: string;
  name: string;
  slug: string;
  description: string;
  isPrivate: boolean;
}

export default function WorkingGroupThreadList() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const groupSlug = params.groupSlug as string;

  const [threads, setThreads] = useState<Thread[]>([]);
  const [group, setGroup] = useState<WorkingGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchGroupAndThreads();
    }
  }, [session, groupSlug]);

  const fetchGroupAndThreads = async () => {
    try {
      setLoading(true);
      setError("");

      const groupRes = await fetch("/api/working-groups");
      const groupsData = await groupRes.json();

      if (!groupRes.ok || !groupsData.success) {
        throw new Error(groupsData.error || "Failed to fetch working groups");
      }

      const currentGroup = groupsData.data.find((g: WorkingGroup) => g.slug === groupSlug);

      if (!currentGroup) {
        setError("Working group not found");
        setLoading(false);
        return;
      }

      setGroup(currentGroup);

 const currentUser = session?.user as any;

const hasAccess =
  currentUser.role === "super_admin" ||
  currentUser.role === "admin" ||
  currentUser.role === "steering" ||
  (currentUser.workingGroups &&
    currentUser.workingGroups.includes(currentGroup._id));

if (currentGroup.isPrivate) {
  const hasPrivateAccess =
    currentUser.role === "super_admin" ||
    currentUser.role === "admin" ||
    (currentUser.workingGroups &&
      currentUser.workingGroups.includes(currentGroup._id));

  if (!hasPrivateAccess) {
    setError("You don't have access to this working group");
    setLoading(false);
    return;
  }
} else if (!hasAccess) {
  setError("You don't have access to this working group");
  setLoading(false);
  return;
}

      const threadsRes = await fetch(`/api/threads?workingGroup=${groupSlug}`);
      const threadsData = await threadsRes.json();

      if (!threadsRes.ok) {
        throw new Error(threadsData.error || "Failed to fetch threads");
      }

      setThreads(threadsData.data || []);
    } catch (err: any) {
      setError(err.message || "An error occurred");
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

  if (loading) {
    return (
      <DashboardLayout title="Loading..." userName={session?.user?.name || ""}>
        <div style={{ textAlign: "center", padding: "3rem 0" }}>
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: "var(--color-ijf-accent)" }} />
          <p style={{ color: "#6b7280", marginTop: "1rem" }}>Loading working group...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Access Denied" userName={session?.user?.name || ""}>
        <div style={{ textAlign: "center", padding: "3rem 0" }}>
          <div style={{ width: "5rem", height: "5rem", backgroundColor: "#fee2e2", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
            <svg className="w-10 h-10" style={{ color: "#dc2626" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>{error}</h3>
          <button
            onClick={() => router.push("/dashboard/forum")}
            style={{ padding: "0.75rem 1.5rem", borderRadius: "0.5rem", fontWeight: 600, backgroundColor: "var(--color-ijf-accent)", color: "var(--color-ijf-bg)", cursor: "pointer" }}
          >
            Back to Forum
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const pinnedThreads = threads.filter((t) => t.pinned);
  const regularThreads = threads.filter((t) => !t.pinned);

  const ThreadCard = ({ thread, pinned }: { thread: Thread; pinned?: boolean }) => (
    <Link href={`/dashboard/forum/${groupSlug}/${thread.slug}`}>
      <div
        className="group"
        style={{
          backgroundColor: "white",
          borderRadius: "0.75rem",
          padding: isMobile ? "1rem" : "1.5rem",
          border: pinned ? "2px solid var(--color-ijf-accent)" : "1px solid #e5e7eb",
          cursor: "pointer",
          transition: "box-shadow 0.3s",
        }}
      >
        {/* Title + status */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <h3 style={{ fontSize: isMobile ? "1rem" : pinned ? "1.25rem" : "1.125rem", fontWeight: 700, color: "#111827", flex: 1, lineHeight: 1.4 }}>
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
          <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>{formatDate(thread.lastActivityAt || thread.createdAt)}</span>
        </div>

        {/* Tags — desktop only */}
        {!isMobile && thread.tags.length > 0 && (
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
            {thread.tags.map((tag, idx) => (
              <span key={idx} style={{ padding: "0.2rem 0.5rem", backgroundColor: "#f3f4f6", borderRadius: "0.25rem", fontSize: "0.75rem", fontWeight: 500, color: "#374151" }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
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
    <DashboardLayout title={group?.name || "Working Group"} userName={session?.user?.name || ""}>
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
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: "3rem", height: "3rem", borderRadius: "0.75rem", backgroundColor: "var(--color-ijf-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <h1 style={{ fontSize: isMobile ? "1.375rem" : "1.875rem", fontWeight: 700, color: "white" }}>{group?.name}</h1>
                  {group?.isPrivate && (
                    <span style={{ padding: "0.2rem 0.6rem", fontSize: "0.7rem", fontWeight: 600, backgroundColor: "rgba(255,255,255,0.2)", color: "white", borderRadius: "9999px", border: "1px solid rgba(255,255,255,0.3)" }}>
                      Private
                    </span>
                  )}
                </div>
                {group?.description && !isMobile && (
                  <p style={{ color: "#d1d5db", marginTop: "0.25rem", fontSize: "0.875rem" }}>{group.description}</p>
                )}
              </div>
            </div>

            <button
              onClick={() => router.push(`/dashboard/forum/new?workingGroup=${groupSlug}`)}
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
        {threads.length === 0 ? (
          <div style={{ backgroundColor: "#f9fafb", borderRadius: "0.75rem", padding: "3rem", textAlign: "center", border: "2px dashed #d1d5db" }}>
            <div style={{ width: "5rem", height: "5rem", backgroundColor: "#e5e7eb", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
              <svg className="w-10 h-10" style={{ color: "#9ca3af" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>No threads yet</h3>
            <p style={{ color: "#4b5563", marginBottom: "1.5rem", maxWidth: "28rem", margin: "0 auto 1.5rem" }}>
              Be the first to start a discussion in this working group!
            </p>
            <button
              onClick={() => router.push(`/dashboard/forum/new?workingGroup=${groupSlug}`)}
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