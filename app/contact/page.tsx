// /app/contact/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    inquiryType: "",
    message: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const inquiryTypes = [
    "I want to join the Irish Jazz Forum",
    "Media inquiry",
    "Partnership opportunity",
    "Event/Festival collaboration",
    "General question",
    "Technical issue",
    "Other",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      
      setFile(selectedFile);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.inquiryType || !formData.message) {
        setError("Please fill in all required fields");
        setSubmitting(false);
        return;
      }

      // Upload file if present
      let fileUrl = null;
      let filename = null;
      let fileSize = null;
      let fileMimetype = null;

      if (file) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        uploadFormData.append("workingGroup", "general");

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload file");
        }

        const uploadData = await uploadRes.json();
        fileUrl = uploadData.url;
        filename = file.name;
        fileSize = file.size;
        fileMimetype = file.type;
      }

      // Submit contact form
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          attachment: fileUrl ? {
            filename,
            url: fileUrl,
            mimetype: fileMimetype,
            size: fileSize,
          } : null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to submit contact form");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, var(--color-ijf-bg) 0%, #1a1f2e 100%)' }}>
        {/* Header */}
        <div className="border-b border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <Link href="/" className="inline-flex items-center gap-2 text-white hover:opacity-80 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-semibold">Back to Home</span>
            </Link>
          </div>
        </div>

        {/* Success Message */}
        <div className="max-w-2xl mx-auto px-6 py-20">
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'var(--color-ijf-accent)' }}>
              <svg className="w-10 h-10" style={{ color: 'var(--color-ijf-bg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Message Received!
            </h2>
            <p className="text-gray-600 mb-8">
              Thank you for contacting the Irish Jazz Forum. We've received your message and will get back to you as soon as possible.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/"
                className="px-6 py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl cursor-pointer"
                style={{ backgroundColor: 'var(--color-ijf-accent)', color: 'var(--color-ijf-bg)' }}
              >
                Return to Home
              </Link>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    name: "",
                    email: "",
                    organization: "",
                    inquiryType: "",
                    message: "",
                  });
                  setFile(null);
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, var(--color-ijf-bg) 0%, #1a1f2e 100%)' }}>
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-white hover:opacity-80 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-semibold">Back to Home</span>
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-ijf-primary)' }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Whether you want to join the forum, explore partnerships, or have questions about Irish jazz, we'd love to hear from you.
          </p>
        </div>

        {/* Form Card */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-lg border-l-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444' }}>
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-gray-900 mb-2">
                  Name <span style={{ color: 'var(--color-ijf-primary)' }}>*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 transition-all shadow-sm focus:ring-ijf-accent"
                  placeholder="Your full name"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-2">
                  Email <span style={{ color: 'var(--color-ijf-primary)' }}>*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 transition-all shadow-sm focus:ring-ijf-accent"
                  placeholder="your@email.com"
                />
              </div>

              {/* Organization */}
              <div>
                <label htmlFor="organization" className="block text-sm font-bold text-gray-900 mb-2">
                  Organization <span className="text-gray-500 text-xs font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 transition-all shadow-sm focus:ring-ijf-accent"
                  placeholder="Your organization or affiliation"
                />
              </div>

              {/* Inquiry Type */}
              <div>
                <label htmlFor="inquiryType" className="block text-sm font-bold text-gray-900 mb-2">
                  What's this about? <span style={{ color: 'var(--color-ijf-primary)' }}>*</span>
                </label>
                <select
                  id="inquiryType"
                  name="inquiryType"
                  value={formData.inquiryType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white text-gray-900 transition-all shadow-sm focus:ring-ijf-accent cursor-pointer"
                >
                  <option value="">Select an option...</option>
                  {inquiryTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-bold text-gray-900 mb-2">
                  Message <span style={{ color: 'var(--color-ijf-primary)' }}>*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 transition-all shadow-sm focus:ring-ijf-accent resize-none"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              {/* File Upload */}
              <div>
                <label htmlFor="file" className="block text-sm font-bold text-gray-900 mb-2">
                  Attachment <span className="text-gray-500 text-xs font-normal">(optional, max 5MB)</span>
                </label>
                <div>
                  <input
                    type="file"
                    id="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="file"
                    className="flex items-center justify-center gap-3 w-full px-6 py-6 border-2 border-dashed border-gray-300 rounded-lg transition-all shadow-sm hover:bg-gray-50 cursor-pointer"
                  >
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {file ? file.name : "Click to attach a file"}
                      </p>
                      {file && (
                        <p className="text-xs text-gray-500 mt-1">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-8 py-4 text-white text-lg font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all cursor-pointer"
                  style={{ backgroundColor: 'var(--color-ijf-primary)' }}
                >
                  {submitting ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </div>

          {/* Direct Contact Info */}
          <div className="mt-12 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4">Other Ways to Reach Us</h3>
              <div className="space-y-2 text-gray-300">
                <p>
                  <span className="font-semibold text-white">Email:</span>{" "}
                  <a href="mailto:info@irishjazzforum.com" className="hover:underline" style={{ color: 'var(--color-ijf-accent)' }}>
                    info@irishjazzforum.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}