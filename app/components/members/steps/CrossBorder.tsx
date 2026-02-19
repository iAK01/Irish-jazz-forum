// Location: app/components/members/steps/CrossBorder.tsx

"use client";

import { UseFormWatch, UseFormSetValue } from "react-hook-form";

interface CrossBorderProps {
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
}

export default function CrossBorder({ watch, setValue }: CrossBorderProps) {
  const borderCounties = watch("crossBorderWork.borderCountiesServed") || [];
  const showcases = watch("internationalActivity.participatesInShowcases") || [];
  const partnerships = watch("internationalActivity.hasInternationalPartnerships") || [];
  const countries = watch("internationalActivity.countriesPresented") || [];

  const addBorderCounty = () => {
    const input = document.getElementById("border-county-input") as HTMLInputElement;
    if (input && input.value.trim()) {
      const newCounty = input.value.trim();
      if (!borderCounties.includes(newCounty)) {
        setValue("crossBorderWork.borderCountiesServed", [...borderCounties, newCounty]);
      }
      input.value = "";
    }
  };

  const removeBorderCounty = (county: string) => {
    setValue("crossBorderWork.borderCountiesServed", borderCounties.filter((c: string) => c !== county));
  };

  const addShowcase = () => {
    const input = document.getElementById("showcase-input") as HTMLInputElement;
    if (input && input.value.trim()) {
      const newShowcase = input.value.trim();
      if (!showcases.includes(newShowcase)) {
        setValue("internationalActivity.participatesInShowcases", [...showcases, newShowcase]);
      }
      input.value = "";
    }
  };

  const removeShowcase = (showcase: string) => {
    setValue("internationalActivity.participatesInShowcases", showcases.filter((s: string) => s !== showcase));
  };

  const addPartnership = () => {
    const input = document.getElementById("partnership-input") as HTMLInputElement;
    if (input && input.value.trim()) {
      const newPartnership = input.value.trim();
      if (!partnerships.includes(newPartnership)) {
        setValue("internationalActivity.hasInternationalPartnerships", [...partnerships, newPartnership]);
      }
      input.value = "";
    }
  };

  const removePartnership = (partnership: string) => {
    setValue("internationalActivity.hasInternationalPartnerships", partnerships.filter((p: string) => p !== partnership));
  };

  const addCountry = () => {
    const input = document.getElementById("country-input") as HTMLInputElement;
    if (input && input.value.trim()) {
      const newCountry = input.value.trim();
      if (!countries.includes(newCountry)) {
        setValue("internationalActivity.countriesPresented", [...countries, newCountry]);
      }
      input.value = "";
    }
  };

  const removeCountry = (country: string) => {
    setValue("internationalActivity.countriesPresented", countries.filter((c: string) => c !== country));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-ijf-accent mb-4">Cross-Border & International</h2>

      {/* Border Counties Served */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Border Counties Served
        </label>
        <div className="flex gap-2 mb-2">
          <input
            id="border-county-input"
            type="text"
            className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            placeholder="e.g., Donegal, Louth"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addBorderCounty();
              }
            }}
          />
          <button
            type="button"
            onClick={addBorderCounty}
            className="px-4 py-2 bg-ijf-accent text-ijf-bg rounded hover:bg-ijf-accent/80 font-medium"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {borderCounties.map((county: string) => (
            <span
              key={county}
              className="px-3 py-1 bg-ijf-primary text-ijf-surface rounded-full text-sm flex items-center gap-2"
            >
              {county}
              <button
                type="button"
                onClick={() => removeBorderCounty(county)}
                className="hover:text-red-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Showcases */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          International Showcases
        </label>
        <p className="text-xs text-zinc-500 mb-2">
          e.g., Jazzahead, WOMEX, Folk Alliance International
        </p>
        <div className="flex gap-2 mb-2">
          <input
            id="showcase-input"
            type="text"
            className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            placeholder="e.g., Jazzahead"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addShowcase();
              }
            }}
          />
          <button
            type="button"
            onClick={addShowcase}
            className="px-4 py-2 bg-ijf-accent text-ijf-bg rounded hover:bg-ijf-accent/80 font-medium"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {showcases.map((showcase: string) => (
            <span
              key={showcase}
              className="px-3 py-1 bg-ijf-primary text-ijf-surface rounded-full text-sm flex items-center gap-2"
            >
              {showcase}
              <button
                type="button"
                onClick={() => removeShowcase(showcase)}
                className="hover:text-red-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* International Partnerships */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          International Partnerships
        </label>
        <p className="text-xs text-zinc-500 mb-2">
          Organizations or venues abroad
        </p>
        <div className="flex gap-2 mb-2">
          <input
            id="partnership-input"
            type="text"
            className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            placeholder="e.g., Berlin Jazz Festival"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addPartnership();
              }
            }}
          />
          <button
            type="button"
            onClick={addPartnership}
            className="px-4 py-2 bg-ijf-accent text-ijf-bg rounded hover:bg-ijf-accent/80 font-medium"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {partnerships.map((partnership: string) => (
            <span
              key={partnership}
              className="px-3 py-1 bg-ijf-primary text-ijf-surface rounded-full text-sm flex items-center gap-2"
            >
              {partnership}
              <button
                type="button"
                onClick={() => removePartnership(partnership)}
                className="hover:text-red-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Countries Presented */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Countries Presented In
        </label>
        <div className="flex gap-2 mb-2">
          <input
            id="country-input"
            type="text"
            className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            placeholder="e.g., Germany, France"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCountry();
              }
            }}
          />
          <button
            type="button"
            onClick={addCountry}
            className="px-4 py-2 bg-ijf-accent text-ijf-bg rounded hover:bg-ijf-accent/80 font-medium"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {countries.map((country: string) => (
            <span
              key={country}
              className="px-3 py-1 bg-ijf-primary text-ijf-surface rounded-full text-sm flex items-center gap-2"
            >
              {country}
              <button
                type="button"
                onClick={() => removeCountry(country)}
                className="hover:text-red-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}