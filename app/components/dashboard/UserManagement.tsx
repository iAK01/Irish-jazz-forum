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
}

interface DeleteModalState {
  open: boolean;
  user: User | null;
  loading: boolean;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    open: false,
    user: null,
    loading: false,
  });

  useEffect(() => {
    fetchUsers();
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

  const openDeleteModal = (user: User) => {
    setDeleteModal({ open: true, user, loading: false });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ open: false, user: null, loading: false });
  };

  const handleDelete = async () => {
    if (!deleteModal.user) return;

    setDeleteModal((prev) => ({ ...prev, loading: true }));

    try {
      const res = await fetch(`/api/users/${deleteModal.user._id}`, {
        method: "DELETE",
      });

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

  if (loading) {
    return <div className="text-center py-4">Loading users...</div>;
  }

  return (
    <>
      <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {users.map((user) => (
              <tr
                key={user._id}
                className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="h-8 w-8 rounded-full mr-3"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full mr-3 bg-zinc-200 dark:bg-zinc-600 flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-300">
                        {(user.name || user.email)?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {user.name || "—"}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                  {user.email}
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
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Delete User
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  This cannot be undone.
                </p>
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-700 rounded-lg p-4 mb-5 space-y-2">
              <div>
                <span className="text-xs text-zinc-500 uppercase font-medium">Name</span>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {deleteModal.user.name || "—"}
                </p>
              </div>
              <div>
                <span className="text-xs text-zinc-500 uppercase font-medium">Email</span>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  {deleteModal.user.email}
                </p>
              </div>
              <div>
                <span className="text-xs text-zinc-500 uppercase font-medium">Role</span>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 capitalize">
                  {deleteModal.user.role.replace("_", " ")}
                </p>
              </div>
              {deleteModal.user.memberOrgs && deleteModal.user.memberOrgs.length > 0 && (
                <div>
                  <span className="text-xs text-zinc-500 uppercase font-medium">Member Organisations</span>
                  <div className="mt-1 space-y-1">
                    {deleteModal.user.memberOrgs.map((org) => (
                      <div key={org.slug} className="flex items-center gap-2">
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">{org.name}</span>
                        {org.isPrimary && (
                          <span className="px-1.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded">
                            Primary Contact
                          </span>
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
                {deleteModal.loading ? "Deleting..." : "Yes, Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}