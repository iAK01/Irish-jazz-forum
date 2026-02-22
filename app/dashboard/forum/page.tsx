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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchForumData();
    }
  }, [session]);

  const fetchForumData = async () => {
    try {
      setLoading(true);

      const generalRes = await fetch("/api/threads?workingGroup=general");
      if (generalRes.ok) {
        const generalData = await generalRes.json();
        setGeneralThreadCount(generalData.data?.length || 0);
      }

      const groupsRes = await fetch("/api/working-groups");
      if (groupsRes.ok) {
        const groupsData = await groupsRes.json();
        const groups = groupsData.data || [];

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
            return { slug: group.slug, name: group.name, threadCount: 0 };
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
      <DashboardLayout title="Discussion Forum" userName="Guest">
        <div className="p-8"><p>Please sign in to access the forum.</p></div>
      </DashboardLayout>
    );
  }

  const currentUser = session.user as any;
  const isPrivileged =
    currentUser.role === "steering" ||
    currentUser.role === "admin" ||
    currentUser.role === "super_admin";

  return (
    <DashboardLayout title="IJF Discussion Forum" userName={session.user.name}>

      {/* Hero */}
      <div
        style={{
          marginBottom: "2rem",
          padding: isMobile ? "1.25rem" : "3rem 2rem",
          borderRadius: "0.75rem",
          background: "linear-gradient(135deg, var(--color-ijf-bg) 0%, #1a1f2e 100%)",
        }}
      >
        <h1 style={{ fontSize: isMobile ? "1.5rem" : "2.25rem", fontWeight: 700, color: "white", marginBottom: "0.5rem" }}>
          Welcome back, {session.user.name?.split(" ")[0]}
        </h1>
        <p style={{ fontSize: isMobile ? "0.9rem" : "1.25rem", color: "#d1d5db" }}>
          Collaborate with the Irish jazz community through focused discussions
        </p>
      </div>

      <div style={{ maxWidth: "72rem", margin: "0 auto", paddingBottom: "2rem" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: "var(--color-ijf-accent)" }} />
            <p style={{ color: "#6b7280", marginTop: "1rem" }}>Loading forum...</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

            {/* General Discussion card */}
            <div
              onClick={() => router.push("/dashboard/forum/general")}
              className="group"
              style={{
                backgroundColor: "white",
                borderRadius: "1rem",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                border: "2px solid var(--color-ijf-accent)",
                padding: isMobile ? "1.25rem" : "2rem",
                cursor: "pointer",
                transition: "box-shadow 0.3s",
              }}
            >
              <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                    <div style={{ width: "2.75rem", height: "2.75rem", borderRadius: "0.75rem", backgroundColor: "var(--color-ijf-accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg className="w-5 h-5" style={{ color: "var(--color-ijf-bg)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                      </svg>
                    </div>
                    <div>
                      <h2 style={{ fontSize: isMobile ? "1.1rem" : "1.5rem", fontWeight: 700, color: "#111827" }}>
                        IJF General Discussion
                      </h2>
                      <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-ijf-accent)" }}>
                        Open to all members
                      </p>
                    </div>
                  </div>
                  {!isMobile && (
                    <p style={{ color: "#4b5563", lineHeight: 1.6 }}>
                      Open forum for all members — announcements, general topics, and cross-group discussions
                    </p>
                  )}
                </div>
                <div style={{ textAlign: "center", flexShrink: 0 }}>
                  <div style={{ fontSize: isMobile ? "2rem" : "3rem", fontWeight: 700, color: "var(--color-ijf-accent)" }}>
                    {generalThreadCount}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 500 }}>
                    {generalThreadCount === 1 ? "thread" : "threads"}
                  </div>
                </div>
              </div>
            </div>

            {/* Working Groups */}
            {workingGroups.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                  <h2 style={{ fontSize: isMobile ? "1.25rem" : "1.875rem", fontWeight: 700, color: "#111827" }}>
                    Your Working Groups
                  </h2>
                  <span style={{ padding: "0.25rem 0.75rem", backgroundColor: "#f3f4f6", borderRadius: "9999px", fontSize: "0.8rem", fontWeight: 600, color: "#374151" }}>
                    {workingGroups.length} {workingGroups.length === 1 ? "group" : "groups"}
                  </span>
                </div>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
                  gap: "1rem",
                }}>
                  {workingGroups.map((group) => (
                    <div
                      key={group.slug}
                      onClick={() => router.push(`/dashboard/forum/${group.slug}`)}
                      style={{
                        backgroundColor: "white",
                        borderRadius: "0.75rem",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
                        border: "1px solid #f3f4f6",
                        padding: isMobile ? "1rem" : "1.5rem",
                        cursor: "pointer",
                        transition: "box-shadow 0.3s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
                            <div style={{ width: "0.5rem", height: "0.5rem", borderRadius: "9999px", backgroundColor: "var(--color-ijf-accent)", flexShrink: 0 }} />
                            <h3 style={{ fontSize: isMobile ? "1rem" : "1.25rem", fontWeight: 700, color: "#111827" }}>
                              {group.name}
                            </h3>
                          </div>
                          {group.lastActivity && (
                            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                              Last activity: {new Date(group.lastActivity).toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          )}
                        </div>
                        <div style={{ textAlign: "right", marginLeft: "1rem" }}>
                          <div style={{ fontSize: isMobile ? "1.5rem" : "1.875rem", fontWeight: 700, color: "var(--color-ijf-primary)" }}>
                            {group.threadCount}
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: 500 }}>
                            {group.threadCount === 1 ? "thread" : "threads"}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingTop: "0.75rem", borderTop: "1px solid #f3f4f6" }}>
                        <svg className="w-4 h-4" style={{ color: "#9ca3af" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                          {group.threadCount === 0 ? "No discussions yet" : "Active discussions"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No working groups */}
            {workingGroups.length === 0 && (
              <div style={{ backgroundColor: "#f9fafb", borderRadius: "0.75rem", padding: "3rem", textAlign: "center", border: "2px dashed #d1d5db" }}>
                <div style={{ width: "4rem", height: "4rem", backgroundColor: "#e5e7eb", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                  <svg className="w-8 h-8" style={{ color: "#9ca3af" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>No Working Groups Yet</h3>
                <p style={{ color: "#4b5563", maxWidth: "28rem", margin: "0 auto" }}>
                  You are not assigned to any working groups yet. Contact an administrator to join a working group.
                </p>
              </div>
            )}

            {/* Privileged note */}
            {isPrivileged && (
              <div style={{ borderRadius: "0.75rem", padding: isMobile ? "1rem" : "1.5rem", border: "2px solid var(--color-ijf-accent)", backgroundColor: "rgba(228, 185, 91, 0.1)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                  <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.5rem", backgroundColor: "var(--color-ijf-accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg className="w-5 h-5" style={{ color: "var(--color-ijf-bg)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 700, color: "#111827", marginBottom: "0.25rem" }}>
                      {currentUser.role === "super_admin" ? "Super Admin" : currentUser.role === "admin" ? "Administrator" : "Steering Member"} Access
                    </h4>
                    <p style={{ fontSize: "0.875rem", color: "#374151" }}>
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