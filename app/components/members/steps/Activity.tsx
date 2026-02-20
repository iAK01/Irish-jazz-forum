// Location: app/components/members/steps/Activity.tsx

"use client";

import { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form";

interface ActivityProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  errors: any;
}

const ACTIVITY_MODES = [
  { value: "festival", label: "Festival" },
  { value: "year_round_programme", label: "Year-Round Programme" },
  { value: "education", label: "Education" },
  { value: "touring", label: "Touring" },
  { value: "recording", label: "Recording" },
  { value: "residencies", label: "Residencies" },
];

const GEOGRAPHIC_REACH = [
  { value: "local", label: "Local" },
  { value: "regional", label: "Regional" },
  { value: "national", label: "National" },
  { value: "all_island", label: "All-Island" },
  { value: "international", label: "International" },
];

const EDUCATION_PROGRAMME_TYPES = [
  { value: "youth_workshops", label: "Youth Workshops" },
  { value: "third_level", label: "Third Level" },
  { value: "summer_school", label: "Summer School" },
  { value: "masterclasses", label: "Masterclasses" },
  { value: "school_outreach", label: "School Outreach" },
];

export default function Activity({ register, watch, setValue, errors }: ActivityProps) {
  const activityModes = watch("activityModes") || [];
  const educationProgrammeTypes = watch("educationProgrammeTypes") || [];
  const primaryArtformTags = watch("primaryArtformTags") || [];

  const toggleActivityMode = (mode: string) => {
    if (activityModes.includes(mode)) {
      setValue("activityModes", activityModes.filter((m: string) => m !== mode));
    } else {
      setValue("activityModes", [...activityModes, mode]);
    }
  };

  const toggleEducationType = (type: string) => {
    if (educationProgrammeTypes.includes(type)) {
      setValue("educationProgrammeTypes", educationProgrammeTypes.filter((t: string) => t !== type));
    } else {
      setValue("educationProgrammeTypes", [...educationProgrammeTypes, type]);
    }
  };

  const addArtformTag = () => {
    const input = document.getElementById("artform-tag-input") as HTMLInputElement;
    if (input && input.value.trim()) {
      const newTag = input.value.trim();
      if (!primaryArtformTags.includes(newTag)) {
        setValue("primaryArtformTags", [...primaryArtformTags, newTag]);
      }
      input.value = "";
    }
  };

  const removeArtformTag = (tag: string) => {
    setValue("primaryArtformTags", primaryArtformTags.filter((t: string) => t !== tag));
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-ijf-accent">Activity Profile</h2>

      {/* Primary Artform Tags */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
          Primary Artform Tags
        </label>
        <p className="text-xs text-zinc-500 mb-3">
          Add tags to describe your artistic focus (e.g., "bebop", "free jazz", "big band")
        </p>
        <div className="flex gap-2 mb-3">
          <input
            id="artform-tag-input"
            type="text"
            className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-ijf-accent"
            placeholder="Enter a tag and press Add"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addArtformTag();
              }
            }}
          />
          <button
            type="button"
            onClick={addArtformTag}
            className="px-5 py-2 text-white rounded-lg text-sm font-medium transition"
            style={{ backgroundColor: "#4CBB5A" }}
          >
            Add
          </button>
        </div>
        {primaryArtformTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {primaryArtformTags.map((tag: string) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-white rounded-full text-sm font-medium"
                style={{ backgroundColor: "#4CBB5A" }}
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeArtformTag(tag)}
                  className="hover:text-red-300 text-zinc-400 leading-none"
                  aria-label={`Remove ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Activity Modes */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
          Activity Modes
        </label>
        <p className="text-xs text-zinc-500 mb-3">Select all that apply</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {ACTIVITY_MODES.map((mode) => {
            const isSelected = activityModes.includes(mode.value);
            return (
              <button
                key={mode.value}
                type="button"
                onClick={() => toggleActivityMode(mode.value)}
                className="flex items-center justify-between px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all"
                style={isSelected
                  ? { backgroundColor: "#4CBB5A", borderColor: "#4CBB5A", color: "white" }
                  : { backgroundColor: "white", borderColor: "#d1d5db", color: "#374151" }
                }
              >
                <span>{mode.label}</span>
                {isSelected && (
                  <svg className="w-4 h-4 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Geographic Reach */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
          Geographic Reach
        </label>
        <select
          {...register("geographicReach")}
          className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-ijf-accent"
        >
          {GEOGRAPHIC_REACH.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Cross-border checkboxes */}
      <div className="flex flex-col sm:flex-row gap-4">
        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-zinc-200 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex-1">
          <input
            type="checkbox"
            {...register("presentsCrossBorderWork")}
            className="w-4 h-4 accent-zinc-900"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">Presents Cross-Border Work</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-zinc-200 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex-1">
          <input
            type="checkbox"
            {...register("hostsInternationalArtists")}
            className="w-4 h-4 accent-zinc-900"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">Hosts International Artists</span>
        </label>
      </div>

      {/* Estimates */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Annual Events <span className="font-normal text-zinc-400">(Estimate)</span>
          </label>
          <input
            type="number"
            {...register("annualEventCountEstimate", { valueAsNumber: true })}
            className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-ijf-accent"
            placeholder="e.g., 24"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Unique Artists <span className="font-normal text-zinc-400">(Estimate)</span>
          </label>
          <input
            type="number"
            {...register("annualUniqueArtistsEstimate", { valueAsNumber: true })}
            className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-ijf-accent"
            placeholder="e.g., 50"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            In-Person Audience <span className="font-normal text-zinc-400">(Estimate)</span>
          </label>
          <input
            type="number"
            {...register("annualAudienceEstimate", { valueAsNumber: true })}
            className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-ijf-accent"
            placeholder="e.g., 5000"
          />
        </div>
      </div>

      {/* Education Programme Types */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
          Education Programme Types
        </label>
        <p className="text-xs text-zinc-500 mb-3">
          Select if you run education programmes — this will unlock additional education fields
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {EDUCATION_PROGRAMME_TYPES.map((type) => {
            const isSelected = educationProgrammeTypes.includes(type.value);
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => toggleEducationType(type.value)}
                className="flex items-center justify-between px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all"
                style={isSelected
                  ? { backgroundColor: "#4CBB5A", borderColor: "#4CBB5A", color: "white" }
                  : { backgroundColor: "white", borderColor: "#d1d5db", color: "#374151" }
                }
              >
                <span>{type.label}</span>
                {isSelected && (
                  <svg className="w-4 h-4 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recording */}
      <div className="flex flex-col sm:flex-row gap-4">
        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-zinc-200 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex-1">
          <input
            type="checkbox"
            {...register("hasRecordingActivity")}
            className="w-4 h-4 accent-zinc-900"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">Has Recording Activity</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-zinc-200 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex-1">
          <input
            type="checkbox"
            {...register("usesProfessionalRecording")}
            className="w-4 h-4 accent-zinc-900"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">Uses Professional Recording</span>
        </label>
      </div>
    </div>
  );
}