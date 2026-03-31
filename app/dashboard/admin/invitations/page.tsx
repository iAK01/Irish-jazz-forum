// /app/dashboard/admin/invitations/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import InvitationList from "@/app/components/InvitationList";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import type { InvitationListItem } from "@/types/invitation";
import type { InvitationFilter } from "@/app/components/InvitationList";

export default function AdminInvitationsPage() {
  const { data: session } = useSession();
  const [invitations, setInvitations] = useState<InvitationListItem[]>([]);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [filter, setFilter] = useState<InvitationFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const getErrorMessage = (error: unknown) =>
    error instanceof Error ? error.message : "An error occurred";

  const fetchInitialData = async () => {
    await Promise.all([fetchInvitations(), fetchPendingApprovalsCount()]);
  };

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
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingApprovalsCount = async () => {
    try {
      const response = await fetch("/api/members?status=prospective");
      const data = await response.json();

      if (response.ok) {
        setPendingApprovalsCount(data.data?.length || 0);
      }
    } catch (err) {
      console.error("Error fetching pending approvals count:", err);
    }
  };

  const pendingCount = invitations.filter((inv) => inv.status === "pending").length;
  const acceptedCount = invitations.filter(
    (inv) => inv.status === "accepted" || inv.status === "completed"
  ).length;
  const expiredCount = invitations.filter((inv) => inv.status === "expired").length;

  const StatCard = ({
    label,
    count,
    filterValue,
    tone = "neutral",
    onClick,
    isLink = false,
  }: {
    label: string;
    count: number;
    filterValue?: InvitationFilter;
    tone?: "neutral" | "pending" | "approvals" | "accepted" | "expired";
    onClick?: () => void;
    isLink?: boolean;
  }) => {
    const isActive = filterValue ? filter === filterValue : false;

    const toneStyles = {
      neutral: {
        bg: "bg-white",
        border: isActive ? "border-gray-400" : "border-gray-200",
        label: "text-gray-600",
        count: "text-gray-900",
      },
      pending: {
        bg: "bg-yellow-50",
        border: isActive ? "border-yellow-400" : "border-yellow-200",
        label: "text-yellow-800",
        count: "text-yellow-900",
      },
      approvals: {
        bg: "bg-amber-50",
        border: isActive ? "border-amber-400" : "border-amber-200",
        label: "text-amber-800",
        count: "text-amber-900",
      },
      accepted: {
        bg: "bg-green-50",
        border: isActive ? "border-green-400" : "border-green-200",
        label: "text-green-800",
        count: "text-green-900",
      },
      expired: {
        bg: "bg-gray-50",
        border: isActive ? "border-gray-400" : "border-gray-200",
        label: "text-gray-600",
        count: "text-gray-900",
      },
    } as const;

    const styles = toneStyles[tone];
    const interactive = Boolean(onClick);

    return (
      <button
        type="button"
        onClick={onClick}
        disabled={!interactive}
        className={`${styles.bg} rounded-lg border-2 ${styles.border} p-3 sm:p-4 text-left transition-all ${
          interactive
            ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5"
            : "cursor-default"
        } ${isActive ? "shadow-md ring-2 ring-black/5" : ""}`}
        aria-pressed={filterValue ? isActive : undefined}
        title={
          filterValue
            ? `Show ${label.toLowerCase()} invitations`
            : isLink
              ? "Open pending approvals"
              : undefined
        }
      >
        <p className={`text-xs sm:text-sm font-medium ${styles.label}`}>{label}</p>
        <div className="mt-1 flex items-end justify-between gap-2">
          <p className={`text-2xl sm:text-3xl font-bold ${styles.count}`}>{count}</p>
          {interactive && (
            <span className={`text-xs font-semibold ${styles.label}`}>
              {isLink ? "Open" : isActive ? "Active" : "Filter"}
            </span>
          )}
        </div>
      </button>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout title="Member Invitations" userName={session?.user?.name || "Admin"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Member Invitations</h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                Manage invitations to join the Irish Jazz Forum
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 self-start sm:self-auto">
              {pendingApprovalsCount > 0 && (
                <Link
                  href="/dashboard/admin/members/pending"
                  className="px-5 py-3 bg-yellow-500 hover:bg-yellow-600 rounded-lg font-semibold text-white transition-all shadow-md hover:shadow-lg text-sm sm:text-base text-center whitespace-nowrap flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Pending Approvals
                  <span className="px-2 py-0.5 bg-white text-yellow-700 rounded-full text-xs font-bold">
                    {pendingApprovalsCount}
                  </span>
                </Link>
              )}
              <Link
                href="/dashboard/admin/invitations/new"
                className="px-5 py-3 rounded-lg font-semibold text-white transition-all shadow-md hover:shadow-lg text-sm sm:text-base text-center whitespace-nowrap self-start sm:self-auto"
                style={{ backgroundColor: "var(--color-ijf-accent)" }}
              >
                + Invite New Member
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mt-4 sm:mt-6">
            <StatCard
              label="Total"
              count={invitations.length}
              filterValue="all"
              tone="neutral"
              onClick={() => setFilter("all")}
            />
            <StatCard
              label="Pending"
              count={pendingCount}
              filterValue="pending"
              tone="pending"
              onClick={() => setFilter("pending")}
            />
            <StatCard
              label="Pending Approvals"
              count={pendingApprovalsCount}
              tone="approvals"
              onClick={
                pendingApprovalsCount > 0
                  ? () => {
                      window.location.href = "/dashboard/admin/members/pending";
                    }
                  : undefined
              }
              isLink
            />
            <StatCard
              label="Accepted"
              count={acceptedCount}
              filterValue="accepted"
              tone="accepted"
              onClick={() => setFilter("accepted")}
            />
            <StatCard
              label="Expired"
              count={expiredCount}
              filterValue="expired"
              tone="expired"
              onClick={() => setFilter("expired")}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Invitations List */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4 sm:p-6">
          <InvitationList
            invitations={invitations}
            filter={filter}
            onFilterChange={setFilter}
            onUpdate={fetchInitialData}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
