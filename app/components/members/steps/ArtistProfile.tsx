// Location: app/components/members/steps/ArtistProfile.tsx

"use client";

import { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form";

interface ArtistProfileProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  errors: any;
}

export default function ArtistProfile({ register, watch, setValue, errors }: ArtistProfileProps) {
  const instruments = watch("artistProfile.instruments") || [];
  const ensemblesLeading = watch("artistProfile.ensemblesLeading") || [];
  const ensemblesParticipating = watch("artistProfile.ensemblesParticipating") || [];

  const addInstrument = () => {
    const input = document.getElementById("instrument-input") as HTMLInputElement;
    if (input && input.value.trim()) {
      const newInstrument = input.value.trim();
      if (!instruments.includes(newInstrument)) {
        setValue("artistProfile.instruments", [...instruments, newInstrument]);
      }
      input.value = "";
    }
  };

  const removeInstrument = (instrument: string) => {
    setValue("artistProfile.instruments", instruments.filter((i: string) => i !== instrument));
  };

  const addEnsembleLeading = () => {
    const input = document.getElementById("ensemble-leading-input") as HTMLInputElement;
    if (input && input.value.trim()) {
      const newEnsemble = input.value.trim();
      if (!ensemblesLeading.includes(newEnsemble)) {
        setValue("artistProfile.ensemblesLeading", [...ensemblesLeading, newEnsemble]);
      }
      input.value = "";
    }
  };

  const removeEnsembleLeading = (ensemble: string) => {
    setValue("artistProfile.ensemblesLeading", ensemblesLeading.filter((e: string) => e !== ensemble));
  };

  const addEnsembleParticipating = () => {
    const input = document.getElementById("ensemble-participating-input") as HTMLInputElement;
    if (input && input.value.trim()) {
      const newEnsemble = input.value.trim();
      if (!ensemblesParticipating.includes(newEnsemble)) {
        setValue("artistProfile.ensemblesParticipating", [...ensemblesParticipating, newEnsemble]);
      }
      input.value = "";
    }
  };

  const removeEnsembleParticipating = (ensemble: string) => {
    setValue("artistProfile.ensemblesParticipating", ensemblesParticipating.filter((e: string) => e !== ensemble));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-ijf-accent mb-4">Artist Profile</h2>

      {/* Instruments */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Instruments
        </label>
        <div className="flex gap-2 mb-2">
          <input
            id="instrument-input"
            type="text"
            className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            placeholder="e.g., saxophone, piano"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addInstrument();
              }
            }}
          />
          <button
            type="button"
            onClick={addInstrument}
            className="px-4 py-2 bg-ijf-accent text-ijf-bg rounded hover:bg-ijf-accent/80 font-medium"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {instruments.map((instrument: string) => (
            <span
              key={instrument}
              className="px-3 py-1 bg-ijf-primary text-ijf-surface rounded-full text-sm flex items-center gap-2"
            >
              {instrument}
              <button
                type="button"
                onClick={() => removeInstrument(instrument)}
                className="hover:text-red-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Ensembles Leading */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Ensembles Leading
        </label>
        <p className="text-xs text-zinc-500 mb-2">
          Groups or bands you lead (enter member slug if they're in the directory)
        </p>
        <div className="flex gap-2 mb-2">
          <input
            id="ensemble-leading-input"
            type="text"
            className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            placeholder="e.g., my-jazz-quartet"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addEnsembleLeading();
              }
            }}
          />
          <button
            type="button"
            onClick={addEnsembleLeading}
            className="px-4 py-2 bg-ijf-accent text-ijf-bg rounded hover:bg-ijf-accent/80 font-medium"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {ensemblesLeading.map((ensemble: string) => (
            <span
              key={ensemble}
              className="px-3 py-1 bg-ijf-primary text-ijf-surface rounded-full text-sm flex items-center gap-2"
            >
              {ensemble}
              <button
                type="button"
                onClick={() => removeEnsembleLeading(ensemble)}
                className="hover:text-red-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Ensembles Participating */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Ensembles Participating
        </label>
        <p className="text-xs text-zinc-500 mb-2">
          Groups or bands you play in
        </p>
        <div className="flex gap-2 mb-2">
          <input
            id="ensemble-participating-input"
            type="text"
            className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            placeholder="e.g., dublin-big-band"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addEnsembleParticipating();
              }
            }}
          />
          <button
            type="button"
            onClick={addEnsembleParticipating}
            className="px-4 py-2 bg-ijf-accent text-ijf-bg rounded hover:bg-ijf-accent/80 font-medium"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {ensemblesParticipating.map((ensemble: string) => (
            <span
              key={ensemble}
              className="px-3 py-1 bg-ijf-primary text-ijf-surface rounded-full text-sm flex items-center gap-2"
            >
              {ensemble}
              <button
                type="button"
                onClick={() => removeEnsembleParticipating(ensemble)}
                className="hover:text-red-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Years Active */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Years Active
        </label>
        <input
          type="number"
          {...register("artistProfile.yearsActive", { valueAsNumber: true })}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          placeholder="e.g., 15"
        />
      </div>

      {/* International Touring */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("artistProfile.hasInternationalTouringExperience")}
            className="w-4 h-4"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            Has International Touring Experience
          </span>
        </label>
      </div>
    </div>
  );
}