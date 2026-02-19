// Location: app/components/members/steps/TechnicalCapacity.tsx

"use client";

import { UseFormRegister } from "react-hook-form";

interface TechnicalCapacityProps {
  register: UseFormRegister<any>;
}

export default function TechnicalCapacity({ register }: TechnicalCapacityProps) {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-ijf-accent mb-4">Technical Capacity (Venue)</h2>

      {/* Backline */}
      <div>
        <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
          Backline
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("techBackline.drumKit")}
              className="w-4 h-4"
            />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">Drum Kit</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("techBackline.bassAmp")}
              className="w-4 h-4"
            />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">Bass Amp</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("techBackline.guitarAmp")}
              className="w-4 h-4"
            />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">Guitar Amp</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("techBackline.keyboardStand")}
              className="w-4 h-4"
            />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">Keyboard Stand</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("techBackline.paSystem")}
              className="w-4 h-4"
            />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">PA System</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("techBackline.stageMonitors")}
              className="w-4 h-4"
            />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">Stage Monitors</span>
          </label>
        </div>
      </div>

      {/* Acoustic Instruments */}
      <div>
        <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
          Acoustic Instruments
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("techAcousticInstruments.uprightPiano")}
              className="w-4 h-4"
            />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">Upright Piano</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("techAcousticInstruments.grandPiano")}
              className="w-4 h-4"
            />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">Grand Piano</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("techAcousticInstruments.tuned")}
              className="w-4 h-4"
            />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">Piano Tuned</span>
          </label>
        </div>
      </div>

      {/* Front of House */}
      <div>
        <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
          Front of House
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("techFrontOfHouse.digitalDesk")}
              className="w-4 h-4"
            />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">Digital Desk</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("techFrontOfHouse.analogueDesk")}
              className="w-4 h-4"
            />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">Analogue Desk</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Channel Count
            </label>
            <input
              type="number"
              {...register("techFrontOfHouse.channelCount", { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              placeholder="e.g., 16"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("techFrontOfHouse.technicianAvailable")}
              className="w-4 h-4"
            />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">Technician Available</span>
          </label>
        </div>
      </div>

      {/* Stage Specs */}
      <div>
        <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
          Stage Specifications
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Stage Width (m)
            </label>
            <input
              type="number"
              step="0.1"
              {...register("stageSpecs.stageWidthM", { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              placeholder="e.g., 8.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Stage Depth (m)
            </label>
            <input
              type="number"
              step="0.1"
              {...register("stageSpecs.stageDepthM", { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              placeholder="e.g., 6.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Capacity Standing
            </label>
            <input
              type="number"
              {...register("stageSpecs.capacityStanding", { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              placeholder="e.g., 300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Capacity Seated
            </label>
            <input
              type="number"
              {...register("stageSpecs.capacitySeated", { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              placeholder="e.g., 200"
            />
          </div>
        </div>
      </div>

      {/* Access Support */}
      <div>
        <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
          Access Support
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("accessSupport.loadingBay")}
              className="w-4 h-4"
            />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">Loading Bay</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("accessSupport.stepFreeAccess")}
              className="w-4 h-4"
            />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">Step-Free Access</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("accessSupport.dressingRoom")}
              className="w-4 h-4"
            />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">Dressing Room</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("accessSupport.backlineStorage")}
              className="w-4 h-4"
            />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">Backline Storage</span>
          </label>
        </div>
      </div>
    </div>
  );
}