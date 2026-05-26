"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface MemberOrg {
  slug: string;
  name: string;
  isPrimary: boolean;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
  memberOrgs?: MemberOrg[];
  postCount?: number;
  lastPostAt?: string | null;
}

interface DeleteModalState {
  open: boolean;
  user: User | null;
  loading: boolean;
}

interface InviteModalState {
  open: boolean;
  email: string;
  memberSlug: string;
  message: string;
  loading: boolean;
  sent: boolean;
  error: string;
}

interface EmailModalState {
  open: boolean;
  user: User | null;
  subject: string;
  message: string;
  loading: boolean;
  sent: boolean;
  error: string;
}

interface Member {
  _id: string;
  name: string;
  slug: string;
}

function timeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    open: false,
    user: null,
    loading: false,
  });
  const [inviteModal, setInviteModal] = useState<InviteModalState>({
    open: false,
    email: "",
    memberSlug: "",
    message: "",
    loading: false,
    sent: false,
    error: "",
  });
  const [emailModal, setEmailModal] = useState<EmailModalState>({
    open: false,
    user: null,
    subject: "",
    message: "",
    loading: false,
    sent: false,
    error: "",
  });

  useEffect(() => {
    fetchUsers();
    fetchMembers();
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/members");
      const data = await res.json();
      setMembers(data.data || []);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.memberOrgs?.some((o) => o.name.toLowerCase().includes(q))
    );
  });

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role");
    }
  };

  // — Delete —
  const openDeleteModal = (user: User) => setDeleteModal({ open: true, user, loading: false });
  const closeDeleteModal = () => setDeleteModal({ open: false, user: null, loading: false });

  const handleDelete = async () => {
    if (!deleteModal.user) return;
    setDeleteModal((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`/api/users/${deleteModal.user._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete user");
        setDeleteModal((prev) => ({ ...prev, loading: false }));
        return;
      }
      closeDeleteModal();
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // — Invite —
  const openInviteModal = () => {
    setInviteModal({
      open: true,
      email: "",
      memberSlug: members[0]?.slug || "",
      message: "",
      loading: false,
      sent: false,
      error: "",
    });
  };
  const closeInviteModal = () =>
    setInviteModal({ open: false, email: "", memberSlug: "", message: "", loading: false, sent: false, error: "" });

  const handleInviteUser = async () => {
    if (!inviteModal.email.trim() || !inviteModal.memberSlug) return;
    setInviteModal((prev) => ({ ...prev, loading: true, error: "" }));
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteModal.email.trim(),
          invitationType: "join_member",
          memberSlug: inviteModal.memberSlug,
          message: inviteModal.message.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send invitation");
      setInviteModal((prev) => ({ ...prev, loading: false, sent: true }));
    } catch (err: any) {
      setInviteModal((prev) => ({ ...prev, loading: false, error: err.message }));
    }
  };

  // — Email —
  const openEmailModal = (user: User) => {
    setEmailModal({
      open: true,
      user,
      subject: "",
      message: "",
      loading: false,
      sent: false,
      error: "",
    });
  };
  const closeEmailModal = () =>
    setEmailModal({ open: false, user: null, subject: "", message: "", loading: false, sent: false, error: "" });

  const handleSendEmail = async () => {
    if (!emailModal.user) return;
    if (!emailModal.subject.trim()) {
      setEmailModal((prev) => ({ ...prev, error: "Please enter a subject line." }));
      return;
    }
    if (!emailModal.message.trim()) {
      setEmailModal((prev) => ({ ...prev, error: "Please enter a message." }));
      return;
    }
    setEmailModal((prev) => ({ ...prev, loading: true, error: "" }));
    try {
      const res = await fetch(`/api/users/${emailModal.user._id}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: emailModal.subject.trim(),
          message: emailModal.message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send email");
      setEmailModal((prev) => ({ ...prev, loading: false, sent: true }));
    } catch (err: any) {
      setEmailModal((prev) => ({ ...prev, loading: false, error: err.message }));
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading users...</div>;
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email or organisation…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-ijf-accent"
          />
        </div>
        <button
          onClick={openInviteModal}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white transition flex-shrink-0"
          style={{ backgroundColor: "#f59e0b" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Invite User
        </button>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 text-zinc-500 text-sm">
          {searchQuery ? `No users matching "${searchQuery}"` : "No users found"}
        </div>
      )}

      {/* Desktop Table */}
      {filteredUsers.length > 0 && (
        <div style={{ display: isMobile ? "none" : "block" }} className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Organisation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Forum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.image ? (
                        <img src={user.image} alt={user.name} className="h-8 w-8 rounded-full mr-3" />
                      ) : (
                        <div className="h-8 w-8 rounded-full mr-3 bg-zinc-200 dark:bg-zinc-600 flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-300">
                          {(user.name || user.email)?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{user.name || "—"}</div>
                        <div className="text-xs text-zinc-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.memberOrgs && user.memberOrgs.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.memberOrgs.map((org) => (
                          <span key={org.slug} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            {org.name}
                            {org.isPrimary && <span className="text-amber-600 dark:text-amber-400" title="Primary contact">★</span>}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-zinc-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.postCount != null && user.postCount > 0 ? (
                      <div>
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{user.postCount} post{user.postCount !== 1 ? "s" : ""}</span>
                        {user.lastPostAt && (
                          <div className="text-xs text-zinc-400 mt-0.5">Last: {timeAgo(user.lastPostAt)}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-zinc-400 text-xs">No posts</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      disabled={user.role === "super_admin"}
                      className="text-sm border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="public">Public</option>
                      <option value="member">Member</option>
                      <option value="working_group">Working Group</option>
                      <option value="steering">Steering</option>
                      <option value="team">Team</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      {/* Email icon */}
                      <button
                        onClick={() => openEmailModal(user)}
                        title={`Email ${user.name || user.email}`}
                        className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <Link
                        href={`/dashboard/admin/users/${user._id}/working-groups`}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition inline-block text-xs font-medium"
                      >
                        Manage Groups
                      </Link>
                      {user.role !== "super_admin" && (
                        <button
                          onClick={() => openDeleteModal(user)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-xs font-medium"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile Cards */}
      {filteredUsers.length > 0 && (
        <div style={{ display: isMobile ? "block" : "none" }} className="space-y-3">
          {filteredUsers.map((user) => (
            <div key={user._id} className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
              <div className="flex items-center gap-3 mb-3">
                {user.image ? (
                  <img src={user.image} alt={user.name} className="h-10 w-10 rounded-full flex-shrink-0" />
                ) : (
                  <div className="h-10 w-10 rounded-full flex-shrink-0 bg-zinc-200 dark:bg-zinc-600 flex items-center justify-center text-sm font-medium text-zinc-600 dark:text-zinc-300">
                    {(user.name || user.email)?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{user.name || "—"}</p>
                  <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => openEmailModal(user)}
                  title="Email user"
                  className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>

              {user.memberOrgs && user.memberOrgs.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {user.memberOrgs.map((org) => (
                    <span key={org.slug} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {org.name}
                      {org.isPrimary && <span className="text-amber-600 dark:text-amber-400" title="Primary contact">★</span>}
                    </span>
                  ))}
                </div>
              )}

              {/* Forum stats */}
              {user.postCount != null && user.postCount > 0 ? (
                <p className="text-xs text-zinc-500 mb-3">
                  {user.postCount} forum post{user.postCount !== 1 ? "s" : ""}
                  {user.lastPostAt && <> · Last active {timeAgo(user.lastPostAt)}</>}
                </p>
              ) : (
                <p className="text-xs text-zinc-400 mb-3">No forum posts</p>
              )}

              <div className="mb-3">
                <label className="text-xs text-zinc-500 uppercase font-medium block mb-1">Role</label>
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user._id, e.target.value)}
                  disabled={user.role === "super_admin"}
                  className="w-full text-sm border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1.5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="public">Public</option>
                  <option value="member">Member</option>
                  <option value="working_group">Working Group</option>
                  <option value="steering">Steering</option>
                  <option value="team">Team</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/dashboard/admin/users/${user._id}/working-groups`}
                  className="flex-1 text-center px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-xs font-medium"
                >
                  Manage Groups
                </Link>
                {user.role !== "super_admin" && (
                  <button
                    onClick={() => openDeleteModal(user)}
                    className="flex-1 px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition text-xs font-medium"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Email Modal */}
      {emailModal.open && emailModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl max-w-lg w-full">
            {emailModal.sent ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Email sent</h3>
                <p className="text-sm text-zinc-500 mb-6">Your message was delivered to {emailModal.user.email}.</p>
                <button onClick={closeEmailModal} className="px-6 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-700 transition">
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Email user</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">To: {emailModal.user.name ? `${emailModal.user.name} <${emailModal.user.email}>` : emailModal.user.email}</p>
                  </div>
                  <button onClick={closeEmailModal} className="text-zinc-400 hover:text-zinc-600 transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Subject</label>
                    <input
                      type="text"
                      value={emailModal.subject}
                      onChange={(e) => setEmailModal((prev) => ({ ...prev, subject: e.target.value }))}
                      placeholder="Subject line…"
                      className="w-full px-3 py-2.5 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Message</label>
                    <textarea
                      value={emailModal.message}
                      onChange={(e) => setEmailModal((prev) => ({ ...prev, message: e.target.value }))}
                      placeholder="Write your message…"
                      rows={7}
                      className="w-full px-3 py-2.5 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {emailModal.error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">{emailModal.error}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-b-xl">
                  <button onClick={closeEmailModal} disabled={emailModal.loading}
                    className="flex-1 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 rounded-lg font-medium text-sm transition disabled:opacity-50">
                    Cancel
                  </button>
                  <button onClick={handleSendEmail} disabled={emailModal.loading}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition disabled:opacity-50">
                    {emailModal.loading ? "Sending…" : "Send"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Invite User Modal */}
      {inviteModal.open && (
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
                  {inviteModal.email} has been invited to join the selected organisation.
                </p>
                <button onClick={closeInviteModal} className="px-6 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-700 transition">
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Invite User</h3>
                  <p className="text-sm text-zinc-500 mt-1">Invite someone to join a member organisation</p>
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
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Organisation *</label>
                    <select value={inviteModal.memberSlug}
                      onChange={(e) => setInviteModal((prev) => ({ ...prev, memberSlug: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm">
                      {members.map((m) => (
                        <option key={m.slug} value={m.slug}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Personal message <span className="font-normal text-zinc-400">(optional)</span>
                    </label>
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
                  <button onClick={handleInviteUser}
                    disabled={inviteModal.loading || !inviteModal.email.trim() || !inviteModal.memberSlug}
                    className="flex-1 px-4 py-2 text-white rounded-lg font-medium text-sm transition disabled:opacity-50"
                    style={{ backgroundColor: "#f59e0b" }}>
                    {inviteModal.loading ? "Sending..." : "Send Invitation"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && deleteModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Delete User</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">This cannot be undone.</p>
              </div>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-700 rounded-lg p-4 mb-5 space-y-2">
              <div>
                <span className="text-xs text-zinc-500 uppercase font-medium">Name</span>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{deleteModal.user.name || "—"}</p>
              </div>
              <div>
                <span className="text-xs text-zinc-500 uppercase font-medium">Email</span>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 break-all">{deleteModal.user.email}</p>
              </div>
              <div>
                <span className="text-xs text-zinc-500 uppercase font-medium">Role</span>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 capitalize">{deleteModal.user.role?.replace("_", " ") || "—"}</p>
              </div>
              {deleteModal.user.memberOrgs && deleteModal.user.memberOrgs.length > 0 && (
                <div>
                  <span className="text-xs text-zinc-500 uppercase font-medium">Member Organisations</span>
                  <div className="mt-1 space-y-1">
                    {deleteModal.user.memberOrgs.map((org) => (
                      <div key={org.slug} className="flex items-center gap-2">
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">{org.name}</span>
                        {org.isPrimary && (
                          <span className="px-1.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded">Primary Contact</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {deleteModal.user.memberOrgs.some((o) => o.isPrimary) && (
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-2 font-medium">
                      ⚠ This user is the primary contact for one or more organisations. Those organisations will remain in the directory without a primary contact.
                    </p>
                  )}
                </div>
              )}
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-5">
              Their forum posts will remain but will show as written by <span className="font-medium">Former Member</span>.
            </p>
            <div className="flex gap-3">
              <button onClick={closeDeleteModal} disabled={deleteModal.loading}
                className="flex-1 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 rounded-lg font-medium text-sm transition disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleteModal.loading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition disabled:opacity-50">
                {deleteModal.loading ? "Deleting..." : "Yes, Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
