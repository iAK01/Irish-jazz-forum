// Location: app/components/members/steps/Education.tsx

"use client";

import { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form";

interface EducationProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
}

const AGE_RANGES = [
  { value: "under_12", label: "Under 12" },
  { value: "12-18", label: "12-18" },
  { value: "transition_year", label: "Transition Year" },
  { value: "third_level", label: "Third Level" },
];

const PROGRAMME_TYPES = [
  { value: "summer_school", label: "Summer School" },
  { value: "year_round", label: "Year-Round" },
  { value: "mentorship", label: "Mentorship" },
  { value: "school_outreach", label: "School Outreach" },
];

export default function Education({ register, watch, setValue }: EducationProps) {
  const ageRanges = watch("youthProgrammes.ageRanges") || [];
  const programmeTypes = watch("youthProgrammes.programmeTypes") || [];

  const toggleAgeRange = (range: string) => {
    const current = ageRanges;
    if (current.includes(range)) {
      setValue("youthProgrammes.ageRanges", current.filter((r: string) => r !== range));
    } else {
      setValue("youthProgrammes.ageRanges", [...current, range]);
    }
  };

  const toggleProgrammeType = (type: string) => {
    const current = programmeTypes;
    if (current.includes(type)) {
      setValue("youthProgrammes.programmeTypes", current.filter((t: string) => t !== type));
    } else {
      setValue("youthProgrammes.programmeTypes", [...current, type]);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-ijf-accent mb-4">Education & Youth Programmes</h2>

      {/* Age Ranges */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Age Ranges
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {AGE_RANGES.map((range) => {
            const isSelected = ageRanges.includes(range.value);
            return (
              <label
                key={range.value}
                className="flex items-center gap-2 px-4 py-2 border rounded cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleAgeRange(range.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  {range.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Programme Types */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Programme Types
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {PROGRAMME_TYPES.map((type) => {
            const isSelected = programmeTypes.includes(type.value);
            return (
              <label
                key={type.value}
                className="flex items-center gap-2 px-4 py-2 border rounded cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleProgrammeType(type.value)}
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

      {/* Scholarships Offered */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("youthProgrammes.scholarshipsOffered")}
            className="w-4 h-4"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            Scholarships Offered
          </span>
        </label>
      </div>

      {/* Alumni Success Stories */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Alumni Success Stories
        </label>
        <textarea
          {...register("youthProgrammes.alumniSuccessStories")}
          rows={4}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          placeholder="Describe notable alumni and their achievements..."
        />
      </div>

      {/* School Outreach */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("youthProgrammes.participatesInSchoolOutreach")}
            className="w-4 h-4"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            Participates in School Outreach
          </span>
        </label>
      </div>
    </div>
  );
}