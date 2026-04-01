import { redirect } from "next/navigation";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import NotificationPreferencesForm from "@/app/components/NotificationPreferencesForm";
import { requireAuth } from "@/lib/auth";

export default async function NotificationPreferencesPage() {
  const user = await requireAuth().catch(() => null);

  if (!user) {
    redirect("/api/auth/signin?callbackUrl=/dashboard/profile/notifications");
  }

  return (
    <DashboardLayout
      title="Notification Settings"
      userName={user.name}
      role={user.role}
    >
      <NotificationPreferencesForm userRole={user.role} />
    </DashboardLayout>
  );
}
