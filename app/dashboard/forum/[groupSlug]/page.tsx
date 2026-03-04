"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";

interface Thread {
  _id: string;
  title: string;
  slug: string;
  publicToMembers: boolean;
  createdBy: {
    name: string;
    email: string;
    image?: string;
  };
  status: string;
  pinned: boolean;
  replyCount: number;
  viewCount: number;
  tags: string[];
  createdAt: string;
  lastActivityAt: string;
  updatedAt: string;
}

interface Member {
  _id: string;
  name: string;
  email: string;
  image?: string;
  lastSeenAt?: string;
}

interface WorkingGroup {
  _id: string;
  name: string;
  slug: string;
  description: string;
  isPrivate: boolean;
  coordinator: Member;
  members: Member[];
}

export default function WorkingGroupThreadList() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const groupSlug = params.groupSlug as string;

  const [threads, setThreads] = useState<Thread[]>([]);
  const [group, setGroup] = useState<WorkingGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (session?.user) fetchGroupAndThreads();
  }, [session, groupSlug]);

  const fetchGroupAndThreads = async () => {
    try {
      setLoading(true);
      setError("");

      const groupRes = await fetch("/api/working-groups");
      const groupsData = await groupRes.json();

      if (!groupRes.ok || !groupsData.success) {
        throw new Error(groupsData.error || "Failed to fetch working groups");
      }

      const currentGroup = groupsData.data.find((g: WorkingGroup) => g.slug === groupSlug);
      if (!currentGroup) {
        setError("Working group not found");
        setLoading(false);
        return;
      }

      setGroup(currentGroup);

      const threadsRes = await fetch(`/api/threads?workingGroup=${groupSlug}`);
      const threadsData = await threadsRes.json();

      if (!threadsRes.ok) {
        throw new Error(threadsData.error || "Failed to fetch threads");
      }

      setThreads(threadsData.data || []);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" });
  };

  const isOnline = (lastSeenAt?: string) => {
    if (!lastSeenAt) return false;
    return Date.now() - new Date(lastSeenAt).getTime() < 5 * 60 * 1000;
  };

  const formatLastSeen = (lastSeenAt?: string) => {
    if (!lastSeenAt) return "Never active";
    const diff = Date.now() - new Date(lastSeenAt).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const statusStyles: Record<string, React.CSSProperties> = {
    resolved: { backgroundColor: "#dbeafe", color: "#1e40af" },
    archived: { backgroundColor: "#f3f4f6", color: "#374151" },
    stalled: { backgroundColor: "#fef9c3", color: "#854d0e" },
    abandoned: { backgroundColor: "#fee2e2", color: "#991b1b" },
  };

  if (loading) {
    return (
      <DashboardLayout title="Loading..." userName={session?.user?.name || ""}>
        <div style={{ textAlign: "center", padding: "3rem 0" }}>
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: "var(--color-ijf-accent)" }} />
          <p style={{ color: "#6b7280", marginTop: "1rem" }}>Loading working group...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Error" userName={session?.user?.name || ""}>
        <div style={{ textAlign: "center", padding: "3rem 0" }}>
          <div style={{ width: "5rem", height: "5rem", backgroundColor: "#fee2e2", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
            <svg style={{ color: "#dc2626", width: "2.5rem", height: "2.5rem" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>{error}</h3>
          <button
            onClick={() => router.push("/dashboard/forum")}
            style={{ padding: "0.75rem 1.5rem", borderRadius: "0.5rem", fontWeight: 600, backgroundColor: "var(--color-ijf-accent)", color: "var(--color-ijf-bg)", cursor: "pointer" }}
          >
            Back to Forum
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const pinnedThreads = threads.filter((t) => t.pinned);
  const regularThreads = threads.filter((t) => !t.pinned);

  const coordinator = group?.coordinator as Member | undefined;
  const allMembers = (group?.members as Member[]) || [];
  const seenIds = new Set<string>();
  if (coordinator?._id) seenIds.add(coordinator._id);
  const otherMembers = allMembers.filter((m) => {
    if (!m._id || seenIds.has(m._id)) return false;
    seenIds.add(m._id);
    return true;
  });
  const allGroupMembers = coordinator ? [coordinator, ...otherMembers] : otherMembers;
  const onlineCount = allGroupMembers.filter((m) => isOnline(m.lastSeenAt)).length;

  const MemberAvatar = ({ member, isCoordinator }: { member: Member; isCoordinator?: boolean }) => {
    const online = isOnline(member.lastSeenAt);
    return (
      <div
        style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        title={`${member.name} — ${online ? "Online now" : `Last seen ${formatLastSeen(member.lastSeenAt)}`}`}
      >
        <div style={{ position: "relative", flexShrink: 0 }}>
          {member.image ? (
            <img
              src={member.image}
              alt={member.name}
              style={{
                width: isMobile ? "1.75rem" : "2rem",
                height: isMobile ? "1.75rem" : "2rem",
                borderRadius: "9999px",
                border: `2px solid ${isCoordinator ? "var(--color-ijf-accent)" : "white"}`,
              }}
            />
          ) : (
            <div style={{
              width: isMobile ? "1.75rem" : "2rem",
              height: isMobile ? "1.75rem" : "2rem",
              borderRadius: "9999px",
              backgroundColor: isCoordinator ? "var(--color-ijf-accent)" : "#e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.6rem",
              fontWeight: 700,
              color: isCoordinator ? "var(--color-ijf-bg)" : "#374151",
              border: "2px solid white",
            }}>
              {member.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{
            position: "absolute",
            bottom: "0",
            right: "0",
            width: "0.5rem",
            height: "0.5rem",
            borderRadius: "9999px",
            backgroundColor: online ? "#22c55e" : "#d1d5db",
            border: "1.5px solid white",
          }} />
        </div>

        {!isMobile && (
          <div>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#111827", lineHeight: 1.2 }}>
              {member.name.split(" ")[0]}
            </div>
            {isCoordinator ? (
              <div style={{ fontSize: "0.65rem", color: "var(--color-ijf-accent)", fontWeight: 600 }}>Coordinator</div>
            ) : (
              <div style={{ fontSize: "0.65rem", color: "#9ca3af" }}>
                {online ? "Online" : formatLastSeen(member.lastSeenAt)}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const MemberStrip = () => (
    <div style={{
      marginBottom: "1rem",
      padding: isMobile ? "0.75rem 1rem" : "0.875rem 1.25rem",
      backgroundColor: "white",
      borderRadius: "0.625rem",
      border: "1px solid #e5e7eb",
      display: "flex",
      alignItems: "center",
      gap: isMobile ? "0.75rem" : "1.25rem",
      flexWrap: "wrap",
    }}>
      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0 }}>
        Members
      </span>

      <div style={{ width: "1px", height: "1.5rem", backgroundColor: "#f0f0f0", flexShrink: 0 }} />

      {coordinator && <MemberAvatar member={coordinator} isCoordinator />}

      {otherMembers.length > 0 && (
        <>
          <div style={{ width: "1px", height: "1.5rem", backgroundColor: "#f0f0f0", flexShrink: 0 }} />
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "0.5rem" : "0.875rem", flexWrap: "wrap" }}>
            {otherMembers.map((member) => (
              <MemberAvatar key={member._id} member={member} />
            ))}
          </div>
        </>
      )}

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.375rem", flexShrink: 0 }}>
        <div style={{ width: "0.5rem", height: "0.5rem", borderRadius: "9999px", backgroundColor: "#22c55e" }} />
        <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{onlineCount} online</span>
      </div>
    </div>
  );

  const ThreadRow = ({ thread }: { thread: Thread }) => {
    const isNonActive = thread.status && thread.status !== "active" && thread.status !== "open";

    return (
      <Link href={`/dashboard/forum/${groupSlug}/${thread.slug}`} style={{ textDecoration: "none" }}>
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            backgroundColor: "white",
            borderRadius: "0.625rem",
            border: thread.pinned ? "1.5px solid var(--color-ijf-accent)" : "1px solid #e5e7eb",
            borderLeft: thread.pinned ? "4px solid var(--color-ijf-accent)" : "1px solid #e5e7eb",
            overflow: "hidden",
            transition: "box-shadow 0.15s, transform 0.15s",
            cursor: "pointer",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
            (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
          }}
        >
          <div style={{ flex: 1, padding: isMobile ? "0.875rem" : "1rem 1.25rem", minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.5rem" }}>
              {thread.pinned && <span style={{ fontSize: "0.875rem", flexShrink: 0, marginTop: "0.1rem" }}>📌</span>}
              <h3 style={{
                fontSize: isMobile ? "0.9375rem" : "1rem",
                fontWeight: 600,
                color: "#111827",
                lineHeight: 1.4,
                margin: 0,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical" as any,
              }}>
                {thread.title}
              </h3>
            </div>

            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.375rem" }}>
              {thread.createdBy.image ? (
                <img src={thread.createdBy.image} alt={thread.createdBy.name} style={{ width: "1.125rem", height: "1.125rem", borderRadius: "9999px", flexShrink: 0 }} />
              ) : (
                <div style={{ width: "1.125rem", height: "1.125rem", borderRadius: "9999px", backgroundColor: "var(--color-ijf-accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-ijf-bg)", fontSize: "0.5rem", fontWeight: 700, flexShrink: 0 }}>
                  {thread.createdBy.name.charAt(0)}
                </div>
              )}
              <span style={{ fontSize: "0.8125rem", color: "#4b5563", fontWeight: 500 }}>{thread.createdBy.name}</span>
              <span style={{ color: "#d1d5db", fontSize: "0.75rem" }}>·</span>
              <span style={{ fontSize: "0.8125rem", color: "#9ca3af" }}>{formatDate(thread.lastActivityAt || thread.createdAt)}</span>

              {!isMobile && thread.tags.slice(0, 3).map((tag, idx) => (
                <span key={idx} style={{ padding: "0.1rem 0.45rem", backgroundColor: "#f3f4f6", borderRadius: "0.25rem", fontSize: "0.7rem", fontWeight: 500, color: "#6b7280" }}>
                  {tag}
                </span>
              ))}

              {isNonActive && (
                <span style={{
                  ...(statusStyles[thread.status] || statusStyles.archived),
                  padding: "0.1rem 0.5rem",
                  borderRadius: "9999px",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                }}>
                  {thread.status}
                </span>
              )}
            </div>
          </div>

          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            padding: isMobile ? "0.875rem 0.75rem" : "1rem 1.25rem",
            borderLeft: "1px solid #f3f4f6",
            backgroundColor: "#fafafa",
            minWidth: isMobile ? "5rem" : "7rem",
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", gap: isMobile ? "0.75rem" : "1.25rem", alignItems: "flex-end" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: isMobile ? "1rem" : "1.25rem", fontWeight: 700, color: "var(--color-ijf-primary)", lineHeight: 1 }}>
                  {thread.replyCount}
                </div>
                <div style={{ fontSize: "0.65rem", color: "#9ca3af", marginTop: "0.1rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>replies</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: isMobile ? "1rem" : "1.25rem", fontWeight: 700, color: "#9ca3af", lineHeight: 1 }}>
                  {thread.viewCount}
                </div>
                <div style={{ fontSize: "0.65rem", color: "#9ca3af", marginTop: "0.1rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>views</div>
              </div>
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              padding: "0.2rem 0.5rem",
              borderRadius: "9999px",
              backgroundColor: thread.publicToMembers ? "rgba(228,185,91,0.15)" : "#f3f4f6",
              border: `1px solid ${thread.publicToMembers ? "rgba(228,185,91,0.4)" : "#e5e7eb"}`,
            }}>
              {thread.publicToMembers ? (
                <>
                  <svg width="10" height="10" fill="none" stroke="var(--color-ijf-accent)" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
                  </svg>
                  <span style={{ fontSize: "0.65rem", fontWeight: 600, color: "#92701a", whiteSpace: "nowrap" }}>Public</span>
                </>
              ) : (
                <>
                  <svg width="10" height="10" fill="none" stroke="#9ca3af" strokeWidth={2} viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  <span style={{ fontSize: "0.65rem", fontWeight: 600, color: "#9ca3af", whiteSpace: "nowrap" }}>Group only</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <DashboardLayout title={group?.name || "Working Group"} userName={session?.user?.name || ""}>
      <div style={{ maxWidth: "72rem", margin: "0 auto" }}>

        <div style={{ marginBottom: "1.25rem" }}>
          <Link href="/dashboard/forum" className="hover:underline" style={{ color: "var(--color-ijf-accent)", fontSize: "0.875rem" }}>
            ← Back to Forum
          </Link>
        </div>

        {/* Header */}
        <div style={{
          marginBottom: "1.5rem",
          padding: isMobile ? "1.25rem" : "1.5rem 2rem",
          borderRadius: "0.75rem",
          background: "linear-gradient(135deg, var(--color-ijf-bg) 0%, #1a1f2e 100%)",
        }}>
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: "1rem", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
              <div style={{ width: "2.75rem", height: "2.75rem", borderRadius: "0.625rem", backgroundColor: "var(--color-ijf-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg style={{ color: "white", width: "1.25rem", height: "1.25rem" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <h1 style={{ fontSize: isMobile ? "1.25rem" : "1.5rem", fontWeight: 700, color: "white", margin: 0 }}>{group?.name}</h1>
                  {group?.isPrivate && (
                    <span style={{ padding: "0.15rem 0.5rem", fontSize: "0.7rem", fontWeight: 600, backgroundColor: "rgba(255,255,255,0.15)", color: "white", borderRadius: "9999px", border: "1px solid rgba(255,255,255,0.25)" }}>
                      Private
                    </span>
                  )}
                </div>
                {group?.description && (
                  <p style={{ color: "#9ca3af", marginTop: "0.2rem", fontSize: "0.8125rem" }}>{group.description}</p>
                )}
              </div>
            </div>

            <button
              onClick={() => router.push(`/dashboard/forum/new?workingGroup=${groupSlug}`)}
              style={{ padding: "0.625rem 1.25rem", borderRadius: "0.5rem", fontWeight: 600, backgroundColor: "var(--color-ijf-accent)", color: "var(--color-ijf-bg)", width: isMobile ? "100%" : "auto", cursor: "pointer", fontSize: "0.875rem", whiteSpace: "nowrap" }}
            >
              + New Thread
            </button>
          </div>

          <div style={{ display: "flex", gap: "1.5rem", paddingTop: "0.875rem", borderTop: "1px solid rgba(255,255,255,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <svg style={{ color: "#9ca3af", width: "0.875rem", height: "0.875rem" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <span style={{ color: "white", fontWeight: 600, fontSize: "0.8125rem" }}>{threads.length} {threads.length === 1 ? "thread" : "threads"}</span>
            </div>
            {pinnedThreads.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ fontSize: "0.8125rem" }}>📌</span>
                <span style={{ color: "white", fontWeight: 600, fontSize: "0.8125rem" }}>{pinnedThreads.length} pinned</span>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <svg width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
              </svg>
              <span style={{ color: "#9ca3af", fontSize: "0.8125rem" }}>
                {threads.filter(t => t.publicToMembers).length} public
              </span>
            </div>
          </div>
        </div>

        {/* Member strip */}
        {group && <MemberStrip />}

        {/* Thread list */}
        {threads.length === 0 ? (
          <div style={{ backgroundColor: "#f9fafb", borderRadius: "0.75rem", padding: "3rem", textAlign: "center", border: "2px dashed #d1d5db" }}>
            <div style={{ width: "4rem", height: "4rem", backgroundColor: "#e5e7eb", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
              <svg style={{ color: "#9ca3af", width: "2rem", height: "2rem" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>No threads yet</h3>
            <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>Be the first to start a discussion in this working group.</p>
            <button
              onClick={() => router.push(`/dashboard/forum/new?workingGroup=${groupSlug}`)}
              style={{ padding: "0.75rem 2rem", borderRadius: "0.5rem", fontWeight: 600, backgroundColor: "var(--color-ijf-accent)", color: "var(--color-ijf-bg)", cursor: "pointer" }}
            >
              Create First Thread
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {pinnedThreads.map((thread) => <ThreadRow key={thread._id} thread={thread} />)}

            {pinnedThreads.length > 0 && regularThreads.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.25rem 0" }}>
                <div style={{ flex: 1, height: "1px", backgroundColor: "#e5e7eb" }} />
                <span style={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 500 }}>All threads</span>
                <div style={{ flex: 1, height: "1px", backgroundColor: "#e5e7eb" }} />
              </div>
            )}

            {regularThreads.map((thread) => <ThreadRow key={thread._id} thread={thread} />)}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}