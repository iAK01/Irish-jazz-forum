import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SuperAdminDashboard from "../components/dashboard/SuperAdminDashboard";
import AdminDashboard from "../components/dashboard/AdminDashboard";
import TeamDashboard from "../components/dashboard/TeamDashboard";
import SteeringDashboard from "../components/dashboard/SteeringDashboard";
import WorkingGroupDashboard from "../components/dashboard/WorkingGroupDashboard";
import MemberDashboard from "../components/dashboard/MemberDashboard";

export default async function DashboardPage() {
  try {
    const user = await requireAuth();

    switch (user.role) {
      case "super_admin":
        return <SuperAdminDashboard user={user} />;
      case "admin":
        return <AdminDashboard user={user} />;
      case "team":
        return <TeamDashboard user={user} />;
      case "steering":
        return <SteeringDashboard user={user} />;
      case "working_group":
        return <WorkingGroupDashboard user={user} />;
      case "member":
        return <MemberDashboard user={user} />;
      default:
        redirect("/");
    }
  } catch (error) {
    redirect("/api/auth/signin");
  }
}