"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface FormData {
  personalName: string;
  name: string;
  slug: string;
  memberType: string[];
  region: string;
  privacySettings: {
    publicProfile: boolean;
    shareDataForAdvocacy: boolean;
  };
}

interface InvitationData {
  email: string;
  inviterName: string;
  message?: string;
  expiresAt: string;
  invitationType: "new_member" | "join_member";
  memberSlug?: string;
  memberName?: string;
}

const MEMBER_TYPES = [
  "artist", "collective", "venue", "festival",
  "organisation", "promoter", "education", "media", "label",
];

function OnboardingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const token = searchParams?.get("token");

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    personalName: "",
    name: "",
    slug: "",
    memberType: [],
    region: "",
    privacySettings: { publicProfile: true, shareDataForAdvocacy: false },
  });

  const [validating, setValidating] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isJoinFlow = invitation?.invitationType === "join_member";
  const totalSteps = isJoinFlow ? 1 : 3;

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") router.push(`/join?token=${token}`);
  }, [status, token]);

  useEffect(() => {
    if (token && status === "authenticated") validateToken();
  }, [token, status]);

  useEffect(() => {
    if (session?.user?.name && !formData.personalName) {
      setFormData((prev) => ({ ...prev, personalName: session.user.name || "" }));
    }
  }, [session]);

  const validateToken = async () => {
    try {
      setValidating(true);
      const response = await fetch("/api/invitations/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) { router.push("/join"); return; }
      setInvitation(data.data);
      setValidating(false);
    } catch {
      router.push("/join");
    }
  };

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();

  const handleOrgNameChange = (name: string) => {
    setFormData((prev) => ({ ...prev, name, slug: generateSlug(name) }));
  };

  const validateStep = (step: number): boolean => {
    if (isJoinFlow) {
      if (!formData.personalName.trim()) { setError("Your name is required"); return false; }
      return true;
    }
    switch (step) {
      case 1:
        if (!formData.personalName.trim()) { setError("Your name is required"); return false; }
        if (!formData.name.trim()) { setError("Organisation or artist name is required"); return false; }
        if (!formData.slug.trim()) { setError("URL slug is required"); return false; }
        if (formData.memberType.length === 0) { setError("Please select at least one member type"); return false; }
        break;
      case 2:
        if (!formData.region) { setError("Region is required"); return false; }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) { setCurrentStep((p) => Math.min(p + 1, totalSteps)); setError(""); }
  };

  const handlePrevious = () => { setCurrentStep((p) => Math.max(p - 1, 1)); setError(""); };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, profileData: formData }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to submit");
      await update();
      if (data.data?.invitationType === "join_member") {
        router.push("/dashboard");
      } else {
        router.push("/join/pending");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setSubmitting(false);
    }
  };

  if (validating || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-12">
      <div className="max-w-2xl mx-auto">

        {!isJoinFlow && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-medium">Step {currentStep} of {totalSteps}</span>
              <span className="text-gray-400 text-sm">{Math.round((currentStep / totalSteps) * 100)}% complete</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="h-2 rounded-full transition-all duration-300" style={{ width: `${(currentStep / totalSteps) * 100}%`, backgroundColor: "#4CBB5A" }} />
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-2xl p-8">

          {/* ── JOIN FLOW ── */}
          {isJoinFlow && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Join {invitation?.memberName || "the organisation"}</h2>
                <p className="text-gray-600">
                  You've been invited to join <strong className="text-gray-900">{invitation?.memberName}</strong> on the Irish Jazz Forum. Confirm your name to complete your account.
                </p>
              </div>
              <div style={{ backgroundColor: "#fffbeb", border: "2px solid #fcd34d", borderRadius: "8px", padding: "14px 16px" }}>
                <p style={{ fontSize: "13px", color: "#92400e" }}>
                  <strong>Note:</strong> You'll have access to the {invitation?.memberName} profile and working group discussions. The primary contact manages the profile itself.
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Your Name *</label>
                <input type="text" value={formData.personalName} onChange={(e) => setFormData({ ...formData, personalName: e.target.value })}
                  placeholder="e.g. Susan Murphy"
                  style={{ width: "100%", padding: "12px 16px", border: "2px solid #d1d5db", borderRadius: "8px", fontSize: "15px" }} />
              </div>
            </div>
          )}

          {/* ── STEP 1: Who are you ── */}
          {!isJoinFlow && currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Tell us about yourself</h2>
                <p className="text-gray-500 text-sm">Just the basics — you can fill in everything else once you're in</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Your Name *</label>
                <input type="text" value={formData.personalName} onChange={(e) => setFormData({ ...formData, personalName: e.target.value })}
                  placeholder="e.g. Siobhán Murphy"
                  style={{ width: "100%", padding: "12px 16px", border: "2px solid #d1d5db", borderRadius: "8px", fontSize: "15px", boxSizing: "border-box" }} />
                <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>The person managing this account</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Organisation / Artist Name *</label>
                <input type="text" value={formData.name} onChange={(e) => handleOrgNameChange(e.target.value)}
                  placeholder="e.g. Cork Jazz Festival or Jane Doe Quartet"
                  style={{ width: "100%", padding: "12px 16px", border: "2px solid #d1d5db", borderRadius: "8px", fontSize: "15px", boxSizing: "border-box" }} />
                <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>Your public name in the member directory</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">URL Slug *</label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "13px", color: "#6b7280", whiteSpace: "nowrap" }}>irishjazzforum.ie/members/</span>
                  <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="your-name"
                    style={{ flex: 1, minWidth: 0, padding: "12px 16px", border: "2px solid #d1d5db", borderRadius: "8px", fontSize: "15px" }} />
                </div>
                <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>Auto-generated from your name — edit if needed</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">I am a... * <span style={{ fontWeight: 400, color: "#6b7280" }}>(select all that apply)</span></label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {MEMBER_TYPES.map((type) => {
                    const isSelected = formData.memberType.includes(type);
                    return (
                      <label key={type} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", border: `2px solid ${isSelected ? "#4CBB5A" : "#d1d5db"}`, borderRadius: "8px", cursor: "pointer", backgroundColor: isSelected ? "#f0fdf4" : "white" }}>
                        <input type="checkbox" checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) setFormData({ ...formData, memberType: [...formData.memberType, type] });
                            else setFormData({ ...formData, memberType: formData.memberType.filter((t) => t !== type) });
                          }}
                          style={{ width: "16px", height: "16px", accentColor: "#4CBB5A" }} />
                        <span style={{ fontSize: "14px", fontWeight: 500, color: "#111827", textTransform: "capitalize" }}>{type}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Location ── */}
          {!isJoinFlow && currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Where are you based?</h2>
                <p className="text-gray-500 text-sm">Used to build a picture of the sector across Ireland</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Region / Province *</label>
                <select value={formData.region} onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  style={{ width: "100%", padding: "12px 16px", border: "2px solid #d1d5db", borderRadius: "8px", fontSize: "15px", backgroundColor: "white" }}>
                  <option value="">Select region...</option>
                  <option value="Dublin">Dublin</option>
                  <option value="Leinster">Leinster</option>
                  <option value="Munster">Munster</option>
                  <option value="Connacht">Connacht</option>
                  <option value="Ulster (ROI)">Ulster (ROI)</option>
                  <option value="Northern Ireland">Northern Ireland</option>
                </select>
              </div>
            </div>
          )}

          {/* ── STEP 3: Review & privacy ── */}
          {!isJoinFlow && currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Review & Submit</h2>
                <p className="text-gray-500 text-sm">Check your details and set your privacy preferences</p>
              </div>

              {/* Summary */}
              <div style={{ backgroundColor: "#f9fafb", borderRadius: "8px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { label: "Your Name", value: formData.personalName },
                  { label: "Organisation / Artist Name", value: formData.name },
                  { label: "Public URL", value: `irishjazzforum.ie/members/${formData.slug}` },
                  { label: "Member Type", value: formData.memberType.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(", ") },
                  { label: "Region", value: formData.region },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
                    <p style={{ fontSize: "15px", color: "#111827", fontWeight: 500, marginTop: "2px" }}>{value || "—"}</p>
                  </div>
                ))}
              </div>

              {/* What's next callout */}
              <div style={{ backgroundColor: "#f0fdf4", border: "2px solid #bbf7d0", borderRadius: "8px", padding: "16px" }}>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#166534", marginBottom: "6px" }}>
                  🎉 This is just the beginning
                </p>
                <p style={{ fontSize: "13px", color: "#166534", lineHeight: "1.6" }}>
                  Once your membership is approved, you'll be able to log in and add much more to your profile — including a logo, photos, social media links, tour dates, working group participation, and more. Other members' profiles will give you an idea of what's possible.
                </p>
              </div>

              {/* Privacy */}
              <div className="space-y-3">
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>Privacy Settings</h3>
                {[
                  { field: "publicProfile", label: "Make my profile public", desc: "Your profile will appear in the public member directory" },
                  { field: "shareDataForAdvocacy", label: "Support advocacy efforts", desc: "Allow IJF to use anonymised data for policy and advocacy work" },
                ].map(({ field, label, desc }) => (
                  <label key={field} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "14px", border: "2px solid #e5e7eb", borderRadius: "8px", cursor: "pointer" }}>
                    <input type="checkbox"
                      checked={formData.privacySettings[field as keyof typeof formData.privacySettings] as boolean}
                      onChange={(e) => setFormData({ ...formData, privacySettings: { ...formData.privacySettings, [field]: e.target.checked } })}
                      style={{ width: "16px", height: "16px", marginTop: "2px", accentColor: "#4CBB5A", flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{label}</p>
                      <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ marginTop: "20px", padding: "14px 16px", backgroundColor: "#fef2f2", border: "2px solid #fecaca", borderRadius: "8px" }}>
              <p style={{ fontSize: "14px", color: "#991b1b", fontWeight: 500 }}>{error}</p>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", gap: "12px", marginTop: "32px", paddingTop: "24px", borderTop: "1px solid #e5e7eb" }}>
            {currentStep > 1 && !isJoinFlow && (
              <button onClick={handlePrevious}
                style={{ padding: "12px 24px", backgroundColor: "#f3f4f6", color: "#111827", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>
                Previous
              </button>
            )}
            {currentStep < totalSteps && !isJoinFlow ? (
              <button onClick={handleNext}
                style={{ flex: 1, padding: "12px 24px", backgroundColor: "#4CBB5A", color: "white", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>
                Next Step →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting}
                style={{ flex: 1, padding: "12px 24px", backgroundColor: "#4CBB5A", color: "white", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.6 : 1 }}>
                {submitting ? "Submitting..." : isJoinFlow ? `Join ${invitation?.memberName || "Organisation"}` : "Submit Profile"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingWizardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto"></div>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}