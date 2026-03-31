import { FilePenLine, Mail, UsersRound } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import DashboardFeatureCard from "./DashboardFeatureCard";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function TeamDashboard({ user }: { user: User }) {
  return (
    <DashboardLayout title="Team Dashboard" userName={user.name} role={user.role}>
      <div className="grid gap-6 md:grid-cols-3">
        <DashboardFeatureCard
          icon={UsersRound}
          title="Member Profiles"
          description="Edit member organisations and keep directory information current."
        />
        <DashboardFeatureCard
          icon={FilePenLine}
          title="Content Management"
          description="Update site content and maintain editorial areas."
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
