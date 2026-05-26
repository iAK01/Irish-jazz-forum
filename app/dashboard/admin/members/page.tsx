"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import Link from "next/link";

const REMIND_COOLDOWN_DAYS = 7;

interface Member {
  _id: string;
  name: string;
  slug: string;
  memberType: string | string[];
  region?: string;
  membershipStatus: string;
  joinedAt: string;
  users?: { userId: string; userEmail: string; role: string }[];
  lastProfileReminderSentAt?: string;
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function reminderCooldownLabel(member: Member): string | null {
  if (!member.lastProfileReminderSentAt) return null;
  const days = daysSince(member.lastProfileReminderSentAt);
  if (days === 0) return "Reminded today";
  if (days === 1) return "Reminded yesterday";
  return `Reminded ${days}d ago`;
}

function reminderOnCooldown(member: Member): boolean {
  if (!member.lastProfileReminderSentAt) return false;
  return daysSince(member.lastProfileReminderSentAt) < REMIND_COOLDOWN_DAYS;
}

type RegionFilter =
  | "all"
  | "leinster_total"
  | "ulster_total"
  | "Dublin"
  | "Leinster"
  | "Munster"
  | "Connacht"
  | "unassigned";

interface DeleteModalState {
  open: boolean;
  member: Member | null;
  loading: boolean;
}

interface InviteModalState {
  open: boolean;
  member: Member | null;
  email: string;
  message: string;
  loading: boolean;
  sent: boolean;
  error: string;
}

interface RemindModalState {
  open: boolean;
  member: Member | null;
  loading: boolean;
  sent: boolean;
  error: string;
  sentTo: string[];
}

const regionFilterLabels: Record<RegionFilter, string> = {
  all: "All Regions",
  leinster_total: "Leinster Total",
  ulster_total: "Ulster",
  Dublin: "Dublin",
  Leinster: "Leinster excl. Dublin",
  Munster: "Munster",
  Connacht: "Connacht",
  unassigned: "No Region Set",
};

export default function MembersListPage() {
  const { data: session } = useSession();
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegionFilters, setSelectedRegionFilters] = useState<
    Exclude<RegionFilter, "all">[]
  >([]);
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    open: false,
    member: null,
    loading: false,
  });
  const [inviteModal, setInviteModal] = useState<InviteModalState>({
    open: false,
    member: null,
    email: "",
    message: "",
    loading: false,
    sent: false,
    error: "",
  });
  const [remindModal, setRemindModal] = useState<RemindModalState>({
    open: false,
    member: null,
    loading: false,
    sent: false,
    error: "",
    sentTo: [],
  });

  useEffect(() => {
    if (session?.user) {
      fetchMembers();
      fetchPendingCount();
    }
  }, [session]);

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();

    const nextMembers = members.filter((member) => {
      const matchesSearch =
        query === "" ||
        member.name.toLowerCase().includes(query) ||
        memberTypeArray(member.memberType).some((t) =>
          t.toLowerCase().includes(query)
        ) ||
        member.region?.toLowerCase().includes(query);

      const matchesRegion =
        selectedRegionFilters.length === 0 ||
        selectedRegionFilters.some((regionFilter) =>
          regionFilter === "unassigned"
            ? !member.region
            : regionFilter === "leinster_total"
              ? member.region === "Dublin" || member.region === "Leinster"
              : regionFilter === "ulster_total"
                ? member.region === "Ulster (ROI)" ||
                  member.region === "Northern Ireland"
                : member.region === regionFilter
        );

      return matchesSearch && matchesRegion;
    });

    setFilteredMembers(nextMembers);
  }, [searchQuery, selectedRegionFilters, members]);

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/members");
      if (res.ok) {
        const data = await res.json();
        setMembers(data.data || []);
        setFilteredMembers(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const res = await fetch("/api/members?status=prospective");
      if (res.ok) {
        const data = await res.json();
        setPendingCount(data.data?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching pending count:", error);
    }
  };

  const memberTypeArray = (memberType: string | string[]): string[] => {
    if (!memberType) return [];
    if (Array.isArray(memberType)) return memberType;
    return memberType.split(",").map((t) => t.trim()).filter(Boolean);
  };

  const openDeleteModal = (member: Member, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteModal({ open: true, member, loading: false });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ open: false, member: null, loading: false });
  };

  const handleDelete = async () => {
    if (!deleteModal.member) return;
    setDeleteModal((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`/api/members/${deleteModal.member.slug}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete member");
        setDeleteModal((prev) => ({ ...prev, loading: false }));
        return;
      }
      closeDeleteModal();
      fetchMembers();
    } catch (error) {
      console.error("Error deleting member:", error);
      alert("Failed to delete member");
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const openInviteModal = (member: Member, e: React.MouseEvent) => {
    e.stopPropagation();
    setInviteModal({ open: true, member, email: "", message: "", loading: false, sent: false, error: "" });
  };

  const closeInviteModal = () => {
    setInviteModal({ open: false, member: null, email: "", message: "", loading: false, sent: false, error: "" });
  };

  const handleInviteUser = async () => {
    if (!inviteModal.member || !inviteModal.email.trim()) return;
    setInviteModal((prev) => ({ ...prev, loading: true, error: "" }));
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteModal.email.trim(),
          invitationType: "join_member",
          memberSlug: inviteModal.member.slug,
          message: inviteModal.message.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send invitation");
      setInviteModal((prev) => ({ ...prev, loading: false, sent: true }));
      fetchMembers();
    } catch (err: unknown) {
      setInviteModal((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to send invitation",
      }));
    }
  };

  const openRemindModal = (member: Member, e: React.MouseEvent) => {
    e.stopPropagation();
    setRemindModal({ open: true, member, loading: false, sent: false, error: "", sentTo: [] });
  };

  const closeRemindModal = () => {
    setRemindModal({ open: false, member: null, loading: false, sent: false, error: "", sentTo: [] });
  };

  const handleSendReminder = async () => {
    if (!remindModal.member) return;
    setRemindModal((prev) => ({ ...prev, loading: true, error: "" }));
    try {
      const res = await fetch(`/api/members/${remindModal.member.slug}/remind`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send reminder");
      setRemindModal((prev) => ({ ...prev, loading: false, sent: true, sentTo: data.data?.sentTo || [] }));
    } catch (err: unknown) {
      setRemindModal((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to send reminder",
      }));
    }
  };

  const regionCounts = {
    Dublin: members.filter((member) => member.region === "Dublin").length,
    Leinster: members.filter((member) => member.region === "Leinster").length,
    Munster: members.filter((member) => member.region === "Munster").length,
    Connacht: members.filter((member) => member.region === "Connacht").length,
    "Ulster (ROI)": members.filter((member) => member.region === "Ulster (ROI)").length,
    "Northern Ireland": members.filter((member) => member.region === "Northern Ireland").length,
    unassigned: members.filter((member) => !member.region).length,
  };
  const leinsterTotalCount = regionCounts.Dublin + regionCounts.Leinster;
  const ulsterTotalCount =
    regionCounts["Ulster (ROI)"] + regionCounts["Northern Ireland"];

  const totalLinkedUsers = members.reduce(
    (sum, member) => sum + (member.users?.length || 0),
    0
  );
  const multiUserMembers = members.filter((member) => (member.users?.length || 0) > 1).length;
  const activeMembersCount = members.filter(
    (member) => member.membershipStatus === "active"
  ).length;

  const regionCards: Array<{
    label: string;
    value: RegionFilter;
    count: number;
    tone: string;
    helper?: string;
  }> = [
    {
      label: "All Regions",
      value: "all",
      count: members.length,
      tone: "zinc",
      helper: "All member profiles",
    },
    {
      label: "Leinster Total",
      value: "leinster_total",
      count: leinsterTotalCount,
      tone: "sky",
      helper: `Includes Dublin (${regionCounts.Dublin})`,
    },
    {
      label: "Dublin",
      value: "Dublin",
      count: regionCounts.Dublin,
      tone: "emerald",
      helper: "Subset of Leinster",
    },
    {
      label: "Leinster excl. Dublin",
      value: "Leinster",
      count: regionCounts.Leinster,
      tone: "sky",
      helper: "Leinster outside Dublin",
    },
    {
      label: "Munster",
      value: "Munster",
      count: regionCounts.Munster,
      tone: "amber",
    },
    {
      label: "Connacht",
      value: "Connacht",
      count: regionCounts.Connacht,
      tone: "violet",
    },
    {
      label: "Ulster",
      value: "ulster_total",
      count: ulsterTotalCount,
      tone: "rose",
      helper: `${regionCounts["Ulster (ROI)"]} ROI Ulster + ${regionCounts["Northern Ireland"]} Northern Ireland`,
    },
    {
      label: "No Region Set",
      value: "unassigned",
      count: regionCounts.unassigned,
      tone: "slate",
    },
  ];

  const toggleRegionFilter = (value: RegionFilter) => {
    if (value === "all") {
      setSelectedRegionFilters([]);
      return;
    }

    setSelectedRegionFilters((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  };

  const toneClasses: Record<string, { base: string; active: string; text: string; subtext: string }> = {
    zinc: {
      base: "bg-white border-zinc-200 hover:border-zinc-300",
      active: "border-zinc-500 ring-2 ring-zinc-200 shadow-md",
      text: "text-zinc-900",
      subtext: "text-zinc-600",
    },
    emerald: {
      base: "bg-emerald-50 border-emerald-200 hover:border-emerald-300",
      active: "border-emerald-500 ring-2 ring-emerald-100 shadow-md",
      text: "text-emerald-900",
      subtext: "text-emerald-700",
    },
    sky: {
      base: "bg-sky-50 border-sky-200 hover:border-sky-300",
      active: "border-sky-500 ring-2 ring-sky-100 shadow-md",
      text: "text-sky-900",
      subtext: "text-sky-700",
    },
    amber: {
      base: "bg-amber-50 border-amber-200 hover:border-amber-300",
      active: "border-amber-500 ring-2 ring-amber-100 shadow-md",
      text: "text-amber-900",
      subtext: "text-amber-700",
    },
    violet: {
      base: "bg-violet-50 border-violet-200 hover:border-violet-300",
      active: "border-violet-500 ring-2 ring-violet-100 shadow-md",
      text: "text-violet-900",
      subtext: "text-violet-700",
    },
    rose: {
      base: "bg-rose-50 border-rose-200 hover:border-rose-300",
      active: "border-rose-500 ring-2 ring-rose-100 shadow-md",
      text: "text-rose-900",
      subtext: "text-rose-700",
    },
    green: {
      base: "bg-green-50 border-green-200 hover:border-green-300",
      active: "border-green-500 ring-2 ring-green-100 shadow-md",
      text: "text-green-900",
      subtext: "text-green-700",
    },
    slate: {
      base: "bg-slate-50 border-slate-200 hover:border-slate-300",
      active: "border-slate-500 ring-2 ring-slate-100 shadow-md",
      text: "text-slate-900",
      subtext: "text-slate-700",
    },
  };

  if (!session || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
    return (
      <DashboardLayout title="Member Directory" userName="Guest">
        <div className="p-8"><p>Access denied. Admin privileges required.</p></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Member Directory" userName={session.user.name}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-zinc-600 dark:text-zinc-400">Manage all member profiles</p>
            <p className="text-sm text-zinc-500 mt-1">Total members: {filteredMembers.length}</p>
          </div>
          <div className="flex gap-3">
            {pendingCount > 0 && (
              <Link href="/dashboard/admin/members/pending"
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Pending Approvals
                <span className="px-2 py-0.5 bg-white text-yellow-700 rounded-full text-xs font-bold">{pendingCount}</span>
              </Link>
            )}
            <Link href="/dashboard/admin/invitations/new"
              className="px-4 py-2 rounded-lg font-medium text-white transition-colors flex items-center gap-2"
              style={{ backgroundColor: "var(--color-ijf-accent)" }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Invite Member
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input type="text" placeholder="Search by name, type, or region..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100" />
        </div>

        {(selectedRegionFilters.length > 0 || searchQuery.trim()) && (
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-zinc-600">
            <span className="font-medium text-zinc-800">Filtered by:</span>
            {selectedRegionFilters.map((regionFilter) => (
              <span
                key={regionFilter}
                className="rounded-full bg-sky-100 px-3 py-1 font-medium text-sky-800"
              >
                {regionFilterLabels[regionFilter]}
              </span>
            ))}
            {searchQuery.trim() && (
              <span className="rounded-full bg-zinc-100 px-3 py-1 font-medium text-zinc-800">
                Search: {searchQuery.trim()}
              </span>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-sm font-medium text-zinc-600">Visible Members</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900">{filteredMembers.length}</p>
            <p className="mt-2 text-xs text-zinc-500">
              {selectedRegionFilters.length === 0
                ? "All member profiles"
                : selectedRegionFilters.length === 1
                  ? `Filtered to ${regionFilterLabels[selectedRegionFilters[0]]}`
                  : `Filtered to ${selectedRegionFilters.length} regions`}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-sm font-medium text-zinc-600">Active Members</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900">{activeMembersCount}</p>
            <p className="mt-2 text-xs text-zinc-500">
              Pending approvals: {pendingCount}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-sm font-medium text-zinc-600">Linked Users</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900">{totalLinkedUsers}</p>
            <p className="mt-2 text-xs text-zinc-500">
              {multiUserMembers} {multiUserMembers === 1 ? "member has" : "members have"} multiple users
            </p>
          </div>
        </div>

        {/* Region Coverage */}
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Regional Coverage
              </h2>
              <p className="text-sm text-zinc-500 mt-1">
                Click a region to filter the member directory below
              </p>
            </div>
            {selectedRegionFilters.length > 1 && (
              <button
                type="button"
                onClick={() => setSelectedRegionFilters([])}
                className="cursor-pointer rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700"
              >
                Clear Region Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-9 gap-3">
            {regionCards.map((card) => {
              const tone = toneClasses[card.tone];
              const isActive =
                card.value === "all"
                  ? selectedRegionFilters.length === 0
                  : selectedRegionFilters.includes(card.value);

              return (
                <button
                  key={card.label}
                  type="button"
                  onClick={() => toggleRegionFilter(card.value)}
                  className={`group cursor-pointer rounded-xl border p-5 text-left transition-all ${tone.base} ${
                    isActive ? tone.active : ""
                  }`}
                  aria-pressed={isActive}
                  title={`Show members in ${card.label}`}
                >
                  <p className={`text-xs font-semibold uppercase tracking-wide ${tone.subtext}`}>
                    {card.label}
                  </p>
                  <p className={`mt-3 text-4xl font-bold md:text-5xl ${tone.text}`}>{card.count}</p>
                  {card.helper && (
                    <p className={`mt-3 text-sm ${tone.subtext}`}>
                      {card.helper}
                    </p>
                  )}
                  <div className="mt-4 flex justify-end">
                    <span
                      className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition ${
                        isActive
                          ? `${tone.text} bg-white/80 shadow-sm`
                          : `${tone.subtext} bg-white/70 group-hover:bg-white`
                      }`}
                    >
                      {isActive ? "Filtering" : "Filter"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12"><p className="text-zinc-500">Loading members...</p></div>
        ) : filteredMembers.length === 0 ? (
          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-12 text-center">
            <p className="text-zinc-600 dark:text-zinc-400">
              {searchQuery ? "No members match your search." : "No members found."}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Region</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Users</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {filteredMembers.map((member) => {
                  const types = memberTypeArray(member.memberType);
                  const userCount = member.users?.length ?? 0;
                  return (
                    <tr key={member._id}
                      onClick={() => window.location.href = `/dashboard/admin/members/${member.slug}`}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition cursor-pointer">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{member.name}</div>
                        <div className="text-sm text-zinc-500">/{member.slug}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {types.map((type) => (
                            <span key={type} className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize">{type}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">{member.region || "—"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                        {userCount > 0 ? (
                          <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-700 rounded text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            {userCount} {userCount === 1 ? "user" : "users"}
                          </span>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          member.membershipStatus === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}>
                          {member.membershipStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                        {new Date(member.joinedAt).toLocaleDateString("en-IE")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button onClick={(e) => openInviteModal(member, e)}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition">
                            Invite User
                          </button>
                          {(member.users?.length ?? 0) > 0 && (() => {
                            const onCooldown = reminderOnCooldown(member);
                            const cooldownLabel = reminderCooldownLabel(member);
                            return (
                              <button
                                onClick={(e) => !onCooldown && openRemindModal(member, e)}
                                disabled={onCooldown}
                                className={`px-3 py-1 rounded text-xs font-medium transition ${
                                  onCooldown
                                    ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                                    : "bg-amber-500 hover:bg-amber-600 text-white"
                                }`}
                                title={onCooldown ? `${cooldownLabel} — cooldown ${REMIND_COOLDOWN_DAYS} days` : "Send a profile completion reminder"}>
                                {onCooldown ? cooldownLabel : "Remind"}
                              </button>
                            );
                          })()}
                          <Link href={`/dashboard/admin/members/${member.slug}`}
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-1 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded text-xs font-medium transition">
                            Edit
                          </Link>
                          <button onClick={(e) => openDeleteModal(member, e)}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite User Modal */}
      {inviteModal.open && inviteModal.member && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            {inviteModal.sent ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Invitation sent</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                  {inviteModal.email} has been invited to join <strong>{inviteModal.member.name}</strong>.
                </p>
                <button onClick={closeInviteModal}
                  className="px-6 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-700 transition">
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Invite User</h3>
                  <p className="text-sm text-zinc-500 mt-1">
                    Invite someone to join <strong className="text-zinc-700 dark:text-zinc-300">{inviteModal.member.name}</strong> as a user
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Email address *</label>
                    <input type="email" value={inviteModal.email}
                      onChange={(e) => setInviteModal((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="name@example.com"
                      className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Personal message <span className="font-normal text-zinc-400">(optional)</span></label>
                    <textarea value={inviteModal.message}
                      onChange={(e) => setInviteModal((prev) => ({ ...prev, message: e.target.value }))}
                      placeholder="Add a note to the invitation email..."
                      rows={3}
                      className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm resize-none" />
                  </div>
                </div>

                {inviteModal.error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{inviteModal.error}</p>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button onClick={closeInviteModal} disabled={inviteModal.loading}
                    className="flex-1 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 rounded-lg font-medium text-sm transition disabled:opacity-50">
                    Cancel
                  </button>
                  <button onClick={handleInviteUser} disabled={inviteModal.loading || !inviteModal.email.trim()}
                    className="flex-1 px-4 py-2 text-white rounded-lg font-medium text-sm transition disabled:opacity-50"
                    style={{ backgroundColor: "var(--color-ijf-accent)" }}>
                    {inviteModal.loading ? "Sending..." : "Send Invitation"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && deleteModal.member && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Delete Organisation</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">This cannot be undone.</p>
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-700 rounded-lg p-4 mb-5 space-y-2">
              <div>
                <span className="text-xs text-zinc-500 uppercase font-medium">Organisation</span>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{deleteModal.member.name}</p>
              </div>
              <div>
                <span className="text-xs text-zinc-500 uppercase font-medium">Slug</span>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">/{deleteModal.member.slug}</p>
              </div>
              <div>
                <span className="text-xs text-zinc-500 uppercase font-medium">Status</span>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 capitalize">{deleteModal.member.membershipStatus}</p>
              </div>
              {(deleteModal.member.users?.length ?? 0) > 0 && (
                <div>
                  <span className="text-xs text-zinc-500 uppercase font-medium">Linked Users</span>
                  <div className="mt-1 space-y-1">
                    {deleteModal.member.users!.map((u) => (
                      <div key={u.userId} className="flex items-center gap-2">
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">{u.userEmail}</span>
                        {u.role === "primary" && (
                          <span className="px-1.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded">Primary</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-2 font-medium">
                    ⚠ These users will remain but will no longer be linked to any organisation.
                  </p>
                </div>
              )}
            </div>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-5">
              Forum posts from this organisation&apos;s members will remain as-is.
            </p>

            <div className="flex gap-3">
              <button onClick={closeDeleteModal} disabled={deleteModal.loading}
                className="flex-1 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 rounded-lg font-medium text-sm transition disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleteModal.loading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition disabled:opacity-50">
                {deleteModal.loading ? "Deleting..." : "Yes, Delete Organisation"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Profile Reminder Modal */}
      {remindModal.open && remindModal.member && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            {remindModal.sent ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Reminder sent</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                  Profile completion email sent to:
                </p>
                <ul className="mb-6 space-y-1">
                  {remindModal.sentTo.map((email) => (
                    <li key={email} className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{email}</li>
                  ))}
                </ul>
                <button onClick={closeRemindModal}
                  className="px-6 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-700 transition">
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Send profile reminder</h3>
                  <p className="text-sm text-zinc-500 mt-1">
                    An automated email will be sent asking{" "}
                    <strong className="text-zinc-700 dark:text-zinc-300">{remindModal.member.name}</strong>{" "}
                    to complete their profile.
                  </p>
                  {remindModal.member.lastProfileReminderSentAt && (
                    <p className="mt-2 text-xs text-zinc-400">
                      Last reminded:{" "}
                      {new Date(remindModal.member.lastProfileReminderSentAt).toLocaleDateString("en-IE", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                      {" "}({reminderCooldownLabel(remindModal.member)})
                    </p>
                  )}
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-700 rounded-lg p-4 mb-5">
                  <p className="text-xs font-semibold uppercase text-zinc-500 mb-2">Will be emailed</p>
                  {(remindModal.member.users?.length ?? 0) > 0 ? (
                    <ul className="space-y-1">
                      {remindModal.member.users!.map((u) => (
                        <li key={u.userId} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                          {u.userEmail}
                          {u.role === "primary" && (
                            <span className="px-1.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded">Primary</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-zinc-500 italic">No linked users</p>
                  )}
                </div>

                {remindModal.error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{remindModal.error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={closeRemindModal} disabled={remindModal.loading}
                    className="flex-1 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 rounded-lg font-medium text-sm transition disabled:opacity-50">
                    Cancel
                  </button>
                  <button onClick={handleSendReminder} disabled={remindModal.loading}
                    className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium text-sm transition disabled:opacity-50">
                    {remindModal.loading ? "Sending..." : "Send Reminder"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
