import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SuperAdminDashboard from "../components/dashboard/SuperAdminDashboard";
import AdminDashboard from "../components/dashboard/AdminDashboard";
import TeamDashboard from "../components/dashboard/TeamDashboard";
import SteeringDashboard from "../components/dashboard/SteeringDashboard";
import WorkingGroupDashboard from "../components/dashboard/WorkingGroupDashboard";
import MemberDashboard from "../components/dashboard/MemberDashboard";
import dbConnect from "@/lib/mongodb";
import { MemberModel } from "@/models/Member";

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
      case "member": {
        let memberName: string | undefined;
        let membershipStatus: string | undefined;
        if (user.memberProfile) {
          await dbConnect();
          const member = await MemberModel.findOne(
            { slug: user.memberProfile },
            { name: 1, membershipStatus: 1 }
          ).lean() as any;
          memberName = member?.name;
          membershipStatus = member?.membershipStatus;
        }
        return (
          <MemberDashboard
            user={user}
            memberName={memberName}
            membershipStatus={membershipStatus}
          />
        );
      }
      default:
        redirect("/");
    }
  } catch (error) {
    redirect("/api/auth/signin");
  }
}