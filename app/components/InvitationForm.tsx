// /app/components/InvitationForm.tsx

"use client";

import { useState } from "react";

interface InvitationFormProps {
  onSuccess?: () => void;
}

export default function InvitationForm({ onSuccess }: InvitationFormProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [expiryDays, setExpiryDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          message: message.trim() || undefined,
          expiryDays,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to send invitation");
      }

      setSuccess(true);
      setEmail("");
      setMessage("");
      setExpiryDays(30);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
          Email Address *
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="member@example.com"
          required
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-ijf-accent focus:border-transparent bg-white text-gray-900 placeholder-gray-400 transition-all"
        />
      </div>

      {/* Personal Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">
          Personal Message (Optional)
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Add a personal note to your invitation..."
          rows={4}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-ijf-accent focus:border-transparent bg-white text-gray-900 placeholder-gray-400 transition-all resize-none"
        />
      </div>

      {/* Expiry */}
      <div>
        <label htmlFor="expiry" className="block text-sm font-semibold text-gray-900 mb-2">
          Invitation Expires In
        </label>
        <select
          id="expiry"
          value={expiryDays}
          onChange={(e) => setExpiryDays(Number(e.target.value))}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-ijf-accent focus:border-transparent bg-white text-gray-900 transition-all cursor-pointer"
        >
          <option value={7}>7 days</option>
          <option value={14}>14 days</option>
          <option value={30}>30 days (recommended)</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <p className="text-red-800 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          <p className="text-green-800 text-sm font-medium">
            ✓ Invitation sent successfully!
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: 'var(--color-ijf-accent)' }}
      >
        {loading ? "Sending Invitation..." : "Send Invitation"}
      </button>
    </form>
  );
}