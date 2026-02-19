import DashboardLayout from "./DashboardLayout";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function SteeringDashboard({ user }: { user: User }) {
  return (
    <DashboardLayout title="Steering Committee Dashboard" userName={user.name} role={user.role}>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 bg-ijf-primary rounded-lg">
          <h3 className="text-xl font-semibold text-ijf-surface mb-2">Analytics</h3>
          <p className="text-ijf-surface/80">View sector data and insights</p>
        </div>
        <div className="p-6 bg-ijf-primary rounded-lg">
          <h3 className="text-xl font-semibold text-ijf-surface mb-2">Reports</h3>
          <p className="text-ijf-surface/80">Generate advocacy reports</p>
        </div>
      </div>
    </DashboardLayout>
  );
}