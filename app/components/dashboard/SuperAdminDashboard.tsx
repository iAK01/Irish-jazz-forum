"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardLayout from "./DashboardLayout";
import AdminDashboard from "./AdminDashboard";
import TeamDashboard from "./TeamDashboard";
import SteeringDashboard from "./SteeringDashboard";
import WorkingGroupDashboard from "./WorkingGroupDashboard";
import MemberDashboard from "./MemberDashboard";
import UserManagement from "./UserManagement";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

type ViewMode = "super_admin" | "admin" | "team" | "steering" | "working_group" | "member";

export default function SuperAdminDashboard({ user }: { user: User }) {
  const [viewMode, setViewMode] = useState<ViewMode>("super_admin");

  if (viewMode === "admin") return <AdminDashboard user={{ ...user, role: "admin" }} />;
  if (viewMode === "team") return <TeamDashboard user={{ ...user, role: "team" }} />;
  if (viewMode === "steering") return <SteeringDashboard user={{ ...user, role: "steering" }} />;
  if (viewMode === "working_group") return <WorkingGroupDashboard user={{ ...user, role: "working_group" }} />;
  if (viewMode === "member") return <MemberDashboard user={{ ...user, role: "member" }} />;

  return (
    <DashboardLayout title="Super Admin Dashboard" userName={user.name}>
      <div className="mb-8 p-4 bg-ijf-accent/20 rounded-lg">
        <p className="text-ijf-surface mb-4 font-semibold">View dashboard as:</p>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setViewMode("super_admin")}
            className="px-4 py-2 bg-ijf-accent text-ijf-bg rounded font-semibold"
          >
            Super Admin
          </button>
          <button
            onClick={() => setViewMode("admin")}
            className="px-4 py-2 bg-ijf-primary text-ijf-surface rounded"
          >
            Admin
          </button>
          <button
            onClick={() => setViewMode("team")}
            className="px-4 py-2 bg-ijf-primary text-ijf-surface rounded"
          >
            Team
          </button>
          <button
            onClick={() => setViewMode("steering")}
            className="px-4 py-2 bg-ijf-primary text-ijf-surface rounded"
          >
            Steering
          </button>
          <button
            onClick={() => setViewMode("working_group")}
            className="px-4 py-2 bg-ijf-primary text-ijf-surface rounded"
          >
            Working Group
          </button>
          <button
            onClick={() => setViewMode("member")}
            className="px-4 py-2 bg-ijf-primary text-ijf-surface rounded"
          >
            Member
          </button>
        </div>
      </div>

      <div className="mb-8" id="user-management">
        <h2 className="text-2xl font-bold text-ijf-accent mb-4">User Management</h2>
        <UserManagement />
      </div>

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

        <a 
          href="#user-management"
          className="p-6 bg-ijf-primary rounded-lg hover:scale-105 hover:shadow-lg transition-all cursor-pointer"
        >
          <h3 className="text-xl font-semibold text-ijf-surface mb-2">User Management</h3>
          <p className="text-ijf-surface/80">Manage user roles and permissions</p>
        </a>
      </div>
    </DashboardLayout>
  );
}