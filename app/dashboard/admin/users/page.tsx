import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import UserManagement from "@/app/components/dashboard/UserManagement";

async function getPendingApprovalsCount() {
  try {
    const baseUrl =
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/members?status=prospective`, {
      cache: "no-store",
    });

    if (!res.ok) return 0;

    const data = await res.json();
    return data.data?.length || 0;
  } catch {
    return 0;
  }
}

export default async function UsersPage() {
  const session = await auth();

  if (!session?.user) redirect("/signin");
  if (session.user.role !== "super_admin") redirect("/dashboard");

  const pendingApprovalsCount = await getPendingApprovalsCount();

  return (
    <DashboardLayout title="User Management" userName={session.user.name || ""}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {pendingApprovalsCount > 0 && (
          <div className="mb-6">
            <Link
              href="/dashboard/admin/members/pending"
              className="px-5 py-3 bg-yellow-500 hover:bg-yellow-600 rounded-lg font-semibold text-white transition-all shadow-md hover:shadow-lg text-sm sm:text-base text-center whitespace-nowrap flex items-center justify-center gap-2 w-full sm:w-fit"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              Pending Approvals
              <span className="px-2 py-0.5 bg-white text-yellow-700 rounded-full text-xs font-bold">
                {pendingApprovalsCount}
              </span>
            </Link>
          </div>
        )}

        <UserManagement />
      </div>
    </DashboardLayout>
  );
}