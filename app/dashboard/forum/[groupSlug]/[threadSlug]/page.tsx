"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import PostList from "@/app/components/PostList";
import ReplyComposer from "@/app/components/ReplyComposer";
import ConfirmDeleteDialog from "@/app/components/ConfirmDeleteDialog";
import ThreadAdminMenu from "@/app/components/ThreadAdminMenu";
import ReactionBar from "@/app/components/ReactionBar";

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
  workingGroups: string[];
  publicToMembers: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  status: string;
  pinned: boolean;
  replyCount: number;
  viewCount: number;
  tags: string[];
  reactionSummary: ReactionSummary;
  currentUserReaction: "like" | "agree" | "thanks" | null;
  createdAt: string;
  updatedAt: string;
}

interface Post {
  _id: string;
  threadId: string;
  content: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  attachments: Array<{
    filename: string;
    url: string;
    mimetype: string;
    size: number;
    uploadedAt: string;
  }>;
  editedAt?: string;
  editedBy?: { name: string; email: string };
  reactionSummary: ReactionSummary;
  currentUserReaction: "like" | "agree" | "thanks" | null;
  createdAt: string;
  deleted: boolean;
}

interface WorkingGroup {
  _id: string;
  name: string;
  slug: string;
  description: string;
  isPrivate: boolean;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

interface ForumSessionUser {
  id?: string;
  _id?: string;
  role: string;
  name?: string;
  workingGroups?: string[];
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function WorkingGroupThreadView() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const groupSlug = params.groupSlug as string;
  const threadSlug = params.threadSlug as string;

