"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";

interface WorkingGroupStats {
  _id: string;
  slug: string;
  name: string;
  description: string;
  isPrivate: boolean;
  googleDriveFolderId?: string | null;
  coordinatorId?: string | null;
  coordinatorName?: string | null;
  isCoordinator: boolean;
  isMember: boolean;
  memberCount: number;
  threadCount: number;
  newThreadCount?: number;
  lastActivityAt?: string;
}

interface OnlineMember {
  _id: string;
  name: string;
  image?: string;
  lastSeenAt?: string;
  isOnline: boolean;
}

interface ForumSummaryResponse {
  generalThreadCount?: number;
  generalNewThreadCount?: number;
  whatsNewCount?: number;
  workingGroups?: WorkingGroupStats[];
  members?: Array<{
    _id: string;
    name: string;
    image?: string;
    lastSeenAt?: string;
  }>;
}

interface EmailModalState {
  open: boolean;
  group: WorkingGroupStats | null;
  audience: "members_and_coordinator" | "members_only";
  subject: string;
  message: string;
  sending: boolean;
  sent: boolean;
  error: string;
}

const EMPTY_EMAIL_MODAL: EmailModalState = {
  open: false,
  group: null,
  audience: "members_and_coordinator",
  subject: "",
  message: "",
  sending: false,
  sent: false,
  error: "",
};

