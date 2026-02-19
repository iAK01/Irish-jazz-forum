import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  try {
    const user = await requireAuth(["admin", "super_admin"]);
    
    return (
      <div className="min-h-screen bg-ijf-bg text-ijf-surface p-8">
        <h1 className="text-3xl font-bold text-ijf-accent mb-4">Admin Dashboard</h1>
        <p>Welcome {user.name}</p>
        <p>Role: {user.role}</p>
      </div>
    );
  } catch (error) {
    redirect("/");
  }
}