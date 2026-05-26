"use client";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  canGoNext: boolean;
  isLastStep: boolean;
  nextStepTitle?: string;
}

export default function StepNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  canGoNext,
  isLastStep,
  nextStepTitle,
}: StepNavigationProps) {
  return (
    <div style={{
      marginTop: "32px",
      paddingTop: "20px",
      borderTop: "1px solid #f0f0f0",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
    }}>
      {/* Previous */}
      <button
        type="button"
        onClick={onPrevious}
        disabled={currentStep === 1}
        style={{
          padding: "10px 22px",
          backgroundColor: "white",
          color: currentStep === 1 ? "#d1d5db" : "#374151",
          border: `1px solid ${currentStep === 1 ? "#e5e7eb" : "#d1d5db"}`,
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: 600,
          cursor: currentStep === 1 ? "not-allowed" : "pointer",
        }}
      >
        ← Previous
      </button>

      {/* Required fields hint */}
      <div style={{ fontSize: "12px", color: "#9ca3af", textAlign: "center" }}>
        {!canGoNext && "Please complete required fields"}
      </div>

      {/* Next / Save */}
      <button
        type="button"
        onClick={onNext}
        disabled={!canGoNext}
        style={{
          padding: "10px 22px",
          backgroundColor: canGoNext ? "#4CBB5A" : "#d1d5db",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: 600,
          cursor: canGoNext ? "pointer" : "not-allowed",
          whiteSpace: "nowrap",
        }}
      >
        {isLastStep
          ? "Save Profile ✓"
          : nextStepTitle
            ? `Next: ${nextStepTitle} →`
            : "Next →"}
      </button>
    </div>
  );
}
