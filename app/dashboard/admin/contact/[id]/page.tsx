"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";

interface ContactSubmission {
  _id: string;
  name: string;
  email: string;
  organization?: string;
  inquiryType: string;
  message: string;
  status: "new" | "in-progress" | "resolved";
  response?: string;
  respondedAt?: string;
  respondedBy?: { name: string; email: string };
  createdAt: string;
}

export default function ContactSubmissionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [submission, setSubmission] = useState<ContactSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reply, setReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (session?.user) {
      const user = session.user as any;
      if (user.role !== "admin" && user.role !== "super_admin") {
        router.push("/dashboard");
        return;
      }
      fetchSubmission();
    }
  }, [session, id]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/contact/${id}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to fetch submission");
      setSubmission(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!submission) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to update status");
      setSubmission(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSendReply = async () => {
    if (!reply.trim()) {
      setReplyError("Please write a reply before sending.");
      return;
    }
    setSendingReply(true);
    setReplyError("");
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: reply.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to send reply");
      setSubmission(data.data);
      setReply("");
    } catch (err: any) {
      setReplyError(err.message);
    } finally {
      setSendingReply(false);
    }
  };

  const statusStyles: Record<string, React.CSSProperties> = {
    new: { backgroundColor: "#dbeafe", color: "#1e40af" },
    "in-progress": { backgroundColor: "#fef9c3", color: "#854d0e" },
    resolved: { backgroundColor: "#dcfce7", color: "#166534" },
  };

  if (loading) {
    return (
      <DashboardLayout title="Contact Submission" userName={session?.user?.name || ""}>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: "var(--color-ijf-accent)" }} />
          <p className="text-gray-500 mt-4">Loading submission...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !submission) {
    return (
      <DashboardLayout title="Contact Submission" userName={session?.user?.name || ""}>
        <div className="p-8 bg-red-50 rounded-xl border border-red-200">
          <p className="text-red-800 font-medium">{error || "Submission not found"}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Contact Submission" userName={session?.user?.name || ""}>
      <div className="max-w-3xl mx-auto space-y-6">

        <button
          onClick={() => router.push("/dashboard/admin/contact")}
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to submissions
        </button>

        {/* Submission detail */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-700 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  style={statusStyles[submission.status]}
                >
                  {submission.status}
                </span>
                <span className="px-2.5 py-0.5 bg-zinc-100 dark:bg-zinc-700 rounded-full text-xs font-medium text-zinc-600 dark:text-zinc-300">
                  {submission.inquiryType}
                </span>
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{submission.name}</h2>
              {submission.organization && (
                <p className="text-sm text-zinc-500">{submission.organization}</p>
              )}
              <a href={`mailto:${submission.email}`} className="text-sm text-blue-600 hover:underline">
                {submission.email}
              </a>
            </div>
            <div className="text-right text-sm text-zinc-500 flex-shrink-0">
              {new Date(submission.createdAt).toLocaleDateString("en-IE", {
                day: "numeric", month: "long", year: "numeric",
              })}
              <br />
              {new Date(submission.createdAt).toLocaleTimeString("en-IE", {
                hour: "2-digit", minute: "2-digit",
              })}
            </div>
          </div>
          <div className="px-6 py-5">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Message</h3>
            <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">{submission.message}</p>
          </div>
        </div>

        {/* Status controls */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 px-6 py-5">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Update Status</h3>
          <div className="flex gap-2">
            {(["new", "in-progress", "resolved"] as const).map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                disabled={updatingStatus || submission.status === s}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
                  submission.status === s
                    ? "text-white shadow"
                    : "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600"
                }`}
                style={submission.status === s ? { backgroundColor: "var(--color-ijf-accent)", color: "var(--color-ijf-bg)" } : {}}
              >
                {s.charAt(0).toUpperCase() + s.slice(1).replace("-", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Previous response */}
        {submission.response && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 px-6 py-5">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="text-sm font-semibold text-green-800 dark:text-green-300">Reply sent</h3>
              {submission.respondedAt && (
                <span className="text-xs text-green-600 dark:text-green-400">
                  {new Date(submission.respondedAt).toLocaleDateString("en-IE")}
                  {submission.respondedBy && ` by ${submission.respondedBy.name}`}
                </span>
              )}
            </div>
            <p className="text-sm text-green-900 dark:text-green-200 whitespace-pre-wrap">{submission.response}</p>
          </div>
        )}

        {/* Reply composer */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 px-6 py-5">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            {submission.response ? "Send Another Reply" : `Reply to ${submission.name}`}
          </h3>
          <p className="text-xs text-zinc-500 mb-3">
            Will be sent to <span className="font-medium">{submission.email}</span> and status will be set to resolved.
          </p>
          <textarea
            value={reply}
            onChange={(e) => { setReply(e.target.value); setReplyError(""); }}
            rows={6}
            placeholder={`Hi ${submission.name},\n\nThank you for getting in touch...`}
            className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm resize-none"
          />
          {replyError && <p className="text-sm text-red-600 mt-2">{replyError}</p>}
          <div className="flex justify-end mt-3">
            <button
              onClick={handleSendReply}
              disabled={sendingReply || !reply.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--color-ijf-accent)", color: "var(--color-ijf-bg)" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              {sendingReply ? "Sending..." : "Send Reply"}
            </button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}