import {
  FolderKanban,
  Mail,
  ShieldCheck,
  Users,
} from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import DashboardFeatureCard from "./DashboardFeatureCard";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminDashboard({ user }: { user: User }) {
  return (
    <DashboardLayout title="Admin Dashboard" userName={user.name} >
      <div className="grid gap-6 md:grid-cols-3">
        <DashboardFeatureCard
          href="/dashboard/admin/working-groups"
          icon={FolderKanban}
          title="Working Groups"
          description="Create and manage forum working groups."
        />

        <DashboardFeatureCard
          href="/dashboard/admin/members"
          icon={Users}
          title="Member List"
          description="View and manage all member profiles."
        />

        <DashboardFeatureCard
          href="/dashboard"
          icon={ShieldCheck}
          title="User Management"
          description="Manage user roles and permissions."
        />

        <DashboardFeatureCard
          href="/dashboard/profile/notifications"
          icon={Mail}
          title="Email Settings"
          description="Turn your weekly forum digest on or off."
        />
      </div>
    </DashboardLayout>
  );
}
