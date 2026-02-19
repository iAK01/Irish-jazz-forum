"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import Link from "next/link";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  workingGroups?: string[];
}

interface WorkingGroup {
  _id: string;
  name: string;
  slug: string;
  description: string;
  isPrivate: boolean;
  members: string[];
}

export default function UserWorkingGroupsPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [user, setUser] = useState<User | null>(null);
  const [allGroups, setAllGroups] = useState<WorkingGroup[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session, userId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch user details
      const userRes = await fetch(`/api/users`);
      if (userRes.ok) {
        const userData = await userRes.json();
        const foundUser = userData.data.find((u: User) => u._id === userId);
        if (foundUser) {
          setUser(foundUser);
          setSelectedGroups(foundUser.workingGroups || []);
        }
      }

      // Fetch all working groups
      const groupsRes = await fetch("/api/working-groups");
      if (groupsRes.ok) {
        const groupsData = await groupsRes.json();
        setAllGroups(groupsData.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleGroup = (groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);

      // Update user's workingGroups
      const userRes = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workingGroups: selectedGroups,
        }),
      });

      if (!userRes.ok) {
        throw new Error("Failed to update user");
      }

      // Update each working group's members array
      for (const group of allGroups) {
        const shouldBeInGroup = selectedGroups.includes(group._id);
        const isInGroup = group.members.includes(userId);

        if (shouldBeInGroup && !isInGroup) {
          // Add user to group
          await fetch(`/api/working-groups/${group._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              members: [...group.members, userId],
            }),
          });
        } else if (!shouldBeInGroup && isInGroup) {
          // Remove user from group
          await fetch(`/api/working-groups/${group._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              members: group.members.filter((id) => id !== userId),
            }),
          });
        }
      }

      alert("Working groups updated successfully!");
      router.push("/dashboard/admin/users");
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to update working groups");
    } finally {
      setSaving(false);
    }
  };

  if (!session || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
    return (
      <DashboardLayout title="Assign Working Groups" userName="Guest">
        <div className="p-8">
          <p>Access denied. Admin privileges required.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout
        title="Assign Working Groups"
        userName={session.user.name}
      >
        <div className="text-center py-12">
          <p className="text-zinc-500">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout
        title="Assign Working Groups"
        userName={session.user.name}
      >
        <div className="p-8">
          <p>User not found.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Assign Working Groups"
      userName={session.user.name}
    >
      <div className="max-w-4xl mx-auto">
        {/* User Info */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 mb-6 border border-zinc-200 dark:border-zinc-700">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            {user.name}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">{user.email}</p>
          <p className="text-sm text-zinc-500 mt-1">Role: {user.role}</p>
        </div>

        {/* Working Groups List */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            Assign to Working Groups
          </h3>

          {allGroups.length === 0 ? (
            <p className="text-zinc-600 dark:text-zinc-400">
              No working groups available.{" "}
              <Link
                href="/dashboard/admin/working-groups"
                className="text-ijf-accent hover:underline"
              >
                Create one first
              </Link>
            </p>
          ) : (
            <div className="space-y-3">
              {allGroups.map((group) => (
                <div
                  key={group._id}
                  className="flex items-start gap-3 p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition"
                >
                  <input
                    type="checkbox"
                    id={`group-${group._id}`}
                    checked={selectedGroups.includes(group._id)}
                    onChange={() => handleToggleGroup(group._id)}
                    className="mt-1 w-4 h-4"
                  />
                  <label
                    htmlFor={`group-${group._id}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {group.name}
                      </span>
                      {group.isPrivate && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded text-xs">
                          Private
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                      {group.description}
                    </p>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-ijf-accent text-ijf-bg rounded-lg hover:bg-ijf-accent/80 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-zinc-200 dark:bg-zinc-700 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}