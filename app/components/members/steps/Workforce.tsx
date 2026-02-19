// Location: app/components/members/steps/Workforce.tsx

"use client";

import { UseFormRegister, UseFormWatch } from "react-hook-form";

interface WorkforceProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  errors: any;
}

export default function Workforce({ register, watch, errors }: WorkforceProps) {
  const hasBoardOrAdvisoryGroup = watch("hasBoardOrAdvisoryGroup");

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-ijf-accent mb-4">Workforce & Governance</h2>

      {/* Written Contracts */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("usesWrittenContracts")}
            className="w-4 h-4"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            Uses Written Contracts
          </span>
        </label>
      </div>

      {/* Volunteer Hours */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Volunteer Hours Per Year (Estimate)
        </label>
        <input
          type="number"
          {...register("volunteerHoursPerYearEstimate", { valueAsNumber: true })}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          placeholder="0"
        />
      </div>

      {/* Employs Freelancers */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("employsFreelancersRegularly")}
            className="w-4 h-4"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            Employs Freelancers Regularly
          </span>
        </label>
      </div>

      {/* Has Board */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("hasBoardOrAdvisoryGroup")}
            className="w-4 h-4"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            Has Board or Advisory Group
          </span>
        </label>
      </div>

      {/* Board Size - Conditional */}
      {hasBoardOrAdvisoryGroup && (
        <div className="ml-6">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Board Size
          </label>
          <input
            type="number"
            {...register("boardSize", { valueAsNumber: true })}
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            placeholder="e.g., 7"
          />
        </div>
      )}

      {/* Written Strategy */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("hasWrittenStrategy")}
            className="w-4 h-4"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            Has Written Strategy
          </span>
        </label>
      </div>
    </div>
  );
}