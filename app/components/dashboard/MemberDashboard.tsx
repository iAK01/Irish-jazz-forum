import Link from "next/link";
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
      <div className="max-w-2xl space-y-4">

        {/* Profile card */}
        <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
            Your Organisation Profile
          </h3>
          {user.memberProfile ? (
            <>
              <p className="text-sm text-zinc-500 mb-4">
                Keep your profile up to date — it feeds directly into the Irish Jazz Forum member directory and our sector data.
              </p>
              <Link
                href="/dashboard/profile"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition"
                style={{ backgroundColor: "var(--color-ijf-accent)" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Profile
              </Link>
            </>
          ) : (
            <p className="text-sm text-zinc-500">
              No member profile assigned yet. Contact an administrator.
            </p>
          )}
        </div>

        {/* Forum card */}
        <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
            Discussion Forum
          </h3>
          <p className="text-sm text-zinc-500 mb-4">
            Join the conversation with other Irish Jazz Forum members.
          </p>
          <Link
            href="/dashboard/forum"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-900 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Go to Forum
          </Link>
        </div>

      </div>
    </DashboardLayout>
  );
}