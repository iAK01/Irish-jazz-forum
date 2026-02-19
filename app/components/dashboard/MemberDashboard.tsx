import DashboardLayout from "./DashboardLayout";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  memberProfile?: string;
}

export default function MemberDashboard({ user }: { user: User }) {
  return (
    <DashboardLayout title="Member Dashboard" userName={user.name} role={user.role}>
      <div className="p-6 bg-ijf-primary rounded-lg">
        <h3 className="text-xl font-semibold text-ijf-surface mb-2">Your Profile</h3>
        {user.memberProfile ? (
          <p className="text-ijf-surface/80">
            Edit your organization profile: {user.memberProfile}
          </p>
        ) : (
          <p className="text-ijf-surface/80">
            No member profile assigned yet. Contact an administrator.
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}