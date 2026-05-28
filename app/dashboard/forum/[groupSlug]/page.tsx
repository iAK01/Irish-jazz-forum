"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import { ReactionSummaryInline } from "@/app/components/ReactionBar";

interface ReactionSummary {
  counts: { like: number; agree: number; thanks: number };
  total: number;
}

interface Thread {
  _id: string;
  title: string;
  slug: string;
  publicToMembers: boolean;
  createdBy: { name: string; email: string; image?: string };
  lastReplyBy?: { name: string; email: string; image?: string } | null;
  status: string;
  pinned: boolean;
  replyCount: number;
  viewCount: number;
  tags: string[];
  reactionSummary: ReactionSummary;
  isNewSinceLastVisit?: boolean;
  createdAt: string;
  lastActivityAt: string;
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
  googleDriveFolderId?: string;
  coordinator: Member;
  members: Member[];
}

interface EmailModalState {
  open: boolean;
  audience: "members_and_coordinator" | "members_only";
  subject: string;
  message: string;
  sending: boolean;
  sent: boolean;
  error: string;
}

const EMPTY_EMAIL_MODAL: EmailModalState = {
  open: false,
  audience: "members_and_coordinator",
  subject: "",
  message: "",
  sending: false,
  sent: false,
  error: "",
};

const STATUS_META: Record<string, { label: string; color: string; bg: string; order: number }> = {
  active:    { label: "Active",    color: "#166534", bg: "#dcfce7", order: 0 },
  paused:    { label: "Paused",    color: "#6b21a8", bg: "#f3e8ff", order: 1 },
  stalled:   { label: "Stalled",   color: "#854d0e", bg: "#fef9c3", order: 2 },
  resolved:  { label: "Resolved",  color: "#1e40af", bg: "#dbeafe", order: 3 },
  declined:  { label: "Declined",  color: "#9f1239", bg: "#fff1f2", order: 4 },
  archived:  { label: "Archived",  color: "#374151", bg: "#f3f4f6", order: 5 },
  abandoned: { label: "Abandoned", color: "#991b1b", bg: "#fee2e2", order: 6 },
};

