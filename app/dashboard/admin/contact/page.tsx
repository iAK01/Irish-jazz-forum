// /app/dashboard/admin/contact/page.tsx

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
  assignedTo?: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function AdminContactPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (session?.user) {
      const currentUser = session.user as any;
      if (currentUser.role !== "admin" && currentUser.role !== "super_admin") {
        router.push("/dashboard");
        return;
      }
      fetchSubmissions();
    }
  }, [session, statusFilter]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError("");

      const url = statusFilter === "all" 
        ? "/api/contact"
        : `/api/contact?status=${statusFilter}`;

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch submissions");
      }

      setSubmissions(data.data || []);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Contact Submissions"
        userName={session?.user?.name || ""}
      >
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-ijf-accent)' }}></div>
          <p className="text-gray-500 mt-4">Loading submissions...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Contact Submissions"
      userName={session?.user?.name || ""}
    >
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 p-8 rounded-xl" style={{ background: 'linear-gradient(135deg, var(--color-ijf-bg) 0%, #1a1f2e 100%)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-ijf-primary)' }}>
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Contact Submissions</h1>
              <p className="text-gray-300 mt-1">Manage inquiries from the public</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex gap-3">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition cursor-pointer ${
                statusFilter === "all"
                  ? "text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              style={statusFilter === "all" ? { backgroundColor: 'var(--color-ijf-accent)' } : {}}
            >
              All ({submissions.length})
            </button>
            <button
              onClick={() => setStatusFilter("new")}
              className={`px-4 py-2 rounded-lg font-medium transition cursor-pointer ${
                statusFilter === "new"
                  ? "text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              style={statusFilter === "new" ? { backgroundColor: 'var(--color-ijf-accent)' } : {}}
            >
              New
            </button>
            <button
              onClick={() => setStatusFilter("in-progress")}
              className={`px-4 py-2 rounded-lg font-medium transition cursor-pointer ${
                statusFilter === "in-progress"
                  ? "text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              style={statusFilter === "in-progress" ? { backgroundColor: 'var(--color-ijf-accent)' } : {}}
            >
              In Progress
            </button>
            <button
              onClick={() => setStatusFilter("resolved")}
              className={`px-4 py-2 rounded-lg font-medium transition cursor-pointer ${
                statusFilter === "resolved"
                  ? "text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              style={statusFilter === "resolved" ? { backgroundColor: 'var(--color-ijf-accent)' } : {}}
            >
              Resolved
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Submissions List */}
        {submissions.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No submissions found
            </h3>
            <p className="text-gray-600">
              {statusFilter === "all" 
                ? "No contact submissions yet"
                : `No ${statusFilter} submissions`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((submission) => (
              <Link
                key={submission._id}
                href={`/dashboard/admin/contact/${submission._id}`}
              >
                <div className="group bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 hover:border-gray-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            submission.status
                          )}`}
                        >
                          {submission.status}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                          {submission.inquiryType}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {submission.name}
                        {submission.organization && (
                          <span className="text-gray-500 font-normal ml-2">
                            · {submission.organization}
                          </span>
                        )}
                      </h3>

                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {submission.message}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>{submission.email}</span>
                        </div>
                        <span>•</span>
                        <span>
                          {new Date(submission.createdAt).toLocaleDateString("en-IE", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        {submission.assignedTo && (
                          <>
                            <span>•</span>
                            <span>Assigned to {submission.assignedTo.name}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <svg className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}