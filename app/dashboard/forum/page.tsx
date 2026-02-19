"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";

interface WorkingGroupStats {
  slug: string;
  name: string;
  threadCount: number;
  lastActivity?: Date;
}

export default function ForumHomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [generalThreadCount, setGeneralThreadCount] = useState(0);
  const [workingGroups, setWorkingGroups] = useState<WorkingGroupStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchForumData();
    }
  }, [session]);

  const fetchForumData = async () => {
    try {
      setLoading(true);

      // Fetch general discussion threads count
      const generalRes = await fetch("/api/threads?workingGroup=general");
      if (generalRes.ok) {
        const generalData = await generalRes.json();
        setGeneralThreadCount(generalData.data?.length || 0);
      }

      // Fetch working groups from database (filtered by user access)
      const groupsRes = await fetch("/api/working-groups");
      if (groupsRes.ok) {
        const groupsData = await groupsRes.json();
        const groups = groupsData.data || [];
        
        // Fetch thread counts for each working group
        const groupStats = await Promise.all(
          groups.map(async (group: any) => {
            const res = await fetch(`/api/threads?workingGroup=${group.slug}`);
            if (res.ok) {
              const data = await res.json();
              const threads = data.data || [];
              return {
                slug: group.slug,
                name: group.name,
                threadCount: threads.length,
                lastActivity: threads[0]?.lastActivityAt,
              };
            }
            return {
              slug: group.slug,
              name: group.name,
              threadCount: 0,
            };
          })
        );

        setWorkingGroups(groupStats);
      }
    } catch (error) {
      console.error("Error fetching forum data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <DashboardLayout
        title="Discussion Forum"
        userName="Guest"
      >
        <div className="p-8">
          <p>Please sign in to access the forum.</p>
        </div>
      </DashboardLayout>
    );
  }

  const currentUser = session.user as any;
  const isPrivileged = 
    currentUser.role === "steering" ||
    currentUser.role === "admin" ||
    currentUser.role === "super_admin";

  return (
    <DashboardLayout
      title="IJF Discussion Forum"
      userName={session.user.name}
    >
      {/* Hero Section */}
      <div className="mb-8 px-8 py-12 rounded-xl" style={{ background: 'linear-gradient(135deg, var(--color-ijf-bg) 0%, #1a1f2e 100%)' }}>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-3">
            Welcome back, {session.user.name?.split(' ')[0]}
          </h1>
          <p className="text-xl text-gray-300">
            Collaborate with the Irish jazz community through focused discussions
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 pb-8">
    
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-ijf-accent)' }}></div>
            <p className="text-gray-500 mt-4">Loading forum...</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* General Discussion - Featured Card */}
            <div>
              <div 
                onClick={() => router.push("/dashboard/forum/general")}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer border-2 border-transparent hover:border-opacity-50"
                style={{ borderColor: 'var(--color-ijf-accent)' }}
              >
                <div className="p-8">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-ijf-accent)' }}>
                          <svg className="w-6 h-6" style={{ color: 'var(--color-ijf-bg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 group-hover:text-opacity-80 transition">
                            IJF General Discussion
                          </h2>
                          <p className="text-sm font-medium mt-1" style={{ color: 'var(--color-ijf-accent)' }}>
                            Open to all members
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        Open forum for all members - announcements, general topics, and cross-group discussions
                      </p>
                    </div>
                    <div className="ml-8 text-center">
                      <div className="text-5xl font-bold mb-2" style={{ color: 'var(--color-ijf-accent)' }}>
                        {generalThreadCount}
                      </div>
                      <div className="text-sm text-gray-500 font-medium">
                        {generalThreadCount === 1 ? 'thread' : 'threads'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Working Groups Section */}
            {workingGroups.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">
                    Your Working Groups
                  </h2>
                  <span className="px-4 py-2 bg-gray-100 rounded-full text-sm font-semibold text-gray-700">
                    {workingGroups.length} {workingGroups.length === 1 ? 'group' : 'groups'}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {workingGroups.map((group) => (
                    <div
                      key={group.slug}
                      onClick={() => router.push(`/dashboard/forum/${group.slug}`)}
                      className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-gray-200"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-ijf-accent)' }}></div>
                              <h3 className="text-xl font-bold text-gray-900 group-hover:text-opacity-80 transition">
                                {group.name}
                              </h3>
                            </div>
                            {group.lastActivity && (
                              <p className="text-sm text-gray-500">
                                Last activity: {new Date(group.lastActivity).toLocaleDateString("en-IE", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric"
                                })}
                              </p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-3xl font-bold" style={{ color: 'var(--color-ijf-primary)' }}>
                              {group.threadCount}
                            </div>
                            <div className="text-xs text-gray-500 font-medium">
                              {group.threadCount === 1 ? 'thread' : 'threads'}
                            </div>
                          </div>
                        </div>

                        {/* Activity indicator */}
                        <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          <span className="text-xs text-gray-500">
                            {group.threadCount === 0 ? 'No discussions yet' : 'Active discussions'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Working Groups Message */}
            {workingGroups.length === 0 && (
              <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No Working Groups Yet
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  You are not assigned to any working groups yet. Contact an administrator to join a working group.
                </p>
              </div>
            )}

            {/* Admin/Steering Note */}
            {isPrivileged && (
              <div className="rounded-xl p-6 border-2" style={{ backgroundColor: 'rgba(228, 185, 91, 0.1)', borderColor: 'var(--color-ijf-accent)' }}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-ijf-accent)' }}>
                      <svg className="w-5 h-5" style={{ color: 'var(--color-ijf-bg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">
                      {currentUser.role === 'super_admin' ? 'Super Admin' : currentUser.role === 'admin' ? 'Administrator' : 'Steering Member'} Access
                    </h4>
                    <p className="text-sm text-gray-700">
                      You have access to all working group discussions across the forum.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}