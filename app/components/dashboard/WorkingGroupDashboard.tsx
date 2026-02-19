import DashboardLayout from "./DashboardLayout";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  workingGroups?: string[];
}

export default function WorkingGroupDashboard({ user }: { user: User }) {
  return (
    <DashboardLayout title="Working Group Dashboard" userName={user.name}>
      <div className="p-6 bg-ijf-primary rounded-lg">
        <h3 className="text-xl font-semibold text-ijf-surface mb-2">Your Working Groups</h3>
        {user.workingGroups && user.workingGroups.length > 0 ? (
          <ul className="text-ijf-surface/80 mt-4 space-y-2">
            {user.workingGroups.map((group) => (
              <li key={group} className="capitalize">
                {group.replace(/_/g, " ")}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ijf-surface/80">No working groups assigned yet</p>
        )}
      </div>
    </DashboardLayout>
  );
}