// /app/dashboard/admin/members/[slug]/review/page.tsx
// FIXED: Changed from [memberId] to [slug]

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface MemberReview {
  _id: string;
  name: string;
  slug: string;
  memberType: string | string[];
  region?: string;
  cityTown?: string;
  county?: string;
  shortTagline?: string;
  longBio?: string;
  logoUrl?: string;
  geographicReach?: string;
  primaryArtformTags: string[];
  activityModes: string[];
  joinedAt: string;
  membershipStatus: string;
}

export default function MemberReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { slug } = await params as string;  // CHANGED from memberId

  const [member, setMember] = useState<MemberReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (slug) {
      fetchMember();
    }
  }, [slug]);

  const fetchMember = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/members/${slug}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch member");
      }

      setMember(data.data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm(`Approve ${member?.name}'s membership?`)) return;

    setActionLoading("approve");
    try {
      const response = await fetch(`/api/members/${slug}/approve`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to approve member");
      }

      alert("Member approved successfully!");
      router.push("/dashboard/admin/members/pending");
    } catch (error: any) {
      alert(error.message || "An error occurred");
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    const reason = prompt(
      `Reject ${member?.name}'s membership?\n\nOptional: Provide a reason (will be sent to the applicant):`
    );

    if (reason === null) return;

    setActionLoading("reject");
    try {
      const response = await fetch(`/api/members/${slug}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() || undefined }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to reject member");
      }

      alert("Member rejected successfully!");
      router.push("/dashboard/admin/members/pending");
    } catch (error: any) {
      alert(error.message || "An error occurred");
      setActionLoading(null);
    }
  };

  const getMemberTypeLabel = (type: string | string[]) => {
    if (Array.isArray(type)) {
      return type.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(", ");
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 text-center">
          <p className="text-red-800 font-medium">{error || "Member not found"}</p>
          <Link
            href="/dashboard/admin/members/pending"
            className="inline-block mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium"
          >
            Back to Pending Members
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Back Link */}
      <Link
        href="/dashboard/admin/members/pending"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Pending Members
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{member.name}</h1>
            <p className="text-gray-600 mt-2">Review member application</p>
          </div>
          <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-semibold text-sm border-2 border-yellow-200">
            Pending Approval
          </span>
        </div>
      </div>

      {/* Member Profile */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-8 mb-6">
        <div className="space-y-6">
          {/* Logo */}
          {member.logoUrl && (
            <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
              <img src={member.logoUrl} alt={member.name} className="w-24 h-24 object-contain rounded-lg border-2 border-gray-200" />
              <div>
                <p className="text-sm text-gray-600 font-medium">Organization Logo</p>
              </div>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Member Type</p>
              <p className="text-gray-900 font-semibold">{getMemberTypeLabel(member.memberType)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Location</p>
              <p className="text-gray-900 font-semibold">
                {member.cityTown && member.region ? `${member.cityTown}, ${member.region}` : member.region || member.county || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Slug</p>
              <p className="text-gray-900 font-mono text-sm">{member.slug}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Geographic Reach</p>
              <p className="text-gray-900 capitalize">{member.geographicReach?.replace(/_/g, ' ') || "Not specified"}</p>
            </div>
          </div>

          {/* Tagline */}
          {member.shortTagline && (
            <div>
              <p className="text-sm text-gray-600 font-medium mb-2">Tagline</p>
              <p className="text-gray-900">{member.shortTagline}</p>
            </div>
          )}

          {/* Bio */}
          {member.longBio && (
            <div>
              <p className="text-sm text-gray-600 font-medium mb-2">Bio</p>
              <p className="text-gray-900 whitespace-pre-wrap">{member.longBio}</p>
            </div>
          )}

          {/* Tags */}
          {member.primaryArtformTags.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 font-medium mb-2">Genres / Artforms</p>
              <div className="flex flex-wrap gap-2">
                {member.primaryArtformTags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Activity Modes */}
          {member.activityModes.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 font-medium mb-2">Activities</p>
              <div className="flex flex-wrap gap-2">
                {member.activityModes.map((mode, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-50 rounded-full text-sm text-blue-700 border border-blue-200">
                    {mode.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Applied Date */}
          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Applied on: <span className="font-medium text-gray-900">
                {new Date(member.joinedAt).toLocaleDateString("en-IE", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={handleApprove}
          disabled={actionLoading !== null}
          className="flex-1 py-4 rounded-lg font-semibold text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--color-ijf-accent)' }}
        >
          {actionLoading === "approve" ? "Approving..." : "✓ Approve Member"}
        </button>
        <button
          onClick={handleReject}
          disabled={actionLoading !== null}
          className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {actionLoading === "reject" ? "Rejecting..." : "✗ Reject"}
        </button>
      </div>
    </div>
  );
}