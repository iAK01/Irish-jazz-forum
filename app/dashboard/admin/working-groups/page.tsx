"use client";

import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
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

interface UserMemberOrg {
  slug: string;
  name: string;
  region?: string | null;
  isPrimary: boolean;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  workingGroups?: string[];
  primaryRegion?: string | null;
  primaryOrgName?: string | null;
  memberOrgs?: UserMemberOrg[];
}

interface AssignmentModalState {
  open: boolean;
  group: WorkingGroup | null;
  selectedUserIds: string[];
  search: string;
  saving: boolean;
  error: string;
}

const EMPTY_ASSIGNMENT_MODAL: AssignmentModalState = {
  open: false,
  group: null,
  selectedUserIds: [],
  search: "",
  saving: false,
  error: "",
};

export default function WorkingGroupsAdminPage() {
  const { data: session } = useSession();
  const [groups, setGroups] = useState<WorkingGroup[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<WorkingGroup | null>(null);
  const [assignmentModal, setAssignmentModal] =
    useState<AssignmentModalState>(EMPTY_ASSIGNMENT_MODAL);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    coordinatorId: "",
    isPrivate: false,
  });

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [groupsRes, usersRes] = await Promise.all([
        fetch("/api/working-groups"),
        fetch("/api/users"),
      ]);

      if (groupsRes.ok) {
        const groupsData = await groupsRes.json();
        setGroups(groupsData.data || []);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.data || []);
      }
    } catch (error) {
      console.error("Error fetching working-group admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const assignableUsers = useMemo(
    () =>
      users
        .filter((user) => user.role !== "public")
        .sort((a, b) => a.name.localeCompare(b.name)),
    [users]
  );

  const assignedUsersByGroup = useMemo(() => {
    const map = new Map<string, User[]>();

    for (const group of groups) {
      map.set(
        group._id,
        assignableUsers
          .filter((user) => (user.workingGroups || []).includes(group._id))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
    }

    return map;
  }, [groups, assignableUsers]);

  const totalAssignments = useMemo(
    () =>
      assignableUsers.reduce(
        (sum, user) => sum + (user.workingGroups?.length || 0),
        0
      ),
    [assignableUsers]
  );

  const unassignedUsers = useMemo(
    () =>
      assignableUsers.filter((user) => (user.workingGroups?.length || 0) === 0),
    [assignableUsers]
  );

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch("/api/working-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to create working group");
      }

      await fetchData();
      setShowCreateForm(false);
      setFormData({
        name: "",
        description: "",
        coordinatorId: "",
        isPrivate: false,
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create working group");
    }
  };

  const handleEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingGroup) return;

    try {
      const response = await fetch(`/api/working-groups/${editingGroup._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to update working group");
      }

      await fetchData();
      setEditingGroup(null);
      setFormData({
        name: "",
        description: "",
        coordinatorId: "",
        isPrivate: false,
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update working group");
    }
  };

  const handleDeactivate = async (groupId: string) => {
    if (!confirm("Are you sure you want to deactivate this working group?")) {
      return;
    }

    try {
      const response = await fetch(`/api/working-groups/${groupId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to deactivate working group");
      }

      await fetchData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to deactivate working group");
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

  const openAssignmentModal = (group: WorkingGroup) => {
    const assignedUserIds =
      assignedUsersByGroup.get(group._id)?.map((user) => user._id) || [];
    const selectedUserIds = [...new Set([...assignedUserIds, group.coordinator._id])];

    setAssignmentModal({
      open: true,
      group,
      selectedUserIds,
      search: "",
      saving: false,
      error: "",
    });
  };

  const closeAssignmentModal = () => {
    setAssignmentModal(EMPTY_ASSIGNMENT_MODAL);
  };

  const toggleUserAssignment = (userId: string) => {
    if (!assignmentModal.group) return;
    if (assignmentModal.group.coordinator._id === userId) return;

    setAssignmentModal((current) => ({
      ...current,
      selectedUserIds: current.selectedUserIds.includes(userId)
        ? current.selectedUserIds.filter((id) => id !== userId)
        : [...current.selectedUserIds, userId],
    }));
  };

  const saveAssignments = async () => {
    const group = assignmentModal.group;
    if (!group) return;

    const targetUserIds = [
      ...new Set([...assignmentModal.selectedUserIds, group.coordinator._id]),
    ];

    const affectedUsers = assignableUsers.filter(
      (user) =>
        targetUserIds.includes(user._id) ||
        (user.workingGroups || []).includes(group._id)
    );

    try {
      setAssignmentModal((current) => ({
        ...current,
        saving: true,
        error: "",
      }));

      await Promise.all(
        affectedUsers.map(async (user) => {
          const hasGroup = (user.workingGroups || []).includes(group._id);
          const shouldHaveGroup = targetUserIds.includes(user._id);

          if (hasGroup === shouldHaveGroup) {
            return;
          }

          const nextWorkingGroups = shouldHaveGroup
            ? [...new Set([...(user.workingGroups || []), group._id])]
            : (user.workingGroups || []).filter((value) => value !== group._id);

          const response = await fetch(`/api/users/${user._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              workingGroups: nextWorkingGroups,
            }),
          });

          if (!response.ok) {
            const result = await response.json();
            throw new Error(
              result.error || `Failed to update working groups for ${user.name}`
            );
          }
        })
      );

      const syncGroupResponse = await fetch(`/api/working-groups/${group._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coordinatorId: group.coordinator._id,
          members: targetUserIds,
        }),
      });

      if (!syncGroupResponse.ok) {
        const result = await syncGroupResponse.json();
        throw new Error(result.error || "Failed to sync working-group members");
      }

      await fetchData();
      closeAssignmentModal();
    } catch (error) {
      setAssignmentModal((current) => ({
        ...current,
        saving: false,
        error:
          error instanceof Error ? error.message : "Failed to save assignments",
      }));
      return;
    }
  };

  if (
    !session ||
    (session.user.role !== "admin" && session.user.role !== "super_admin")
  ) {
    return (
      <DashboardLayout title="Groups" userName="Guest">
        <div className="p-8">
          <p>Access denied. Admin privileges required.</p>
        </div>
      </DashboardLayout>
    );
  }

  const modalGroup = assignmentModal.group;
  const modalUsers = modalGroup
    ? assignableUsers
        .filter((user) => {
          const query = assignmentModal.search.trim().toLowerCase();
          if (!query) return true;

          return (
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            (user.primaryOrgName || "").toLowerCase().includes(query) ||
            (user.primaryRegion || "").toLowerCase().includes(query)
          );
        })
        .sort((a, b) => {
          const aSelected = assignmentModal.selectedUserIds.includes(a._id);
          const bSelected = assignmentModal.selectedUserIds.includes(b._id);

          if (aSelected && !bSelected) return -1;
          if (!aSelected && bSelected) return 1;
          return a.name.localeCompare(b.name);
        })
    : [];

  return (
    <DashboardLayout title="Groups" userName={session.user.name}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-zinc-600 dark:text-zinc-400">
              See who leads each group, who is assigned to it, and where those people are based.
            </p>
            <p className="text-sm text-zinc-500 mt-1">
              Use this page to staff working groups quickly.
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-ijf-accent text-ijf-bg rounded-lg hover:bg-ijf-accent/80 transition font-semibold"
          >
            + New Working Group
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-sm font-medium text-zinc-600">Working Groups</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900">{groups.length}</p>
            <p className="mt-2 text-xs text-zinc-500">
              Active staffing areas across the forum
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-sm font-medium text-zinc-600">Assignment Links</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900">{totalAssignments}</p>
            <p className="mt-2 text-xs text-zinc-500">
              Total user-to-group assignments
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-sm font-medium text-zinc-600">Unassigned Users</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900">{unassignedUsers.length}</p>
            <p className="mt-2 text-xs text-zinc-500">
              People not currently placed in any group
            </p>
          </div>
        </div>

        {unassignedUsers.length > 0 && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">
              Unassigned people
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {unassignedUsers.slice(0, 10).map((user) => (
                <span
                  key={user._id}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 border border-amber-200"
                >
                  {user.name}
                  {user.primaryRegion && (
                    <span className="text-zinc-500">{user.primaryRegion}</span>
                  )}
                </span>
              ))}
              {unassignedUsers.length > 10 && (
                <span className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 border border-amber-200">
                  +{unassignedUsers.length - 10} more
                </span>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-zinc-500">Loading groups...</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-12 text-center">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              No working groups yet. Create your first one.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {groups.map((group) => {
              const assignedUsers = assignedUsersByGroup.get(group._id) || [];
              const previewUsers = assignedUsers.slice(0, 6);
              const hiddenCount = Math.max(assignedUsers.length - previewUsers.length, 0);

              return (
                <div
                  key={group._id}
                  className="bg-white rounded-xl p-6 border border-zinc-200"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-bold text-zinc-900">
                          {group.name}
                        </h3>
                        {group.isPrivate && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                            Private
                          </span>
                        )}
                        {!group.isActive && (
                          <span className="px-2 py-1 bg-zinc-100 text-zinc-800 rounded text-xs font-medium">
                            Inactive
                          </span>
                        )}
                      </div>

                      <p className="text-zinc-600 mb-4">{group.description}</p>

                      <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
                        <span className="inline-flex items-center gap-2 rounded-full bg-zinc-50 border border-zinc-200 px-3 py-1.5 text-zinc-800">
                          Coordinator: <strong>{group.coordinator.name}</strong>
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-3 py-1.5 text-amber-900">
                          <strong>{assignedUsers.length}</strong> assigned
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 border border-sky-200 px-3 py-1.5 text-sky-900">
                          {assignedUsers.filter((user) => user.primaryRegion).length} with region
                        </span>
                      </div>

                      <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                            Assigned People
                          </h4>
                          {assignedUsers.length > 0 && (
                            <button
                              type="button"
                              onClick={() => openAssignmentModal(group)}
                              className="text-sm font-semibold text-ijf-accent hover:underline"
                            >
                              Manage people
                            </button>
                          )}
                        </div>

                        {assignedUsers.length === 0 ? (
                          <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-4 py-5 text-sm text-zinc-500">
                            Nobody is assigned to this group yet.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {previewUsers.map((user) => {
                              const isCoordinator = user._id === group.coordinator._id;
                              return (
                                <div
                                  key={user._id}
                                  className="rounded-lg border border-zinc-200 bg-white px-4 py-3"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="font-semibold text-zinc-900 truncate">
                                        {user.name}
                                      </p>
                                      <p className="text-xs text-zinc-500 truncate">
                                        {user.primaryOrgName || user.email}
                                      </p>
                                    </div>
                                    {isCoordinator && (
                                      <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-semibold border border-amber-200">
                                        Coordinator
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                                    <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-zinc-700">
                                      {user.primaryRegion || "No region"}
                                    </span>
                                    <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-zinc-700">
                                      {(user.workingGroups?.length || 0)} groups
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                            {hiddenCount > 0 && (
                              <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-500 flex items-center justify-center">
                                +{hiddenCount} more assigned people
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-stretch gap-2 w-40 flex-shrink-0">
                      <button
                        onClick={() => openAssignmentModal(group)}
                        className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 text-sm font-semibold"
                      >
                        Manage People
                      </button>
                      <button
                        onClick={() => startEdit(group)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-semibold"
                      >
                        Edit Group
                      </button>
                      {group.isActive && (
                        <button
                          onClick={() => handleDeactivate(group._id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-semibold"
                        >
                          Deactivate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6 text-zinc-900">
                Create Working Group
              </h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(event) =>
                      setFormData({ ...formData, name: event.target.value })
                    }
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg bg-white text-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        description: event.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg bg-white text-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Coordinator *
                  </label>
                  <select
                    required
                    value={formData.coordinatorId}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        coordinatorId: event.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg bg-white text-zinc-900"
                  >
                    <option value="">Select coordinator...</option>
                    {assignableUsers.map((user) => (
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
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        isPrivate: event.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <label htmlFor="isPrivate" className="text-sm text-zinc-700">
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
                      setFormData({
                        name: "",
                        description: "",
                        coordinatorId: "",
                        isPrivate: false,
                      });
                    }}
                    className="px-6 py-2 bg-zinc-200 rounded-lg hover:bg-zinc-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editingGroup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6 text-zinc-900">
                Edit Working Group
              </h2>
              <form onSubmit={handleEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(event) =>
                      setFormData({ ...formData, name: event.target.value })
                    }
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg bg-white text-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        description: event.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg bg-white text-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Coordinator *
                  </label>
                  <select
                    required
                    value={formData.coordinatorId}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        coordinatorId: event.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg bg-white text-zinc-900"
                  >
                    <option value="">Select coordinator...</option>
                    {assignableUsers.map((user) => (
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
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        isPrivate: event.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <label htmlFor="isPrivateEdit" className="text-sm text-zinc-700">
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
                      setFormData({
                        name: "",
                        description: "",
                        coordinatorId: "",
                        isPrivate: false,
                      });
                    }}
                    className="px-6 py-2 bg-zinc-200 rounded-lg hover:bg-zinc-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {assignmentModal.open && modalGroup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900">
                    Manage People: {modalGroup.name}
                  </h2>
                  <p className="text-sm text-zinc-500 mt-1">
                    Assign people from the user database. Coordinator stays assigned automatically.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeAssignmentModal}
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                >
                  Close
                </button>
              </div>

              <div className="mb-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 border border-zinc-200 text-zinc-800">
                    Coordinator: <strong>{modalGroup.coordinator.name}</strong>
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 border border-zinc-200 text-zinc-800">
                    {assignmentModal.selectedUserIds.length} selected
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  value={assignmentModal.search}
                  onChange={(event) =>
                    setAssignmentModal((current) => ({
                      ...current,
                      search: event.target.value,
                    }))
                  }
                  placeholder="Search by name, email, organisation, or region..."
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg bg-white text-zinc-900"
                />
              </div>

              <div className="space-y-3">
                {modalUsers.map((user) => {
                  const isSelected = assignmentModal.selectedUserIds.includes(user._id);
                  const isCoordinator = user._id === modalGroup.coordinator._id;

                  return (
                    <div
                      key={user._id}
                      className={`rounded-xl border p-4 transition ${
                        isSelected
                          ? "border-amber-300 bg-amber-50"
                          : "border-zinc-200 bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleUserAssignment(user._id)}
                          disabled={isCoordinator}
                          className="mt-1 w-4 h-4"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-zinc-900">{user.name}</p>
                            {isCoordinator && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                                Coordinator
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-xs font-medium">
                              {user.primaryRegion || "No region"}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-xs font-medium">
                              {(user.workingGroups?.length || 0)} groups
                            </span>
                          </div>
                          <p className="text-sm text-zinc-500 mt-1">{user.email}</p>
                          <p className="text-sm text-zinc-600 mt-1">
                            {user.primaryOrgName || "No linked member profile"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {assignmentModal.error && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {assignmentModal.error}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={saveAssignments}
                  disabled={assignmentModal.saving}
                  className="px-6 py-3 bg-ijf-accent text-ijf-bg rounded-lg hover:bg-ijf-accent/80 font-semibold disabled:opacity-50"
                >
                  {assignmentModal.saving ? "Saving..." : "Save Assignments"}
                </button>
                <button
                  onClick={closeAssignmentModal}
                  disabled={assignmentModal.saving}
                  className="px-6 py-3 bg-zinc-200 rounded-lg hover:bg-zinc-300 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
