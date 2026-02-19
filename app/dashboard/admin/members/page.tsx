"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import Link from "next/link";

interface Member {
  _id: string;
  name: string;
  slug: string;
  memberType: string | string[];
  region?: string;
  membershipStatus: string;
  joinedAt: string;
  users?: { userId: string; userEmail: string; role: string }[];
}

interface DeleteModalState {
  open: boolean;
  member: Member | null;
  loading: boolean;
}

export default function MembersListPage() {
  const { data: session } = useSession();
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    open: false,
    member: null,
    loading: false,
  });

  useEffect(() => {
    if (session?.user) {
      fetchMembers();
      fetchPendingCount();
    }
  }, [session]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredMembers(members);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredMembers(
        members.filter(
          (member) =>
            member.name.toLowerCase().includes(query) ||
            memberTypeArray(member.memberType).some((t) => t.toLowerCase().includes(query)) ||
            member.region?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, members]);

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
      const res = await fetch(`/api/members/${deleteModal.member.slug}`, {
        method: "DELETE",
      });

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

  if (!session || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
    return (
      <DashboardLayout title="Member Directory" userName="Guest">
        <div className="p-8">
          <p>Access denied. Admin privileges required.</p>
        </div>
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
              <Link
                href="/dashboard/admin/members/pending"
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Pending Approvals
                <span className="px-2 py-0.5 bg-white text-yellow-700 rounded-full text-xs font-bold">
                  {pendingCount}
                </span>
              </Link>
            )}
            <Link
              href="/dashboard/admin/invitations/new"
              className="px-4 py-2 rounded-lg font-medium text-white transition-colors flex items-center gap-2"
              style={{ backgroundColor: "var(--color-ijf-accent)" }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Invite Member
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name, type, or region..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-zinc-500">Loading members...</p>
          </div>
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
                    <tr key={member._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{member.name}</div>
                        <div className="text-sm text-zinc-500">/{member.slug}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {types.map((type) => (
                            <span
                              key={type}
                              className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                        {member.region || "—"}
                      </td>
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
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            member.membershipStatus === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          }`}
                        >
                          {member.membershipStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                        {new Date(member.joinedAt).toLocaleDateString("en-IE")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={(e) => openDeleteModal(member, e)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
              Forum posts from this organisation's members will remain as-is.
            </p>

            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={deleteModal.loading}
                className="flex-1 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 rounded-lg font-medium text-sm transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteModal.loading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition disabled:opacity-50"
              >
                {deleteModal.loading ? "Deleting..." : "Yes, Delete Organisation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}