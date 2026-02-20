import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import UserManagement from "@/app/components/dashboard/UserManagement";

export default async function UsersPage() {
  const session = await auth();

  if (!session?.user) redirect("/signin");
  if (session.user.role !== "super_admin") redirect("/dashboard");

  return (
    <DashboardLayout title="User Management" userName={session.user.name || ""}>
      <UserManagement />
    </DashboardLayout>
  );
}