export default function ForumHomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [generalThreadCount, setGeneralThreadCount] = useState(0);
  const [generalNewThreadCount, setGeneralNewThreadCount] = useState(0);
  const [workingGroups, setWorkingGroups] = useState<WorkingGroupStats[]>([]);
  const [allMembers, setAllMembers] = useState<OnlineMember[]>([]);
  const [whatsNewCount, setWhatsNewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [emailModal, setEmailModal] = useState<EmailModalState>(EMPTY_EMAIL_MODAL);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (session?.user) fetchForumData();
  }, [session]);

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

  const fetchForumData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/forum/summary");
      if (!res.ok) return;
      const { data = {} } = (await res.json()) as { data?: ForumSummaryResponse };

      setGeneralThreadCount(data.generalThreadCount || 0);
      setGeneralNewThreadCount(data.generalNewThreadCount || 0);
      setWhatsNewCount(data.whatsNewCount || 0);
      setWorkingGroups(data.workingGroups || []);

      const members: OnlineMember[] = (data.members || [])
        .map((m) => ({ ...m, isOnline: isOnline(m.lastSeenAt) }))
        .sort((a: OnlineMember, b: OnlineMember) => {
          if (a.isOnline && !b.isOnline) return -1;
          if (!a.isOnline && b.isOnline) return 1;
          if (!a.lastSeenAt && !b.lastSeenAt) return 0;
          if (!a.lastSeenAt) return 1;
          if (!b.lastSeenAt) return -1;
          return new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime();
        });

      setAllMembers(members);
      await fetch("/api/forum/visit", { method: "POST" });
    } catch (error) {
      console.error("Error fetching forum data:", error);
    } finally {
      setLoading(false);
    }
  };

  const openEmailModal = (group: WorkingGroupStats) => {
    setEmailModal({
      open: true,
      group,
      audience: "members_and_coordinator",
      subject: `${group.name}: update from Irish Jazz Forum`,
      message: "",
      sending: false,
      sent: false,
      error: "",
    });
  };

  const sendGroupEmail = async () => {
    if (!emailModal.group) return;
    setEmailModal((m) => ({ ...m, sending: true, error: "" }));
    try {
      const res = await fetch(`/api/working-groups/${emailModal.group._id}/email`, {
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

  if (!session) {
    return (
      <DashboardLayout title="Discussion Forum" userName="Guest">
        <div className="p-8"><p>Please sign in to access the forum.</p></div>
      </DashboardLayout>
    );
  }

  const currentUserRole = (session.user as any).role as string;
  const isPrivileged =
    currentUserRole === "steering" ||
    currentUserRole === "admin" ||
    currentUserRole === "super_admin";

  const coordinatedGroups = workingGroups.filter((g) => g.isCoordinator);
  const memberOnlyGroups = workingGroups.filter((g) => g.isMember && !g.isCoordinator);
  const otherGroups = workingGroups.filter((g) => !g.isMember && !g.isCoordinator);

  const onlineMembers = allMembers.filter((m) => m.isOnline);
  const offlineMembers = allMembers.filter((m) => !m.isOnline);

  const MemberDot = ({ member }: { member: OnlineMember }) => (
    <div
      title={`${member.name} — ${member.isOnline ? "Online now" : formatLastSeen(member.lastSeenAt)}`}
      style={{ position: "relative", flexShrink: 0 }}
    >
      {member.image ? (
        <img
          src={member.image}
          alt={member.name}
          style={{
            width: isMobile ? "2rem" : "2.25rem",
            height: isMobile ? "2rem" : "2.25rem",
            borderRadius: "9999px",
            border: `2px solid ${member.isOnline ? "#22c55e" : "#e5e7eb"}`,
          }}
        />
      ) : (
        <div style={{
          width: isMobile ? "2rem" : "2.25rem",
          height: isMobile ? "2rem" : "2.25rem",
          borderRadius: "9999px",
          backgroundColor: member.isOnline ? "var(--color-ijf-accent)" : "#e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.65rem",
          fontWeight: 700,
          color: member.isOnline ? "var(--color-ijf-bg)" : "#6b7280",
          border: `2px solid ${member.isOnline ? "#22c55e" : "#e5e7eb"}`,
        }}>
          {member.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div style={{
        position: "absolute",
        bottom: 0,
        right: 0,
        width: "0.55rem",
        height: "0.55rem",
        borderRadius: "9999px",
        backgroundColor: member.isOnline ? "#22c55e" : "#d1d5db",
        border: "1.5px solid white",
      }} />
    </div>
  );

  const GroupCard = ({ group, showActions }: { group: WorkingGroupStats; showActions: boolean }) => (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "0.75rem",
        boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
        border: group.isMember ? "2px solid var(--color-ijf-accent)" : "1px solid #e5e7eb",
        padding: isMobile ? "1rem" : "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.875rem",
        transition: "box-shadow 0.2s",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 20px rgba(0,0,0,0.1)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 4px rgba(0,0,0,0.06)"; }}
    >
      {/* Top row: name + thread count */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            {group.isCoordinator && (
              <span style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", padding: "0.15rem 0.5rem", borderRadius: "9999px", backgroundColor: "rgba(228,185,91,0.18)", color: "#92701a" }}>
                Coordinator
              </span>
            )}
            {group.isMember && !group.isCoordinator && (
              <span style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", padding: "0.15rem 0.5rem", borderRadius: "9999px", backgroundColor: "#f0fdf4", color: "#166534" }}>
                Member
              </span>
            )}
          </div>
          <h3 style={{ fontSize: isMobile ? "1rem" : "1.125rem", fontWeight: 700, color: "#111827", margin: 0, lineHeight: 1.3 }}>
            {group.name}
          </h3>
          {group.coordinatorName && !group.isCoordinator && (
            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.2rem" }}>
              Led by {group.coordinatorName}
            </p>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.375rem" }}>
            {group.memberCount > 0 && (
              <span style={{ display: "inline-flex", alignItems: "center", padding: "0.2rem 0.55rem", borderRadius: "9999px", backgroundColor: "rgba(228,185,91,0.12)", color: "#8a6612", fontSize: "0.72rem", fontWeight: 700 }}>
                {group.memberCount} {group.memberCount === 1 ? "person assigned" : "people assigned"}
              </span>
            )}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: isMobile ? "1.5rem" : "1.875rem", fontWeight: 700, color: "var(--color-ijf-primary)", lineHeight: 1 }}>
            {group.threadCount}
          </div>
          <div style={{ fontSize: "0.7rem", color: "#6b7280" }}>
            {group.threadCount === 1 ? "thread" : "threads"}
          </div>
          {group.newThreadCount ? (
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#166534", marginTop: "0.2rem" }}>
              {group.newThreadCount} new
            </div>
          ) : null}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        <button
          onClick={() => router.push(`/dashboard/forum/${group.slug}`)}
          style={{ padding: "0.5rem 0.875rem", borderRadius: "0.5rem", fontSize: "0.8125rem", fontWeight: 600, backgroundColor: "var(--color-ijf-accent)", color: "var(--color-ijf-bg)", cursor: "pointer", whiteSpace: "nowrap" }}
        >
          Open Forum
        </button>

        {showActions && (
          <>
            <button
              onClick={() => router.push(`/dashboard/forum/new?workingGroup=${group.slug}`)}
              style={{ padding: "0.5rem 0.875rem", borderRadius: "0.5rem", fontSize: "0.8125rem", fontWeight: 600, border: "1px solid #d1d5db", backgroundColor: "white", color: "#374151", cursor: "pointer", whiteSpace: "nowrap" }}
            >
              + New Thread
            </button>

            {group.googleDriveFolderId && (
              <button
                onClick={() => window.open(`https://drive.google.com/drive/folders/${group.googleDriveFolderId}`, "_blank", "noopener,noreferrer")}
                style={{ padding: "0.5rem 0.875rem", borderRadius: "0.5rem", fontSize: "0.8125rem", fontWeight: 600, border: "1px solid #d1d5db", backgroundColor: "white", color: "#374151", cursor: "pointer", whiteSpace: "nowrap" }}
              >
                Open Drive
              </button>
            )}

            <button
              onClick={() => openEmailModal(group)}
              style={{ padding: "0.5rem 0.875rem", borderRadius: "0.5rem", fontSize: "0.8125rem", fontWeight: 600, border: "1px solid rgba(228,185,91,0.5)", backgroundColor: "rgba(228,185,91,0.1)", color: "#92701a", cursor: "pointer", whiteSpace: "nowrap" }}
            >
              Email Members
            </button>
          </>
        )}
      </div>

      {group.lastActivityAt && (
        <p style={{ fontSize: "0.75rem", color: "#9ca3af", margin: 0 }}>
          Last activity: {new Date(group.lastActivityAt).toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingTop: "0.625rem", borderTop: "1px solid #f3f4f6" }}>
        <svg width="14" height="14" fill="none" stroke={group.threadCount === 0 ? "#d1d5db" : "#9ca3af"} strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <span style={{ fontSize: "0.72rem", color: "#6b7280" }}>
          {group.threadCount === 0 ? "No discussions yet" : "Active discussions"}
        </span>
      </div>
    </div>
  );

  return (
    <DashboardLayout title="IJF Discussion Forum" userName={session.user.name} hideGreeting>

      <div style={{ maxWidth: "72rem", margin: "0 auto", paddingBottom: "2rem" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: "var(--color-ijf-accent)" }} />
            <p style={{ color: "#6b7280", marginTop: "1rem" }}>Loading forum...</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

            {/* 1. Members strip */}
            {allMembers.length > 0 && (
              <div style={{ backgroundColor: "white", borderRadius: "0.75rem", border: "1px solid #e5e7eb", padding: isMobile ? "0.875rem 1rem" : "1rem 1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                    <div style={{ width: "0.5rem", height: "0.5rem", borderRadius: "9999px", backgroundColor: "#22c55e" }} />
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#111827" }}>{onlineMembers.length} online</span>
                    <span style={{ color: "#d1d5db" }}>·</span>
                    <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{allMembers.length} members</span>
                  </div>
                  <div style={{ width: "1px", height: "1.5rem", backgroundColor: "#e5e7eb", flexShrink: 0 }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    {onlineMembers.map((m) => (
                      <div key={m._id} style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                        <MemberDot member={m} />
                        {!isMobile && <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#111827" }}>{m.name.split(" ")[0]}</span>}
                      </div>
                    ))}
                    {onlineMembers.length > 0 && offlineMembers.length > 0 && (
                      <div style={{ width: "1px", height: "1.5rem", backgroundColor: "#e5e7eb", flexShrink: 0 }} />
                    )}
                    {offlineMembers.map((m) => <MemberDot key={m._id} member={m} />)}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Navy bar — personalised greeting + actions */}
            <div style={{
              padding: isMobile ? "0.875rem 1rem" : "1rem 1.5rem",
              borderRadius: "0.75rem",
              background: "linear-gradient(135deg, #1e3a5f 0%, #162840 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
            }}>
              <span style={{ fontSize: isMobile ? "1rem" : "1.125rem", fontWeight: 700, color: "white" }}>
                Welcome back, {session.user.name?.split(" ")[0]}
              </span>
              <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
                <button
                  onClick={() => router.push("/dashboard/forum/whats-new")}
                  style={{ padding: "0.5rem 0.875rem", borderRadius: "0.5rem", backgroundColor: "var(--color-ijf-accent)", color: "var(--color-ijf-bg)", fontWeight: 700, cursor: "pointer", fontSize: "0.875rem" }}
                >
                  What&apos;s New{whatsNewCount > 0 ? ` (${whatsNewCount})` : ""}
                </button>
                <button
                  onClick={() => router.push("/dashboard/forum/search")}
                  style={{ padding: "0.5rem 0.875rem", borderRadius: "0.5rem", backgroundColor: "rgba(255,255,255,0.08)", color: "white", fontWeight: 700, border: "1px solid rgba(255,255,255,0.12)", cursor: "pointer", fontSize: "0.875rem" }}
                >
                  Search Forum
                </button>
              </div>
            </div>

            {/* Coordinator section */}
            {coordinatedGroups.length > 0 && (
              <section>
                <div style={{ marginBottom: "1rem", padding: isMobile ? "1rem" : "1.25rem 1.5rem", borderRadius: "0.75rem", backgroundColor: "rgba(228,185,91,0.1)", border: "1px solid rgba(228,185,91,0.35)" }}>
                  <p style={{ fontWeight: 700, color: "#111827", fontSize: isMobile ? "1rem" : "1.125rem", marginBottom: "0.25rem" }}>
                    Hi {session.user.name?.split(" ")[0]}, you coordinate {coordinatedGroups.length === 1 ? "this working group" : "these working groups"}
                  </p>
                  <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: 0 }}>
                    Quick actions are below each group — start a thread, open Drive, or email your members.
                  </p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "1rem" }}>
                  {coordinatedGroups.map((g) => (
                    <GroupCard key={g.slug} group={g} showActions={true} />
                  ))}
                </div>
              </section>
            )}

            {/* Member section */}
            {memberOnlyGroups.length > 0 && (
              <section>
                <div style={{ marginBottom: "1rem", padding: isMobile ? "1rem" : "1.25rem 1.5rem", borderRadius: "0.75rem", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                  <p style={{ fontWeight: 700, color: "#111827", fontSize: isMobile ? "1rem" : "1.125rem", marginBottom: "0.25rem" }}>
                    {coordinatedGroups.length === 0
                      ? `Hi ${session.user.name?.split(" ")[0]}, you're a member of ${memberOnlyGroups.length === 1 ? "this working group" : "these working groups"}`
                      : `You're also a member of ${memberOnlyGroups.length === 1 ? "this group" : "these groups"}`
                    }
                  </p>
                  <p style={{ fontSize: "0.875rem", color: "#4b5563", margin: 0 }}>
                    Jump straight to the threads or start a new discussion.
                  </p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "1rem" }}>
                  {memberOnlyGroups.map((g) => (
                    <GroupCard key={g.slug} group={g} showActions={true} />
                  ))}
                </div>
              </section>
            )}

            {/* All other working groups */}
            {otherGroups.length > 0 && (
              <section>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <h2 style={{ fontSize: isMobile ? "1.125rem" : "1.5rem", fontWeight: 700, color: "#111827", margin: 0 }}>
                    {coordinatedGroups.length === 0 && memberOnlyGroups.length === 0
                      ? "Working Groups"
                      : "Other Working Groups"
                    }
                  </h2>
                  <span style={{ padding: "0.25rem 0.75rem", backgroundColor: "#f3f4f6", borderRadius: "9999px", fontSize: "0.8rem", fontWeight: 600, color: "#374151" }}>
                    {otherGroups.length}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "1rem" }}>
                  {otherGroups.map((g) => (
                    <GroupCard key={g.slug} group={g} showActions={false} />
                  ))}
                </div>
              </section>
            )}

            {/* Privileged note for admins */}
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
                      {currentUserRole === "super_admin" ? "Super Admin" : currentUserRole === "admin" ? "Administrator" : "Steering Member"} Access
                    </h4>
                    <p style={{ fontSize: "0.875rem", color: "#374151", margin: 0 }}>
                      You have access to all working group discussions across the forum.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* General Discussion — always at the bottom */}
            <section>
              <h2 style={{ fontSize: isMobile ? "1.125rem" : "1.5rem", fontWeight: 700, color: "#111827", marginBottom: "1rem" }}>
                General Discussion
              </h2>
              <div
                onClick={() => router.push("/dashboard/forum/general")}
                style={{ backgroundColor: "white", borderRadius: "1rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", border: "2px solid var(--color-ijf-accent)", padding: isMobile ? "1.25rem" : "2rem", cursor: "pointer" }}
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
                        <h2 style={{ fontSize: isMobile ? "1.1rem" : "1.5rem", fontWeight: 700, color: "#111827", margin: 0 }}>
                          IJF General Discussion
                        </h2>
                        <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-ijf-accent)", margin: 0 }}>
                          Open to all members{generalNewThreadCount > 0 ? ` • ${generalNewThreadCount} new` : ""}
                        </p>
                      </div>
                    </div>
                    {!isMobile && (
                      <p style={{ color: "#4b5563", lineHeight: 1.6, margin: 0 }}>
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
            </section>

          </div>
        )}
      </div>

      {/* Email modal */}
      {emailModal.open && emailModal.group && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ backgroundColor: "white", borderRadius: "0.75rem", padding: "2rem", width: "100%", maxWidth: "36rem", margin: "1rem", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827", margin: 0 }}>
                  Email Group: {emailModal.group.name}
                </h2>
                <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.25rem" }}>
                  Send a message to your working group members.
                </p>
              </div>
              <button onClick={() => setEmailModal(EMPTY_EMAIL_MODAL)} style={{ padding: "0.375rem 0.75rem", borderRadius: "0.5rem", backgroundColor: "#f3f4f6", cursor: "pointer", fontSize: "0.875rem" }}>
                Close
              </button>
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
                    <button
                      key={opt}
                      onClick={() => setEmailModal((m) => ({ ...m, audience: opt }))}
                      style={{ padding: "0.75rem", borderRadius: "0.625rem", border: `1px solid ${emailModal.audience === opt ? "rgba(228,185,91,0.5)" : "#e5e7eb"}`, backgroundColor: emailModal.audience === opt ? "rgba(228,185,91,0.1)" : "white", textAlign: "left", cursor: "pointer" }}
                    >
                      <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#111827", margin: "0 0 0.2rem" }}>
                        {opt === "members_and_coordinator" ? "Members + you" : "Members only"}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>
                        {opt === "members_and_coordinator" ? "All group members including yourself" : "All assigned members, excluding yourself"}
                      </p>
                    </button>
                  ))}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.375rem" }}>Subject</label>
                  <input
                    type="text"
                    value={emailModal.subject}
                    onChange={(e) => setEmailModal((m) => ({ ...m, subject: e.target.value }))}
                    style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "0.5rem", border: "1px solid #d1d5db", fontSize: "0.9375rem", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.375rem" }}>Message</label>
                  <textarea
                    rows={7}
                    value={emailModal.message}
                    onChange={(e) => setEmailModal((m) => ({ ...m, message: e.target.value }))}
                    placeholder="Write your update..."
                    style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "0.5rem", border: "1px solid #d1d5db", fontSize: "0.9375rem", resize: "vertical", boxSizing: "border-box" }}
                  />
                </div>

                {emailModal.error && (
                  <p style={{ fontSize: "0.875rem", color: "#991b1b", backgroundColor: "#fef2f2", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #fecaca" }}>{emailModal.error}</p>
                )}

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    onClick={sendGroupEmail}
                    disabled={emailModal.sending || !emailModal.subject.trim() || !emailModal.message.trim()}
                    style={{ padding: "0.75rem 1.5rem", borderRadius: "0.5rem", backgroundColor: "#111827", color: "white", fontWeight: 600, cursor: "pointer", opacity: emailModal.sending || !emailModal.subject.trim() || !emailModal.message.trim() ? 0.5 : 1 }}
                  >
                    {emailModal.sending ? "Sending..." : "Send Email"}
                  </button>
                  <button onClick={() => setEmailModal(EMPTY_EMAIL_MODAL)} style={{ padding: "0.75rem 1.5rem", borderRadius: "0.5rem", backgroundColor: "#f3f4f6", cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
