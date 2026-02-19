"use client";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  canGoNext: boolean;
  isLastStep: boolean;
}

export default function StepNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  canGoNext,
  isLastStep,
}: StepNavigationProps) {
  return (
    <div className="mt-8 border-t border-zinc-200 dark:border-zinc-800 pt-6">
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
          <div
            className="bg-ijf-accent h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={onPrevious}
          disabled={currentStep === 1}
          className="px-6 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Previous
        </button>

        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          {!canGoNext && "Please complete required fields"}
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className="px-6 py-2 bg-ijf-primary text-ijf-surface rounded hover:bg-ijf-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isLastStep ? "Submit" : "Next"}
        </button>
      </div>
    </div>
  );
}