  const [group, setGroup] = useState<WorkingGroup | null>(null);
  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (session?.user) fetchGroupAndThread();
  }, [session, groupSlug, threadSlug]);

  const fetchGroupAndThread = async () => {
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

      const currentUser = session?.user as ForumSessionUser;

      // Fetch thread before access check so publicToMembers can override private group restriction
      const threadRes = await fetch(`/api/threads?workingGroup=${groupSlug}`);
      const threadData = await threadRes.json();

      if (!threadRes.ok || !threadData.success) {
        throw new Error(threadData.error || "Failed to fetch thread");
      }

      const currentThread = threadData.data.find((t: Thread) => t.slug === threadSlug);
      if (!currentThread) {
        setError("Thread not found");
        setLoading(false);
        return;
      }

      // Access check: private groups block non-members UNLESS thread is publicToMembers
      if (currentGroup.isPrivate && !currentThread.publicToMembers) {
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
      }

      setThread(currentThread);
      await fetchPosts(currentThread._id, 1);

      await fetch(`/api/threads/${currentThread._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "incrementView" }),
      });
    } catch (err: unknown) {
      setError(getErrorMessage(err, "An error occurred"));
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (threadId: string, page: number) => {
    try {
      if (page > 1) setLoadingMore(true);
      const postsRes = await fetch(`/api/threads/${threadId}/posts?page=${page}`);
      const postsData = await postsRes.json();
      if (!postsRes.ok || !postsData.success) {
        throw new Error(postsData.error || "Failed to fetch posts");
      }
      if (page === 1) {
        setPosts(postsData.data || []);
      } else {
        setPosts((prev) => [...prev, ...(postsData.data || [])]);
      }
      setPagination(postsData.pagination);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "An error occurred"));
    } finally {
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (thread && pagination?.hasMore) fetchPosts(thread._id, pagination.page + 1);
  };

  const handleReplyAdded = (newPost: Post) => {
    setPosts((prev) => [...prev, newPost]);
    if (thread) setThread({ ...thread, replyCount: thread.replyCount + 1 });
  };

  const handlePostEdited = (postId: string, newContent: string) => {
    setPosts((prev) =>
      prev.map((p) => p._id === postId ? { ...p, content: newContent, editedAt: new Date().toISOString() } : p)
    );
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
    if (thread) setThread({ ...thread, replyCount: Math.max(0, thread.replyCount - 1) });
  };

  const handleThreadUpdated = (updates: Partial<Thread>) => {
    if (thread) setThread({ ...thread, ...updates });
  };

  const handleDeleteThread = async () => {
    if (!thread) return;
    try {
      setDeleting(true);
      setDeleteError("");
      const response = await fetch(`/api/threads/${thread._id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to delete thread");
      router.push(`/dashboard/forum/${groupSlug}`);
    } catch (err: unknown) {
      setDeleteError(getErrorMessage(err, "Failed to delete thread"));
      setDeleting(false);
    }
  };

  const statusStyles: Record<string, React.CSSProperties> = {
    active: { backgroundColor: "#dcfce7", color: "#166534", borderColor: "#bbf7d0" },
    resolved: { backgroundColor: "#dbeafe", color: "#1e40af", borderColor: "#bfdbfe" },
    archived: { backgroundColor: "#f3f4f6", color: "#374151", borderColor: "#e5e7eb" },
    stalled: { backgroundColor: "#fef9c3", color: "#854d0e", borderColor: "#fef08a" },
    abandoned: { backgroundColor: "#fee2e2", color: "#991b1b", borderColor: "#fecaca" },
  };

  if (loading) {
    return (
      <DashboardLayout title="Loading..." userName={session?.user?.name || ""}>
        <div style={{ textAlign: "center", padding: "3rem 0" }}>
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: "var(--color-ijf-accent)" }} />
          <p style={{ color: "#6b7280", marginTop: "1rem" }}>Loading thread...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !thread || !group) {
    return (
      <DashboardLayout title="Error" userName={session?.user?.name || ""}>
        <div style={{ textAlign: "center", padding: "3rem 0" }}>
          <div style={{ width: "5rem", height: "5rem", backgroundColor: "#fee2e2", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
            <svg style={{ color: "#dc2626", width: "2.5rem", height: "2.5rem" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>{error || "Thread not found"}</h3>
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

  const currentUser = session?.user as ForumSessionUser;
  const isAdmin = currentUser.role === "super_admin" || currentUser.role === "admin";
  const isSuperAdmin = currentUser.role === "super_admin";

  return (
    <DashboardLayout title={thread.title} userName={session?.user?.name || ""}>
      <div style={{ maxWidth: "64rem", margin: "0 auto" }}>

        {/* Breadcrumb */}
        <div style={{ marginBottom: "1.5rem", fontSize: "0.875rem", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.25rem" }}>
          <Link href="/dashboard/forum" className="hover:underline" style={{ color: "var(--color-ijf-accent)" }}>Forum</Link>
          <span style={{ color: "#9ca3af", margin: "0 0.25rem" }}>/</span>
          <Link href={`/dashboard/forum/${groupSlug}`} className="hover:underline" style={{ color: "var(--color-ijf-accent)" }}>{group.name}</Link>
          {!isMobile && (
            <>
              <span style={{ color: "#9ca3af", margin: "0 0.25rem" }}>/</span>
              <span style={{ color: "#374151" }}>{thread.title}</span>
            </>
          )}
        </div>

        {/* Header */}
        <div style={{
          marginBottom: "2rem",
          padding: isMobile ? "1.25rem" : "2rem",
          borderRadius: "0.75rem",
          background: "linear-gradient(135deg, var(--color-ijf-bg) 0%, #1a1f2e 100%)",
        }}>
          {/* Title row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", flex: 1 }}>
              {thread.pinned && <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>📌</span>}
              <h1 style={{ fontSize: isMobile ? "1.375rem" : "2rem", fontWeight: 700, color: "white", lineHeight: 1.3 }}>
                {thread.title}
              </h1>
            </div>

            {isAdmin && (
              <ThreadAdminMenu
                thread={thread}
                isWorkingGroup={true}
                isSuperAdmin={isSuperAdmin}
                onThreadUpdated={handleThreadUpdated}
                onDeleteRequested={() => setShowDeleteDialog(true)}
              />
            )}
          </div>

          {/* Status + visibility + tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
            <span style={{
              ...(statusStyles[thread.status] || statusStyles.archived),
              padding: "0.2rem 0.75rem",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: 600,
              border: "1px solid",
            }}>
              {thread.status}
            </span>

            {/* Visibility badge */}
            <span style={{
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: "0.2rem 0.75rem",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: 600,
              backgroundColor: thread.publicToMembers ? "rgba(228,185,91,0.2)" : "rgba(255,255,255,0.1)",
              color: thread.publicToMembers ? "var(--color-ijf-accent)" : "#9ca3af",
              border: `1px solid ${thread.publicToMembers ? "rgba(228,185,91,0.4)" : "rgba(255,255,255,0.15)"}`,
            }}>
              {thread.publicToMembers ? (
                <>
                  <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
                  </svg>
                  Public
                </>
              ) : (
                <>
                  <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  Group only
                </>
              )}
            </span>

            {thread.tags && thread.tags.map((tag, idx) => (
              <span key={idx} style={{ padding: "0.2rem 0.75rem", fontSize: "0.75rem", fontWeight: 500, borderRadius: "9999px", backgroundColor: "rgba(228,185,91,0.3)", color: "white" }}>
                {tag}
              </span>
            ))}
          </div>

          {/* Author + date */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem", color: "#d1d5db" }}>
            {thread.createdBy.image ? (
              <img src={thread.createdBy.image} alt={thread.createdBy.name} style={{ width: "2rem", height: "2rem", borderRadius: "9999px" }} />
            ) : (
              <div style={{ width: "2rem", height: "2rem", borderRadius: "9999px", backgroundColor: "var(--color-ijf-accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-ijf-bg)", fontSize: "0.8rem", fontWeight: 700, flexShrink: 0 }}>
                {thread.createdBy.name.charAt(0)}
              </div>
            )}
            <span style={{ color: "white", fontWeight: 500 }}>{thread.createdBy.name}</span>
            <span style={{ color: "#6b7280" }}>•</span>
            <span>{new Date(thread.createdAt).toLocaleDateString("en-IE", { day: "numeric", month: isMobile ? "short" : "long", year: "numeric" })}</span>
          </div>

          {/* Stats bar */}
          <div style={{ display: "flex", gap: "1.5rem", marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <svg style={{ color: "#d1d5db", width: "1rem", height: "1rem" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "white" }}>{thread.replyCount}</span>
              <span style={{ fontSize: "0.875rem", color: "#d1d5db" }}>replies</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <svg style={{ color: "#d1d5db", width: "1rem", height: "1rem" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "white" }}>{thread.viewCount}</span>
              <span style={{ fontSize: "0.875rem", color: "#d1d5db" }}>views</span>
            </div>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <ReactionBar
              targetType="thread"
              targetId={thread._id}
              reactionSummary={thread.reactionSummary}
              currentUserReaction={thread.currentUserReaction}
              variant="dark"
            />
          </div>

          {/* Non-active status warning */}
          {thread.status && thread.status !== "active" && thread.status !== "open" && (
            <div style={{
              ...(statusStyles[thread.status] || statusStyles.archived),
              marginTop: "1rem",
              padding: "0.75rem 1rem",
              borderRadius: "0.5rem",
              border: "1px solid",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}>
              This thread is marked as: <strong>{thread.status}</strong>
            </div>
          )}
        </div>

        {/* Delete error */}
        {deleteError && (
          <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "0.5rem" }}>
            <p style={{ color: "#991b1b", fontWeight: 500 }}>{deleteError}</p>
          </div>
        )}

        {/* Posts */}
        <div style={{ marginBottom: "2rem" }}>
          <PostList
            posts={posts}
            currentUserId={currentUser.id || currentUser._id}
            currentUserRole={currentUser.role}
            onPostEdited={handlePostEdited}
            onPostDeleted={handlePostDeleted}
          />
        </div>

        {/* Load more */}
        {pagination?.hasMore && (
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              style={{ padding: "0.75rem 2rem", borderRadius: "0.5rem", fontWeight: 600, backgroundColor: "var(--color-ijf-accent)", color: "var(--color-ijf-bg)", cursor: "pointer", opacity: loadingMore ? 0.5 : 1 }}
            >
              {loadingMore ? "Loading..." : "Load More Replies"}
            </button>
          </div>
        )}

        {/* Reply composer */}
        <div style={{ backgroundColor: "white", borderRadius: "0.75rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", border: "1px solid #f3f4f6", padding: isMobile ? "1rem" : "1.5rem" }}>
          <ReplyComposer threadId={thread._id} onReplyAdded={handleReplyAdded} workingGroup={groupSlug} />
        </div>
      </div>

      <ConfirmDeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteThread}
        title="Delete Thread"
        message="Are you sure you want to delete this thread? This will also delete all posts and attachments."
        itemName={thread.title}
        counts={{ posts: posts.length }}
        isLoading={deleting}
      />
    </DashboardLayout>
  );
}
