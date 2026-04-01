// /app/components/PostList.tsx

"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Copy,
  Ellipsis,
  Link2,
  MessageSquareQuote,
  Pencil,
  Trash2,
} from "lucide-react";
import ReactionBar from "@/app/components/ReactionBar";

interface ReactionSummary {
  counts: {
    like: number;
    agree: number;
    thanks: number;
  };
  total: number;
}

interface Post {
  _id: string;
  threadId: string;
  content: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  attachments: Array<{
    filename: string;
    url: string;
    mimetype: string;
    size: number;
    uploadedAt: string;
  }>;
  editedAt?: string;
  editedBy?: {
    name: string;
    email: string;
  };
  reactionSummary: ReactionSummary;
  currentUserReaction: "like" | "agree" | "thanks" | null;
  createdAt: string;
  deleted: boolean;
}

interface PostListProps {
  posts: Post[];
  currentUserId: string;
  currentUserRole: string;
  threadPath: string;
  onQuoteReply: (post: {
    postId: string;
    authorName: string;
    content: string;
  }) => void;
  onPostEdited: (postId: string, newContent: string) => void;
  onPostDeleted: (postId: string) => void;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function PostList({
  posts,
  currentUserId,
  currentUserRole,
  threadPath,
  onQuoteReply,
  onPostEdited,
  onPostDeleted,
}: PostListProps) {
  const isAdmin =
    currentUserRole === "super_admin" || currentUserRole === "admin";

  return (
    <div className="space-y-4">
      {posts.map((post, index) => (
        <PostCard
          key={post._id}
          post={post}
          isOriginalPost={index === 0}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          threadPath={threadPath}
          onQuoteReply={onQuoteReply}
          onPostEdited={onPostEdited}
          onPostDeleted={onPostDeleted}
        />
      ))}
    </div>
  );
}

// ─── Standalone TipTap edit editor ───────────────────────────────────────────
// Extracted into its own component so useEditor is never called conditionally.

function PostEditEditor({
  initialContent,
  onSave,
  onCancel,
}: {
  initialContent: string;
  onSave: (html: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Edit your post..." }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3",
        style: "min-height: 200px; --tw-prose-links: var(--color-ijf-accent);",
      },
    },
  });

  const handleSave = async () => {
    if (!editor) return;
    const html = editor.getHTML();
    if (!html || html === "<p></p>") {
      setError("Content cannot be empty");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(html);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to save changes"));
      setSaving(false);
    }
  };

  return (
    <div className="mb-4">
      <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
        {/* Toolbar */}
 <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-600 p-2 flex flex-wrap gap-1" style={{ position: "sticky", top: 0, zIndex: 10 }}>          <button
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
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
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
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
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
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
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
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
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
              if (url) editor?.chain().focus().setLink({ href: url }).run();
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

        {/* Editor content */}
        <EditorContent
          editor={editor}
          className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex gap-2 mt-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-ijf-accent text-ijf-bg rounded hover:bg-opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-opacity-90 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── PostCard ─────────────────────────────────────────────────────────────────

function PostCard({
  post,
  isOriginalPost,
  currentUserId,
  isAdmin,
  threadPath,
  onQuoteReply,
  onPostEdited,
  onPostDeleted,
}: {
  post: Post;
  isOriginalPost: boolean;
  currentUserId: string;
  isAdmin: boolean;
  threadPath: string;
  onQuoteReply: (post: {
    postId: string;
    authorName: string;
    content: string;
  }) => void;
  onPostEdited: (postId: string, newContent: string) => void;
  onPostDeleted: (postId: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const isAuthor = currentUserId === post.createdBy._id;
  const canEdit =
    isAdmin ||
    (isAuthor &&
      new Date().getTime() - new Date(post.createdAt).getTime() <
        24 * 60 * 60 * 1000);
  const canDelete = isAdmin;
  const postHash = `#post-${post._id}`;

  useEffect(() => {
    const syncHighlight = () => {
      setIsHighlighted(window.location.hash === postHash);
    };

    syncHighlight();
    window.addEventListener("hashchange", syncHighlight);

    return () => window.removeEventListener("hashchange", syncHighlight);
  }, [postHash]);

  useEffect(() => {
    const syncViewport = () => {
      setIsMobile(window.innerWidth < 768);
    };

    syncViewport();
    window.addEventListener("resize", syncViewport);

    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  useEffect(() => {
    if (!showMobileMenu) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest(`[data-post-menu="${post._id}"]`)) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [post._id, showMobileMenu]);

  const handleSaveEdit = async (html: string) => {
    const response = await fetch(`/api/posts/${post._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: html }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to update post");
    }

    onPostEdited(post._id, html);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch(`/api/posts/${post._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to delete post");
      }

      onPostDeleted(post._id);
    } catch (err: unknown) {
      alert(getErrorMessage(err, "Failed to delete post"));
    }
  };

  const handleCopyLink = async () => {
    const absoluteUrl = `${window.location.origin}${threadPath}${postHash}`;

    try {
      await navigator.clipboard.writeText(absoluteUrl);
      window.history.replaceState(null, "", postHash);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy post link:", absoluteUrl);
    }
  };

  const handleJumpToPost = () => {
    window.history.replaceState(null, "", postHash);
    setIsHighlighted(true);
    setShowMobileMenu(false);
  };

  const actionButtonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "2.25rem",
    height: "2.25rem",
    borderRadius: "9999px",
    border: "1px solid #e5e7eb",
    color: "#6b7280",
    backgroundColor: "white",
    cursor: "pointer",
    flexShrink: 0,
  };

  const destructiveButtonStyle: React.CSSProperties = {
    ...actionButtonStyle,
    border: "1px solid #fecaca",
    color: "#dc2626",
  };

  return (
    <div
      id={`post-${post._id}`}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${
        isOriginalPost ? "border-2 border-ijf-accent" : ""
      }`}
      style={{
        scrollMarginTop: "7rem",
        boxShadow: isHighlighted
          ? "0 0 0 3px rgba(228,185,91,0.35)"
          : undefined,
      }}
    >
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {post.createdBy.image && (
            <img
              src={post.createdBy.image}
              alt={post.createdBy.name}
              className="w-10 h-10 rounded-full"
            />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 dark:text-white">
                {post.createdBy.name}
              </span>
              {isOriginalPost && (
                <span className="px-2 py-1 text-xs bg-ijf-accent text-ijf-bg rounded">
                  Original Post
                </span>
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {new Date(post.createdAt).toLocaleDateString("en-IE", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
              {post.editedAt && (
                <span className="ml-2 italic">
                  (edited{post.editedBy ? ` by ${post.editedBy.name}` : ""})
                </span>
              )}
            </div>
          </div>
        </div>

        {!isEditing && (
          <div
            className="flex items-center gap-2"
            data-post-menu={post._id}
          >
            {!isMobile ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <a
                href={postHash}
                onClick={handleJumpToPost}
                aria-label="Jump to this post"
                title="Jump to this post"
                style={actionButtonStyle}
              >
                <Link2 className="h-4 w-4" />
              </a>
              <button
                onClick={handleCopyLink}
                type="button"
                aria-label={copied ? "Post link copied" : "Copy post link"}
                title={copied ? "Post link copied" : "Copy post link"}
                style={actionButtonStyle}
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={() =>
                  onQuoteReply({
                    postId: post._id,
                    authorName: post.createdBy.name,
                    content: post.content,
                  })
                }
                type="button"
                aria-label="Quote reply"
                title="Quote reply"
                style={actionButtonStyle}
              >
                <MessageSquareQuote className="h-4 w-4" />
              </button>
              {canEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  type="button"
                  aria-label="Edit post"
                  title="Edit post"
                  style={actionButtonStyle}
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  type="button"
                  aria-label="Delete post"
                  title="Delete post"
                  style={destructiveButtonStyle}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              </div>
            ) : (
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setShowMobileMenu((prev) => !prev)}
                aria-label="Open post actions"
                title="Post actions"
                aria-expanded={showMobileMenu}
                style={actionButtonStyle}
              >
                <Ellipsis className="h-4 w-4" />
              </button>

              {showMobileMenu && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "2.75rem",
                    zIndex: 20,
                    minWidth: "11rem",
                    overflow: "hidden",
                    borderRadius: "0.75rem",
                    border: "1px solid #e5e7eb",
                    backgroundColor: "white",
                    boxShadow: "0 12px 24px rgba(0,0,0,0.12)",
                  }}
                >
                  <a
                    href={postHash}
                    onClick={handleJumpToPost}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.75rem 1rem",
                      fontSize: "0.875rem",
                      color: "#374151",
                    }}
                  >
                    <Link2 className="h-4 w-4 text-gray-500" />
                    <span>Jump to post</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      void handleCopyLink();
                      setShowMobileMenu(false);
                    }}
                    style={{
                      display: "flex",
                      width: "100%",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.75rem 1rem",
                      textAlign: "left",
                      fontSize: "0.875rem",
                      color: "#374151",
                    }}
                  >
                    <Copy className="h-4 w-4 text-gray-500" />
                    <span>{copied ? "Link copied" : "Copy link"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onQuoteReply({
                        postId: post._id,
                        authorName: post.createdBy.name,
                        content: post.content,
                      });
                      setShowMobileMenu(false);
                    }}
                    style={{
                      display: "flex",
                      width: "100%",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.75rem 1rem",
                      textAlign: "left",
                      fontSize: "0.875rem",
                      color: "#374151",
                    }}
                  >
                    <MessageSquareQuote className="h-4 w-4 text-gray-500" />
                    <span>Quote reply</span>
                  </button>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(true);
                        setShowMobileMenu(false);
                      }}
                      style={{
                        display: "flex",
                        width: "100%",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.75rem 1rem",
                        textAlign: "left",
                        fontSize: "0.875rem",
                        color: "#374151",
                      }}
                    >
                      <Pencil className="h-4 w-4 text-gray-500" />
                      <span>Edit post</span>
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMobileMenu(false);
                        void handleDelete();
                      }}
                      style={{
                        display: "flex",
                        width: "100%",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.75rem 1rem",
                        textAlign: "left",
                        fontSize: "0.875rem",
                        color: "#dc2626",
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete post</span>
                    </button>
                  )}
                </div>
              )}
            </div>
            )}
          </div>
        )}
      </div>

      {/* Post Content / Edit Mode */}
      {isEditing ? (
        <PostEditEditor
          initialContent={post.content}
          onSave={handleSaveEdit}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div
          className="prose prose-sm max-w-none dark:prose-invert mb-4 [&_p:empty]:min-h-[1em]"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      )}

      {/* Attachments */}
      {post.attachments && post.attachments.length > 0 && !isEditing && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Attachments:
          </p>
          {post.attachments.map((file, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {file.mimetype.startsWith("image/") ? (
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={file.url}
                    alt={file.filename}
                    className="max-w-md rounded border border-gray-300 dark:border-gray-600"
                  />
                </a>
              ) : (
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ijf-accent hover:underline text-sm flex items-center gap-1"
                >
                  📎 {file.filename}
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {!isEditing && (
        <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid #f3f4f6" }}>
          <ReactionBar
            targetType="post"
            targetId={post._id}
            reactionSummary={post.reactionSummary}
            currentUserReaction={post.currentUserReaction}
          />
        </div>
      )}
    </div>
  );
}
