import Link from "next/link";
import DashboardLayout from "./DashboardLayout";

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
        <Link 
          href="/dashboard/admin/working-groups"
          className="p-6 bg-ijf-primary rounded-lg hover:scale-105 hover:shadow-lg transition-all cursor-pointer"
        >
          <h3 className="text-xl font-semibold text-ijf-surface mb-2">Working Groups</h3>
          <p className="text-ijf-surface/80">Create and manage forum working groups</p>
        </Link>
        
        <Link 
          href="/dashboard/admin/members"
          className="p-6 bg-ijf-primary rounded-lg hover:scale-105 hover:shadow-lg transition-all cursor-pointer"
        >
          <h3 className="text-xl font-semibold text-ijf-surface mb-2">Member List</h3>
          <p className="text-ijf-surface/80">View and manage all member profiles</p>
        </Link>

        <Link 
          href="/dashboard"
          className="p-6 bg-ijf-primary rounded-lg hover:scale-105 hover:shadow-lg transition-all cursor-pointer"
        >
          <h3 className="text-xl font-semibold text-ijf-surface mb-2">User Management</h3>
          <p className="text-ijf-surface/80">Manage user roles and permissions</p>
        </Link>
      </div>
    </DashboardLayout>
  );
}