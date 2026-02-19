// Location: app/components/members/steps/Media.tsx

"use client";

import { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form";

interface MediaProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
}

export default function Media({ register, watch, setValue }: MediaProps) {
  const nationalMedia = watch("mediaPresence.featuredInNationalMedia") || [];
  const internationalMedia = watch("mediaPresence.featuredInInternationalMedia") || [];
  const socialMedia = watch("mediaPresence.socialMediaPlatforms") || [];

  const addNationalMedia = () => {
    const input = document.getElementById("national-media-input") as HTMLInputElement;
    if (input && input.value.trim()) {
      const newMedia = input.value.trim();
      if (!nationalMedia.includes(newMedia)) {
        setValue("mediaPresence.featuredInNationalMedia", [...nationalMedia, newMedia]);
      }
      input.value = "";
    }
  };

  const removeNationalMedia = (media: string) => {
    setValue("mediaPresence.featuredInNationalMedia", nationalMedia.filter((m: string) => m !== media));
  };

  const addInternationalMedia = () => {
    const input = document.getElementById("international-media-input") as HTMLInputElement;
    if (input && input.value.trim()) {
      const newMedia = input.value.trim();
      if (!internationalMedia.includes(newMedia)) {
        setValue("mediaPresence.featuredInInternationalMedia", [...internationalMedia, newMedia]);
      }
      input.value = "";
    }
  };

  const removeInternationalMedia = (media: string) => {
    setValue("mediaPresence.featuredInInternationalMedia", internationalMedia.filter((m: string) => m !== media));
  };

  const addSocialMedia = () => {
    const input = document.getElementById("social-media-input") as HTMLInputElement;
    if (input && input.value.trim()) {
      const newPlatform = input.value.trim();
      if (!socialMedia.includes(newPlatform)) {
        setValue("mediaPresence.socialMediaPlatforms", [...socialMedia, newPlatform]);
      }
      input.value = "";
    }
  };

  const removeSocialMedia = (platform: string) => {
    setValue("mediaPresence.socialMediaPlatforms", socialMedia.filter((p: string) => p !== platform));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-ijf-accent mb-4">Media & Visibility</h2>

      {/* Regular Media Coverage */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("mediaPresence.hasRegularMediaCoverage")}
            className="w-4 h-4"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            Has Regular Media Coverage
          </span>
        </label>
      </div>

      {/* National Media */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Featured in National Media
        </label>
        <p className="text-xs text-zinc-500 mb-2">
          e.g., Irish Times, RTÉ, Lyric FM
        </p>
        <div className="flex gap-2 mb-2">
          <input
            id="national-media-input"
            type="text"
            className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            placeholder="e.g., Irish Times"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addNationalMedia();
              }
            }}
          />
          <button
            type="button"
            onClick={addNationalMedia}
            className="px-4 py-2 bg-ijf-accent text-ijf-bg rounded hover:bg-ijf-accent/80 font-medium"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {nationalMedia.map((media: string) => (
            <span
              key={media}
              className="px-3 py-1 bg-ijf-primary text-ijf-surface rounded-full text-sm flex items-center gap-2"
            >
              {media}
              <button
                type="button"
                onClick={() => removeNationalMedia(media)}
                className="hover:text-red-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* International Media */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Featured in International Media
        </label>
        <div className="flex gap-2 mb-2">
          <input
            id="international-media-input"
            type="text"
            className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            placeholder="e.g., Jazz Times, DownBeat"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addInternationalMedia();
              }
            }}
          />
          <button
            type="button"
            onClick={addInternationalMedia}
            className="px-4 py-2 bg-ijf-accent text-ijf-bg rounded hover:bg-ijf-accent/80 font-medium"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {internationalMedia.map((media: string) => (
            <span
              key={media}
              className="px-3 py-1 bg-ijf-primary text-ijf-surface rounded-full text-sm flex items-center gap-2"
            >
              {media}
              <button
                type="button"
                onClick={() => removeInternationalMedia(media)}
                className="hover:text-red-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Active Website */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("mediaPresence.hasActiveWebsite")}
            className="w-4 h-4"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            Has Active Website
          </span>
        </label>
      </div>

      {/* Social Media Platforms */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Social Media Platforms
        </label>
        <p className="text-xs text-zinc-500 mb-2">
          Enter platform and handle/URL, e.g., "Instagram: @myband" or "Facebook: facebook.com/mypage"
        </p>
        <div className="flex gap-2 mb-2">
          <input
            id="social-media-input"
            type="text"
            className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            placeholder="e.g., Instagram: @dublinbigband"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSocialMedia();
              }
            }}
          />
          <button
            type="button"
            onClick={addSocialMedia}
            className="px-4 py-2 bg-ijf-accent text-ijf-bg rounded hover:bg-ijf-accent/80 font-medium"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {socialMedia.map((platform: string) => (
            <span
              key={platform}
              className="px-3 py-1 bg-ijf-primary text-ijf-surface rounded-full text-sm flex items-center gap-2"
            >
              {platform}
              <button
                type="button"
                onClick={() => removeSocialMedia(platform)}
                className="hover:text-red-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Jazz Ireland */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("mediaPresence.participatesInJazzIreland")}
            className="w-4 h-4"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            Participates in Jazz Ireland
          </span>
        </label>
      </div>
    </div>
  );
}