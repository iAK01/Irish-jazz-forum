// /app/components/InvitationForm.tsx

"use client";

import { useState, useEffect } from "react";

interface Member {
  slug: string;
  name: string;
  memberType: string[];
}

interface InvitationFormProps {
  onSuccess?: () => void;
}

export default function InvitationForm({ onSuccess }: InvitationFormProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [expiryDays, setExpiryDays] = useState(30);
  const [invitationType, setInvitationType] = useState<"new_member" | "join_member">("new_member");
  const [memberSlug, setMemberSlug] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Fetch existing members when join_member type is selected
  useEffect(() => {
    if (invitationType === "join_member" && members.length === 0) {
      fetchMembers();
    }
  }, [invitationType]);

  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      const response = await fetch("/api/members");
      const data = await response.json();
      if (data.success) {
        setMembers(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch members:", err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    if (invitationType === "join_member" && !memberSlug) {
      setError("Please select an organisation for this invitation");
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
          invitationType,
          memberSlug: invitationType === "join_member" ? memberSlug : undefined,
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
      setMemberSlug("");
      setInvitationType("new_member");

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

      {/* Invitation Type Toggle */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Invitation Type *
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setInvitationType("new_member")}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              invitationType === "new_member"
                ? "border-ijf-accent bg-amber-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <p className="font-semibold text-gray-900 text-sm">New Member</p>
            <p className="text-xs text-gray-500 mt-1">
              First person from an organisation — they'll create a new member profile
            </p>
          </button>
          <button
            type="button"
            onClick={() => setInvitationType("join_member")}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              invitationType === "join_member"
                ? "border-ijf-accent bg-amber-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <p className="font-semibold text-gray-900 text-sm">Join Existing Org</p>
            <p className="text-xs text-gray-500 mt-1">
              Additional staff member — they'll be linked to an existing member profile
            </p>
          </button>
        </div>
      </div>

      {/* Member selector — only shown for join_member */}
      {invitationType === "join_member" && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Select Organisation *
          </label>
          {loadingMembers ? (
            <div className="px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-500 text-sm">
              Loading members...
            </div>
          ) : (
            <select
              value={memberSlug}
              onChange={(e) => setMemberSlug(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-ijf-accent focus:border-transparent bg-white text-gray-900 transition-all cursor-pointer"
              required
            >
              <option value="">Select an organisation...</option>
              {members.map((member) => (
                <option key={member.slug} value={member.slug}>
                  {member.name} ({member.memberType?.join(", ")})
                </option>
              ))}
            </select>
          )}
          <p className="text-sm text-gray-500 mt-1">
            The person being invited will be linked to this organisation's profile
          </p>
        </div>
      )}

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

      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <p className="text-red-800 text-sm font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          <p className="text-green-800 text-sm font-medium">✓ Invitation sent successfully!</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: "var(--color-ijf-accent)" }}
      >
        {loading ? "Sending Invitation..." : "Send Invitation"}
      </button>
    </form>
  );
}