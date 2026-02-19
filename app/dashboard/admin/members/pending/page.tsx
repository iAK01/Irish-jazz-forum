// /app/dashboard/admin/members/pending/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PendingMemberCard from "@/app/components/PendingMemberCard";

interface PendingMember {
  _id: string;
  slug: string;  // ADD THIS LINE
  name: string;
  memberType: string | string[];
  region?: string;
  cityTown?: string;
  joinedAt: string;
}

export default function PendingMembersPage() {
  const [members, setMembers] = useState<PendingMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPendingMembers();
  }, []);

  const fetchPendingMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/members?status=prospective");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch pending members");
      }

      setMembers(data.data || []);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pending Member Approvals</h1>
            <p className="text-gray-600 mt-2">
              Review and approve new member applications
            </p>
          </div>
          <Link
            href="/dashboard/admin/members"
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition-colors"
          >
            View All Members
          </Link>
        </div>

        {/* Stats */}
        <div className="bg-yellow-50 rounded-lg border-2 border-yellow-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-ijf-accent)' }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-yellow-800 font-medium">Awaiting Approval</p>
              <p className="text-3xl font-bold text-yellow-900">{members.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* Pending Members */}
      {members.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">All caught up!</h3>
          <p className="text-gray-600 mb-6">There are no pending member approvals at this time.</p>
          <Link
            href="/dashboard/admin/invitations/new"
            className="inline-block px-6 py-3 rounded-lg font-semibold text-white transition-all shadow-md hover:shadow-lg"
            style={{ backgroundColor: 'var(--color-ijf-accent)' }}
          >
            Invite New Members
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {members.map((member) => (
            <PendingMemberCard
              key={member._id}
              member={member}
              onApprove={fetchPendingMembers}
              onReject={fetchPendingMembers}
            />
          ))}
        </div>
      )}
    </div>
  );
}