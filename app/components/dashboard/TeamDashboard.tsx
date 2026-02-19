import DashboardLayout from "./DashboardLayout";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function TeamDashboard({ user }: { user: User }) {
  return (
    <DashboardLayout title="Team Dashboard" userName={user.name} role={user.role}>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 bg-ijf-primary rounded-lg">
          <h3 className="text-xl font-semibold text-ijf-surface mb-2">Member Profiles</h3>
          <p className="text-ijf-surface/80">Edit member organizations</p>
        </div>
        <div className="p-6 bg-ijf-primary rounded-lg">
          <h3 className="text-xl font-semibold text-ijf-surface mb-2">Content Management</h3>
          <p className="text-ijf-surface/80">Update site content</p>
        </div>
      </div>
    </DashboardLayout>
  );
}