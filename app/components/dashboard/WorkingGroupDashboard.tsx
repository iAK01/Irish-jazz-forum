import { Mail, UsersRound } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import DashboardFeatureCard from "./DashboardFeatureCard";

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
      <div className="grid gap-6 md:grid-cols-2">
        <div
          className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(228,185,91,0.08), rgba(255,255,255,0) 55%)",
          }}
        >
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-ijf-accent/20 bg-ijf-accent/10 text-ijf-accent">
            <UsersRound className="h-5 w-5" strokeWidth={2.1} />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-zinc-900">Your Working Groups</h3>
          {user.workingGroups && user.workingGroups.length > 0 ? (
            <ul className="mt-4 space-y-2 text-sm leading-6 text-zinc-600">
              {user.workingGroups.map((group) => (
                <li key={group} className="capitalize">
                  {group.replace(/_/g, " ")}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm leading-6 text-zinc-600">No working groups assigned yet.</p>
          )}
        </div>

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
