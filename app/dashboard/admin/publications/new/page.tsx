// app/dashboard/admin/publications/new/page.tsx

"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";

const TipTapEditor = dynamic(() => import("@/app/components/TipTapEditor"), { ssr: false });

function slugify(str: string) {
  return str.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

export default function NewPublicationPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    category: "news" as "news" | "resource",
    resourceType: "policy",
    status: "draft" as "draft" | "members_only" | "public",
    tags: "",
  });
  const [body, setBody] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<{ label: string; url: string }[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setForm((f) => ({ ...f, title, slug: slugify(title) }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        // No workingGroup param = goes to GCS

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();

        if (!res.ok || !data.success) {
          alert(`Failed to upload ${file.name}: ${data.error}`);
          continue;
        }

        setImages((prev) => [...prev, data.url]);
      }
    } catch (err) {
      alert("Upload failed");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((i) => i !== url));
  };

  const addAttachment = () => setAttachments((a) => [...a, { label: "", url: "" }]);
  const removeAttachment = (i: number) => setAttachments((a) => a.filter((_, idx) => idx !== i));
  const updateAttachment = (i: number, field: "label" | "url", value: string) => {
    setAttachments((a) => a.map((att, idx) => (idx === i ? { ...att, [field]: value } : att)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.slug || !form.excerpt || !body) {
      setError("Title, slug, excerpt, and body are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/publications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          body,
          images,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          attachments: attachments.filter((a) => a.label && a.url),
          resourceType: form.category === "resource" ? form.resourceType : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save"); return; }
      router.push("/dashboard/admin/publications");
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  if (!session || !["admin", "super_admin", "team"].includes(session.user.role)) {
    return <DashboardLayout title="New Publication" userName="Guest"><p>Access denied.</p></DashboardLayout>;
  }

  return (
    <DashboardLayout title="New Publication" userName={session.user.name}>
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">{error}</div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={handleTitleChange}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              placeholder="Publication title"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono text-sm"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Excerpt</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              placeholder="Short summary shown on listing pages"
            />
          </div>

          {/* Category + ResourceType + Status */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as any }))}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              >
                <option value="news">News</option>
                <option value="resource">Resource</option>
              </select>
            </div>

            {form.category === "resource" && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Resource Type</label>
                <select
                  value={form.resourceType}
                  onChange={(e) => setForm((f) => ({ ...f, resourceType: e.target.value }))}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="policy">Policy</option>
                  <option value="data">Data & Research</option>
                  <option value="guidance">Guidance</option>
                  <option value="statement">Statement</option>
                  <option value="other">Other</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              >
                <option value="draft">Draft</option>
                <option value="members_only">Members only</option>
                <option value="public">Public</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Tags <span className="font-normal text-zinc-400">(comma separated)</span>
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              placeholder="e.g. advocacy, arts council, funding"
            />
          </div>

          {/* Images */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Images
              </label>
              <label className={`text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer transition ${
                uploadingImage
                  ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                  : "bg-zinc-900 text-white hover:bg-zinc-700"
              }`}>
                {uploadingImage ? "Uploading..." : "+ Upload Images"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </label>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {images.map((url, i) => (
                  <div key={url} className="relative group">
                    <img
                      src={url}
                      alt={`Image ${i + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-zinc-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                    >
                      ×
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-xs rounded">
                        Hero
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-zinc-400 mt-2">First image will be used as the hero image on the listing page.</p>
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Body</label>
            <TipTapEditor content={body} onChange={setBody} />
          </div>

          {/* Attachments */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Attachments</label>
              <button type="button" onClick={addAttachment} className="text-xs text-ijf-accent hover:underline font-medium">
                + Add attachment
              </button>
            </div>
            <div className="space-y-2">
              {attachments.map((att, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Label"
                    value={att.label}
                    onChange={(e) => updateAttachment(i, "label", e.target.value)}
                    className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                  />
                  <input
                    type="url"
                    placeholder="URL"
                    value={att.url}
                    onChange={(e) => updateAttachment(i, "url", e.target.value)}
                    className="w-64 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                  />
                  <button type="button" onClick={() => removeAttachment(i)} className="text-red-500 hover:text-red-700 text-sm font-medium">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard/admin/publications")}
              className="px-6 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Publication"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}