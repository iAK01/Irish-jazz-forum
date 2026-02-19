// FILE 3/8: /app/join/verify-email/page.tsx
// NEW FILE - Email verification sent confirmation

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-ijf-accent rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Check your email
        </h1>

        <p className="text-gray-600 mb-6">
          We've sent you a magic link to sign in. Click the link in the email to continue with your Irish Jazz Forum membership application.
        </p>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-medium mb-1">Didn't receive the email?</p>
          <p>Check your spam folder or go back and try again.</p>
        </div>

        <div className="mt-6">
          <a
            href="/join"
            className="text-ijf-accent hover:underline font-medium"
          >
            ← Back to sign in
          </a>
        </div>
      </div>
    </div>
  );
}