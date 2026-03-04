"use client";

import { Suspense } from "react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useEditor } from "@tiptap/react";
import { EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Undo2,
  Redo2,
  Upload,
  X,
  FileText,
  AlertCircle,
} from "lucide-react";

interface ThreadFormData {
  title: string;
  publicToMembers?: boolean;
  tags: string;
}

function NewThreadContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const workingGroup = searchParams.get("workingGroup");

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<ThreadFormData>();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Write your message here..." }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none px-4 py-4",
        style: "min-height: 260px;",
      },
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const uploadedFiles = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("workingGroup", workingGroup || "general");
        const response = await fetch("/api/upload", { method: "POST", body: formData });
        if (!response.ok) throw new Error(`Failed to upload ${file.name}`);
        const data = await response.json();
        uploadedFiles.push({
          filename: file.name,
          url: data.url,
          mimetype: file.type,
          size: file.size,
          uploadedAt: new Date(),
        });
      }
      setAttachments([...attachments, ...uploadedFiles]);
    } catch (err: any) {
      setError(err.message || "File upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ThreadFormData) => {
    if (!editor) return;
    const content = editor.getHTML();
    if (!content || content === "<p></p>") {
      setError("Post content is required");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const tagsArray = data.tags
        ? data.tags.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
        : [];
      const workingGroups = workingGroup && workingGroup !== "general" ? [workingGroup] : [];
      const payload = {
        title: data.title.trim(),
        workingGroups,
        publicToMembers: data.publicToMembers === true,
        tags: tagsArray,
        content,
        attachments,
      };
      const response = await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Failed to create thread");
      const threadSlug = result.data.slug;
      if (workingGroup && workingGroup !== "general") {
        router.push(`/dashboard/forum/${workingGroup}/${threadSlug}`);
      } else {
        router.push(`/dashboard/forum/general/${threadSlug}`);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (workingGroup && workingGroup !== "general") {
      router.push(`/dashboard/forum/${workingGroup}`);
    } else {
      router.push("/dashboard/forum/general");
    }
  };

  const isPublic = watch("publicToMembers");

  return (
    <DashboardLayout title="New Thread" userName={session?.user?.name || ""}>
      <div style={{ maxWidth: "52rem", margin: "0 auto" }}>

        {/* Back link */}
        <button
          onClick={handleCancel}
          style={{ color: "var(--color-ijf-accent)", fontSize: "0.875rem", marginBottom: "1.25rem", display: "inline-block", cursor: "pointer" }}
          className="hover:underline"
        >
          ← Back to {workingGroup && workingGroup !== "general" ? "Working Group" : "General Discussion"}
        </button>

        {/* Header — compact */}
        <div
          style={{
            marginBottom: "1.75rem",
            padding: "1.25rem 1.5rem",
            borderRadius: "0.75rem",
            background: "linear-gradient(135deg, var(--color-ijf-bg) 0%, #1a1f2e 100%)",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div
            style={{
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "0.5rem",
              backgroundColor: "var(--color-ijf-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg style={{ color: "var(--color-ijf-bg)", width: "1.1rem", height: "1.1rem" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "white", lineHeight: 1.3 }}>Create New Thread</h1>
            <p style={{ fontSize: "0.8125rem", color: "#9ca3af", marginTop: "0.1rem" }}>
              {workingGroup && workingGroup !== "general" ? `Posting in: ${workingGroup.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}` : "General Discussion"}
            </p>
          </div>
        </div>

        {/* Form card */}
        <div style={{ backgroundColor: "white", borderRadius: "0.75rem", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", border: "1px solid #f0f0f0" }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ padding: "2rem" }}>

            {/* Error */}
            {error && (
              <div style={{ marginBottom: "1.5rem", padding: "1rem", borderRadius: "0.5rem", backgroundColor: "rgba(239,68,68,0.07)", borderLeft: "4px solid #ef4444" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <AlertCircle style={{ color: "#dc2626", width: "1.1rem", height: "1.1rem", flexShrink: 0, marginTop: "0.1rem" }} />
                  <p style={{ fontSize: "0.875rem", color: "#991b1b" }}>{error}</p>
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>

              {/* Title */}
              <div>
                <label htmlFor="title" style={{ display: "block", fontSize: "0.9375rem", fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>
                  Thread Title <span style={{ color: "var(--color-ijf-primary)" }}>*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  {...register("title", {
                    required: "Title is required",
                    minLength: { value: 3, message: "Title must be at least 3 characters" },
                    maxLength: { value: 200, message: "Title must be less than 200 characters" },
                  })}
                  style={{
                    width: "100%",
                    padding: "0.875rem 1rem",
                    fontSize: "1rem",
                    border: errors.title ? "2px solid #ef4444" : "2px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    backgroundColor: "white",
                    color: "#111827",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  placeholder="What's your thread about?"
                />
                {errors.title && (
                  <p style={{ marginTop: "0.4rem", fontSize: "0.8125rem", color: "#dc2626", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <AlertCircle style={{ width: "0.875rem", height: "0.875rem" }} />
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Content */}
              <div>
                <label style={{ display: "block", fontSize: "0.9375rem", fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>
                  Content <span style={{ color: "var(--color-ijf-primary)" }}>*</span>
                </label>
                <div style={{ border: "2px solid #e5e7eb", borderRadius: "0.5rem", overflow: "hidden", backgroundColor: "white" }}>

                  {/* Toolbar — all buttons tabIndex=-1 so tab skips straight to editor */}
                  <div style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", padding: "0.5rem 0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexWrap: "wrap" }}>

                      {/* Format group */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.125rem", backgroundColor: "white", borderRadius: "0.375rem", padding: "0.25rem", border: "1px solid #e5e7eb" }}>
                        {[
                          { label: "Bold", icon: <Bold className="w-4 h-4" />, action: () => editor?.chain().focus().toggleBold().run(), active: editor?.isActive("bold") },
                          { label: "Italic", icon: <Italic className="w-4 h-4" />, action: () => editor?.chain().focus().toggleItalic().run(), active: editor?.isActive("italic") },
                          { label: "Strike", icon: <Strikethrough className="w-4 h-4" />, action: () => editor?.chain().focus().toggleStrike().run(), active: editor?.isActive("strike") },
                        ].map((btn) => (
                          <button key={btn.label} type="button" tabIndex={-1} onClick={btn.action}
                            style={{ padding: "0.375rem", borderRadius: "0.25rem", cursor: "pointer", backgroundColor: btn.active ? "var(--color-ijf-accent)" : "transparent", color: btn.active ? "var(--color-ijf-bg)" : "#374151" }}
                            title={btn.label}
                          >{btn.icon}</button>
                        ))}
                      </div>

                      {/* Headings */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.125rem", backgroundColor: "white", borderRadius: "0.375rem", padding: "0.25rem", border: "1px solid #e5e7eb" }}>
                        {[
                          { label: "H2", icon: <Heading2 className="w-4 h-4" />, action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), active: editor?.isActive("heading", { level: 2 }) },
                          { label: "H3", icon: <Heading3 className="w-4 h-4" />, action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(), active: editor?.isActive("heading", { level: 3 }) },
                        ].map((btn) => (
                          <button key={btn.label} type="button" tabIndex={-1} onClick={btn.action}
                            style={{ padding: "0.375rem", borderRadius: "0.25rem", cursor: "pointer", backgroundColor: btn.active ? "var(--color-ijf-accent)" : "transparent", color: btn.active ? "var(--color-ijf-bg)" : "#374151" }}
                            title={btn.label}
                          >{btn.icon}</button>
                        ))}
                      </div>

                      {/* Lists */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.125rem", backgroundColor: "white", borderRadius: "0.375rem", padding: "0.25rem", border: "1px solid #e5e7eb" }}>
                        {[
                          { label: "Bullet List", icon: <List className="w-4 h-4" />, action: () => editor?.chain().focus().toggleBulletList().run(), active: editor?.isActive("bulletList") },
                          { label: "Numbered List", icon: <ListOrdered className="w-4 h-4" />, action: () => editor?.chain().focus().toggleOrderedList().run(), active: editor?.isActive("orderedList") },
                        ].map((btn) => (
                          <button key={btn.label} type="button" tabIndex={-1} onClick={btn.action}
                            style={{ padding: "0.375rem", borderRadius: "0.25rem", cursor: "pointer", backgroundColor: btn.active ? "var(--color-ijf-accent)" : "transparent", color: btn.active ? "var(--color-ijf-bg)" : "#374151" }}
                            title={btn.label}
                          >{btn.icon}</button>
                        ))}
                      </div>

                      {/* Link */}
                      <button type="button" tabIndex={-1}
                        onClick={() => { const url = window.prompt("Enter URL:"); if (url) editor?.chain().focus().setLink({ href: url }).run(); }}
                        style={{ padding: "0.375rem", borderRadius: "0.375rem", cursor: "pointer", backgroundColor: editor?.isActive("link") ? "var(--color-ijf-accent)" : "white", color: editor?.isActive("link") ? "var(--color-ijf-bg)" : "#374151", border: "1px solid #e5e7eb" }}
                        title="Insert Link"
                      ><LinkIcon className="w-4 h-4" /></button>

                      <div style={{ flex: 1 }} />

                      {/* Undo/Redo */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.125rem", backgroundColor: "white", borderRadius: "0.375rem", padding: "0.25rem", border: "1px solid #e5e7eb" }}>
                        <button type="button" tabIndex={-1} onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()}
                          style={{ padding: "0.375rem", borderRadius: "0.25rem", cursor: "pointer", color: "#374151", opacity: editor?.can().undo() ? 1 : 0.35 }}
                          title="Undo"
                        ><Undo2 className="w-4 h-4" /></button>
                        <button type="button" tabIndex={-1} onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()}
                          style={{ padding: "0.375rem", borderRadius: "0.25rem", cursor: "pointer", color: "#374151", opacity: editor?.can().redo() ? 1 : 0.35 }}
                          title="Redo"
                        ><Redo2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>

                  {editor ? (
                    <EditorContent editor={editor} style={{ backgroundColor: "white", color: "#111827" }} />
                  ) : (
                    <div style={{ padding: "1rem", color: "#9ca3af", fontSize: "0.875rem" }}>Loading editor...</div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" style={{ display: "block", fontSize: "0.9375rem", fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>
                  Tags <span style={{ fontSize: "0.8125rem", fontWeight: 400, color: "#9ca3af" }}>(Optional)</span>
                </label>
                <input
                  id="tags"
                  type="text"
                  {...register("tags")}
                  style={{
                    width: "100%",
                    padding: "0.875rem 1rem",
                    fontSize: "1rem",
                    border: "2px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    backgroundColor: "white",
                    color: "#111827",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  placeholder="e.g. funding, education, advocacy"
                />
                <p style={{ marginTop: "0.375rem", fontSize: "0.8125rem", color: "#9ca3af" }}>
                  Separate tags with commas
                </p>
              </div>

              {/* Attachments */}
              <div>
                <label style={{ display: "block", fontSize: "0.9375rem", fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>
                  Attachments <span style={{ fontSize: "0.8125rem", fontWeight: 400, color: "#9ca3af" }}>(Optional)</span>
                </label>
                <input type="file" multiple onChange={handleFileUpload} disabled={uploading} id="file-upload" style={{ display: "none" }} />
                <label
                  htmlFor="file-upload"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.75rem",
                    width: "100%",
                    padding: "1.5rem",
                    border: "2px dashed #d1d5db",
                    borderRadius: "0.5rem",
                    backgroundColor: "#f9fafb",
                    cursor: uploading ? "wait" : "pointer",
                    boxSizing: "border-box",
                  }}
                >
                  <Upload style={{ width: "1.25rem", height: "1.25rem", color: "#9ca3af", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.9rem", color: "#6b7280", fontWeight: 500 }}>
                    {uploading ? "Uploading..." : "Click to upload files"}
                  </span>
                </label>

                {attachments.length > 0 && (
                  <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {attachments.map((file, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.625rem 0.875rem", backgroundColor: "white", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                          <FileText style={{ width: "1rem", height: "1rem", color: "#9ca3af", flexShrink: 0 }} />
                          <span style={{ fontSize: "0.875rem", color: "#374151", fontWeight: 500 }}>{file.filename}</span>
                        </div>
                        <button type="button" onClick={() => removeAttachment(idx)} style={{ padding: "0.25rem", color: "#ef4444", cursor: "pointer", borderRadius: "0.25rem" }}>
                          <X style={{ width: "1rem", height: "1rem" }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Public toggle */}
            <div
              onClick={() => setValue("publicToMembers", !isPublic)}
              style={{
                marginTop: "1.75rem",
                padding: "1rem 1.25rem",
                borderRadius: "0.625rem",
                border: `2px solid ${isPublic ? "var(--color-ijf-accent)" : "#e5e7eb"}`,
                backgroundColor: isPublic ? "rgba(228,185,91,0.06)" : "#f9fafb",
                transition: "border-color 0.2s, background-color 0.2s",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              {/* Toggle pill */}
              <div style={{ position: "relative", width: "2.75rem", height: "1.5rem", borderRadius: "9999px", backgroundColor: isPublic ? "var(--color-ijf-accent)" : "#d1d5db", transition: "background-color 0.2s", flexShrink: 0 }}>
                <div style={{ position: "absolute", top: "0.2rem", left: isPublic ? "1.35rem" : "0.2rem", width: "1.1rem", height: "1.1rem", borderRadius: "9999px", backgroundColor: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
              </div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "#111827" }}>Make visible to all forum members</p>
                <p style={{ fontSize: "0.8125rem", color: "#6b7280", marginTop: "0.125rem" }}>
                  By default, threads are only visible to working group members. Enable this to allow all members to read and reply.
                </p>
              </div>

              {/* Globe */}
              <svg width="22" height="22" fill="none" stroke="var(--color-ijf-accent)" strokeWidth={2} viewBox="0 0 24 24" style={{ flexShrink: 0, opacity: isPublic ? 1 : 0.25, transition: "opacity 0.2s" }}>
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
              </svg>

              <input type="checkbox" {...register("publicToMembers")} style={{ display: "none" }} />
            </div>

            {/* Footer */}
            <div style={{ marginTop: "1.75rem", paddingTop: "1.25rem", borderTop: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                style={{ padding: "0.625rem 1.25rem", fontSize: "0.9rem", fontWeight: 500, color: "#6b7280", cursor: "pointer", borderRadius: "0.5rem" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "0.75rem 2rem",
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  color: "white",
                  backgroundColor: "var(--color-ijf-primary)",
                  borderRadius: "0.5rem",
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.6 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
              >
                {submitting ? (
                  <>
                    <div style={{ width: "1rem", height: "1rem", border: "2px solid white", borderTopColor: "transparent", borderRadius: "9999px", animation: "spin 0.7s linear infinite" }} />
                    Creating Thread...
                  </>
                ) : "Create Thread"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function NewThreadPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    }>
      <NewThreadContent />
    </Suspense>
  );
}