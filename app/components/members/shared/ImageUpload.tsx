// Location: app/components/members/shared/ImageUpload.tsx

"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageUploadProps {
  label: string;
  value: string | string[];
  onChange: (url: string | string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
}

export default function ImageUpload({
  label,
  value,
  onChange,
  multiple = false,
  maxFiles = 5,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.type.startsWith("image/")) {
          setError("Please upload only image files");
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          setError("File size must be less than 5MB");
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        uploadedUrls.push(data.url);
      }

      if (multiple) {
        const currentUrls = Array.isArray(value) ? value : [];
        const newUrls = [...currentUrls, ...uploadedUrls].slice(0, maxFiles);
        onChange(newUrls);
      } else {
        onChange(uploadedUrls[0]);
      }
    } catch (err) {
      setError("Failed to upload image. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (urlToRemove: string) => {
    if (multiple && Array.isArray(value)) {
      onChange(value.filter((url) => url !== urlToRemove));
    } else {
      onChange("");
    }
  };

  const renderPreview = () => {
    if (multiple && Array.isArray(value)) {
      return (
        <div className="grid grid-cols-3 gap-4 mt-4">
          {value.map((url, index) => (
            <div key={index} className="relative group">
              <Image
                src={url}
                alt={`Upload ${index + 1}`}
                width={200}
                height={200}
                className="rounded-lg object-cover w-full h-32"
              />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      );
    } else if (value && typeof value === "string") {
      return (
        <div className="relative mt-4 inline-block">
          <Image
            src={value}
            alt="Upload preview"
            width={300}
            height={300}
            className="rounded-lg object-cover"
          />
          <button
            type="button"
            onClick={() => handleRemove(value)}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full px-3 py-1"
          >
            Remove
          </button>
        </div>
      );
    }
    return null;
  };

  const currentCount = Array.isArray(value) ? value.length : value ? 1 : 0;
  const canUploadMore = !multiple || currentCount < maxFiles;

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
        {label}
      </label>
      
      {canUploadMore && (
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-ijf-accent file:text-ijf-bg hover:file:bg-ijf-accent/80 disabled:opacity-50"
          />
          {uploading && <span className="text-sm text-zinc-500">Uploading...</span>}
        </div>
      )}

      {multiple && (
        <p className="text-xs text-zinc-500 mt-1">
          {currentCount} of {maxFiles} images uploaded
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}

      {renderPreview()}
    </div>
  );
}