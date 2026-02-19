// /app/components/InvitationList.tsx

"use client";

import { useState } from "react";
import type { InvitationListItem } from "@/types/invitation";

interface InvitationListProps {
  invitations: InvitationListItem[];
  onUpdate?: () => void;
}

export default function InvitationList({
  invitations,
  onUpdate,
}: InvitationListProps) {
  const [filter, setFilter] = useState<"all" | "pending" | "accepted" | "expired" | "revoked">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filteredInvitations = invitations.filter((inv) => {
    if (filter === "all") return true;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

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

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to resend invitation");
      }

      alert("Invitation resent successfully!");
      if (onUpdate) onUpdate();
    } catch (error: any) {
      alert(error.message || "An error occurred");
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

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to revoke invitation");
      }

      alert("Invitation revoked successfully!");
      if (onUpdate) onUpdate();
    } catch (error: any) {
      alert(error.message || "An error occurred");
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

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to delete invitation");
      }

      alert("Invitation deleted successfully!");
      if (onUpdate) onUpdate();
    } catch (error: any) {
      alert(error.message || "An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {[
          { value: "all", label: "All" },
          { value: "pending", label: "Pending" },
          { value: "accepted", label: "Accepted" },
          { value: "expired", label: "Expired" },
          { value: "revoked", label: "Revoked" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value as any)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              filter === tab.value
                ? "border-ijf-accent text-gray-900"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Invitations Table */}
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
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-gray-900">{invitation.email}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(invitation.status)}`}>
                      {invitation.status}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      Invited by: <span className="font-medium">{invitation.invitedBy.name}</span>
                    </p>
                    <p>Sent: {formatDate(invitation.createdAt)}</p>
                    <p>Expires: {formatDate(invitation.expiresAt)}</p>
                    {invitation.memberCreated && (
                      <p className="text-green-700 font-medium">
                        ✓ Member created: {invitation.memberCreated.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  {["pending", "expired"].includes(invitation.status) && (
                    <button
                      onClick={() => handleResend(invitation._id)}
                      disabled={actionLoading === invitation._id}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === invitation._id ? "..." : "Resend"}
                    </button>
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
                  {/* Delete button - only for revoked/expired invitations */}
                  {["revoked", "expired"].includes(invitation.status) && (
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}