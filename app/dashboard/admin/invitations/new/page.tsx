// /app/dashboard/admin/invitations/new/page.tsx

"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import InvitationForm from "@/app/components/InvitationForm";

export default function NewInvitationPage() {
  const router = useRouter();

  const handleSuccess = () => {
    // Redirect to invitations list after 2 seconds
    setTimeout(() => {
      router.push("/dashboard/admin/invitations");
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Back Link */}
      <Link
        href="/dashboard/admin/invitations"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Invitations
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Invite New Member</h1>
        <p className="text-gray-600 mt-2">
          Send an invitation to join the Irish Jazz Forum. The recipient will receive an email with a secure link to create their profile.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-8 shadow-sm">
        <InvitationForm onSuccess={handleSuccess} />
      </div>

      {/* Info Box */}
      <div className="mt-6 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
        <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li className="flex items-start gap-2">
            <span className="font-bold mt-0.5">1.</span>
            <span>The recipient will receive an email with a secure invitation link</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold mt-0.5">2.</span>
            <span>They sign in with Google or use an email magic link</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold mt-0.5">3.</span>
            <span>They complete a brief onboarding form with their profile details</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold mt-0.5">4.</span>
            <span>You review and approve their membership</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold mt-0.5">5.</span>
            <span>They gain full access to the Irish Jazz Forum</span>
          </li>
        </ul>
      </div>
    </div>
  );
}