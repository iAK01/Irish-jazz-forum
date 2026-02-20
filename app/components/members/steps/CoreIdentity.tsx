// Location: app/components/members/steps/CoreIdentity.tsx

"use client";

import { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { useEffect } from "react";
import slugify from "slugify";

interface CoreIdentityProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  errors: any;
}

const IJF_GREEN = "#4CBB5A";
const SELECTED_STYLE: React.CSSProperties = { backgroundColor: IJF_GREEN, borderColor: IJF_GREEN, color: "white", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: "8px", borderWidth: "2px", borderStyle: "solid", fontSize: "14px", fontWeight: 500, cursor: "pointer", width: "100%", textAlign: "left" };
const UNSELECTED_STYLE: React.CSSProperties = { backgroundColor: "white", borderColor: "#d1d5db", color: "#374151", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: "8px", borderWidth: "2px", borderStyle: "solid", fontSize: "14px", fontWeight: 500, cursor: "pointer", width: "100%", textAlign: "left" };

const MEMBER_TYPES = [
  { value: "artist", label: "Artist" },
  { value: "collective", label: "Collective" },
  { value: "organisation", label: "Organisation" },
  { value: "festival", label: "Festival" },
  { value: "venue", label: "Venue" },
  { value: "promoter", label: "Promoter" },
  { value: "education", label: "Education" },
  { value: "media", label: "Media" },
  { value: "label", label: "Label" },
  { value: "audience_rep", label: "Audience Representative" },
];

const ECOSYSTEM_ROLES = [
  { value: "touring_network_participant", label: "Touring Network Participant" },
  { value: "youth_education_provider", label: "Youth Education Provider" },
  { value: "international_showcase_organizer", label: "International Showcase Organizer" },
  { value: "recording_archive_contributor", label: "Recording/Archive Contributor" },
  { value: "disability_arts_specialist", label: "Disability Arts Specialist" },
  { value: "cross_border_facilitator", label: "Cross-Border Facilitator" },
  { value: "venue_provider", label: "Venue Provider" },
  { value: "funding_applicant", label: "Funding Applicant" },
  { value: "media_content_creator", label: "Media Content Creator" },
];

const LEGAL_STATUS_OPTIONS = [
  { value: "registered_charity", label: "Registered Charity" },
  { value: "clg", label: "Company Limited by Guarantee (CLG)" },
  { value: "sole_trader", label: "Sole Trader" },
  { value: "partnership", label: "Partnership" },
  { value: "informal_collective", label: "Informal Collective" },
  { value: "student_society", label: "Student Society" },
  { value: "ltd", label: "Limited Company (Ltd)" },
  { value: "other", label: "Other" },
];

const PRIORITY_LABEL: Record<number, string> = { 1: "PRIMARY", 2: "SECONDARY", 3: "TERTIARY" };

const Checkmark = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginLeft: "8px", flexShrink: 0 }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

export default function CoreIdentity({ register, watch, setValue, errors }: CoreIdentityProps) {
  const name = watch("name");
  const slug = watch("slug");
  const memberType = watch("memberType") || [];
  const ecosystemRoles = watch("ecosystemRoles") || [];

  useEffect(() => {
    if (name && !slug) {
      setValue("slug", slugify(name, { lower: true, strict: true }));
    }
  }, [name, slug, setValue]);

  const toggleMemberType = (type: string) => {
    if (memberType.includes(type)) {
      setValue("memberType", memberType.filter((t: string) => t !== type));
    } else {
      setValue("memberType", [...memberType, type]);
    }
  };

  const toggleEcosystemRole = (role: string) => {
    if (ecosystemRoles.includes(role)) {
      setValue("ecosystemRoles", ecosystemRoles.filter((r: string) => r !== role));
    } else {
      setValue("ecosystemRoles", [...ecosystemRoles, role]);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-ijf-accent">Core Identity</h2>

      {/* Name */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-2">
          Name <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <input
          type="text"
          {...register("name", { required: "Name is required" })}
          style={{ width: "100%", padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px" }}
          placeholder="Your name or organisation name"
        />
        {errors.name && <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "4px" }}>{errors.name.message}</p>}
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-2">
          URL Slug <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <input
          type="text"
          {...register("slug", {
            required: "Slug is required",
            pattern: { value: /^[a-z0-9-]+$/, message: "Slug can only contain lowercase letters, numbers, and hyphens" },
          })}
          style={{ width: "100%", padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px" }}
          placeholder="auto-generated-from-name"
        />
        <p className="text-xs text-zinc-500 mt-1">Your profile URL: /members/{slug || "your-slug"}</p>
        {errors.slug && <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "4px" }}>{errors.slug.message}</p>}
      </div>

      {/* Member Type */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-1">
          Member Type <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <p className="text-xs text-zinc-500 mb-3">
          Select all that apply — first selected becomes your primary type
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
          {MEMBER_TYPES.map((type) => {
            const isSelected = memberType.includes(type.value);
            const priority = memberType.indexOf(type.value) + 1;
            return (
              <button key={type.value} type="button" onClick={() => toggleMemberType(type.value)}
                style={isSelected ? SELECTED_STYLE : UNSELECTED_STYLE}>
                <span>{type.label}</span>
                {isSelected && (
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, opacity: 0.85 }}>
                      {PRIORITY_LABEL[priority] || ""}
                    </span>
                    <Checkmark />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {errors.memberType && <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "4px" }}>{errors.memberType.message}</p>}
      </div>

      {/* Ecosystem Roles */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-1">Ecosystem Roles</label>
        <p className="text-xs text-zinc-500 mb-3">Select all roles that describe your participation in the jazz ecosystem</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
          {ECOSYSTEM_ROLES.map((role) => {
            const isSelected = ecosystemRoles.includes(role.value);
            return (
              <button key={role.value} type="button" onClick={() => toggleEcosystemRole(role.value)}
                style={isSelected ? SELECTED_STYLE : UNSELECTED_STYLE}>
                <span>{role.label}</span>
                {isSelected && <Checkmark />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legal Status */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-2">Legal Status</label>
        <select
          {...register("legalStatus")}
          style={{ width: "100%", padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", backgroundColor: "white" }}
        >
          <option value="">Select legal status (optional)</option>
          {LEGAL_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}