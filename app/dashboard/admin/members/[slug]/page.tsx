"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import MemberProfileForm from "@/app/components/members/MemberProfileForm";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import Link from "next/link";

export default function AdminMemberEditPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: session } = useSession();

  const [memberData, setMemberData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) return;
    if (session.user.role !== "admin" && session.user.role !== "super_admin") {
      router.push("/dashboard");
      return;
    }
    fetchMember();
  }, [session, slug]);

  const fetchMember = async () => {
    try {
      const res = await fetch(`/api/members/${slug}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load member");
      setMemberData(data.data || data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null;

  if (loading) {
    return (
      <DashboardLayout title="Edit Member" userName={session.user.name} role={session.user.role}>
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4" style={{ borderColor: "#4CBB5A" }} />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !memberData) {
    return (
      <DashboardLayout title="Edit Member" userName={session.user.name} role={session.user.role}>
        <div className="max-w-xl mx-auto py-24 text-center">
          <p className="text-red-600 font-medium mb-4">{error || "Member not found."}</p>
          <Link href="/dashboard/admin/members" className="text-sm underline text-gray-500">
            ← Back to Member Directory
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Editing: ${memberData.name}`} userName={session.user.name} role={session.user.role}>

      {/* Breadcrumb */}
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#6b7280" }}>
        <Link href="/dashboard/admin/members" style={{ color: "#4CBB5A", textDecoration: "none", fontWeight: 500 }}>
          Member Directory
        </Link>
        <span>›</span>
        <span style={{ color: "#374151", fontWeight: 600 }}>{memberData.name}</span>
      </div>

      {/* Status banner for prospective members */}
      {memberData.membershipStatus === "prospective" && (
        <div style={{ backgroundColor: "#fffbeb", border: "2px solid #fcd34d", borderRadius: "10px", padding: "14px 18px", marginBottom: "24px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
          <span style={{ fontSize: "20px", flexShrink: 0 }}>⏳</span>
          <div>
            <p style={{ fontWeight: 700, color: "#92400e", fontSize: "14px", marginBottom: "2px" }}>Pending Approval</p>
            <p style={{ fontSize: "13px", color: "#92400e" }}>
              This profile is awaiting approval. You can edit and then approve from{" "}
              <Link href={`/dashboard/admin/members/${slug}/review`} style={{ color: "#92400e", fontWeight: 600, textDecoration: "underline" }}>
                the review page
              </Link>.
            </p>
          </div>
        </div>
      )}

      {/* The full profile form, pre-populated with this member's data */}
      <MemberProfileForm initialData={memberData} mode="edit" />

    </DashboardLayout>
  );
}