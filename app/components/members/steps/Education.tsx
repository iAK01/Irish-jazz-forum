// Location: app/components/members/steps/Education.tsx

"use client";

import { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form";

interface EducationProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
}

const IJF_GREEN = "#4CBB5A";
const SELECTED_STYLE: React.CSSProperties = { backgroundColor: IJF_GREEN, borderColor: IJF_GREEN, color: "white", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: "8px", borderWidth: "2px", borderStyle: "solid", fontSize: "14px", fontWeight: 500, cursor: "pointer" };
const UNSELECTED_STYLE: React.CSSProperties = { backgroundColor: "white", borderColor: "#d1d5db", color: "#374151", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: "8px", borderWidth: "2px", borderStyle: "solid", fontSize: "14px", fontWeight: 500, cursor: "pointer" };

const AGE_RANGES = [
  { value: "under_12", label: "Under 12" },
  { value: "12-18", label: "12–18" },
  { value: "transition_year", label: "Transition Year" },
  { value: "third_level", label: "Third Level" },
];

const PROGRAMME_TYPES = [
  { value: "summer_school", label: "Summer School" },
  { value: "year_round", label: "Year-Round" },
  { value: "mentorship", label: "Mentorship" },
  { value: "school_outreach", label: "School Outreach" },
];

const Checkmark = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginLeft: "8px", flexShrink: 0 }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

export default function Education({ register, watch, setValue }: EducationProps) {
  const ageRanges = watch("youthProgrammes.ageRanges") || [];
  const programmeTypes = watch("youthProgrammes.programmeTypes") || [];

  const toggle = (field: string, current: string[], value: string) => {
    setValue(field, current.includes(value) ? current.filter((v: string) => v !== value) : [...current, value]);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-ijf-accent">Education & Youth Programmes</h2>

      {/* Age Ranges */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-1">Age Ranges</label>
        <p className="text-xs text-zinc-500 mb-3">Select all that apply</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
          {AGE_RANGES.map((range) => {
            const isSelected = ageRanges.includes(range.value);
            return (
              <button key={range.value} type="button"
                style={isSelected ? SELECTED_STYLE : UNSELECTED_STYLE}
                onClick={() => toggle("youthProgrammes.ageRanges", ageRanges, range.value)}>
                <span>{range.label}</span>
                {isSelected && <Checkmark />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Programme Types */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-1">Programme Types</label>
        <p className="text-xs text-zinc-500 mb-3">Select all that apply</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
          {PROGRAMME_TYPES.map((type) => {
            const isSelected = programmeTypes.includes(type.value);
            return (
              <button key={type.value} type="button"
                style={isSelected ? SELECTED_STYLE : UNSELECTED_STYLE}
                onClick={() => toggle("youthProgrammes.programmeTypes", programmeTypes, type.value)}>
                <span>{type.label}</span>
                {isSelected && <Checkmark />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scholarships */}
      <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", padding: "12px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
        <input type="checkbox" {...register("youthProgrammes.scholarshipsOffered")} style={{ width: "16px", height: "16px" }} />
        <span style={{ fontSize: "14px", color: "#374151" }}>Scholarships Offered</span>
      </label>

      {/* Alumni Success Stories */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-2">Alumni Success Stories</label>
        <textarea
          {...register("youthProgrammes.alumniSuccessStories")}
          rows={4}
          className="w-full px-4 py-2 border border-zinc-300 rounded-lg bg-white text-zinc-900 focus:outline-none"
          placeholder="Describe notable alumni and their achievements..."
        />
      </div>

      {/* School Outreach */}
      <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", padding: "12px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
        <input type="checkbox" {...register("youthProgrammes.participatesInSchoolOutreach")} style={{ width: "16px", height: "16px" }} />
        <span style={{ fontSize: "14px", color: "#374151" }}>Participates in School Outreach</span>
      </label>
    </div>
  );
}