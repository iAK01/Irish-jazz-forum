"use client";

import { UseFormRegister } from "react-hook-form";

interface LocationProps {
  register: UseFormRegister<any>;
  errors: any;
}

const REGIONS = [
  "Dublin",
  "Leinster",
  "Munster",
  "Connacht",
  "Ulster (ROI)",
  "Northern Ireland",
];

export default function Location({ register, errors }: LocationProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-ijf-accent mb-4">Location & Geography</h2>

      {/* County */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          County
        </label>
        <input
          type="text"
          {...register("county")}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          placeholder="e.g., Dublin, Cork, Galway"
        />
      </div>

      {/* City/Town */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          City/Town
        </label>
        <input
          type="text"
          {...register("cityTown")}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          placeholder="e.g., Dublin City, Limerick, Sligo"
        />
      </div>

      {/* Region */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Region
        </label>
        <select
          {...register("region")}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
        >
          <option value="">Select region (optional)</option>
          {REGIONS.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      {/* Coordinates (Optional) */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Latitude (Optional)
          </label>
          <input
            type="number"
            step="any"
            {...register("latitude", {
              valueAsNumber: true,
            })}
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            placeholder="53.3498"
          />
          <p className="text-xs text-zinc-500 mt-1">
            For mapping purposes
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Longitude (Optional)
          </label>
          <input
            type="number"
            step="any"
            {...register("longitude", {
              valueAsNumber: true,
            })}
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            placeholder="-6.2603"
          />
          <p className="text-xs text-zinc-500 mt-1">
            For mapping purposes
          </p>
        </div>
      </div>
    </div>
  );
}