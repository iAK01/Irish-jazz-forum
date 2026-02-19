"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";

interface WorkingGroup {
  _id: string;
  name: string;
  slug: string;
  description: string;
  coordinator: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  members: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  }[];
  isPrivate: boolean;
  isActive: boolean;
  createdAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function WorkingGroupsAdminPage() {
  const { data: session } = useSession();
  const [groups, setGroups] = useState<WorkingGroup[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<WorkingGroup | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    coordinatorId: "",
    isPrivate: false,
  });

  useEffect(() => {
    if (session?.user) {
      fetchGroups();
      fetchUsers();
    }
  }, [session]);

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/working-groups");
      if (res.ok) {
        const data = await res.json();
        setGroups(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/working-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchGroups();
        setShowCreateForm(false);
        setFormData({ name: "", description: "", coordinatorId: "", isPrivate: false });
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create working group");
      }
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Failed to create working group");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;

    try {
      const res = await fetch(`/api/working-groups/${editingGroup._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchGroups();
        setEditingGroup(null);
        setFormData({ name: "", description: "", coordinatorId: "", isPrivate: false });
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update working group");
      }
    } catch (error) {
      console.error("Error updating group:", error);
      alert("Failed to update working group");
    }
  };

  const handleDeactivate = async (groupId: string) => {
    if (!confirm("Are you sure you want to deactivate this working group?")) return;

    try {
      const res = await fetch(`/api/working-groups/${groupId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchGroups();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to deactivate working group");
      }
    } catch (error) {
      console.error("Error deactivating group:", error);
      alert("Failed to deactivate working group");
    }
  };

  const startEdit = (group: WorkingGroup) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description,
      coordinatorId: group.coordinator._id,
      isPrivate: group.isPrivate,
    });
  };

  if (!session || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
    return (
      <DashboardLayout title="Working Groups" userName="Guest">
        <div className="p-8">
          <p>Access denied. Admin privileges required.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Manage Working Groups"
      userName={session.user.name}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-zinc-600 dark:text-zinc-400">
            Create and manage working groups for the forum
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-ijf-accent text-ijf-bg rounded-lg hover:bg-ijf-accent/80 transition font-semibold"
          >
            + New Working Group
          </button>
        </div>

        {/* Groups List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-zinc-500">Loading working groups...</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-12 text-center">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              No working groups yet. Create your first one!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <div
                key={group._id}
                className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        {group.name}
                      </h3>
                      {group.isPrivate && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded text-xs font-medium">
                          Private
                        </span>
                      )}
                      {!group.isActive && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 rounded text-xs font-medium">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-3">
                      {group.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500">Coordinator:</span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {group.coordinator.name}
                        </span>
                      </div>
                      <span className="text-zinc-400">•</span>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500">Members:</span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {group.members.length}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(group)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      Edit
                    </button>
                    {group.isActive && (
                      <button
                        onClick={() => handleDeactivate(group._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">
                Create Working Group
              </h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Coordinator *
                  </label>
                  <select
                    required
                    value={formData.coordinatorId}
                    onChange={(e) => setFormData({ ...formData, coordinatorId: e.target.value })}
                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="">Select coordinator...</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={formData.isPrivate}
                    onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isPrivate" className="text-sm text-zinc-700 dark:text-zinc-300">
                    Private (only members can see)
                  </label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-ijf-accent text-ijf-bg rounded-lg hover:bg-ijf-accent/80 font-semibold"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setFormData({ name: "", description: "", coordinatorId: "", isPrivate: false });
                    }}
                    className="px-6 py-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Form Modal */}
        {editingGroup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">
                Edit Working Group
              </h2>
              <form onSubmit={handleEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Coordinator *
                  </label>
                  <select
                    required
                    value={formData.coordinatorId}
                    onChange={(e) => setFormData({ ...formData, coordinatorId: e.target.value })}
                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="">Select coordinator...</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPrivateEdit"
                    checked={formData.isPrivate}
                    onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isPrivateEdit" className="text-sm text-zinc-700 dark:text-zinc-300">
                    Private (only members can see)
                  </label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-ijf-accent text-ijf-bg rounded-lg hover:bg-ijf-accent/80 font-semibold"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingGroup(null);
                      setFormData({ name: "", description: "", coordinatorId: "", isPrivate: false });
                    }}
                    className="px-6 py-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}