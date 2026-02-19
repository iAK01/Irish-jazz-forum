// MODIFICATION FOR: /app/dashboard/admin/members/page.tsx
// CHANGE: Add "Invite Member" button and pending members count badge

"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import Link from "next/link";

interface Member {
  _id: string;
  name: string;
  slug: string;
  memberType: string;
  region?: string;
  membershipStatus: string;
  joinedAt: string;
}

export default function MembersListPage() {
  const { data: session } = useSession();
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
            member.memberType.toLowerCase().includes(query) ||
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

  // ADDED: Fetch pending members count
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
    <DashboardLayout
      title="Member Directory"
      userName={session.user.name}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-zinc-600 dark:text-zinc-400">
              Manage all member profiles
            </p>
            <p className="text-sm text-zinc-500 mt-1">
              Total members: {filteredMembers.length}
            </p>
          </div>
          
          {/* ADDED: Action Buttons */}
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
              style={{ backgroundColor: 'var(--color-ijf-accent)' }}
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

        {/* Members List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-zinc-500">Loading members...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-12 text-center">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              {searchQuery ? "No members match your search." : "No members found."}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Region
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {filteredMembers.map((member) => (
                  <tr
                    key={member._id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {member.name}
                      </div>
                      <div className="text-sm text-zinc-500">/{member.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {member.memberType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                      {member.region || "—"}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}