"use client";

import { Suspense } from "react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";
  const error = searchParams?.get("error");

  const [email, setEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");

  const handleGoogleSignIn = async () => {
    await signIn("google", { callbackUrl });
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setEmailError("Please enter your email address.");
      return;
    }
    setEmailLoading(true);
    setEmailError("");

    const check = await fetch("/api/users/check-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    const { exists } = await check.json();
    if (!exists) {
      setEmailError("No account found for this email address. Please use the link from your invitation email.");
      setEmailLoading(false);
      return;
    }

    await signIn("resend", {
      email: email.trim(),
      callbackUrl,
      redirect: false,
    });
    setEmailLoading(false);
    setEmailSent(true);
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "#f0fdf4" }}>
            <svg className="w-8 h-8" style={{ color: "#4CBB5A" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your inbox</h1>
            <p className="text-gray-600 mb-1">We've sent a sign-in link to</p>
            <p className="font-mono font-semibold text-gray-900 text-lg">{email}</p>
            <p className="text-gray-500 text-sm mt-3">Click the link in that email and you'll be signed in automatically.</p>
          </div>
          <div style={{ backgroundColor: "#f0fdf4", border: "2px solid #bbf7d0", borderRadius: "8px", padding: "14px 16px" }}>
            <p style={{ fontSize: "13px", color: "#166534", fontWeight: 600, marginBottom: "4px" }}>📌 This is how you log in every time</p>
            <p style={{ fontSize: "13px", color: "#166534" }}>Come back to this page, enter your email address, and we'll send you a new link. No password needed, ever.</p>
          </div>
          <button
            onClick={() => { setEmailSent(false); setEmail(""); }}
            style={{ marginTop: "20px", width: "100%", textAlign: "center", fontSize: "13px", color: "#6b7280", background: "none", border: "none", cursor: "pointer" }}>
            ← Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to Irish Jazz Forum</h1>
          <p className="text-gray-500 text-sm">Choose the same method you used when you first joined</p>
        </div>

        {error && (
          <div style={{ backgroundColor: "#fef2f2", border: "2px solid #fecaca", borderRadius: "8px", padding: "12px 16px", marginBottom: "20px" }}>
            <p style={{ fontSize: "13px", color: "#991b1b" }}>
              {error === "OAuthAccountNotLinked"
                ? "This email is already registered using a different sign-in method. Please use the method you signed up with."
                : "There was a problem signing you in. Please try again."}
            </p>
          </div>
        )}

        <div style={{ border: "2px solid #e5e7eb", borderRadius: "12px", padding: "20px", marginBottom: "12px" }}>
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
          <div style={{ backgroundColor: "#f8fafc", borderRadius: "6px", padding: "10px 12px" }}>
            <p style={{ fontSize: "12px", color: "#475569", lineHeight: "1.6" }}>
              <span style={{ fontWeight: 600 }}>Use this if you signed up with Google.</span> You'll use this every time — just click the button and you're in.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "4px 0 12px" }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#e5e7eb" }} />
          <span style={{ fontSize: "12px", color: "#9ca3af", fontWeight: 500 }}>OR</span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#e5e7eb" }} />
        </div>

        <div style={{ border: "2px solid #e5e7eb", borderRadius: "12px", padding: "20px" }}>
          <form onSubmit={handleMagicLink}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
              Your email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
              placeholder="you@example.com"
              style={{ width: "100%", padding: "10px 14px", border: "2px solid #d1d5db", borderRadius: "8px", fontSize: "14px", marginBottom: "10px", boxSizing: "border-box" }}
            />
            {emailError && <p style={{ fontSize: "12px", color: "#dc2626", marginBottom: "8px" }}>{emailError}</p>}
            <button
              type="submit"
              disabled={emailLoading}
              style={{ width: "100%", padding: "10px 16px", backgroundColor: "#4CBB5A", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: emailLoading ? "not-allowed" : "pointer", opacity: emailLoading ? 0.6 : 1, marginBottom: "12px" }}
            >
              {emailLoading ? "Checking..." : "Send me a sign-in link"}
            </button>
          </form>
          <div style={{ backgroundColor: "#f8fafc", borderRadius: "6px", padding: "10px 12px" }}>
            <p style={{ fontSize: "12px", color: "#475569", lineHeight: "1.6" }}>
              <span style={{ fontWeight: 600 }}>Use this if you don't have a Google account.</span> We'll email you a one-click sign-in link. You do this every time you log in — no password ever needed.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4" style={{ borderColor: "#4CBB5A" }} />
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}