// /app/dashboard/admin/invitations/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import InvitationList from "@/app/components/InvitationList";
import type { InvitationListItem } from "@/types/invitation";

export default function AdminInvitationsPage() {
  const [invitations, setInvitations] = useState<InvitationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/invitations");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch invitations");
      }

      setInvitations(data.data || []);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = invitations.filter((inv) => inv.status === "pending").length;

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
            <h1 className="text-3xl font-bold text-gray-900">Member Invitations</h1>
            <p className="text-gray-600 mt-2">
              Manage invitations to join the Irish Jazz Forum
            </p>
          </div>
          <Link
            href="/dashboard/admin/invitations/new"
            className="px-6 py-3 rounded-lg font-semibold text-white transition-all shadow-md hover:shadow-lg"
            style={{ backgroundColor: 'var(--color-ijf-accent)' }}
          >
            + Invite New Member
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
            <p className="text-sm text-gray-600 font-medium">Total Invitations</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{invitations.length}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg border-2 border-yellow-200 p-4">
            <p className="text-sm text-yellow-800 font-medium">Pending</p>
            <p className="text-3xl font-bold text-yellow-900 mt-1">{pendingCount}</p>
          </div>
          <div className="bg-green-50 rounded-lg border-2 border-green-200 p-4">
            <p className="text-sm text-green-800 font-medium">Accepted</p>
            <p className="text-3xl font-bold text-green-900 mt-1">
              {invitations.filter((inv) => inv.status === "accepted" || inv.status === "completed").length}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-4">
            <p className="text-sm text-gray-600 font-medium">Expired</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {invitations.filter((inv) => inv.status === "expired").length}
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* Invitations List */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <InvitationList invitations={invitations} onUpdate={fetchInvitations} />
      </div>
    </div>
  );
}