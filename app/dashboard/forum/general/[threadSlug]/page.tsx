// /app/dashboard/forum/general/[threadSlug]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import PostList from "@/app/components/PostList";
import ReplyComposer from "@/app/components/ReplyComposer";
import ConfirmDeleteDialog from "@/app/components/ConfirmDeleteDialog";

interface Thread {
  _id: string;
  title: string;
  slug: string;
  workingGroups: string[];
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
  editedBy?: {
    name: string;
    email: string;
  };
  createdAt: string;
  deleted: boolean;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export default function GeneralThreadView() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const threadSlug = threadSlug as string;

  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  // Delete thread state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Admin menu state
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchThread();
    }
  }, [session, threadSlug]);

  const fetchThread = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch thread details
      const threadRes = await fetch(`/api/threads?workingGroup=general`);
      const threadData = await threadRes.json();

      if (!threadRes.ok || !threadData.success) {
        throw new Error(threadData.error || "Failed to fetch thread");
      }

      const currentThread = threadData.data.find(
        (t: Thread) => t.slug === threadSlug
      );

      if (!currentThread) {
        setError("Thread not found");
        setLoading(false);
        return;
      }

      setThread(currentThread);

      // Fetch posts (first page)
      await fetchPosts(currentThread._id, 1);

      // Increment view count
      await fetch(`/api/threads/${currentThread._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "incrementView" }),
      });
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (threadId: string, page: number) => {
    try {
      if (page > 1) {
        setLoadingMore(true);
      }

      const postsRes = await fetch(
        `/api/threads/${threadId}/posts?page=${page}`
      );
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
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (thread && pagination?.hasMore) {
      fetchPosts(thread._id, pagination.page + 1);
    }
  };

  const handleReplyAdded = (newPost: Post) => {
    setPosts((prev) => [...prev, newPost]);
    if (thread) {
      setThread({ ...thread, replyCount: thread.replyCount + 1 });
    }
  };

  const handlePostEdited = (postId: string, newContent: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? { ...p, content: newContent, editedAt: new Date().toISOString() }
          : p
      )
    );
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
    if (thread) {
      setThread({ ...thread, replyCount: Math.max(0, thread.replyCount - 1) });
    }
  };

  const handleDeleteThread = async () => {
    if (!thread) return;

    try {
      setDeleting(true);
      setDeleteError("");

      const response = await fetch(`/api/threads/${thread._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to delete thread");
      }

      // Redirect to general discussion
      router.push("/dashboard/forum/general");
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete thread");
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "resolved":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "archived":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "stalled":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "abandoned":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Loading..."
        userName={session?.user?.name || ""}
      >
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-ijf-accent)' }}></div>
          <p className="text-gray-500 mt-4">Loading thread...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !thread) {
    return (
      <DashboardLayout
        title="Error"
        userName={session?.user?.name || ""}
      >
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {error || "Thread not found"}
          </h3>
          <button
            onClick={() => router.push("/dashboard/forum/general")}
            className="px-6 py-3 rounded-lg font-semibold transition cursor-pointer"
            style={{ backgroundColor: 'var(--color-ijf-accent)', color: 'var(--color-ijf-bg)' }}
          >
            Back to General Discussion
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const currentUser = session?.user as any;
  const isAdmin =
    currentUser.role === "super_admin" || currentUser.role === "admin";
  const isSuperAdmin = currentUser.role === "super_admin";

  return (
    <DashboardLayout
      title={thread.title}
      userName={session?.user?.name || ""}
    >
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/dashboard/forum"
            className="text-sm hover:underline"
            style={{ color: 'var(--color-ijf-accent)' }}
          >
            Forum
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link
            href="/dashboard/forum/general"
            className="text-sm hover:underline"
            style={{ color: 'var(--color-ijf-accent)' }}
          >
            General Discussion
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-sm text-gray-700">
            {thread.title}
          </span>
        </div>

        {/* Gradient Header */}
        <div className="mb-8 p-8 rounded-xl" style={{ background: 'linear-gradient(135deg, var(--color-ijf-bg) 0%, #1a1f2e 100%)' }}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {thread.pinned && (
                  <span className="text-3xl">📌</span>
                )}
                <h1 className="text-4xl font-bold text-white">
                  {thread.title}
                </h1>
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                    thread.status
                  )}`}
                >
                  {thread.status}
                </span>
                
                {thread.tags && thread.tags.length > 0 && (
                  <>
                    {thread.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-xs font-medium rounded-full"
                        style={{ backgroundColor: 'rgba(228, 185, 91, 0.3)', color: 'white' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  {thread.createdBy.image ? (
                    <img
                      src={thread.createdBy.image}
                      alt={thread.createdBy.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: 'var(--color-ijf-accent)' }}>
                      {thread.createdBy.name.charAt(0)}
                    </div>
                  )}
                  <span className="font-medium text-white">{thread.createdBy.name}</span>
                </div>
                <span className="text-gray-400">•</span>
                <span>
                  {new Date(thread.createdAt).toLocaleDateString("en-IE", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Admin Menu */}
            {isAdmin && (
              <div className="relative ml-4">
                <button
                  onClick={() => setShowAdminMenu(!showAdminMenu)}
                  className="p-2 rounded-lg transition cursor-pointer"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>

                {showAdminMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                    <button
                      onClick={() => {
                        alert("Pin/Unpin not yet implemented");
                        setShowAdminMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 cursor-pointer"
                    >
                      {thread.pinned ? "📌 Unpin Thread" : "📌 Pin Thread"}
                    </button>
                    <button
                      onClick={() => {
                        alert("Status change not yet implemented");
                        setShowAdminMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 border-t border-gray-100 cursor-pointer"
                    >
                      Change Status
                    </button>
                    {isSuperAdmin && (
                      <button
                        onClick={() => {
                          setShowDeleteDialog(true);
                          setShowAdminMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-red-50 text-sm text-red-600 border-t border-gray-100 cursor-pointer"
                      >
                        🗑️ Delete Thread
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-white/20">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm font-semibold text-white">{thread.replyCount}</span>
              <span className="text-sm text-gray-300">replies</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="text-sm font-semibold text-white">{thread.viewCount}</span>
              <span className="text-sm text-gray-300">views</span>
            </div>
          </div>

          {/* Status Warning */}
          {thread.status && thread.status !== "active" && thread.status !== "open" && (
            <div className={`mt-6 p-4 rounded-lg border ${getStatusColor(thread.status)}`}>
              <p className="text-sm font-medium">
                This thread is marked as: <strong>{thread.status}</strong>
              </p>
            </div>
          )}
        </div>

        {/* White Content Card - Original Post */}
        <div className="mb-8 p-8 rounded-xl bg-white shadow-lg border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Original Post</h2>
        </div>

        {/* Delete Error */}
        {deleteError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">{deleteError}</p>
          </div>
        )}

        {/* Posts */}
        <div className="mb-8">
          <PostList
            posts={posts}
            currentUserId={currentUser._id}
            currentUserRole={currentUser.role}
            onPostEdited={handlePostEdited}
            onPostDeleted={handlePostDeleted}
          />
        </div>

        {/* Load More Button */}
        {pagination?.hasMore && (
          <div className="text-center mb-8">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-8 py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: 'var(--color-ijf-accent)', color: 'var(--color-ijf-bg)' }}
            >
              {loadingMore ? "Loading..." : "Load More Replies"}
            </button>
          </div>
        )}

        {/* Reply Composer */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Add Your Reply</h3>
          <ReplyComposer 
            threadId={thread._id} 
            onReplyAdded={handleReplyAdded}
            workingGroup="general"
          />
        </div>
      </div>

      {/* Delete Thread Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteThread}
        title="Delete Thread"
        message="Are you sure you want to delete this thread? This will also delete all posts and attachments."
        itemName={thread.title}
        counts={{
          posts: posts.length,
        }}
        isLoading={deleting}
      />
    </DashboardLayout>
  );
}