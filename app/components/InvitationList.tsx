// /app/components/InvitationList.tsx

"use client";

import { useState } from "react";
import type { InvitationListItem } from "@/types/invitation";

export type InvitationFilter =
  | "all"
  | "pending"
  | "accepted"
  | "expired"
  | "revoked";

interface InvitationListProps {
  invitations: InvitationListItem[];
  filter?: InvitationFilter;
  onFilterChange?: (filter: InvitationFilter) => void;
  onUpdate?: () => void;
}

interface FollowUpModal {
  invitationId: string;
  email: string;
  inviterName: string;
}

function getDaysSince(dateString: string): number {
  return Math.floor(
    (Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24)
  );
}

function getDaysRemaining(dateString: string): number {
  return Math.floor(
    (new Date(dateString).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

function DaysRemainingBadge({ expiresAt }: { expiresAt: string }) {
  const days = getDaysRemaining(expiresAt);

  if (days < 0) {
    return (
      <span className="text-xs font-medium text-red-600">
        Expired {Math.abs(days)}d ago
      </span>
    );
  }
  if (days <= 7) {
    return (
      <span className="text-xs font-semibold text-red-600">
        ⚠ {days}d remaining
      </span>
    );
  }
  if (days <= 14) {
    return (
      <span className="text-xs font-medium text-amber-600">
        {days}d remaining
      </span>
    );
  }
  return (
    <span className="text-xs font-medium text-gray-500">
      {days}d remaining
    </span>
  );
}

export default function InvitationList({
  invitations,
  filter: controlledFilter,
  onFilterChange,
  onUpdate,
}: InvitationListProps) {
  const [internalFilter, setInternalFilter] = useState<InvitationFilter>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [followUpModal, setFollowUpModal] = useState<FollowUpModal | null>(null);
  const [followUpSubject, setFollowUpSubject] = useState("");
  const [followUpMessage, setFollowUpMessage] = useState("");
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [followUpError, setFollowUpError] = useState("");

  const filter = controlledFilter ?? internalFilter;

  const setFilter = (nextFilter: InvitationFilter) => {
    if (onFilterChange) {
      onFilterChange(nextFilter);
      return;
    }
    setInternalFilter(nextFilter);
  };

  const getErrorMessage = (error: unknown) =>
    error instanceof Error ? error.message : "An error occurred";

  const filteredInvitations = invitations.filter((inv) => {
    if (filter === "all") return true;
    if (filter === "accepted") {
      return inv.status === "accepted" || inv.status === "completed";
    }
    return inv.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "accepted":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "expired":
        return "bg-gray-100 text-gray-600 border-gray-200";
      case "revoked":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-IE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const handleResend = async (invitationId: string) => {
    if (!confirm("Resend this invitation? This will extend the expiry date by 30 days.")) return;

    setActionLoading(invitationId);
    try {
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resend" }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to resend invitation");

      alert("Invitation resent successfully!");
      if (onUpdate) onUpdate();
    } catch (error: unknown) {
      alert(getErrorMessage(error));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevoke = async (invitationId: string) => {
    if (!confirm("Revoke this invitation? This action cannot be undone.")) return;

    setActionLoading(invitationId);
    try {
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke" }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to revoke invitation");

      alert("Invitation revoked successfully!");
      if (onUpdate) onUpdate();
    } catch (error: unknown) {
      alert(getErrorMessage(error));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (invitationId: string, email: string) => {
    if (!confirm(`Permanently delete invitation for ${email}? This cannot be undone.`)) return;

    setActionLoading(invitationId);
    try {
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to delete invitation");

      alert("Invitation deleted successfully!");
      if (onUpdate) onUpdate();
    } catch (error: unknown) {
      alert(getErrorMessage(error));
    } finally {
      setActionLoading(null);
    }
  };

  const openFollowUpModal = (invitation: InvitationListItem) => {
    const inviterName = invitation.invitedBy.name || "The Irish Jazz Forum Team";
    setFollowUpModal({
      invitationId: invitation._id,
      email: invitation.email,
      inviterName,
    });
    setFollowUpSubject("Just checking in — your Irish Jazz Forum invitation");
    setFollowUpMessage(
      `Hi,\n\nI wanted to make sure you received our invitation to join the Irish Jazz Forum — it may have ended up in your spam folder.\n\nWe'd really love to have you on board. The link below will take you straight to sign-up — it only takes a couple of minutes.\n\nLet me know if you have any questions.\n\n— ${inviterName}`
    );
    setFollowUpError("");
  };

  const closeFollowUpModal = () => {
    setFollowUpModal(null);
    setFollowUpSubject("");
    setFollowUpMessage("");
    setFollowUpError("");
  };

  const handleSendFollowUp = async () => {
    if (!followUpModal) return;
    if (!followUpSubject.trim()) {
      setFollowUpError("Please enter a subject line.");
      return;
    }
    if (!followUpMessage.trim()) {
      setFollowUpError("Please enter a message.");
      return;
    }

    setFollowUpLoading(true);
    setFollowUpError("");

    try {
      const response = await fetch(`/api/invitations/${followUpModal.invitationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "followup",
          subject: followUpSubject.trim(),
          message: followUpMessage.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to send follow-up");

      closeFollowUpModal();
      alert("Follow-up sent! Invitation expiry extended by 30 days.");
      if (onUpdate) onUpdate();
    } catch (error: unknown) {
      setFollowUpError(getErrorMessage(error));
    } finally {
      setFollowUpLoading(false);
    }
  };

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        {[
          { value: "all", label: "All" },
          { value: "pending", label: "Pending" },
          { value: "accepted", label: "Accepted" },
          { value: "expired", label: "Expired" },
          { value: "revoked", label: "Revoked" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value as InvitationFilter)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
              filter === tab.value
                ? "border-ijf-accent text-gray-900"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Invitations List */}
      {filteredInvitations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No invitations found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInvitations.map((invitation) => (
            <div
              key={invitation._id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors"
            >
              {/* Email + Status row */}
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="font-semibold text-gray-900 break-all">{invitation.email}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium border flex-shrink-0 ${getStatusColor(invitation.status)}`}>
                  {invitation.status}
                </span>
              </div>

              {/* Meta */}
              <div className="text-sm text-gray-600 space-y-1 mb-3">
                <p>
                  Invited by: <span className="font-medium">{invitation.invitedBy.name}</span>
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <p>Sent: {formatDate(invitation.createdAt)} <span className="text-gray-400">({getDaysSince(invitation.createdAt)}d ago)</span></p>
                  {["pending", "expired"].includes(invitation.status) && (
                    <DaysRemainingBadge expiresAt={invitation.expiresAt} />
                  )}
                  {!["pending", "expired"].includes(invitation.status) && (
                    <p>Expires: {formatDate(invitation.expiresAt)}</p>
                  )}
                </div>
                {invitation.memberCreated && (
                  <p className="text-green-700 font-medium">
                    ✓ Member created: {invitation.memberCreated.name}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {["pending", "expired"].includes(invitation.status) && (
                  <>
                    <button
                      onClick={() => handleResend(invitation._id)}
                      disabled={actionLoading === invitation._id}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === invitation._id ? "..." : "Resend"}
                    </button>
                    <button
                      onClick={() => openFollowUpModal(invitation)}
                      disabled={actionLoading === invitation._id}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send Follow-up
                    </button>
                  </>
                )}
                {invitation.status === "pending" && (
                  <button
                    onClick={() => handleRevoke(invitation._id)}
                    disabled={actionLoading === invitation._id}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === invitation._id ? "..." : "Revoke"}
                  </button>
                )}
                {["revoked", "expired", "accepted", "completed"].includes(invitation.status) && (
                  <button
                    onClick={() => handleDelete(invitation._id, invitation.email)}
                    disabled={actionLoading === invitation._id}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-800 text-white text-sm rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === invitation._id ? "..." : "Delete"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Follow-up Modal */}
      {followUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeFollowUpModal}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Send Follow-up</h2>
                <p className="text-sm text-gray-500 mt-0.5">To: {followUpModal.email}</p>
              </div>
              <button
                onClick={closeFollowUpModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Subject line
                </label>
                <input
                  type="text"
                  value={followUpSubject}
                  onChange={(e) => setFollowUpSubject(e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Message
                </label>
                <textarea
                  value={followUpMessage}
                  onChange={(e) => setFollowUpMessage(e.target.value)}
                  rows={9}
                  className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none font-mono"
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  The sign-up link is automatically appended below your message.
                </p>
              </div>

              {/* Info banner */}
              <div className="flex items-start gap-2.5 bg-indigo-50 border border-indigo-200 rounded-lg px-3.5 py-3">
                <svg className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  Sending this follow-up will automatically extend the invitation expiry by <strong>30 days</strong> from today.
                </p>
              </div>

              {followUpError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3.5 py-3">
                  <p className="text-sm text-red-700">{followUpError}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button
                onClick={closeFollowUpModal}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendFollowUp}
                disabled={followUpLoading}
                className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {followUpLoading ? "Sending..." : "Send Follow-up"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
