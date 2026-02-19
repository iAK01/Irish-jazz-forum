// /app/components/PendingMemberCard.tsx

"use client";

import { useState } from "react";
import Link from "next/link";

interface PendingMemberCardProps {
  member: {
    _id: string;
    slug: string;  // ADDED: slug field
    name: string;
    memberType: string | string[];
    region?: string;
    cityTown?: string;
    joinedAt: string;
  };
  onApprove?: () => void;
  onReject?: () => void;
}

export default function PendingMemberCard({
  member,
  onApprove,
  onReject,
}: PendingMemberCardProps) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  const handleApprove = async () => {
    if (!confirm(`Approve ${member.name}'s membership?`)) return;

    setLoading("approve");
    try {
      // CHANGED: Use slug instead of _id
      const response = await fetch(`/api/members/${member.slug}/approve`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to approve member");
      }

      if (onApprove) onApprove();
    } catch (error: any) {
      alert(error.message || "An error occurred");
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async () => {
    const reason = prompt(
      `Reject ${member.name}'s membership?\n\nOptional: Provide a reason (will be sent to the applicant):`
    );
    
    if (reason === null) return; // User cancelled

    setLoading("reject");
    try {
      // CHANGED: Use slug instead of _id
      const response = await fetch(`/api/members/${member.slug}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() || undefined }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to reject member");
      }

      if (onReject) onReject();
    } catch (error: any) {
      alert(error.message || "An error occurred");
    } finally {
      setLoading(null);
    }
  };

  const getMemberTypeLabel = (type: string | string[]) => {
    if (Array.isArray(type)) {
      return type.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(", ");
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-gray-300 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: "var(--color-ijf-accent)" }}
            >
              {getMemberTypeLabel(member.memberType)}
            </span>
            {member.region && (
              <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                {member.cityTown ? `${member.cityTown}, ${member.region}` : member.region}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600">
            Applied: {formatDate(member.joinedAt)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        {/* CHANGED: Use slug for review link */}
        <Link
          href={`/dashboard/admin/members/${member.slug}/review`}
          className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium text-sm text-center transition-colors"
        >
          Review Profile
        </Link>
        
        <button
          onClick={handleApprove}
          disabled={loading !== null}
          className="flex-1 px-4 py-2 text-white rounded-lg font-medium text-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "var(--color-ijf-accent)" }}
        >
          {loading === "approve" ? "Approving..." : "Approve"}
        </button>
        
        <button
          onClick={handleReject}
          disabled={loading !== null}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === "reject" ? "Rejecting..." : "Reject"}
        </button>
      </div>
    </div>
  );
}