import { BarChart3, FileText, Mail } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import DashboardFeatureCard from "./DashboardFeatureCard";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function SteeringDashboard({ user }: { user: User }) {
  return (
    <DashboardLayout title="Steering Committee Dashboard" userName={user.name} role={user.role}>
      <div className="grid gap-6 md:grid-cols-3">
        <DashboardFeatureCard
          icon={BarChart3}
          title="Analytics"
          description="View sector data, trends, and shared insights."
        />
        <DashboardFeatureCard
          icon={FileText}
          title="Reports"
          description="Generate advocacy reports and review strategic outputs."
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
