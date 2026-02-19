// Location: app/components/members/steps/EDI.tsx

"use client";

import { UseFormWatch, UseFormSetValue } from "react-hook-form";

interface EDIProps {
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
}

const EDI_FOCUS_AREAS = [
  { value: "gender_balance", label: "Gender Balance" },
  { value: "disability", label: "Disability" },
  { value: "youth", label: "Youth" },
  { value: "ethnic_diversity", label: "Ethnic Diversity" },
  { value: "lgbtq+", label: "LGBTQ+" },
  { value: "socioeconomic", label: "Socioeconomic" },
];

const ACCESSIBILITY_FEATURES = [
  { value: "step_free_access", label: "Step-Free Access" },
  { value: "loop_system", label: "Loop System" },
  { value: "bsl_interpreter", label: "BSL Interpreter" },
  { value: "accessible_toilets", label: "Accessible Toilets" },
  { value: "quiet_spaces", label: "Quiet Spaces" },
  { value: "sensory_supports", label: "Sensory Supports" },
];

const SUSTAINABILITY_PRACTICES = [
  { value: "localised_touring", label: "Localised Touring" },
  { value: "digital_programmes", label: "Digital Programmes" },
  { value: "sustainable_transport", label: "Sustainable Transport" },
  { value: "waste_reduction", label: "Waste Reduction" },
  { value: "green_venues", label: "Green Venues" },
];

export default function EDI({ watch, setValue }: EDIProps) {
  const ediFocusAreas = watch("ediFocusAreas") || [];
  const accessibilityFeatures = watch("accessibilityFeatures") || [];
  const sustainabilityPractices = watch("environmentalSustainabilityPractices") || [];

  const toggleEDIFocus = (area: string) => {
    const current = ediFocusAreas;
    if (current.includes(area)) {
      setValue("ediFocusAreas", current.filter((a: string) => a !== area));
    } else {
      setValue("ediFocusAreas", [...current, area]);
    }
  };

  const toggleAccessibility = (feature: string) => {
    const current = accessibilityFeatures;
    if (current.includes(feature)) {
      setValue("accessibilityFeatures", current.filter((f: string) => f !== feature));
    } else {
      setValue("accessibilityFeatures", [...current, feature]);
    }
  };

  const toggleSustainability = (practice: string) => {
    const current = sustainabilityPractices;
    if (current.includes(practice)) {
      setValue("environmentalSustainabilityPractices", current.filter((p: string) => p !== practice));
    } else {
      setValue("environmentalSustainabilityPractices", [...current, practice]);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-ijf-accent mb-4">Equity, Diversity & Inclusion</h2>

      {/* EDI Focus Areas */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          EDI Focus Areas
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {EDI_FOCUS_AREAS.map((area) => {
            const isSelected = ediFocusAreas.includes(area.value);
            return (
              <label
                key={area.value}
                className="flex items-center gap-2 px-4 py-2 border rounded cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleEDIFocus(area.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  {area.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Accessibility Features */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Accessibility Features
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {ACCESSIBILITY_FEATURES.map((feature) => {
            const isSelected = accessibilityFeatures.includes(feature.value);
            return (
              <label
                key={feature.value}
                className="flex items-center gap-2 px-4 py-2 border rounded cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleAccessibility(feature.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  {feature.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Environmental Sustainability */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Environmental Sustainability Practices
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {SUSTAINABILITY_PRACTICES.map((practice) => {
            const isSelected = sustainabilityPractices.includes(practice.value);
            return (
              <label
                key={practice.value}
                className="flex items-center gap-2 px-4 py-2 border rounded cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSustainability(practice.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  {practice.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}