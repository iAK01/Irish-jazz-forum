"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface FormData {
  name: string;
  slug: string;
  memberType: string[];
  shortTagline: string;
  region: string;
  county?: string;
  cityTown?: string;
  geographicReach: string;
  email?: string;
  phone?: string;
  websiteUrl?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
  logoUrl?: string;
  privacySettings: {
    publicProfile: boolean;
    shareDataForAdvocacy: boolean;
  };
}

function OnboardingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = searchParams?.get("token");

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    slug: "",
    memberType: [],
    shortTagline: "",
    region: "",
    geographicReach: "local",
    socialLinks: {},
    privacySettings: {
      publicProfile: true,
      shareDataForAdvocacy: false,
    },
  });

  const [validating, setValidating] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const totalSteps = 5;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/join?token=${token}`);
    }
  }, [status, token]);

  useEffect(() => {
    if (token && status === "authenticated") {
      validateToken();
    }
  }, [token, status]);

  useEffect(() => {
    if (session?.user?.name && !formData.name) {
      setFormData((prev) => ({ ...prev, name: session.user.name || "" }));
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

      if (!response.ok || !data.success) {
        router.push("/join");
        return;
      }

      setValidating(false);
    } catch (err) {
      router.push("/join");
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      setError("");
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError("");
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          setError("Name is required");
          return false;
        }
        if (!formData.slug.trim()) {
          setError("Slug is required");
          return false;
        }
        if (formData.memberType.length === 0) {
          setError("Please select at least one member type");
          return false;
        }
        break;
      case 2:
        if (!formData.region) {
          setError("Region is required");
          return false;
        }
        if (!formData.geographicReach) {
          setError("Geographic reach is required");
          return false;
        }
        break;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          profileData: formData,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to submit profile");
      }

      router.push("/join/pending");
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
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-medium">Step {currentStep} of {totalSteps}</span>
            <span className="text-gray-400 text-sm">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all duration-300"
              style={{
                width: `${(currentStep / totalSteps) * 100}%`,
                backgroundColor: 'var(--color-ijf-accent)',
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about yourself</h2>
                <p className="text-gray-600">Basic information to get started</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Your Name / Organization Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="John Doe / Cork Jazz Festival"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-ijf-accent focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  URL Slug *
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">irishjazzforum.ie/members/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="your-name"
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-ijf-accent focus:border-transparent"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">This will be your public profile URL</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  I am a... * (Select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["artist", "venue", "festival", "organisation"].map((type) => (
                    <label key={type} className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.memberType.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, memberType: [...formData.memberType, type] });
                          } else {
                            setFormData({ ...formData, memberType: formData.memberType.filter((t) => t !== type) });
                          }
                        }}
                        className="w-5 h-5 text-ijf-accent rounded"
                      />
                      <span className="text-gray-900 font-medium capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Short Tagline (Optional)
                </label>
                <input
                  type="text"
                  value={formData.shortTagline}
                  onChange={(e) => setFormData({ ...formData, shortTagline: e.target.value })}
                  placeholder="Jazz vocalist & educator"
                  maxLength={100}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-ijf-accent focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">{formData.shortTagline.length}/100 characters</p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Where are you based?</h2>
                <p className="text-gray-600">Location information</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Region / Province *
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-ijf-accent focus:border-transparent"
                >
                  <option value="">Select region...</option>
                  <option value="Leinster">Leinster</option>
                  <option value="Munster">Munster</option>
                  <option value="Connacht">Connacht</option>
                  <option value="Ulster">Ulster</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  County (Optional)
                </label>
                <input
                  type="text"
                  value={formData.county || ""}
                  onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                  placeholder="e.g., Cork, Dublin, Galway"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-ijf-accent focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  City / Town (Optional)
                </label>
                <input
                  type="text"
                  value={formData.cityTown || ""}
                  onChange={(e) => setFormData({ ...formData, cityTown: e.target.value })}
                  placeholder="e.g., Cork City, Limerick"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-ijf-accent focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Geographic Reach *
                </label>
                <select
                  value={formData.geographicReach}
                  onChange={(e) => setFormData({ ...formData, geographicReach: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-ijf-accent focus:border-transparent"
                >
                  <option value="local">Local / City</option>
                  <option value="regional">Regional / Province</option>
                  <option value="national">National</option>
                  <option value="international">International</option>
                </select>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact & Links</h2>
                <p className="text-gray-600">How can people reach you? (All optional)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@example.com"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-ijf-accent focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+353 1 234 5678"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-ijf-accent focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.websiteUrl || ""}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-ijf-accent focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Social Media
                </label>
                <div className="space-y-3">
                  <input
                    type="url"
                    value={formData.socialLinks?.facebook || ""}
                    onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, facebook: e.target.value } })}
                    placeholder="Facebook URL"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-ijf-accent focus:border-transparent"
                  />
                  <input
                    type="url"
                    value={formData.socialLinks?.instagram || ""}
                    onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, instagram: e.target.value } })}
                    placeholder="Instagram URL"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-ijf-accent focus:border-transparent"
                  />
                  <input
                    type="url"
                    value={formData.socialLinks?.twitter || ""}
                    onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, twitter: e.target.value } })}
                    placeholder="Twitter / X URL"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-ijf-accent focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Add a logo (Optional)</h2>
                <p className="text-gray-600">You can upload a logo later from your dashboard</p>
              </div>

              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600 mb-2">Logo upload coming soon</p>
                <p className="text-sm text-gray-500">You can add your logo from your member dashboard after approval</p>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Submit</h2>
                <p className="text-gray-600">Check your information and set privacy preferences</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Name</p>
                  <p className="text-gray-900 font-semibold">{formData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Member Type</p>
                  <p className="text-gray-900 font-semibold capitalize">{formData.memberType.join(", ")}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Location</p>
                  <p className="text-gray-900 font-semibold">
                    {formData.cityTown && formData.region ? `${formData.cityTown}, ${formData.region}` : formData.region}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Privacy Settings</h3>
                
                <label className="flex items-start gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.privacySettings.publicProfile}
                    onChange={(e) => setFormData({
                      ...formData,
                      privacySettings: { ...formData.privacySettings, publicProfile: e.target.checked },
                    })}
                    className="w-5 h-5 text-ijf-accent rounded mt-0.5"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Make my profile public</p>
                    <p className="text-sm text-gray-600">Your profile will be visible in the public member directory</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.privacySettings.shareDataForAdvocacy}
                    onChange={(e) => setFormData({
                      ...formData,
                      privacySettings: { ...formData.privacySettings, shareDataForAdvocacy: e.target.checked },
                    })}
                    className="w-5 h-5 text-ijf-accent rounded mt-0.5"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Support advocacy efforts</p>
                    <p className="text-sm text-gray-600">Allow IJF to use anonymized data for policy and advocacy work</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-semibold transition-colors"
              >
                Previous
              </button>
            )}
            
            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className="flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-all shadow-md hover:shadow-lg"
                style={{ backgroundColor: 'var(--color-ijf-accent)' }}
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--color-ijf-accent)' }}
              >
                {submitting ? "Submitting..." : "Submit Profile"}
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}