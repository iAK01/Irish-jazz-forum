// app/dashboard/admin/publications/page.tsx

"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";

interface Publication {
  _id: string;
  title: string;
  slug: string;
  category: "news" | "resource";
  resourceType?: string;
  status: "draft" | "members_only" | "public";
  publishedAt?: string;
  createdAt: string;
  author?: { name: string };
}

export default function PublicationsAdminPage() {
  const { data: session } = useSession();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "news" | "resource">("all");
  const [deleteTarget, setDeleteTarget] = useState<Publication | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (session?.user) fetchPublications();
  }, [session]);

  const fetchPublications = async () => {
    try {
      const res = await fetch("/api/publications");
      const data = await res.json();
      setPublications(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/publications/${deleteTarget.slug}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Failed to delete"); return; }
      setDeleteTarget(null);
      fetchPublications();
    } catch {
      alert("Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: "bg-gray-100 text-gray-600",
      members_only: "bg-amber-100 text-amber-800",
      public: "bg-green-100 text-green-800",
    };
    const labels: Record<string, string> = {
      draft: "Draft",
      members_only: "Members only",
      public: "Public",
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded ${styles[status] || "bg-gray-100 text-gray-600"}`}>
        {labels[status] || status}
      </span>
    );
  };

  const filtered = filter === "all" ? publications : publications.filter((p) => p.category === filter);

  if (!session || !["admin", "super_admin", "team"].includes(session.user.role)) {
    return (
      <DashboardLayout title="Publications" userName="Guest">
        <p>Access denied.</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Publications" userName={session.user.name}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-2">
            {["all", "news", "resource"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <Link
            href="/dashboard/admin/publications/new"
            className="px-4 py-2 rounded-lg font-medium text-white flex items-center gap-2"
            style={{ backgroundColor: "var(--color-ijf-accent)" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Publication
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-zinc-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-zinc-50 rounded-lg p-12 text-center text-zinc-500">No publications yet.</div>
        ) : (
          <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {filtered.map((pub) => (
                  <tr key={pub._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{pub.title}</div>
                      <div className="text-xs text-zinc-500">/{pub.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800 capitalize">
                        {pub.category}
                        {pub.resourceType && ` · ${pub.resourceType}`}
                      </span>
                    </td>
                    <td className="px-6 py-4">{statusBadge(pub.status)}</td>
                    <td className="px-6 py-4 text-sm text-zinc-500">
                      {pub.publishedAt
                        ? new Date(pub.publishedAt).toLocaleDateString("en-IE")
                        : new Date(pub.createdAt).toLocaleDateString("en-IE")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/admin/publications/${pub.slug}/edit`}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(pub)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Delete Publication</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Are you sure you want to delete <span className="font-semibold">"{deleteTarget.title}"</span>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg text-sm font-medium transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}