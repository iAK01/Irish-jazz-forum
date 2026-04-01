// /app/components/ReplyComposer.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Mention from "@tiptap/extension-mention";
import { mentionSuggestion } from "@/lib/mentionSuggestion";
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
  Paperclip,
  X,
  FileText,
  ChevronDown,
} from "lucide-react";

interface ReplyComposerProps {
  threadId: string;
  workingGroup?: string;
  quoteReplyTo?: {
    postId: string;
    authorName: string;
    content: string;
  } | null;
  onQuoteInserted?: () => void;
  onReplyAdded: (newPost: Record<string, unknown>) => void;
}

const DRAFT_KEY = (threadId: string) => `reply-draft-${threadId}`;

interface UploadedAttachment {
  filename: string;
  url: string;
  mimetype: string;
  size: number;
  uploadedAt: Date;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default function ReplyComposer({
  threadId,
  workingGroup,
  quoteReplyTo = null,
  onQuoteInserted,
  onReplyAdded,
}: ReplyComposerProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showMoreTools, setShowMoreTools] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [hasDraft, setHasDraft] = useState(false);
  const moreToolsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastQuotedPostIdRef = useRef<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: "Write your reply here — type @ to mention someone",
      }),
      CharacterCount,
      Mention.configure({
        HTMLAttributes: {
          class: "mention",
          style:
            "background: rgba(228,185,91,0.15); color: #92701a; border-radius: 4px; padding: 1px 4px; font-weight: 600;",
        },
        suggestion: mentionSuggestion,
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "focus:outline-none px-4 py-3",
        style: "min-height: 200px; --tw-prose-links: var(--color-ijf-accent);",
      },
    },
    onUpdate({ editor }) {
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);

      const html = editor.getHTML();
      if (html && html !== "<p></p>") {
        localStorage.setItem(DRAFT_KEY(threadId), html);
        setHasDraft(true);
      } else {
        localStorage.removeItem(DRAFT_KEY(threadId));
        setHasDraft(false);
      }
    },
  });

  useEffect(() => {
    if (!editor) return;
    const draft = localStorage.getItem(DRAFT_KEY(threadId));
    if (draft && draft !== "<p></p>") {
      editor.commands.setContent(draft);
      setHasDraft(true);
      const text = editor.getText();
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    }
  }, [editor, threadId]);

  useEffect(() => {
    if (!quoteReplyTo) {
      lastQuotedPostIdRef.current = null;
      return;
    }

  }, [quoteReplyTo]);

  useEffect(() => {
    if (!editor || !quoteReplyTo) return;
    if (lastQuotedPostIdRef.current === quoteReplyTo.postId) return;

    const quotedBlock = `<blockquote data-quoted-post-id="${quoteReplyTo.postId}"><p><strong>${escapeHtml(
      quoteReplyTo.authorName
    )} wrote:</strong></p>${quoteReplyTo.content}</blockquote><p></p>`;
    const currentHtml = editor.getHTML();
    const nextHtml =
      currentHtml && currentHtml !== "<p></p>"
        ? `${quotedBlock}${currentHtml}`
        : quotedBlock;

    editor.commands.setContent(nextHtml);
    editor.commands.focus("end");
    lastQuotedPostIdRef.current = quoteReplyTo.postId;
    onQuoteInserted?.();
  }, [editor, quoteReplyTo, onQuoteInserted]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        moreToolsRef.current &&
        !moreToolsRef.current.contains(e.target as Node)
      ) {
        setShowMoreTools(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY(threadId));
    setHasDraft(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");

    try {
      const uploadedFiles: UploadedAttachment[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("workingGroup", workingGroup || "general");

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

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
      setAttachments((prev) => [...prev, ...uploadedFiles]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "File upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
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
      const response = await fetch(`/api/threads/${threadId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, attachments }),
      });

      const result = await response.json();
      if (!response.ok || !result.success)
        throw new Error(result.error || "Failed to post reply");

      editor.commands.setContent("");
      setAttachments([]);
      setWordCount(0);
      clearDraft();
      onReplyAdded(result.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const toolbarBtn = (active: boolean) => ({
    base: `p-2 rounded transition-colors cursor-pointer`,
    style: active
      ? { backgroundColor: "var(--color-ijf-accent)", color: "white" }
      : {},
    className: active
      ? `p-2 rounded transition-colors cursor-pointer`
      : `p-2 rounded transition-colors cursor-pointer text-gray-700 hover:bg-gray-100`,
  });

  return (
    <div id="reply-composer">
      {error && (
        <div
          className="mb-3 p-3 rounded-lg border-l-4"
          style={{
            backgroundColor: "rgba(239,68,68,0.08)",
            borderColor: "#ef4444",
          }}
        >
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      {hasDraft && (
        <div
          className="mb-3 flex items-center justify-between px-3 py-2 rounded-lg text-sm"
          style={{
            backgroundColor: "rgba(228,185,91,0.12)",
            border: "1px solid rgba(228,185,91,0.3)",
          }}
        >
          <span style={{ color: "#92701a" }}>📝 Draft saved</span>
          <button
            type="button"
            onClick={() => {
              editor?.commands.setContent("");
              clearDraft();
              setWordCount(0);
            }}
            className="text-xs underline cursor-pointer"
            style={{ color: "#92701a" }}
          >
            Discard draft
          </button>
        </div>
      )}

      <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        {/* Toolbar */}
        <div
          className="bg-gray-50 border-b border-gray-200 px-3 py-2"
          style={{ position: "sticky", top: 0, zIndex: 10 }}
        >
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Core: Bold, Italic */}
            <div className="flex items-center gap-0.5 bg-white rounded-lg p-1 border border-gray-200">
              <button
                type="button"
                tabIndex={-1}
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={toolbarBtn(!!editor?.isActive("bold")).className}
                style={toolbarBtn(!!editor?.isActive("bold")).style}
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                tabIndex={-1}
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={toolbarBtn(!!editor?.isActive("italic")).className}
                style={toolbarBtn(!!editor?.isActive("italic")).style}
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
            </div>

            {/* Link */}
            <button
              type="button"
              tabIndex={-1}
              onClick={() => {
                const url = window.prompt("Enter URL:");
                if (url) editor?.chain().focus().setLink({ href: url }).run();
              }}
              style={{
                padding: "0.5rem",
                borderRadius: "0.375rem",
                cursor: "pointer",
                backgroundColor: editor?.isActive("link") ? "#ea580c" : "#fff7ed",
                color: editor?.isActive("link") ? "white" : "#ea580c",
                border: "1px solid #fed7aa",
              }}
              title="Insert Link"
            >
              <LinkIcon className="w-4 h-4" />
            </button>

            {/* More tools dropdown */}
            <div ref={moreToolsRef} style={{ position: "relative" }}>
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowMoreTools(!showMoreTools)}
                className="flex items-center gap-1 px-2 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 text-sm cursor-pointer transition-colors"
                title="More formatting"
              >
                More <ChevronDown className="w-3 h-3" />
              </button>

              {showMoreTools && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    left: 0,
                    zIndex: 20,
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                    padding: "0.375rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                    minWidth: "9rem",
                  }}
                >
                  {[
                    {
                      label: "Strikethrough",
                      icon: <Strikethrough className="w-4 h-4" />,
                      action: () =>
                        editor?.chain().focus().toggleStrike().run(),
                      active: !!editor?.isActive("strike"),
                    },
                    {
                      label: "Heading 2",
                      icon: <Heading2 className="w-4 h-4" />,
                      action: () =>
                        editor
                          ?.chain()
                          .focus()
                          .toggleHeading({ level: 2 })
                          .run(),
                      active: !!editor?.isActive("heading", { level: 2 }),
                    },
                    {
                      label: "Heading 3",
                      icon: <Heading3 className="w-4 h-4" />,
                      action: () =>
                        editor
                          ?.chain()
                          .focus()
                          .toggleHeading({ level: 3 })
                          .run(),
                      active: !!editor?.isActive("heading", { level: 3 }),
                    },
                    {
                      label: "Bullet list",
                      icon: <List className="w-4 h-4" />,
                      action: () =>
                        editor?.chain().focus().toggleBulletList().run(),
                      active: !!editor?.isActive("bulletList"),
                    },
                    {
                      label: "Numbered list",
                      icon: <ListOrdered className="w-4 h-4" />,
                      action: () =>
                        editor?.chain().focus().toggleOrderedList().run(),
                      active: !!editor?.isActive("orderedList"),
                    },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      tabIndex={-1}
                      onClick={() => {
                        item.action();
                        setShowMoreTools(false);
                      }}
                      className="flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer transition-colors text-left"
                      style={{
                        backgroundColor: item.active
                          ? "var(--color-ijf-accent)"
                          : "transparent",
                        color: item.active ? "white" : "#374151",
                      }}
                      onMouseEnter={(e) => {
                        if (!item.active)
                          (e.currentTarget as HTMLElement).style.backgroundColor =
                            "#f3f4f6";
                      }}
                      onMouseLeave={(e) => {
                        if (!item.active)
                          (e.currentTarget as HTMLElement).style.backgroundColor =
                            "transparent";
                      }}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-px bg-gray-200 h-6 mx-0.5" />

            {/* Paperclip upload */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id="reply-file-upload"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors disabled:opacity-50"
              title="Attach files"
              style={
                attachments.length > 0
                  ? {
                      backgroundColor: "#dbeafe",
                      borderColor: "#3b82f6",
                      color: "#1d4ed8",
                      border: "1px solid #3b82f6",
                    }
                  : {
                      backgroundColor: "#eff6ff",
                      borderColor: "#93c5fd",
                      color: "#2563eb",
                      border: "1px solid #93c5fd",
                    }
              }
            >
              <Paperclip className="w-4 h-4" />
              {attachments.length > 0 && (
                <span className="text-xs font-semibold">{attachments.length}</span>
              )}
              {uploading && <span className="text-xs">Uploading...</span>}
            </button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Undo / Redo */}
            <div className="flex items-center gap-0.5 bg-white rounded-lg p-1 border border-gray-200">
              <button
                type="button"
                tabIndex={-1}
                onClick={() => editor?.chain().focus().undo().run()}
                disabled={!editor?.can().undo()}
                className="p-2 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Undo"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                tabIndex={-1}
                onClick={() => editor?.chain().focus().redo().run()}
                disabled={!editor?.can().redo()}
                className="p-2 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Redo"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Editor */}
        <EditorContent editor={editor} className="bg-white text-gray-900" />

        {/* Attachment list */}
        {attachments.length > 0 && (
          <div className="px-4 pb-3 border-t border-gray-100 pt-3 flex flex-wrap gap-2">
            {attachments.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              >
                <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-700 font-medium max-w-[12rem] truncate">
                  {file.filename}
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(idx)}
                  className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-t border-gray-200">
          <span className="text-xs text-gray-400">
            {wordCount > 0
              ? `${wordCount} ${wordCount === 1 ? "word" : "words"}`
              : "Start typing — use @ to mention someone"}
          </span>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || wordCount === 0}
            className="px-6 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "var(--color-ijf-primary)",
              color: "white",
            }}
          >
            {submitting ? "Posting..." : "Post Reply"}
          </button>
        </div>
      </div>
    </div>
  );
}
