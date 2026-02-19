// /app/components/PostList.tsx

"use client";

import { useState } from "react";

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
  createdAt: string;
  deleted: boolean;
}

interface PostListProps {
  posts: Post[];
  currentUserId: string;
  currentUserRole: string;
  onPostEdited: (postId: string, newContent: string) => void;
  onPostDeleted: (postId: string) => void;
}

export default function PostList({
  posts,
  currentUserId,
  currentUserRole,
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
          onPostEdited={onPostEdited}
          onPostDeleted={onPostDeleted}
        />
      ))}
    </div>
  );
}

function PostCard({
  post,
  isOriginalPost,
  currentUserId,
  isAdmin,
  onPostEdited,
  onPostDeleted,
}: {
  post: Post;
  isOriginalPost: boolean;
  currentUserId: string;
  isAdmin: boolean;
  onPostEdited: (postId: string, newContent: string) => void;
  onPostDeleted: (postId: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isAuthor = currentUserId === post.createdBy._id;
  const canEdit =
    isAdmin ||
    (isAuthor &&
      new Date().getTime() - new Date(post.createdAt).getTime() <
        24 * 60 * 60 * 1000);
  const canDelete = isAdmin;

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(post.content);
    setError("");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(post.content);
    setError("");
  };

  const handleSaveEdit = async () => {
    if (!editContent || editContent.trim().length === 0) {
      setError("Content cannot be empty");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/posts/${post._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to update post");
      }

      onPostEdited(post._id, editContent.trim());
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${post._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to delete post");
      }

      onPostDeleted(post._id);
    } catch (err: any) {
      alert(err.message || "Failed to delete post");
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${
        isOriginalPost ? "border-2 border-ijf-accent" : ""
      }`}
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
                  (edited
                  {post.editedBy ? ` by ${post.editedBy.name}` : ""})
                </span>
              )}
            </div>
          </div>
        </div>

        {(canEdit || canDelete) && !isEditing && (
          <div className="flex gap-2">
            {canEdit && (
              <button
                onClick={handleEdit}
                className="text-sm text-ijf-accent hover:underline"
              >
                Edit
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                className="text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      {isEditing ? (
        <div className="mb-4">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full min-h-[200px] px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-ijf-accent focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleSaveEdit}
              disabled={saving}
              className="px-4 py-2 bg-ijf-accent text-ijf-bg rounded hover:bg-opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={saving}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-opacity-90 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          className="prose prose-sm max-w-none dark:prose-invert mb-4"
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
    </div>
  );
}