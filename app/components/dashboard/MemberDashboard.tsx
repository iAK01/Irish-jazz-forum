// Location: app/components/dashboard/MemberDashboard.tsx

import Link from "next/link";
import {
  Clock3,
  Mail,
  MessageSquareText,
  PencilLine,
} from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import DashboardFeatureCard from "./DashboardFeatureCard";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  memberProfile?: string;
}

interface MemberDashboardProps {
  user: User;
  memberName?: string;
  membershipStatus?: string;
}

export default function MemberDashboard({ user, memberName, membershipStatus }: MemberDashboardProps) {
  const isPending = membershipStatus === "prospective";

  return (
    <DashboardLayout title="Member Dashboard" userName={user.name} role={user.role}>
      <div className="space-y-6">

        {/* Pending approval banner */}
        {isPending && (
          <div style={{ backgroundColor: "#fffbeb", border: "2px solid #fcd34d", borderRadius: "12px", padding: "20px 24px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
            <div
              style={{
                flexShrink: 0,
                width: "2.75rem",
                height: "2.75rem",
                borderRadius: "9999px",
                backgroundColor: "rgba(245, 158, 11, 0.14)",
                color: "#b45309",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Clock3 size={22} strokeWidth={2.1} />
            </div>
            <div>
              <p style={{ fontWeight: 700, color: "#92400e", fontSize: "15px", marginBottom: "4px" }}>
                Your membership is pending approval
              </p>
              <p style={{ color: "#92400e", fontSize: "14px", lineHeight: "1.6" }}>
                Your profile for <strong>{memberName}</strong> has been submitted and is awaiting review by the Irish Jazz Forum team. You&apos;ll receive an email once it&apos;s approved. In the meantime you can browse the site, but full member features are not yet available.
              </p>
            </div>
          </div>
        )}

        {/* Organisation Profile */}
        <div style={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "24px" }}>
          <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            {user.memberProfile ? (
              <Link
                href="/dashboard/profile"
                style={{
                  pointerEvents: isPending ? "none" : "auto",
                  opacity: isPending ? 0.65 : 1,
                  textDecoration: "none",
                }}
              >
                <DashboardFeatureCard
                  icon={PencilLine}
                  title="Your Organisation Profile"
                  description="Keep your profile up to date for the member directory and sector data."
                />
              </Link>
            ) : (
              <div style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "24px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>
                  Your Organisation Profile
                </h3>
                <p style={{ fontSize: "14px", color: "#6b7280" }}>
                  No member profile assigned yet. Contact an administrator.
                </p>
              </div>
            )}

            <DashboardFeatureCard
              href="/dashboard/forum"
              icon={MessageSquareText}
              title="Discussion Forum"
              description="Join the conversation with other Irish Jazz Forum members."
            />

            <DashboardFeatureCard
              href="/dashboard/profile/notifications"
              icon={Mail}
              title="Email Notifications"
              description="Turn your weekly forum digest on or off for your account."
            />
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
