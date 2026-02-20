// Location: app/components/dashboard/MemberDashboard.tsx

import Link from "next/link";
import DashboardLayout from "./DashboardLayout";

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
            <div style={{ fontSize: "24px", flexShrink: 0 }}>⏳</div>
            <div>
              <p style={{ fontWeight: 700, color: "#92400e", fontSize: "15px", marginBottom: "4px" }}>
                Your membership is pending approval
              </p>
              <p style={{ color: "#92400e", fontSize: "14px", lineHeight: "1.6" }}>
                Your profile for <strong>{memberName}</strong> has been submitted and is awaiting review by the Irish Jazz Forum team. You'll receive an email once it's approved. In the meantime you can browse the site, but full member features are not yet available.
              </p>
            </div>
          </div>
        )}

        {/* Organisation Profile */}
        <div style={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "24px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>
            Your Organisation Profile
          </h3>
          <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "20px" }}>
            Keep your profile up to date — it feeds directly into the Irish Jazz Forum member directory and our sector data.
          </p>
          {user.memberProfile ? (
            <Link
              href="/dashboard/profile"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: isPending ? "#e5e7eb" : "#4CBB5A",
                color: isPending ? "#9ca3af" : "white",
                padding: "10px 20px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                textDecoration: "none",
                pointerEvents: isPending ? "none" : "auto",
              }}
            >
              ✏️ Edit Profile
            </Link>
          ) : (
            <p style={{ fontSize: "14px", color: "#6b7280" }}>
              No member profile assigned yet. Contact an administrator.
            </p>
          )}
        </div>

        {/* Discussion Forum */}
        <div style={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "24px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>
            Discussion Forum
          </h3>
          <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "20px" }}>
            Join the conversation with other Irish Jazz Forum members.
          </p>
          <Link
            href="/dashboard/forum"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "white", color: "#374151", border: "2px solid #e5e7eb", padding: "10px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}
          >
            💬 Go to Forum
          </Link>
        </div>

      </div>
    </DashboardLayout>
  );
}