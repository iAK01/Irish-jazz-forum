"use client";

import { Suspense } from "react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";

interface ThreadFormData {
  title: string;
  tags: string;
}

function NewThreadFormContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const workingGroup = searchParams.get("workingGroup");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ThreadFormData>();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: "Write your post...",
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[300px] px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md",
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

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

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
        ? data.tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0)
        : [];

      const workingGroups =
        workingGroup && workingGroup !== "general" ? [workingGroup] : [];

      const payload = {
        title: data.title.trim(),
        workingGroups,
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

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to create thread");
      }

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

  return (
    <DashboardLayout
      title="New Thread"
      userName={session?.user?.name || ""}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="text-ijf-accent hover:underline"
          >
            ← Cancel
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Start a New Discussion
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Thread Title *
              </label>
              <input
                id="title"
                type="text"
                {...register("title", {
                  required: "Title is required",
                  minLength: {
                    value: 3,
                    message: "Title must be at least 3 characters",
                  },
                  maxLength: {
                    value: 200,
                    message: "Title must be less than 200 characters",
                  },
                })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-ijf-accent focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter a descriptive title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Tags (optional)
              </label>
              <input
                id="tags"
                type="text"
                {...register("tags")}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-ijf-accent focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g. funding, education, policy (comma separated)"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Separate multiple tags with commas
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Post Content *
              </label>
              <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-600 p-2 flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    className={`px-3 py-1 rounded text-sm ${
                      editor?.isActive("bold")
                        ? "bg-ijf-accent text-ijf-bg"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    Bold
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    className={`px-3 py-1 rounded text-sm ${
                      editor?.isActive("italic")
                        ? "bg-ijf-accent text-ijf-bg"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    Italic
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleStrike().run()}
                    className={`px-3 py-1 rounded text-sm ${
                      editor?.isActive("strike")
                        ? "bg-ijf-accent text-ijf-bg"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    Strike
                  </button>
                  <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />
                  <button
                    type="button"
                    onClick={() =>
                      editor?.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                    className={`px-3 py-1 rounded text-sm ${
                      editor?.isActive("heading", { level: 2 })
                        ? "bg-ijf-accent text-ijf-bg"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      editor?.chain().focus().toggleHeading({ level: 3 }).run()
                    }
                    className={`px-3 py-1 rounded text-sm ${
                      editor?.isActive("heading", { level: 3 })
                        ? "bg-ijf-accent text-ijf-bg"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    H3
                  </button>
                  <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />
                  <button
                    type="button"
                    onClick={() =>
                      editor?.chain().focus().toggleBulletList().run()
                    }
                    className={`px-3 py-1 rounded text-sm ${
                      editor?.isActive("bulletList")
                        ? "bg-ijf-accent text-ijf-bg"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    Bullet List
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      editor?.chain().focus().toggleOrderedList().run()
                    }
                    className={`px-3 py-1 rounded text-sm ${
                      editor?.isActive("orderedList")
                        ? "bg-ijf-accent text-ijf-bg"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    Numbered List
                  </button>
                  <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />
                  <button
                    type="button"
                    onClick={() => {
                      const url = window.prompt("Enter URL:");
                      if (url) {
                        editor
                          ?.chain()
                          .focus()
                          .setLink({ href: url })
                          .run();
                      }
                    }}
                    className={`px-3 py-1 rounded text-sm ${
                      editor?.isActive("link")
                        ? "bg-ijf-accent text-ijf-bg"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    Link
                  </button>
                  <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().undo().run()}
                    disabled={!editor?.can().undo()}
                    className="px-3 py-1 rounded text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                  >
                    Undo
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().redo().run()}
                    disabled={!editor?.can().redo()}
                    className="px-3 py-1 rounded text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                  >
                    Redo
                  </button>
                </div>

                <EditorContent
                  editor={editor}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Attachments (optional)
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-ijf-accent file:text-ijf-bg
                  hover:file:bg-opacity-90
                  file:cursor-pointer cursor-pointer"
              />
              {uploading && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Uploading...
                </p>
              )}

              {attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {attachments.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {file.filename}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(idx)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-ijf-accent text-ijf-bg rounded font-medium hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Creating..." : "Create Thread"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded font-medium hover:bg-opacity-90 disabled:opacity-50"
              >
                Cancel
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    }>
      <NewThreadFormContent />
    </Suspense>
  );
}