const CLOSED_STATUSES = new Set(["resolved", "declined", "archived", "abandoned"]);

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
  const [showClosed, setShowClosed] = useState(false);
  const [emailModal, setEmailModal] = useState<EmailModalState>(EMPTY_EMAIL_MODAL);

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

      const [groupRes, threadsRes] = await Promise.all([
        fetch("/api/working-groups"),
        fetch(`/api/threads?workingGroup=${groupSlug}`),
      ]);

      const groupsData = await groupRes.json();
      if (!groupRes.ok || !groupsData.success) throw new Error(groupsData.error || "Failed to fetch groups");

      const currentGroup = groupsData.data.find((g: WorkingGroup) => g.slug === groupSlug);
      if (!currentGroup) { setError("Working group not found"); setLoading(false); return; }
      setGroup(currentGroup);

      const threadsData = await threadsRes.json();
      if (!threadsRes.ok) throw new Error(threadsData.error || "Failed to fetch threads");
      setThreads(threadsData.data || []);

      await fetch("/api/forum/visit", { method: "POST" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const sendGroupEmail = async () => {
    if (!group) return;
    setEmailModal((m) => ({ ...m, sending: true, error: "" }));
    try {
      const res = await fetch(`/api/working-groups/${group._id}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audience: emailModal.audience,
          subject: emailModal.subject,
          message: emailModal.message,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to send");
      setEmailModal((m) => ({ ...m, sending: false, sent: true }));
    } catch (err: any) {
      setEmailModal((m) => ({ ...m, sending: false, error: err.message }));
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
          <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>{error}</h3>
          <button onClick={() => router.push("/dashboard/forum")} style={{ padding: "0.75rem 1.5rem", borderRadius: "0.5rem", fontWeight: 600, backgroundColor: "var(--color-ijf-accent)", color: "var(--color-ijf-bg)", cursor: "pointer" }}>
            Back to Forum
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const currentUserId = (session?.user as any)?._id || (session?.user as any)?.id || "";
  const currentUserRole = (session?.user as any)?.role || "";
  const isAdmin = currentUserRole === "admin" || currentUserRole === "super_admin";
  const isCoordinator = group?.coordinator?._id?.toString() === currentUserId;
  const canManage = isAdmin || isCoordinator;

  const coordinator = group?.coordinator as Member | undefined;
  const allGroupMembers = group?.members as Member[] || [];
  const seenIds = new Set<string>();
  if (coordinator?._id) seenIds.add(coordinator._id);
  const otherMembers = allGroupMembers.filter((m) => {
    if (!m._id || seenIds.has(m._id)) return false;
    seenIds.add(m._id);
    return true;
  });
  const orderedMembers = coordinator ? [coordinator, ...otherMembers] : otherMembers;
  const onlineCount = orderedMembers.filter((m) => isOnline(m.lastSeenAt)).length;

  // Partition threads
  const pinnedThreads = threads.filter((t) => t.pinned);
  const unpinnedThreads = threads.filter((t) => !t.pinned);
  const openThreads = unpinnedThreads.filter((t) => !CLOSED_STATUSES.has(t.status));
  const closedThreads = unpinnedThreads.filter((t) => CLOSED_STATUSES.has(t.status));
  const newCount = threads.filter((t) => t.isNewSinceLastVisit).length;

  // Group open threads by status, in defined order
  const threadsByStatus = new Map<string, Thread[]>();
  for (const t of openThreads) {
    const key = t.status || "active";
    const group = threadsByStatus.get(key) || [];
    group.push(t);
    threadsByStatus.set(key, group);
  }
  const statusGroups = [...threadsByStatus.entries()].sort((a, b) => {
    const orderA = STATUS_META[a[0]]?.order ?? 99;
    const orderB = STATUS_META[b[0]]?.order ?? 99;
    return orderA - orderB;
  });

  const UserAvatar = ({ user, size = "1.125rem" }: { user: { name: string; image?: string }; size?: string }) => (
    user.image ? (
      <img src={user.image} alt={user.name} style={{ width: size, height: size, borderRadius: "9999px", flexShrink: 0 }} />
    ) : (
      <div style={{ width: size, height: size, borderRadius: "9999px", backgroundColor: "var(--color-ijf-accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-ijf-bg)", fontSize: "0.5rem", fontWeight: 700, flexShrink: 0 }}>
        {user.name.charAt(0)}
      </div>
    )
  );

  const MemberAvatar = ({ member, isCoord }: { member: Member; isCoord?: boolean }) => {
    const online = isOnline(member.lastSeenAt);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }} title={`${member.name} — ${online ? "Online now" : formatLastSeen(member.lastSeenAt)}`}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          {member.image ? (
            <img src={member.image} alt={member.name} style={{ width: isMobile ? "1.75rem" : "2rem", height: isMobile ? "1.75rem" : "2rem", borderRadius: "9999px", border: `2px solid ${isCoord ? "var(--color-ijf-accent)" : "white"}` }} />
          ) : (
            <div style={{ width: isMobile ? "1.75rem" : "2rem", height: isMobile ? "1.75rem" : "2rem", borderRadius: "9999px", backgroundColor: isCoord ? "var(--color-ijf-accent)" : "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 700, color: isCoord ? "var(--color-ijf-bg)" : "#374151", border: "2px solid white" }}>
              {member.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ position: "absolute", bottom: 0, right: 0, width: "0.5rem", height: "0.5rem", borderRadius: "9999px", backgroundColor: online ? "#22c55e" : "#d1d5db", border: "1.5px solid white" }} />
        </div>
        {!isMobile && (
          <div>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#111827", lineHeight: 1.2 }}>{member.name.split(" ")[0]}</div>
            {isCoord ? (
              <div style={{ fontSize: "0.65rem", color: "var(--color-ijf-accent)", fontWeight: 600 }}>Coordinator</div>
            ) : (
              <div style={{ fontSize: "0.65rem", color: "#9ca3af" }}>{online ? "Online" : formatLastSeen(member.lastSeenAt)}</div>
            )}
          </div>
        )}
      </div>
    );
  };

  const ThreadRow = ({ thread }: { thread: Thread }) => {
    const meta = STATUS_META[thread.status] || STATUS_META.active;
    const isNonActive = thread.status && thread.status !== "active";
    const showLastReply = thread.lastReplyBy && thread.lastReplyBy.name !== thread.createdBy.name;

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
            cursor: "pointer",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
        >
          <div style={{ flex: 1, padding: isMobile ? "0.875rem" : "1rem 1.25rem", minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.5rem" }}>
              {thread.pinned && <span style={{ fontSize: "0.875rem", flexShrink: 0, marginTop: "0.1rem" }}>📌</span>}
              <h3 style={{ fontSize: isMobile ? "0.9375rem" : "1rem", fontWeight: 600, color: "#111827", lineHeight: 1.4, margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as React.CSSProperties["WebkitBoxOrient"] }}>
                {thread.title}
              </h3>
              {thread.isNewSinceLastVisit && (
                <span style={{ padding: "0.12rem 0.45rem", borderRadius: "9999px", backgroundColor: "rgba(34,197,94,0.12)", color: "#166534", fontSize: "0.68rem", fontWeight: 700, flexShrink: 0 }}>
                  New
                </span>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.375rem", marginBottom: showLastReply ? "0.375rem" : 0 }}>
              <UserAvatar user={thread.createdBy} />
              <span style={{ fontSize: "0.8125rem", color: "#4b5563", fontWeight: 500 }}>{thread.createdBy.name}</span>
              <span style={{ color: "#d1d5db", fontSize: "0.75rem" }}>·</span>
              <span style={{ fontSize: "0.8125rem", color: "#9ca3af" }}>{formatDate(thread.createdAt)}</span>

              {!isMobile && thread.tags.slice(0, 3).map((tag, idx) => (
                <span key={idx} style={{ padding: "0.1rem 0.45rem", backgroundColor: "#f3f4f6", borderRadius: "0.25rem", fontSize: "0.7rem", fontWeight: 500, color: "#6b7280" }}>
                  {tag}
                </span>
              ))}

              {isNonActive && (
                <span style={{ backgroundColor: meta.bg, color: meta.color, padding: "0.1rem 0.5rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 600 }}>
                  {meta.label}
                </span>
              )}
            </div>

            {showLastReply && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <svg width="11" height="11" fill="none" stroke="#9ca3af" strokeWidth={2} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                <UserAvatar user={thread.lastReplyBy!} size="0.9rem" />
                <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                  Last reply by <span style={{ color: "#6b7280", fontWeight: 500 }}>{thread.lastReplyBy!.name}</span>{" · "}{formatDate(thread.lastActivityAt)}
                </span>
              </div>
            )}

            {thread.reactionSummary?.total > 0 && (
              <div style={{ marginTop: "0.55rem" }}>
                <ReactionSummaryInline reactionSummary={thread.reactionSummary} />
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: isMobile ? "0.875rem 0.75rem" : "1rem 1.25rem", borderLeft: "1px solid #f3f4f6", backgroundColor: "#fafafa", minWidth: isMobile ? "4.5rem" : "6rem", flexShrink: 0 }}>
            <div style={{ display: "flex", gap: isMobile ? "0.75rem" : "1.25rem", alignItems: "flex-end" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: isMobile ? "1rem" : "1.25rem", fontWeight: 700, color: "var(--color-ijf-primary)", lineHeight: 1 }}>{thread.replyCount}</div>
                <div style={{ fontSize: "0.65rem", color: "#9ca3af", marginTop: "0.1rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>replies</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: isMobile ? "1rem" : "1.25rem", fontWeight: 700, color: "#9ca3af", lineHeight: 1 }}>{thread.viewCount}</div>
                <div style={{ fontSize: "0.65rem", color: "#9ca3af", marginTop: "0.1rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>views</div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  const SectionDivider = ({ label }: { label: string }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.25rem 0" }}>
      <div style={{ flex: 1, height: "1px", backgroundColor: "#e5e7eb" }} />
      <span style={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 500 }}>{label}</span>
      <div style={{ flex: 1, height: "1px", backgroundColor: "#e5e7eb" }} />
    </div>
  );

  return (
    <DashboardLayout title={group?.name || "Working Group"} userName={session?.user?.name || ""}>
      <div style={{ maxWidth: "72rem", margin: "0 auto" }}>

        <div style={{ marginBottom: "1.25rem" }}>
          <Link href="/dashboard/forum" className="hover:underline" style={{ color: "var(--color-ijf-accent)", fontSize: "0.875rem" }}>
            ← Back to Forum
          </Link>
        </div>

        {/* Header */}
        <div style={{ marginBottom: "1.5rem", padding: isMobile ? "1.25rem" : "1.5rem 2rem", borderRadius: "0.75rem", background: "linear-gradient(135deg, var(--color-ijf-bg) 0%, #1a1f2e 100%)" }}>
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
                  {isCoordinator && (
                    <span style={{ padding: "0.15rem 0.5rem", fontSize: "0.7rem", fontWeight: 600, backgroundColor: "rgba(228,185,91,0.25)", color: "var(--color-ijf-accent)", borderRadius: "9999px", border: "1px solid rgba(228,185,91,0.4)" }}>
                      You coordinate this group
                    </span>
                  )}
                </div>
                {group?.description && (
                  <p style={{ color: "#9ca3af", marginTop: "0.2rem", fontSize: "0.8125rem" }}>{group.description}</p>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", width: isMobile ? "100%" : "auto" }}>
              <button onClick={() => router.push("/dashboard/forum/whats-new")} style={{ padding: "0.625rem 1rem", borderRadius: "0.5rem", fontWeight: 600, backgroundColor: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.12)", width: isMobile ? "100%" : "auto", cursor: "pointer", fontSize: "0.875rem" }}>
                What&apos;s New
              </button>
              <button onClick={() => router.push("/dashboard/forum/search")} style={{ padding: "0.625rem 1rem", borderRadius: "0.5rem", fontWeight: 600, backgroundColor: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.12)", width: isMobile ? "100%" : "auto", cursor: "pointer", fontSize: "0.875rem" }}>
                Search
              </button>

              {canManage && (
                <button
                  onClick={() => setEmailModal({ ...EMPTY_EMAIL_MODAL, open: true, subject: `${group?.name}: update from Irish Jazz Forum` })}
                  style={{ padding: "0.625rem 1rem", borderRadius: "0.5rem", fontWeight: 600, backgroundColor: "rgba(228,185,91,0.18)", color: "var(--color-ijf-accent)", border: "1px solid rgba(228,185,91,0.4)", width: isMobile ? "100%" : "auto", cursor: "pointer", fontSize: "0.875rem" }}
                >
                  Email Members
                </button>
              )}

              {group?.googleDriveFolderId && canManage && (
                <button
                  onClick={() => window.open(`https://drive.google.com/drive/folders/${group.googleDriveFolderId}`, "_blank", "noopener,noreferrer")}
                  style={{ padding: "0.625rem 1rem", borderRadius: "0.5rem", fontWeight: 600, backgroundColor: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.12)", width: isMobile ? "100%" : "auto", cursor: "pointer", fontSize: "0.875rem" }}
                >
                  Open Drive
                </button>
              )}

              <button
                onClick={() => router.push(`/dashboard/forum/new?workingGroup=${groupSlug}`)}
                style={{ padding: "0.625rem 1.25rem", borderRadius: "0.5rem", fontWeight: 600, backgroundColor: "var(--color-ijf-accent)", color: "var(--color-ijf-bg)", width: isMobile ? "100%" : "auto", cursor: "pointer", fontSize: "0.875rem", whiteSpace: "nowrap" }}
              >
                + New Thread
              </button>
            </div>
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
            {newCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <div style={{ width: "0.5rem", height: "0.5rem", borderRadius: "9999px", backgroundColor: "#22c55e" }} />
                <span style={{ color: "#86efac", fontWeight: 700, fontSize: "0.8125rem" }}>{newCount} new since last visit</span>
              </div>
            )}
          </div>
        </div>

        {/* Member strip */}
        {group && (
          <div style={{ marginBottom: "1rem", padding: isMobile ? "0.75rem 1rem" : "0.875rem 1.25rem", backgroundColor: "white", borderRadius: "0.625rem", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: isMobile ? "0.75rem" : "1.25rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0 }}>Members</span>
            <div style={{ width: "1px", height: "1.5rem", backgroundColor: "#f0f0f0", flexShrink: 0 }} />
            {coordinator && <MemberAvatar member={coordinator} isCoord />}
            {otherMembers.length > 0 && (
              <>
                <div style={{ width: "1px", height: "1.5rem", backgroundColor: "#f0f0f0", flexShrink: 0 }} />
                <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "0.5rem" : "0.875rem", flexWrap: "wrap" }}>
                  {otherMembers.map((m) => <MemberAvatar key={m._id} member={m} />)}
                </div>
              </>
            )}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.375rem", flexShrink: 0 }}>
              <div style={{ width: "0.5rem", height: "0.5rem", borderRadius: "9999px", backgroundColor: "#22c55e" }} />
              <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{onlineCount} online</span>
            </div>
          </div>
        )}

        {/* Thread list */}
        {threads.length === 0 ? (
          <div style={{ backgroundColor: "#f9fafb", borderRadius: "0.75rem", padding: "3rem", textAlign: "center", border: "2px dashed #d1d5db" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>No threads yet</h3>
            <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>Be the first to start a discussion in this working group.</p>
            <button onClick={() => router.push(`/dashboard/forum/new?workingGroup=${groupSlug}`)} style={{ padding: "0.75rem 2rem", borderRadius: "0.5rem", fontWeight: 600, backgroundColor: "var(--color-ijf-accent)", color: "var(--color-ijf-bg)", cursor: "pointer" }}>
              Create First Thread
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>

            {/* Pinned threads */}
            {pinnedThreads.map((t) => <ThreadRow key={t._id} thread={t} />)}
            {pinnedThreads.length > 0 && openThreads.length > 0 && <SectionDivider label="Active discussions" />}

            {/* Open threads grouped by status */}
            {statusGroups.map(([status, statusThreads], idx) => {
              const meta = STATUS_META[status] || STATUS_META.active;
              return (
                <div key={status}>
                  {(idx > 0 || pinnedThreads.length === 0) && statusGroups.length > 1 && idx > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.5rem 0 0.25rem" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", padding: "0.2rem 0.6rem", borderRadius: "9999px", fontSize: "0.72rem", fontWeight: 700, backgroundColor: meta.bg, color: meta.color }}>
                        {meta.label}
                      </span>
                      <div style={{ flex: 1, height: "1px", backgroundColor: "#e5e7eb" }} />
                    </div>
                  )}
                  {statusThreads.map((t) => <ThreadRow key={t._id} thread={t} />)}
                </div>
              );
            })}

            {/* Closed threads toggle */}
            {closedThreads.length > 0 && (
              <>
                <button
                  onClick={() => setShowClosed((v) => !v)}
                  style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.625rem 0", background: "none", border: "none", cursor: "pointer", width: "100%" }}
                >
                  <div style={{ flex: 1, height: "1px", backgroundColor: "#e5e7eb" }} />
                  <span style={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 500, whiteSpace: "nowrap" }}>
                    {showClosed ? "Hide" : "Show"} {closedThreads.length} closed {closedThreads.length === 1 ? "thread" : "threads"}
                  </span>
                  <svg width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth={2} viewBox="0 0 24 24" style={{ transform: showClosed ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                  <div style={{ flex: 1, height: "1px", backgroundColor: "#e5e7eb" }} />
                </button>
                {showClosed && closedThreads.map((t) => <ThreadRow key={t._id} thread={t} />)}
              </>
            )}
          </div>
        )}
      </div>

      {/* Email modal */}
      {emailModal.open && group && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ backgroundColor: "white", borderRadius: "0.75rem", padding: "2rem", width: "100%", maxWidth: "36rem", margin: "1rem", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827", margin: 0 }}>Email Group: {group.name}</h2>
                <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.25rem" }}>Send a message to your working group members.</p>
              </div>
              <button onClick={() => setEmailModal(EMPTY_EMAIL_MODAL)} style={{ padding: "0.375rem 0.75rem", borderRadius: "0.5rem", backgroundColor: "#f3f4f6", cursor: "pointer", fontSize: "0.875rem" }}>Close</button>
            </div>

            {emailModal.sent ? (
              <div style={{ padding: "1.5rem", borderRadius: "0.75rem", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", textAlign: "center" }}>
                <p style={{ fontWeight: 700, color: "#166534", marginBottom: "0.5rem" }}>Email sent</p>
                <button onClick={() => setEmailModal(EMPTY_EMAIL_MODAL)} style={{ padding: "0.5rem 1.5rem", borderRadius: "0.5rem", backgroundColor: "#166534", color: "white", fontWeight: 600, cursor: "pointer" }}>Done</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  {(["members_and_coordinator", "members_only"] as const).map((opt) => (
                    <button key={opt} onClick={() => setEmailModal((m) => ({ ...m, audience: opt }))} style={{ padding: "0.75rem", borderRadius: "0.625rem", border: `1px solid ${emailModal.audience === opt ? "rgba(228,185,91,0.5)" : "#e5e7eb"}`, backgroundColor: emailModal.audience === opt ? "rgba(228,185,91,0.1)" : "white", textAlign: "left", cursor: "pointer" }}>
                      <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#111827", margin: "0 0 0.2rem" }}>{opt === "members_and_coordinator" ? "Members + you" : "Members only"}</p>
                      <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>{opt === "members_and_coordinator" ? "All group members including yourself" : "All assigned members, excluding yourself"}</p>
                    </button>
                  ))}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.375rem" }}>Subject</label>
                  <input type="text" value={emailModal.subject} onChange={(e) => setEmailModal((m) => ({ ...m, subject: e.target.value }))} style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "0.5rem", border: "1px solid #d1d5db", fontSize: "0.9375rem", boxSizing: "border-box" }} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.375rem" }}>Message</label>
                  <textarea rows={7} value={emailModal.message} onChange={(e) => setEmailModal((m) => ({ ...m, message: e.target.value }))} placeholder="Write your update..." style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "0.5rem", border: "1px solid #d1d5db", fontSize: "0.9375rem", resize: "vertical", boxSizing: "border-box" }} />
                </div>

                {emailModal.error && <p style={{ fontSize: "0.875rem", color: "#991b1b", backgroundColor: "#fef2f2", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #fecaca" }}>{emailModal.error}</p>}

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button onClick={sendGroupEmail} disabled={emailModal.sending || !emailModal.subject.trim() || !emailModal.message.trim()} style={{ padding: "0.75rem 1.5rem", borderRadius: "0.5rem", backgroundColor: "#111827", color: "white", fontWeight: 600, cursor: "pointer", opacity: emailModal.sending || !emailModal.subject.trim() || !emailModal.message.trim() ? 0.5 : 1 }}>
                    {emailModal.sending ? "Sending..." : "Send Email"}
                  </button>
                  <button onClick={() => setEmailModal(EMPTY_EMAIL_MODAL)} style={{ padding: "0.75rem 1.5rem", borderRadius: "0.5rem", backgroundColor: "#f3f4f6", cursor: "pointer" }}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
