// /app/components/ReplyComposer.tsx

"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
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
} from "lucide-react";

interface ReplyComposerProps {
  threadId: string;
  workingGroup?: string;
  onReplyAdded: (newPost: any) => void;
}

export default function ReplyComposer({
  threadId,
  workingGroup,
  onReplyAdded,
}: ReplyComposerProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: "Write your reply...",
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3",
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

  const handleSubmit = async () => {
    if (!editor) return;

    const content = editor.getHTML();
    if (!content || content === "<p></p>") {
      setError("Reply content is required");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        content,
        attachments,
      };

      const response = await fetch(`/api/threads/${threadId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to post reply");
      }

      // Clear form
      editor.commands.setContent("");
      setAttachments([]);
      setShowPreview(false);

      // Notify parent
      onReplyAdded(result.data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Reply to this thread
      </h3>

      {error && (
        <div className="mb-4 p-4 rounded-lg border-l-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444' }}>
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Toggle Preview */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setShowPreview(false)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition cursor-pointer ${
            !showPreview
              ? "text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          style={!showPreview ? { backgroundColor: 'var(--color-ijf-accent)' } : {}}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition cursor-pointer ${
            showPreview
              ? "text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          style={showPreview ? { backgroundColor: 'var(--color-ijf-accent)' } : {}}
        >
          Preview
        </button>
      </div>

      {showPreview ? (
        <div className="border-2 border-gray-300 rounded-lg p-4 min-h-[200px] bg-gray-50">
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: editor?.getHTML() || "" }}
          />
        </div>
      ) : (
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
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
                  title="Bold"
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
                  title="Italic"
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
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
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
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
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
                  title="Undo"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().redo().run()}
                  disabled={!editor?.can().redo()}
                  className="p-2 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Redo"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Editor */}
          <EditorContent
            editor={editor}
            className="bg-white text-gray-900"
          />
        </div>
      )}

      {/* File Upload */}
      <div className="mt-4">
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Attachments <span className="text-gray-500 text-xs font-normal">(optional)</span>
        </label>
        <div>
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
            id="reply-file-upload"
            className="hidden"
          />
          <label
            htmlFor="reply-file-upload"
            className={`flex items-center justify-center gap-3 w-full px-6 py-6 border-2 border-dashed rounded-lg transition-all shadow-sm ${
              uploading
                ? "border-gray-300 bg-gray-50 cursor-wait"
                : "border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer"
            }`}
          >
            <Upload className="w-6 h-6 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-700">
                {uploading ? "Uploading files..." : "Click to upload files"}
              </p>
            </div>
          </label>
        </div>

        {/* Attachment List */}
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

      {/* Submit Button */}
      <div className="mt-6">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-8 py-3 text-white text-base font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all cursor-pointer"
          style={{ backgroundColor: 'var(--color-ijf-primary)' }}
        >
          {submitting ? "Posting..." : "Post Reply"}
        </button>
      </div>
    </div>
  );
}