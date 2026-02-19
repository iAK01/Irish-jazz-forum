import { Suspense } from "react";

"use client";

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
  tags: string;
}

export default function NewThreadPage() {
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
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: "Write your message here...",
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none px-4 py-4",
        style: "min-height: 300px;",
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
    <DashboardLayout title="New Thread" userName={session?.user?.name || ""}>
      <div className="max-w-5xl mx-auto">
        
        {/* Breadcrumb */}
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="text-sm hover:underline cursor-pointer"
            style={{ color: 'var(--color-ijf-accent)' }}
          >
            ← Back to {workingGroup && workingGroup !== "general" ? "Working Group" : "General Discussion"}
          </button>
        </div>

        {/* Header Section */}
        <div className="mb-8 p-8 rounded-xl" style={{ background: 'linear-gradient(135deg, var(--color-ijf-bg) 0%, #1a1f2e 100%)' }}>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-ijf-accent)' }}>
              <svg className="w-7 h-7" style={{ color: 'var(--color-ijf-bg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">
                Create New Thread
              </h1>
              <p className="text-gray-300 mt-1 text-lg">
                Share your thoughts with the community
              </p>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="p-8">
            
            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 rounded-lg border-l-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444' }}>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800">Error</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              
              {/* Title Input */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-bold text-gray-900 mb-2"
                >
                  Thread Title <span style={{ color: 'var(--color-ijf-primary)' }}>*</span>
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
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 transition-all shadow-sm focus:ring-ijf-accent"
                  placeholder="What's your thread about?"
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Content Editor */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Content <span style={{ color: 'var(--color-ijf-primary)' }}>*</span>
                </label>
                <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm transition-all focus-within:ring-2 focus-within:border-transparent focus-within:ring-ijf-accent">
                  
                  {/* Toolbar */}
                  <div className="bg-gray-50 border-b-2 border-gray-200 px-3 py-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      
                      {/* Text Formatting Group */}
                      <div className="flex items-center gap-1 bg-white rounded-md p-1 border border-gray-200">
                        <button
                          type="button"
                          onClick={() => editor?.chain().focus().toggleBold().run()}
                          className={`p-2 rounded transition-colors cursor-pointer ${
                            editor?.isActive("bold")
                              ? "text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                          style={editor?.isActive("bold") ? { backgroundColor: 'var(--color-ijf-accent)' } : {}}
                          title="Bold (Ctrl+B)"
                        >
                          <Bold className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => editor?.chain().focus().toggleItalic().run()}
                          className={`p-2 rounded transition-colors cursor-pointer ${
                            editor?.isActive("italic")
                              ? "text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                          style={editor?.isActive("italic") ? { backgroundColor: 'var(--color-ijf-accent)' } : {}}
                          title="Italic (Ctrl+I)"
                        >
                          <Italic className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => editor?.chain().focus().toggleStrike().run()}
                          className={`p-2 rounded transition-colors cursor-pointer ${
                            editor?.isActive("strike")
                              ? "text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                          style={editor?.isActive("strike") ? { backgroundColor: 'var(--color-ijf-accent)' } : {}}
                          title="Strikethrough"
                        >
                          <Strikethrough className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Headings Group */}
                      <div className="flex items-center gap-1 bg-white rounded-md p-1 border border-gray-200">
                        <button
                          type="button"
                          onClick={() =>
                            editor?.chain().focus().toggleHeading({ level: 2 }).run()
                          }
                          className={`p-2 rounded transition-colors cursor-pointer ${
                            editor?.isActive("heading", { level: 2 })
                              ? "text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                          style={editor?.isActive("heading", { level: 2 }) ? { backgroundColor: 'var(--color-ijf-accent)' } : {}}
                          title="Heading 2"
                        >
                          <Heading2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            editor?.chain().focus().toggleHeading({ level: 3 }).run()
                          }
                          className={`p-2 rounded transition-colors cursor-pointer ${
                            editor?.isActive("heading", { level: 3 })
                              ? "text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                          style={editor?.isActive("heading", { level: 3 }) ? { backgroundColor: 'var(--color-ijf-accent)' } : {}}
                          title="Heading 3"
                        >
                          <Heading3 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Lists Group */}
                      <div className="flex items-center gap-1 bg-white rounded-md p-1 border border-gray-200">
                        <button
                          type="button"
                          onClick={() =>
                            editor?.chain().focus().toggleBulletList().run()
                          }
                          className={`p-2 rounded transition-colors cursor-pointer ${
                            editor?.isActive("bulletList")
                              ? "text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                          style={editor?.isActive("bulletList") ? { backgroundColor: 'var(--color-ijf-accent)' } : {}}
                          title="Bullet List"
                        >
                          <List className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            editor?.chain().focus().toggleOrderedList().run()
                          }
                          className={`p-2 rounded transition-colors cursor-pointer ${
                            editor?.isActive("orderedList")
                              ? "text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                          style={editor?.isActive("orderedList") ? { backgroundColor: 'var(--color-ijf-accent)' } : {}}
                          title="Numbered List"
                        >
                          <ListOrdered className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Link Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const url = window.prompt("Enter URL:");
                          if (url) {
                            editor?.chain().focus().setLink({ href: url }).run();
                          }
                        }}
                        className={`p-2 rounded transition-colors border border-gray-200 cursor-pointer ${
                          editor?.isActive("link")
                            ? "text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                        style={editor?.isActive("link") ? { backgroundColor: 'var(--color-ijf-accent)' } : {}}
                        title="Insert Link"
                      >
                        <LinkIcon className="w-4 h-4" />
                      </button>

                      {/* Spacer */}
                      <div className="flex-1"></div>

                      {/* Undo/Redo Group */}
                      <div className="flex items-center gap-1 bg-white rounded-md p-1 border border-gray-200">
                        <button
                          type="button"
                          onClick={() => editor?.chain().focus().undo().run()}
                          disabled={!editor?.can().undo()}
                          className="p-2 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer"
                          title="Undo (Ctrl+Z)"
                        >
                          <Undo2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => editor?.chain().focus().redo().run()}
                          disabled={!editor?.can().redo()}
                          className="p-2 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer"
                          title="Redo (Ctrl+Y)"
                        >
                          <Redo2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Editor Area */}
                  {editor && (
                    <EditorContent
                      editor={editor}
                      className="bg-white text-gray-900"
                    />
                  )}
                  {!editor && (
                    <div className="bg-white text-gray-900 px-4 py-4">
                      Loading editor...
                    </div>
                  )}
                </div>
              </div>

              {/* Tags Input */}
              <div>
                <label
                  htmlFor="tags"
                  className="block text-sm font-bold text-gray-900 mb-2"
                >
                  Tags <span className="text-gray-500 text-xs font-normal">(Optional)</span>
                </label>
                <input
                  id="tags"
                  type="text"
                  {...register("tags")}
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 transition-all shadow-sm"
                  placeholder="e.g. funding, education, advocacy"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Separate tags with commas to help others discover your thread
                </p>
              </div>

              {/* File Attachments */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Attachments <span className="text-gray-500 text-xs font-normal">(Optional)</span>
                </label>
                
                <div>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    disabled={uploading}
                    id="file-upload"
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload"
                    className={`flex items-center justify-center gap-3 w-full px-6 py-8 border-2 border-dashed rounded-lg transition-all shadow-sm ${
                      uploading
                        ? "border-gray-300 bg-gray-50 cursor-wait"
                        : "border-gray-300 bg-gray-50 hover:border-ijf-primary hover:bg-gray-100 cursor-pointer"
                    }`}
                  >
                    <Upload className="w-8 h-8 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {uploading ? "Uploading files..." : "Click to upload files or drag and drop"}
                      </p>
                    </div>
                  </label>
                </div>

                {/* Attached Files List */}
                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Attached Files ({attachments.length})
                    </p>
                    {attachments.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-gray-200 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-900">
                            {file.filename}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                          className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer"
                          title="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 disabled:opacity-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 text-white text-base font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer"
                style={{ backgroundColor: 'var(--color-ijf-primary)' }}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Thread...
                  </>
                ) : (
                  "Create Thread"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}