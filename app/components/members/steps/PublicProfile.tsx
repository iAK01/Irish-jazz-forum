// Location: app/components/members/steps/PublicProfile.tsx

"use client";

import { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form";
import ImageUpload from "../shared/ImageUpload";
import RepeatableTable from "../shared/RepeatableTable";

interface PublicProfileProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
}

export default function PublicProfile({ register, watch, setValue }: PublicProfileProps) {
  const logoUrl = watch("logoUrl") || "";
  const heroImageUrl = watch("heroImageUrl") || "";
  const galleryImageUrls = watch("galleryImageUrls") || [];
  const publicTags = watch("publicTags") || [];
  const keyProjects = watch("keyProjects") || [];
  const pressQuotes = watch("pressQuotes") || [];

  const addPublicTag = () => {
    const input = document.getElementById("public-tag-input") as HTMLInputElement;
    if (input && input.value.trim()) {
      const newTag = input.value.trim();
      if (!publicTags.includes(newTag)) {
        setValue("publicTags", [...publicTags, newTag]);
      }
      input.value = "";
    }
  };

  const removePublicTag = (tag: string) => {
    setValue("publicTags", publicTags.filter((t: string) => t !== tag));
  };

  const addKeyProject = () => {
    setValue("keyProjects", [
      ...keyProjects,
      { name: "", year: null, summary: "", url: "" },
    ]);
  };

  const removeKeyProject = (index: number) => {
    setValue("keyProjects", keyProjects.filter((_: any, i: number) => i !== index));
  };

  const updateKeyProject = (index: number, field: string, value: any) => {
    const updated = [...keyProjects];
    updated[index] = { ...updated[index], [field]: value };
    setValue("keyProjects", updated);
  };

  const addPressQuote = () => {
    setValue("pressQuotes", [
      ...pressQuotes,
      { quote: "", source: "", year: null },
    ]);
  };

  const removePressQuote = (index: number) => {
    setValue("pressQuotes", pressQuotes.filter((_: any, i: number) => i !== index));
  };

  const updatePressQuote = (index: number, field: string, value: any) => {
    const updated = [...pressQuotes];
    updated[index] = { ...updated[index], [field]: value };
    setValue("pressQuotes", updated);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-ijf-accent mb-4">Public Profile</h2>

      {/* Logo */}
      <ImageUpload
        label="Logo"
        value={logoUrl}
        onChange={(url) => setValue("logoUrl", url)}
        multiple={false}
      />

      {/* Short Tagline */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Short Tagline
        </label>
        <input
          type="text"
          maxLength={200}
          {...register("shortTagline")}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          placeholder="A brief description (max 200 characters)"
        />
        <p className="text-xs text-zinc-500 mt-1">
          {watch("shortTagline")?.length || 0}/200 characters
        </p>
      </div>

      {/* Long Bio */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Bio
        </label>
        <textarea
          {...register("longBio")}
          rows={6}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          placeholder="Tell your story..."
        />
      </div>

      {/* Hero Image */}
      <ImageUpload
        label="Hero Image"
        value={heroImageUrl}
        onChange={(url) => setValue("heroImageUrl", url)}
        multiple={false}
      />

      {/* Gallery Images */}
      <ImageUpload
        label="Gallery Images"
        value={galleryImageUrls}
        onChange={(urls) => setValue("galleryImageUrls", urls)}
        multiple={true}
        maxFiles={5}
      />

      {/* Public Tags */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Public Tags
        </label>
        <p className="text-xs text-zinc-500 mb-2">
          Keywords for search and discovery
        </p>
        <div className="flex gap-2 mb-2">
          <input
            id="public-tag-input"
            type="text"
            className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            placeholder="e.g., festival, education, Dublin"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addPublicTag();
              }
            }}
          />
          <button
            type="button"
            onClick={addPublicTag}
            className="px-4 py-2 bg-ijf-accent text-ijf-bg rounded hover:bg-ijf-accent/80 font-medium"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {publicTags.map((tag: string) => (
            <span
              key={tag}
              className="px-3 py-1 bg-ijf-primary text-ijf-surface rounded-full text-sm flex items-center gap-2"
            >
              {tag}
              <button
                type="button"
                onClick={() => removePublicTag(tag)}
                className="hover:text-red-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Key Projects */}
      <div>
        <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
          Key Projects
        </h3>
        <RepeatableTable
          fields={[
            { name: "name", label: "Project Name", type: "text", required: true },
            { name: "year", label: "Year", type: "number", placeholder: "Optional" },
            { name: "summary", label: "Summary", type: "textarea", placeholder: "Optional" },
            { name: "url", label: "URL", type: "text", placeholder: "Optional" },
          ]}
          data={keyProjects}
          onAdd={addKeyProject}
          onRemove={removeKeyProject}
          onChange={updateKeyProject}
          addButtonText="Add Project"
        />
      </div>

      {/* Press Quotes */}
      <div>
        <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
          Press Quotes
        </h3>
        <RepeatableTable
          fields={[
            { name: "quote", label: "Quote", type: "textarea", required: true },
            { name: "source", label: "Source", type: "text", required: true },
            { name: "year", label: "Year", type: "number", placeholder: "Optional" },
          ]}
          data={pressQuotes}
          onAdd={addPressQuote}
          onRemove={removePressQuote}
          onChange={updatePressQuote}
          addButtonText="Add Quote"
        />
      </div>
    </div>
  );
}