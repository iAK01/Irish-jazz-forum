// /app/dashboard/admin/deleted-items/page.tsx
// Admin page for viewing and restoring soft-deleted items

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";

interface DeletedWorkingGroup {
  _id: string;
  name: string;
  slug: string;
  deletedAt: string;
  deletedBy?: { name: string; email: string };
  threadCount: number;
  postCount: number;
  expiringSoon: boolean;
  daysUntilPermanent: number;
}

interface DeletedThread {
  _id: string;
  title: string;
  slug: string;
  workingGroups: string[];
  deletedAt: string;
  deletedBy?: { name: string; email: string };
  postCount: number;
  expiringSoon: boolean;
  daysUntilPermanent: number;
}

interface DeletedPost {
  _id: string;
  content: string;
  threadId: string;
  deletedAt: string;
  deletedBy?: { name: string; email: string };
  createdBy: { name: string; email: string };
  attachmentCount: number;
  expiringSoon: boolean;
  daysUntilPermanent: number;
}

export default function DeletedItemsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [restoring, setRestoring] = useState<string | null>(null);

  const [workingGroups, setWorkingGroups] = useState<DeletedWorkingGroup[]>([]);
  const [threads, setThreads] = useState<DeletedThread[]>([]);
  const [posts, setPosts] = useState<DeletedPost[]>([]);

  const [activeTab, setActiveTab] = useState<"workingGroups" | "threads" | "posts">("workingGroups");

  const currentUserRole = (session?.user as any)?.role;
  const isSuperAdmin = currentUserRole === "super_admin";
  const isAdmin = currentUserRole === "admin" || isSuperAdmin;

  useEffect(() => {
    if (status === "loading") return;

    if (!session || !isAdmin) {
      router.push("/dashboard");
      return;
    }

    fetchDeletedItems();
  }, [session, status]);

  const fetchDeletedItems = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/deleted-items");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch deleted items");
      }

      setWorkingGroups(data.data.workingGroups || []);
      setThreads(data.data.threads || []);
      setPosts(data.data.posts || []);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (type: string, id: string, name: string) => {
    if (!confirm(`Are you sure you want to restore "${name}"?`)) return;

    try {
      setRestoring(id);
      setError("");
      setSuccessMessage("");

      const response = await fetch("/api/deleted-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to restore item");
      }

      setSuccessMessage(`Successfully restored "${name}"`);
      fetchDeletedItems();
    } catch (err: any) {
      setError(err.message || "Failed to restore item");
    } finally {
      setRestoring(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    const stripped = content.replace(/<[^>]*>/g, "");
    if (stripped.length <= maxLength) return stripped;
    return stripped.substring(0, maxLength) + "...";
  };

  if (status === "loading" || loading) {
    return (
      <DashboardLayout title="Deleted Items" userName={session?.user?.name || ""}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  const totalDeleted = workingGroups.length + threads.length + posts.length;

  return (
    <DashboardLayout title="Deleted Items" userName={session?.user?.name || ""}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Deleted Items</h1>
          <p className="text-gray-600 mt-1">
            Review and restore soft-deleted content. Items are permanently deleted after 7 days.
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <p className="text-sm text-gray-600">Working Groups</p>
            <p className="text-2xl font-bold text-gray-900">{workingGroups.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <p className="text-sm text-gray-600">Threads</p>
            <p className="text-2xl font-bold text-gray-900">{threads.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <p className="text-sm text-gray-600">Posts</p>
            <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
          </div>
        </div>

        {totalDeleted === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow border border-gray-200 text-center">
            <p className="text-gray-600">No deleted items to display.</p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-4">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("workingGroups")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "workingGroups"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Working Groups ({workingGroups.length})
                </button>
                <button
                  onClick={() => setActiveTab("threads")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "threads"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Threads ({threads.length})
                </button>
                <button
                  onClick={() => setActiveTab("posts")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "posts"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Posts ({posts.length})
                </button>
              </nav>
            </div>

            {/* Working Groups Tab */}
            {activeTab === "workingGroups" && (
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                {workingGroups.length === 0 ? (
                  <p className="p-4 text-gray-600 text-center">No deleted working groups.</p>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deleted</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">By</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contents</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {workingGroups.map((group) => (
                        <tr key={group._id} className={group.expiringSoon ? "bg-red-50" : ""}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm font-medium text-gray-900">{group.name}</p>
                            <p className="text-xs text-gray-500">{group.slug}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(group.deletedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {group.deletedBy?.name || "Unknown"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {group.threadCount} threads, {group.postCount} posts
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm ${group.expiringSoon ? "text-red-600 font-medium" : "text-gray-600"}`}>
                              {group.daysUntilPermanent} day{group.daysUntilPermanent !== 1 ? "s" : ""}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            {isSuperAdmin && (
                              <button
                                onClick={() => handleRestore("workingGroup", group._id, group.name)}
                                disabled={restoring === group._id}
                                className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                              >
                                {restoring === group._id ? "Restoring..." : "Restore"}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Threads Tab */}
            {activeTab === "threads" && (
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                {threads.length === 0 ? (
                  <p className="p-4 text-gray-600 text-center">No deleted threads.</p>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deleted</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posts</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {threads.map((thread) => (
                        <tr key={thread._id} className={thread.expiringSoon ? "bg-red-50" : ""}>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-gray-900">{thread.title}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {thread.workingGroups.length > 0 ? thread.workingGroups.join(", ") : "General"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(thread.deletedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {thread.postCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm ${thread.expiringSoon ? "text-red-600 font-medium" : "text-gray-600"}`}>
                              {thread.daysUntilPermanent} day{thread.daysUntilPermanent !== 1 ? "s" : ""}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            {isSuperAdmin && (
                              <button
                                onClick={() => handleRestore("thread", thread._id, thread.title)}
                                disabled={restoring === thread._id}
                                className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                              >
                                {restoring === thread._id ? "Restoring..." : "Restore"}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Posts Tab */}
            {activeTab === "posts" && (
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                {posts.length === 0 ? (
                  <p className="p-4 text-gray-600 text-center">No deleted posts.</p>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deleted</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Files</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {posts.map((post) => (
                        <tr key={post._id} className={post.expiringSoon ? "bg-red-50" : ""}>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-900">{truncateContent(post.content)}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {post.createdBy?.name || "Unknown"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(post.deletedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {post.attachmentCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm ${post.expiringSoon ? "text-red-600 font-medium" : "text-gray-600"}`}>
                              {post.daysUntilPermanent} day{post.daysUntilPermanent !== 1 ? "s" : ""}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => handleRestore("post", post._id, "this post")}
                              disabled={restoring === post._id}
                              className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                            >
                              {restoring === post._id ? "Restoring..." : "Restore"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}