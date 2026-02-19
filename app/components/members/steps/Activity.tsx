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
    const current = activityModes;
    if (current.includes(mode)) {
      setValue("activityModes", current.filter((m: string) => m !== mode));
    } else {
      setValue("activityModes", [...current, mode]);
    }
  };

  const toggleEducationType = (type: string) => {
    const current = educationProgrammeTypes;
    if (current.includes(type)) {
      setValue("educationProgrammeTypes", current.filter((t: string) => t !== type));
    } else {
      setValue("educationProgrammeTypes", [...current, type]);
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-ijf-accent mb-4">Activity Profile</h2>

      {/* Primary Artform Tags */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Primary Artform Tags
        </label>
        <p className="text-xs text-zinc-500 mb-3">
          Add tags to describe your artistic focus (e.g., "bebop", "free jazz", "big band")
        </p>
        <div className="flex gap-2 mb-2">
          <input
            id="artform-tag-input"
            type="text"
            className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            placeholder="Enter a tag and press Add"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addArtformTag();
              }
            }}
          />
          <button
            type="button"
            onClick={addArtformTag}
            className="px-4 py-2 bg-ijf-accent text-ijf-bg rounded hover:bg-ijf-accent/80 font-medium"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {primaryArtformTags.map((tag: string) => (
            <span
              key={tag}
              className="px-3 py-1 bg-ijf-primary text-ijf-surface rounded-full text-sm flex items-center gap-2"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeArtformTag(tag)}
                className="hover:text-red-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Activity Modes */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Activity Modes
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {ACTIVITY_MODES.map((mode) => {
            const isSelected = activityModes.includes(mode.value);
            return (
              <button
                key={mode.value}
                type="button"
                onClick={() => toggleActivityMode(mode.value)}
                className={`px-4 py-2 border rounded text-sm font-medium transition ${
                  isSelected
                    ? "bg-ijf-accent text-ijf-bg border-ijf-accent"
                    : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:border-ijf-accent"
                }`}
              >
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Geographic Reach */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Geographic Reach
        </label>
        <select
          {...register("geographicReach")}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
        >
          <option value="">Select reach</option>
          {GEOGRAPHIC_REACH.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Cross-Border & International */}
      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("presentsCrossBorderWork")}
            className="w-4 h-4"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            Presents Cross-Border Work
          </span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("hostsInternationalArtists")}
            className="w-4 h-4"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            Hosts International Artists
          </span>
        </label>
      </div>

      {/* Annual Estimates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Annual Events (Estimate)
          </label>
          <input
            type="number"
            {...register("annualEventCountEstimate", { valueAsNumber: true })}
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Unique Artists (Estimate)
          </label>
          <input
            type="number"
            {...register("annualUniqueArtistsEstimate", { valueAsNumber: true })}
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Audience (Estimate)
          </label>
          <input
            type="number"
            {...register("annualAudienceEstimate", { valueAsNumber: true })}
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            placeholder="0"
          />
        </div>
      </div>

      {/* Education Programme Types */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Education Programme Types
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {EDUCATION_PROGRAMME_TYPES.map((type) => {
            const isSelected = educationProgrammeTypes.includes(type.value);
            return (
              <label
                key={type.value}
                className="flex items-center gap-2 px-4 py-2 border rounded cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleEducationType(type.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  {type.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Recording Activity */}
      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("hasRecordingActivity")}
            className="w-4 h-4"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            Has Recording Activity
          </span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("usesProfessionalRecording")}
            className="w-4 h-4"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            Uses Professional Recording
          </span>
        </label>
      </div>
    </div>
  );
}