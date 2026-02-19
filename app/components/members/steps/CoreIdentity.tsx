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

export default function CoreIdentity({ register, watch, setValue, errors }: CoreIdentityProps) {
  const name = watch("name");
  const slug = watch("slug");
  const memberType = watch("memberType") || [];
  const ecosystemRoles = watch("ecosystemRoles") || [];

  // Auto-generate slug from name
  useEffect(() => {
    if (name && !slug) {
      const generatedSlug = slugify(name, {
        lower: true,
        strict: true,
      });
      setValue("slug", generatedSlug);
    }
  }, [name, slug, setValue]);

  const toggleMemberType = (type: string) => {
    const current = memberType;
    if (current.includes(type)) {
      setValue("memberType", current.filter((t: string) => t !== type));
    } else {
      setValue("memberType", [...current, type]);
    }
  };

  const toggleEcosystemRole = (role: string) => {
    const current = ecosystemRoles;
    if (current.includes(role)) {
      setValue("ecosystemRoles", current.filter((r: string) => r !== role));
    } else {
      setValue("ecosystemRoles", [...current, role]);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-ijf-accent mb-4">Core Identity</h2>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register("name", { required: "Name is required" })}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          placeholder="Your name or organization name"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          URL Slug <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register("slug", { 
            required: "Slug is required",
            pattern: {
              value: /^[a-z0-9-]+$/,
              message: "Slug can only contain lowercase letters, numbers, and hyphens"
            }
          })}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          placeholder="auto-generated-from-name"
        />
        <p className="text-xs text-zinc-500 mt-1">
          This will be your profile URL: /members/{slug || "your-slug"}
        </p>
        {errors.slug && (
          <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
        )}
      </div>

      {/* Member Type (Multi-select with Priority) */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Member Type <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-zinc-500 mb-3">
          Select all that apply. First selected = PRIMARY, others = SECONDARY/TERTIARY
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {MEMBER_TYPES.map((type) => {
            const isSelected = memberType.includes(type.value);
            const priority = memberType.indexOf(type.value) + 1;
            
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => toggleMemberType(type.value)}
                className={`px-4 py-2 border rounded text-sm font-medium transition ${
                  isSelected
                    ? "bg-ijf-accent text-ijf-bg border-ijf-accent"
                    : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:border-ijf-accent"
                }`}
              >
                {type.label}
                {isSelected && (
                  <span className="ml-2 text-xs">
                    {priority === 1 ? "PRIMARY" : priority === 2 ? "SECONDARY" : "TERTIARY"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {errors.memberType && (
          <p className="text-red-500 text-sm mt-1">{errors.memberType.message}</p>
        )}
      </div>

      {/* Ecosystem Roles */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Ecosystem Roles
        </label>
        <p className="text-xs text-zinc-500 mb-3">
          Select all roles that describe your participation in the jazz ecosystem
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {ECOSYSTEM_ROLES.map((role) => {
            const isSelected = ecosystemRoles.includes(role.value);
            
            return (
              <label
                key={role.value}
                className="flex items-center gap-2 px-4 py-2 border rounded cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleEcosystemRole(role.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  {role.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Legal Status */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Legal Status
        </label>
        <select
          {...register("legalStatus")}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
        >
          <option value="">Select legal status (optional)</option>
          {LEGAL_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}