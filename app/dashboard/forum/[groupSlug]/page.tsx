// /app/dashboard/forum/[groupSlug]/page.tsx

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
  const groupSlug = groupSlug as string;

  const [threads, setThreads] = useState<Thread[]>([]);
  const [group, setGroup] = useState<WorkingGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.user) {
      fetchGroupAndThreads();
    }
  }, [session, groupSlug]);

  const fetchGroupAndThreads = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch working group details
      const groupRes = await fetch("/api/working-groups");
      const groupsData = await groupRes.json();

      if (!groupRes.ok || !groupsData.success) {
        throw new Error(groupsData.error || "Failed to fetch working groups");
      }

      const currentGroup = groupsData.data.find(
        (g: WorkingGroup) => g.slug === groupSlug
      );

      if (!currentGroup) {
        setError("Working group not found");
        setLoading(false);
        return;
      }

      setGroup(currentGroup);

      // Check access
      const currentUser = session?.user as any;
      const hasAccess =
        currentUser.role === "super_admin" ||
        currentUser.role === "admin" ||
        currentUser.role === "steering" ||
        (currentUser.workingGroups && currentUser.workingGroups.includes(groupSlug));

      // For private groups, only members and admins
      if (currentGroup.isPrivate) {
        const hasPrivateAccess =
          currentUser.role === "super_admin" ||
          currentUser.role === "admin" ||
          (currentUser.workingGroups && currentUser.workingGroups.includes(groupSlug));

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

      // Fetch threads for this working group
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
    return date.toLocaleDateString("en-IE", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "resolved":
        return "bg-blue-100 text-blue-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      case "stalled":
        return "bg-yellow-100 text-yellow-800";
      case "abandoned":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
          <p className="text-gray-500 mt-4">Loading working group...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        title="Access Denied"
        userName={session?.user?.name || ""}
      >
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">{error}</h3>
          <button
            onClick={() => router.push("/dashboard/forum")}
            className="px-6 py-3 rounded-lg font-semibold transition cursor-pointer"
            style={{ backgroundColor: 'var(--color-ijf-accent)', color: 'var(--color-ijf-bg)' }}
          >
            Back to Forum
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const pinnedThreads = threads.filter((t) => t.pinned);
  const regularThreads = threads.filter((t) => !t.pinned);

  return (
    <DashboardLayout
      title={group?.name || "Working Group"}
      userName={session?.user?.name || ""}
    >
      <div className="max-w-6xl mx-auto">
        
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/dashboard/forum"
            className="text-sm hover:underline"
            style={{ color: 'var(--color-ijf-accent)' }}
          >
            ← Back to Forum
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8 p-8 rounded-xl" style={{ background: 'linear-gradient(135deg, var(--color-ijf-bg) 0%, #1a1f2e 100%)' }}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-ijf-primary)' }}>
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-white">{group?.name}</h1>
                    {group?.isPrivate && (
                      <span className="px-3 py-1 text-xs font-semibold bg-white/20 text-white rounded-full border border-white/30">
                        Private
                      </span>
                    )}
                  </div>
                  {group?.description && (
                    <p className="text-gray-300 mt-1">{group.description}</p>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => router.push(`/dashboard/forum/new?workingGroup=${groupSlug}`)}
              className="px-6 py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl cursor-pointer"
              style={{ backgroundColor: 'var(--color-ijf-accent)', color: 'var(--color-ijf-bg)' }}
            >
              + New Thread
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-white/20">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <span className="text-white font-semibold">{threads.length} {threads.length === 1 ? 'thread' : 'threads'}</span>
            </div>
            {pinnedThreads.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-gray-300">📌</span>
                <span className="text-white font-semibold">{pinnedThreads.length} pinned</span>
              </div>
            )}
          </div>
        </div>

        {/* Thread List */}
        {threads.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No threads yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Be the first to start a discussion in this working group!
            </p>
            <button
              onClick={() => router.push(`/dashboard/forum/new?workingGroup=${groupSlug}`)}
              className="px-8 py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl cursor-pointer"
              style={{ backgroundColor: 'var(--color-ijf-accent)', color: 'var(--color-ijf-bg)' }}
            >
              Create First Thread
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pinned Threads */}
            {pinnedThreads.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span>📌</span>
                  <span>Pinned Threads</span>
                </h2>
                <div className="space-y-3">
                  {pinnedThreads.map((thread) => (
                    <Link
                      key={thread._id}
                      href={`/dashboard/forum/${groupSlug}/${thread.slug}`}
                    >
                      <div className="group bg-white rounded-xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-opacity-30" style={{ borderColor: 'var(--color-ijf-accent)' }}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-xl font-bold text-gray-900 group-hover:text-opacity-80 transition">
                                {thread.title}
                              </h3>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                  thread.status
                                )}`}
                              >
                                {thread.status}
                              </span>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                {thread.createdBy.image ? (
                                  <img
                                    src={thread.createdBy.image}
                                    alt={thread.createdBy.name}
                                    className="w-6 h-6 rounded-full"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: 'var(--color-ijf-accent)' }}>
                                    {thread.createdBy.name.charAt(0)}
                                  </div>
                                )}
                                <span className="font-medium">{thread.createdBy.name}</span>
                              </div>

                              <span className="text-gray-400">•</span>
                              <span>{formatDate(thread.lastActivityAt || thread.createdAt)}</span>

                              {thread.tags.length > 0 && (
                                <>
                                  <span className="text-gray-400">•</span>
                                  <div className="flex gap-2">
                                    {thread.tags.map((tag, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-1 bg-gray-100 rounded text-xs font-medium"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-6 ml-8">
                            <div className="text-center">
                              <div className="text-2xl font-bold" style={{ color: 'var(--color-ijf-primary)' }}>
                                {thread.replyCount}
                              </div>
                              <div className="text-xs text-gray-500 font-medium">replies</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-400">
                                {thread.viewCount}
                              </div>
                              <div className="text-xs text-gray-500 font-medium">views</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Regular Threads */}
            {regularThreads.length > 0 && (
              <div>
                {pinnedThreads.length > 0 && (
                  <h2 className="text-lg font-bold text-gray-900 mb-3">All Threads</h2>
                )}
                <div className="space-y-3">
                  {regularThreads.map((thread) => (
                    <Link
                      key={thread._id}
                      href={`/dashboard/forum/${groupSlug}/${thread.slug}`}
                    >
                      <div className="group bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 hover:border-gray-300">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-opacity-80 transition">
                                {thread.title}
                              </h3>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                  thread.status
                                )}`}
                              >
                                {thread.status}
                              </span>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                {thread.createdBy.image ? (
                                  <img
                                    src={thread.createdBy.image}
                                    alt={thread.createdBy.name}
                                    className="w-5 h-5 rounded-full"
                                  />
                                ) : (
                                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: 'var(--color-ijf-accent)' }}>
                                    {thread.createdBy.name.charAt(0)}
                                  </div>
                                )}
                                <span>{thread.createdBy.name}</span>
                              </div>

                              <span className="text-gray-400">•</span>
                              <span>{formatDate(thread.lastActivityAt || thread.createdAt)}</span>

                              {thread.tags.length > 0 && (
                                <>
                                  <span className="text-gray-400">•</span>
                                  <div className="flex gap-2">
                                    {thread.tags.map((tag, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-1 bg-gray-100 rounded text-xs"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-6 ml-6">
                            <div className="text-center">
                              <div className="text-xl font-bold text-gray-900">
                                {thread.replyCount}
                              </div>
                              <div className="text-xs text-gray-500">replies</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold text-gray-400">
                                {thread.viewCount}
                              </div>
                              <div className="text-xs text-gray-500">views</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}