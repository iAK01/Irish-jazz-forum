"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

function JoinContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  const [invitation, setInvitation] = useState<any>(null);
  const [stage, setStage] = useState<"loading" | "ready" | "magic_sent" | "error">("loading");
  const [error, setError] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (token) {
      validateInvitation();
    } else {
      setError("No invitation token found. Please use the link from your invitation email.");
      setStage("error");
    }
  }, [token]);

  const validateInvitation = async () => {
    try {
      const response = await fetch("/api/invitations/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Invalid invitation");
      setInvitation(data.data);
      setStage("ready");
    } catch (err: any) {
      setError(err.message);
      setStage("error");
    }
  };

  const handleGoogleSignIn = async () => {
    await signIn("google", { callbackUrl: `/join/onboarding?token=${token}` });
  };

  const handleMagicLink = async () => {
    setEmailLoading(true);
    await signIn("resend", {
      email: invitation.email,
      callbackUrl: `/join/onboarding?token=${token}`,
      redirect: false,
    });
    setEmailLoading(false);
    setStage("magic_sent");
  };

  const handleResend = async () => {
    setResending(true);
    await signIn("resend", {
      email: invitation.email,
      callbackUrl: `/join/onboarding?token=${token}`,
      redirect: false,
    });
    setResending(false);
  };

  if (stage === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4" style={{ borderColor: "#4CBB5A" }} />
      </div>
    );
  }

  if (stage === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation Problem</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">
            Contact{" "}
            <a href="mailto:info@irishjazzforum.ie" style={{ color: "#4CBB5A" }} className="font-medium">
              info@irishjazzforum.ie
            </a>
          </p>
        </div>
      </div>
    );
  }

  if (stage === "magic_sent") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "#f0fdf4" }}>
            <svg className="w-8 h-8" style={{ color: "#4CBB5A" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Check your inbox</h1>
            <p className="text-gray-600 mb-1">We've sent a sign-in link to</p>
            <p className="font-mono font-semibold text-gray-900 text-lg">{invitation.email}</p>
          </div>

          <div className="space-y-3 mb-8">
            {[
              "Open the email from Irish Jazz Forum",
              "Click the sign-in link inside it",
              "You'll be brought back here to finish setting up your account",
            ].map((text, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#4CBB5A", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <p style={{ fontSize: "14px", color: "#374151", paddingTop: "3px" }}>{text}</p>
              </div>
            ))}
          </div>

          {/* Reminder about ongoing login */}
          <div style={{ backgroundColor: "#f0fdf4", border: "2px solid #bbf7d0", borderRadius: "8px", padding: "16px", marginBottom: "24px" }}>
            <p style={{ fontSize: "13px", color: "#166534", fontWeight: 600, marginBottom: "4px" }}>
              📌 How you'll log in from now on
            </p>
            <p style={{ fontSize: "13px", color: "#166534" }}>
              Every time you visit the Irish Jazz Forum, enter your email address and we'll send you a sign-in link. No password needed.
            </p>
          </div>

          <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "20px", textAlign: "center" }}>
            <p className="text-sm text-gray-500 mb-3">No email? Check your spam folder, then:</p>
            <button onClick={handleResend} disabled={resending}
              style={{ border: "2px solid #4CBB5A", color: "#4CBB5A", backgroundColor: "transparent", padding: "10px 24px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: resending ? "not-allowed" : "pointer", opacity: resending ? 0.6 : 1 }}>
              {resending ? "Sending..." : "Resend sign-in link"}
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Invitation expires{" "}
            {new Date(invitation.expiresAt).toLocaleDateString("en-IE", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>
    );
  }

  // Stage: ready — show both options
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">You've been invited</h1>
          <p className="text-gray-600">
            <span className="font-semibold text-gray-900">{invitation.inviterName}</span> has invited you to join the Irish Jazz Forum.
          </p>
          {invitation.message && (
            <div className="mt-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg text-left">
              <p className="text-sm text-gray-700 italic">"{invitation.message}"</p>
            </div>
          )}
        </div>

        <p className="text-sm font-semibold text-gray-700 mb-4 text-center">
          Choose how you want to sign in
        </p>

        {/* Option 1 — Google */}
        <div style={{ border: "2px solid #e5e7eb", borderRadius: "12px", padding: "20px", marginBottom: "12px" }}>
          <button onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
          <div style={{ backgroundColor: "#f8fafc", borderRadius: "6px", padding: "10px 12px" }}>
            <p style={{ fontSize: "12px", color: "#475569", lineHeight: "1.5" }}>
              <span style={{ fontWeight: 600 }}>Best if you have a Google account.</span> Every time you log in to the Irish Jazz Forum, you'll click "Sign in with Google" — quick and no passwords needed.
            </p>
          </div>
        </div>

        {/* Option 2 — Magic link */}
        <div style={{ border: "2px solid #e5e7eb", borderRadius: "12px", padding: "20px" }}>
          <button onClick={handleMagicLink} disabled={emailLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg font-medium text-white transition-all disabled:opacity-50 mb-3"
            style={{ backgroundColor: "#4CBB5A" }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {emailLoading ? "Sending link..." : `Send sign-in link to ${invitation.email}`}
          </button>
          <div style={{ backgroundColor: "#f8fafc", borderRadius: "6px", padding: "10px 12px" }}>
            <p style={{ fontSize: "12px", color: "#475569", lineHeight: "1.5" }}>
              <span style={{ fontWeight: 600 }}>No Google account? Use this option.</span> We'll email you a sign-in link. Every time you log in to the Irish Jazz Forum in future, you'll enter your email address and we'll send you a new link — no password ever needed.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Invitation expires{" "}
          {new Date(invitation.expiresAt).toLocaleDateString("en-IE", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>
    </div>
  );
}

export default function JoinLandingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4" style={{ borderColor: "#4CBB5A" }} />
      </div>
    }>
      <JoinContent />
    </Suspense>
  );
}