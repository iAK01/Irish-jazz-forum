// /app/join/pending/page.tsx

"use client";

import Link from "next/link";

export default function JoinPendingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-12 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'var(--color-ijf-accent)' }}>
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Profile Submitted Successfully!
          </h1>

          {/* Message */}
          <div className="space-y-4 text-gray-700 mb-8">
            <p className="text-lg">
              Thank you for completing your profile. Your application is now being reviewed by our admin team.
            </p>
            <p>
              You'll receive an email notification once your membership has been approved. This typically takes 1-2 business days.
            </p>
          </div>

          {/* What Happens Next */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-semibold text-blue-900 mb-3 text-lg">What happens next?</h3>
            <ul className="space-y-3 text-sm text-blue-900">
              <li className="flex items-start gap-3">
                <span className="font-bold mt-0.5 min-w-[24px]">1.</span>
                <span>Our admin team will review your profile and membership application</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold mt-0.5 min-w-[24px]">2.</span>
                <span>Once approved, you'll receive a welcome email with your login details</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold mt-0.5 min-w-[24px]">3.</span>
                <span>You'll gain full access to the Irish Jazz Forum platform, including:</span>
              </li>
            </ul>
            <ul className="ml-11 mt-2 space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Your personal member dashboard</span>
              </li>
              <li className="flex items-start gap-2">
  <span>•</span>
  <span>Full editing of your organisation or artist profile — logo, photos, social links, tour dates, and more</span>
</li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Forum discussions and working groups</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Member directory and networking tools</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Resources, events, and opportunities</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-block w-full px-8 py-4 rounded-lg font-semibold text-white transition-all shadow-md hover:shadow-lg"
              style={{ backgroundColor: 'var(--color-ijf-accent)' }}
            >
              Return to Homepage
            </Link>
            
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">
                Have questions about your application?
              </p>
              <a
                href="mailto:ken@improvisedmusic.ie"
                className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                style={{ color: 'var(--color-ijf-accent)' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact us at info[at]irishjazzforum[dot]com
              </a>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            Check your email inbox (including spam folder) for updates on your application status.
          </p>
        </div>
      </div>
    </div>
  );
}