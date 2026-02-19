// Location: app/components/members/steps/CareerSupport.tsx

"use client";

import { UseFormRegister } from "react-hook-form";

interface CareerSupportProps {
  register: UseFormRegister<any>;
}

export default function CareerSupport({ register }: CareerSupportProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-ijf-accent mb-4">Career Support & Professional Development</h2>

      <div className="space-y-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("careerSupport.offersMentorship")}
            className="w-4 h-4"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            Offers Mentorship
          </span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("careerSupport.providesAdminSupport")}
            className="w-4 h-4"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            Provides Admin Support
          </span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("careerSupport.hasBookingAgency")}
            className="w-4 h-4"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            Has Booking Agency
          </span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("careerSupport.providesRehearsalSpace")}
            className="w-4 h-4"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            Provides Rehearsal Space
          </span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("careerSupport.offersResidencies")}
            className="w-4 h-4"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            Offers Residencies
          </span>
        </label>
      </div>
    </div>
  );
}