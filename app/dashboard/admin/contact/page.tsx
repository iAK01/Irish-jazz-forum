"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";

interface ContactSubmission {
  _id: string;
  name: string;
  email: string;
  organization?: string;
  inquiryType: string;
  message: string;
  status: "new" | "in-progress" | "resolved";
  archived: boolean;
  assignedTo?: { name: string; email: string };
  createdAt: string;
}

type FilterTab = "active" | "resolved" | "archived";

export default function AdminContactPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<FilterTab>("active");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState("");

  useEffect(() => {
    if (session?.user) {
      const currentUser = session.user as any;
      if (currentUser.role !== "admin" && currentUser.role !== "super_admin") {
        router.push("/dashboard");
        return;
      }
      fetchSubmissions();
    }
  }, [session, tab]);

  useEffect(() => {
    setSelected(new Set());
    setBulkError("");
  }, [tab]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/contact?status=${tab}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to fetch submissions");
      setSubmissions(data.data || []);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === submissions.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(submissions.map((s) => s._id)));
    }
  };

  const handleBulkAction = async (action: string, statusValue?: string) => {
    if (selected.size === 0) return;

    if (action === "delete") {
      const ok = window.confirm(
        `Permanently delete ${selected.size} submission${selected.size > 1 ? "s" : ""}? This cannot be undone.`
      );
      if (!ok) return;
    }

    setBulkLoading(true);
    setBulkError("");

    try {
      const body: any = { ids: Array.from(selected), action };
      if (statusValue) body.status = statusValue;

      const res = await fetch("/api/contact/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Bulk action failed");

      setSelected(new Set());
      await fetchSubmissions();
    } catch (err: any) {
      setBulkError(err.message || "An error occurred");
    } finally {
      setBulkLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      new: "bg-blue-100 text-blue-800",
      "in-progress": "bg-yellow-100 text-yellow-800",
      resolved: "bg-green-100 text-green-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  const allSelected = submissions.length > 0 && selected.size === submissions.length;
  const someSelected = selected.size > 0;

  return (
    <DashboardLayout title="Enquiries" userName={session?.user?.name || ""}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8 p-8 rounded-xl" style={{ background: "linear-gradient(135deg, var(--color-ijf-bg) 0%, #1a1f2e 100%)" }}>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--color-ijf-primary)" }}>
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Enquiries</h1>
              <p className="text-gray-300 mt-1">Manage enquiries from the public</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-1">
            {(["active", "resolved", "archived"] as FilterTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition -mb-px ${
                  tab === t
                    ? "border-current"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                }`}
                style={tab === t ? { borderColor: "var(--color-ijf-accent)", color: "var(--color-ijf-accent)" } : {}}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
                {tab === t && !loading && submissions.length > 0 && (
                  <span
                    className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: "var(--color-ijf-accent)", color: "var(--color-ijf-bg)" }}
                  >
                    {submissions.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Errors */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}
        {bulkError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">{bulkError}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div
              className="inline-block animate-spin rounded-full h-12 w-12 border-b-2"
              style={{ borderColor: "var(--color-ijf-accent)" }}
            />
            <p className="text-gray-500 mt-4">Loading submissions...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No submissions</h3>
            <p className="text-gray-600">
              {tab === "active" && "No active submissions"}
              {tab === "resolved" && "No resolved submissions"}
              {tab === "archived" && "Nothing archived yet"}
            </p>
          </div>
        ) : (
          <div>
            {/* Select all */}
            <div className="flex items-center gap-3 mb-3 px-2">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded cursor-pointer"
                style={{ accentColor: "var(--color-ijf-accent)" }}
              />
              <span className="text-sm text-gray-500">
                {someSelected
                  ? `${selected.size} of ${submissions.length} selected`
                  : "Select all"}
              </span>
            </div>

            {/* List */}
            <div className="space-y-2">
              {submissions.map((submission) => (
                <div key={submission._id} className="flex items-center gap-3">
               <div className="flex-shrink-0">
  <input
    type="checkbox"
    checked={selected.has(submission._id)}
    onChange={(e) => {
      e.stopPropagation();
      toggleSelect(submission._id);
    }}
    onClick={(e) => e.stopPropagation()}
    className="w-4 h-4 rounded cursor-pointer"
    style={{ accentColor: "var(--color-ijf-accent)" }}
  />
</div>

                  <Link
                    href={`/dashboard/admin/contact/${submission._id}`}
                    className="flex-1 group bg-white rounded-xl p-5 hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-gray-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(submission.status)}`}>
                            {submission.status}
                          </span>
                          <span className="px-2.5 py-0.5 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                            {submission.inquiryType}
                          </span>
                        </div>

                        <h3 className="text-base font-semibold text-gray-900">
                          {submission.name}
                          {submission.organization && (
                            <span className="text-gray-500 font-normal ml-2">· {submission.organization}</span>
                          )}
                        </h3>

                        <p className="text-gray-500 text-sm mt-1 line-clamp-1">{submission.message}</p>

                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span>{submission.email}</span>
                          <span>·</span>
                          <span>
                            {new Date(submission.createdAt).toLocaleDateString("en-IE", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition flex-shrink-0 ml-4 mt-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bulk action bar */}
        {someSelected && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 bg-zinc-900 rounded-2xl shadow-2xl text-white">
            <span className="text-sm font-medium text-zinc-300 mr-1">
              {selected.size} selected
            </span>

            {tab !== "archived" && (
              <button
                onClick={() => handleBulkAction("archive")}
                disabled={bulkLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm font-medium transition disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M10 12v4m4-4v4" />
                </svg>
                Archive
              </button>
            )}

            {tab === "archived" && (
              <button
                onClick={() => handleBulkAction("unarchive")}
                disabled={bulkLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm font-medium transition disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Restore
              </button>
            )}

            {tab === "active" && (
              <>
                <div className="w-px h-5 bg-zinc-700 mx-1" />
                <span className="text-xs text-zinc-400">Status:</span>
                {(["new", "in-progress", "resolved"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleBulkAction("status", s)}
                    disabled={bulkLoading}
                    className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-xs font-medium transition disabled:opacity-50 capitalize"
                  >
                    {s.replace("-", " ")}
                  </button>
                ))}
              </>
            )}

            <div className="w-px h-5 bg-zinc-700 mx-1" />

            <button
              onClick={() => handleBulkAction("delete")}
              disabled={bulkLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>

            <button
              onClick={() => setSelected(new Set())}
              className="ml-1 p-1 text-zinc-500 hover:text-zinc-300 transition"
              title="Clear selection"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}