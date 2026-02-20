// Location: app/components/members/steps/EDI.tsx

"use client";

import { UseFormWatch, UseFormSetValue } from "react-hook-form";

interface EDIProps {
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
}

const IJF_GREEN = "#4CBB5A";
const SELECTED_STYLE = { backgroundColor: IJF_GREEN, borderColor: IJF_GREEN, color: "white" };
const UNSELECTED_STYLE = { backgroundColor: "white", borderColor: "#d1d5db", color: "#374151" };

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

  const toggle = (field: string, current: string[], value: string) => {
    if (current.includes(value)) {
      setValue(field, current.filter((v: string) => v !== value));
    } else {
      setValue(field, [...current, value]);
    }
  };

  const ToggleButton = ({
    label,
    isSelected,
    onClick,
  }: {
    label: string;
    isSelected: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all"
      style={isSelected ? SELECTED_STYLE : UNSELECTED_STYLE}
    >
      <span>{label}</span>
      {isSelected && (
        <svg className="w-4 h-4 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  );

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-ijf-accent">Equality, Diversity & Inclusion</h2>

      {/* EDI Focus Areas */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
          EDI Focus Areas
        </label>
        <p className="text-xs text-zinc-500 mb-3">Select all areas your organisation actively focuses on</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {EDI_FOCUS_AREAS.map((area) => (
            <ToggleButton
              key={area.value}
              label={area.label}
              isSelected={ediFocusAreas.includes(area.value)}
              onClick={() => toggle("ediFocusAreas", ediFocusAreas, area.value)}
            />
          ))}
        </div>
      </div>

      {/* Accessibility Features */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
          Accessibility Features
        </label>
        <p className="text-xs text-zinc-500 mb-3">Select all accessibility features your venue or events provide</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {ACCESSIBILITY_FEATURES.map((feature) => (
            <ToggleButton
              key={feature.value}
              label={feature.label}
              isSelected={accessibilityFeatures.includes(feature.value)}
              onClick={() => toggle("accessibilityFeatures", accessibilityFeatures, feature.value)}
            />
          ))}
        </div>
      </div>

      {/* Sustainability Practices */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
          Environmental Sustainability Practices
        </label>
        <p className="text-xs text-zinc-500 mb-3">Select all practices your organisation actively uses</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {SUSTAINABILITY_PRACTICES.map((practice) => (
            <ToggleButton
              key={practice.value}
              label={practice.label}
              isSelected={sustainabilityPractices.includes(practice.value)}
              onClick={() => toggle("environmentalSustainabilityPractices", sustainabilityPractices, practice.value)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}