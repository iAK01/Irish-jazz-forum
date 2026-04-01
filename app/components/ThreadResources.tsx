"use client";

import { type ReactNode, useState } from "react";
import {
  ExternalLink,
  FileArchive,
  FileImage,
  FilePlus2,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Link2,
  Loader2,
  Plus,
} from "lucide-react";

interface ThreadResourcePost {
  _id: string;
  content: string;
  createdAt: string;
  createdBy: {
    name: string;
  };
  attachments: Array<{
    filename: string;
    url: string;
    mimetype: string;
    size: number;
    uploadedAt: string;
  }>;
}

interface ResourceItem {
  key: string;
  title: string;
  url: string;
  bucket: "working" | "reference";
  sourceType: "attachment" | "link";
  sourceLabel: string;
  addedAt: string;
  postId: string;
  postAuthor: string;
  meta?: string;
}

interface Props {
  posts: ThreadResourcePost[];
  threadId: string;
  threadPath: string;
  groupName: string;
  workingGroupSlug: string;
  driveFolderId?: string;
  onResourceAdded?: (newPost: Record<string, unknown>) => void;
}

type ResourceMode = "create_google_doc" | "attach_drive_link" | null;

const FILE_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "csv",
  "zip",
  "rtf",
  "txt",
];

function normalizeUrl(value: string) {
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`.replace(/\/+$/, "");
  } catch {
    return value.trim().replace(/\/+$/, "");
  }
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function extractLinks(html: string) {
  const matches = [...html.matchAll(/<a\b[^>]*href=(["'])(.*?)\1[^>]*>(.*?)<\/a>/gi)];

  return matches.map((match) => ({
    url: match[2],
    label: decodeHtmlEntities(stripHtml(match[3] || "")),
  }));
}

function fileExtension(value: string) {
  const parts = value.toLowerCase().split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

function isGoogleWorkingDocument(url: string) {
  return (
    url.includes("docs.google.com/document/") ||
    url.includes("docs.google.com/spreadsheets/") ||
    url.includes("docs.google.com/presentation/") ||
    url.includes("docs.google.com/forms/")
  );
}

function isDriveFile(url: string) {
  return url.includes("drive.google.com/file/");
}

function isReferenceLink(url: string, label: string) {
  const extension = fileExtension(url) || fileExtension(label);

  return isDriveFile(url) || FILE_EXTENSIONS.includes(extension);
}

function inferLinkTitle(url: string, label: string) {
  if (label) return label;

  try {
    const parsed = new URL(url);
    const lastSegment =
      parsed.pathname.split("/").filter(Boolean).pop() || parsed.hostname;
    return decodeURIComponent(lastSegment.replace(/[-_]/g, " "));
  } catch {
    return url;
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function resourceIcon(resource: ResourceItem) {
  if (resource.bucket === "working") {
    return <FileText size={16} strokeWidth={2.2} />;
  }

  const lower = resource.title.toLowerCase();
  if (
    lower.endsWith(".xls") ||
    lower.endsWith(".xlsx") ||
    resource.title.toLowerCase().includes("sheet")
  ) {
    return <FileSpreadsheet size={16} strokeWidth={2.2} />;
  }

  if (
    lower.endsWith(".png") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".gif")
  ) {
    return <FileImage size={16} strokeWidth={2.2} />;
  }

  if (lower.endsWith(".zip")) {
    return <FileArchive size={16} strokeWidth={2.2} />;
  }

  if (resource.sourceType === "link") {
    return <Link2 size={16} strokeWidth={2.2} />;
  }

  return <FileText size={16} strokeWidth={2.2} />;
}

function collectResources(posts: ThreadResourcePost[]) {
  const deduped = new Map<string, ResourceItem>();

  for (const post of posts) {
    for (const attachment of post.attachments || []) {
      const key = normalizeUrl(attachment.url);
      if (deduped.has(key)) continue;

      const bucket = isGoogleWorkingDocument(attachment.url)
        ? "working"
        : "reference";

      deduped.set(key, {
        key,
        title: attachment.filename,
        url: attachment.url,
        bucket,
        sourceType: "attachment",
        sourceLabel: "Attached in thread",
        addedAt: attachment.uploadedAt || post.createdAt,
        postId: post._id,
        postAuthor: post.createdBy.name,
        meta: `${attachment.mimetype}${attachment.size ? ` • ${formatBytes(attachment.size)}` : ""}`,
      });
    }

    for (const link of extractLinks(post.content || "")) {
      const normalized = normalizeUrl(link.url);
      if (deduped.has(normalized)) continue;

      let bucket: "working" | "reference" | null = null;
      if (isGoogleWorkingDocument(link.url)) {
        bucket = "working";
      } else if (isReferenceLink(link.url, link.label)) {
        bucket = "reference";
      }

      if (!bucket) continue;

      deduped.set(normalized, {
        key: normalized,
        title: inferLinkTitle(link.url, link.label),
        url: link.url,
        bucket,
        sourceType: "link",
        sourceLabel: bucket === "working" ? "Linked working doc" : "Linked file",
        addedAt: post.createdAt,
        postId: post._id,
        postAuthor: post.createdBy.name,
      });
    }
  }

  const resources = [...deduped.values()].sort(
    (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
  );

  return {
    workingDocuments: resources.filter((resource) => resource.bucket === "working"),
    referenceFiles: resources.filter((resource) => resource.bucket === "reference"),
  };
}

function ResourceSection({
  title,
  description,
  resources,
  threadPath,
  emptyMessage,
}: {
  title: string;
  description: string;
  resources: ResourceItem[];
  threadPath: string;
  emptyMessage: string;
}) {
  return (
    <section>
      <div style={{ marginBottom: "0.85rem" }}>
        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#111827" }}>
          {title}
        </h3>
        <p style={{ marginTop: "0.2rem", fontSize: "0.82rem", color: "#6b7280" }}>
          {description}
        </p>
      </div>

      {resources.length === 0 ? (
        <div
          style={{
            padding: "0.95rem 1rem",
            borderRadius: "0.75rem",
            backgroundColor: "#fafafa",
            border: "1px dashed #d1d5db",
            color: "#6b7280",
            fontSize: "0.875rem",
          }}
        >
          {emptyMessage}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {resources.map((resource) => (
            <div
              key={resource.key}
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "1rem",
                padding: "0.95rem 1rem",
                borderRadius: "0.75rem",
                border: "1px solid #e5e7eb",
                backgroundColor: "white",
              }}
            >
              <div style={{ display: "flex", gap: "0.75rem", minWidth: 0 }}>
                <div
                  style={{
                    width: "2rem",
                    height: "2rem",
                    borderRadius: "0.55rem",
                    backgroundColor:
                      resource.bucket === "working"
                        ? "rgba(228,185,91,0.14)"
                        : "#f3f4f6",
                    color:
                      resource.bucket === "working"
                        ? "#8a6612"
                        : "#4b5563",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {resourceIcon(resource)}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexWrap: "wrap" }}>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#111827",
                        fontWeight: 700,
                        textDecoration: "none",
                        wordBreak: "break-word",
                      }}
                    >
                      {resource.title}
                    </a>
                    <span
                      style={{
                        padding: "0.12rem 0.45rem",
                        borderRadius: "9999px",
                        backgroundColor:
                          resource.bucket === "working"
                            ? "rgba(228,185,91,0.12)"
                            : "#f3f4f6",
                        color:
                          resource.bucket === "working" ? "#8a6612" : "#4b5563",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                      }}
                    >
                      {resource.sourceLabel}
                    </span>
                  </div>

                  <div style={{ marginTop: "0.35rem", fontSize: "0.8rem", color: "#6b7280" }}>
                    Added by {resource.postAuthor} on {formatDate(resource.addedAt)}
                    {resource.meta ? ` • ${resource.meta}` : ""}
                  </div>

                  <div style={{ marginTop: "0.45rem", display: "flex", alignItems: "center", gap: "0.85rem", flexWrap: "wrap" }}>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        color: "var(--color-ijf-accent)",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      <ExternalLink size={14} strokeWidth={2.2} />
                      Open
                    </a>
                    <a
                      href={`${threadPath}#post-${resource.postId}`}
                      style={{
                        color: "#6b7280",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      View in discussion
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ResourceActionButton({
  label,
  icon,
  active = false,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.45rem",
        padding: "0.7rem 0.95rem",
        borderRadius: "0.65rem",
        border: active ? "1px solid rgba(228,185,91,0.35)" : "1px solid #e5e7eb",
        backgroundColor: active ? "rgba(228,185,91,0.12)" : "white",
        color: active ? "#8a6612" : "#374151",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

export default function ThreadResources({
  posts,
  threadId,
  threadPath,
  groupName,
  workingGroupSlug,
  driveFolderId,
  onResourceAdded,
}: Props) {
  const { workingDocuments, referenceFiles } = collectResources(posts);
  const [mode, setMode] = useState<ResourceMode>(null);
  const [docTitle, setDocTitle] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!driveFolderId && workingDocuments.length === 0 && referenceFiles.length === 0) {
    return null;
  }

  const driveFolderUrl = driveFolderId
    ? `https://drive.google.com/drive/folders/${driveFolderId}`
    : null;

  const resetForm = () => {
    setDocTitle("");
    setLinkTitle("");
    setLinkUrl("");
    setError("");
    setSuccess("");
  };

  const toggleMode = (nextMode: Exclude<ResourceMode, null>) => {
    setMode((currentMode) => {
      const finalMode = currentMode === nextMode ? null : nextMode;
      setError("");
      setSuccess("");
      return finalMode;
    });
  };

  const handleCreateGoogleDoc = async () => {
    const title = docTitle.trim();

    if (!title) {
      setError("Document title is required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const response = await fetch(`/api/threads/${threadId}/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_google_doc",
          title,
          workingGroupSlug,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to create Google Doc");
      }

      onResourceAdded?.(result.data);
      setSuccess("Google Doc created and added to Thread Resources.");
      setDocTitle("");
      setMode(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create Google Doc");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAttachLink = async () => {
    const title = linkTitle.trim();
    const url = linkUrl.trim();

    if (!title) {
      setError("Resource title is required.");
      return;
    }

    if (!url) {
      setError("Google Docs or Drive URL is required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const response = await fetch(`/api/threads/${threadId}/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "attach_drive_link",
          title,
          url,
          workingGroupSlug,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to attach Drive link");
      }

      onResourceAdded?.(result.data);
      setSuccess("Drive resource added to Thread Resources.");
      setLinkTitle("");
      setLinkUrl("");
      setMode(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to attach Drive link");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        marginBottom: "2rem",
        borderRadius: "0.9rem",
        border: "1px solid #e5e7eb",
        backgroundColor: "white",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "1.25rem 1.5rem",
          borderBottom: "1px solid #f3f4f6",
          background:
            "linear-gradient(180deg, rgba(228,185,91,0.09) 0%, rgba(255,255,255,1) 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#111827" }}>
              Thread Resources
            </h2>
            <p style={{ marginTop: "0.25rem", fontSize: "0.88rem", color: "#6b7280" }}>
              Key documents and reference files gathered from this thread so the group can work from one place.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flexWrap: "wrap" }}>
            {driveFolderUrl && (
              <>
                <ResourceActionButton
                  label="Create Google Doc"
                  icon={<FilePlus2 size={16} strokeWidth={2.2} />}
                  active={mode === "create_google_doc"}
                  onClick={() => toggleMode("create_google_doc")}
                />
                <ResourceActionButton
                  label="Attach Drive Link"
                  icon={<Plus size={16} strokeWidth={2.2} />}
                  active={mode === "attach_drive_link"}
                  onClick={() => toggleMode("attach_drive_link")}
                />
                <a
                  href={driveFolderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.7rem 1rem",
                    borderRadius: "0.65rem",
                    backgroundColor: "var(--color-ijf-accent)",
                    color: "var(--color-ijf-bg)",
                    fontWeight: 700,
                    textDecoration: "none",
                    flexShrink: 0,
                  }}
                >
                  <FolderOpen size={16} strokeWidth={2.2} />
                  Open {groupName} Drive Folder
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "1.25rem 1.5rem 1.5rem",
          display: "grid",
          gap: "1.5rem",
        }}
      >
        {mode && (
          <div
            style={{
              padding: "1rem",
              borderRadius: "0.8rem",
              border: "1px solid rgba(228,185,91,0.28)",
              backgroundColor: "#fffaf0",
            }}
          >
            {mode === "create_google_doc" ? (
              <div style={{ display: "grid", gap: "0.9rem" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#111827" }}>
                    Create a Working Document
                  </h3>
                  <p style={{ marginTop: "0.25rem", fontSize: "0.82rem", color: "#6b7280" }}>
                    A new Google Doc will be created in the shared {groupName} Drive folder and pinned into Working Documents.
                  </p>
                </div>

                <label style={{ display: "grid", gap: "0.35rem" }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#374151" }}>
                    Document title
                  </span>
                  <input
                    value={docTitle}
                    onChange={(event) => setDocTitle(event.target.value)}
                    placeholder="e.g. Proposed programme draft"
                    style={{
                      width: "100%",
                      padding: "0.8rem 0.9rem",
                      borderRadius: "0.65rem",
                      border: "1px solid #d1d5db",
                      backgroundColor: "white",
                      color: "#111827",
                    }}
                  />
                </label>

                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={handleCreateGoogleDoc}
                    disabled={submitting}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.45rem",
                      padding: "0.75rem 1rem",
                      borderRadius: "0.65rem",
                      backgroundColor: "var(--color-ijf-accent)",
                      color: "var(--color-ijf-bg)",
                      fontWeight: 700,
                      cursor: submitting ? "not-allowed" : "pointer",
                      opacity: submitting ? 0.7 : 1,
                    }}
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <FilePlus2 size={16} strokeWidth={2.2} />}
                    Create and add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setMode(null);
                    }}
                    disabled={submitting}
                    style={{
                      padding: "0.75rem 1rem",
                      borderRadius: "0.65rem",
                      border: "1px solid #d1d5db",
                      backgroundColor: "white",
                      color: "#374151",
                      fontWeight: 700,
                      cursor: submitting ? "not-allowed" : "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "0.9rem" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#111827" }}>
                    Attach an Existing Drive Resource
                  </h3>
                  <p style={{ marginTop: "0.25rem", fontSize: "0.82rem", color: "#6b7280" }}>
                    Paste a Google Docs or Drive link and it will appear at the top of this thread as a shared resource.
                  </p>
                </div>

                <label style={{ display: "grid", gap: "0.35rem" }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#374151" }}>
                    Resource title
                  </span>
                  <input
                    value={linkTitle}
                    onChange={(event) => setLinkTitle(event.target.value)}
                    placeholder="e.g. Final venue brief"
                    style={{
                      width: "100%",
                      padding: "0.8rem 0.9rem",
                      borderRadius: "0.65rem",
                      border: "1px solid #d1d5db",
                      backgroundColor: "white",
                      color: "#111827",
                    }}
                  />
                </label>

                <label style={{ display: "grid", gap: "0.35rem" }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#374151" }}>
                    Google Docs or Drive URL
                  </span>
                  <input
                    value={linkUrl}
                    onChange={(event) => setLinkUrl(event.target.value)}
                    placeholder="https://docs.google.com/document/d/..."
                    style={{
                      width: "100%",
                      padding: "0.8rem 0.9rem",
                      borderRadius: "0.65rem",
                      border: "1px solid #d1d5db",
                      backgroundColor: "white",
                      color: "#111827",
                    }}
                  />
                </label>

                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={handleAttachLink}
                    disabled={submitting}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.45rem",
                      padding: "0.75rem 1rem",
                      borderRadius: "0.65rem",
                      backgroundColor: "var(--color-ijf-accent)",
                      color: "var(--color-ijf-bg)",
                      fontWeight: 700,
                      cursor: submitting ? "not-allowed" : "pointer",
                      opacity: submitting ? 0.7 : 1,
                    }}
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Link2 size={16} strokeWidth={2.2} />}
                    Add to resources
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setMode(null);
                    }}
                    disabled={submitting}
                    style={{
                      padding: "0.75rem 1rem",
                      borderRadius: "0.65rem",
                      border: "1px solid #d1d5db",
                      backgroundColor: "white",
                      color: "#374151",
                      fontWeight: 700,
                      cursor: submitting ? "not-allowed" : "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div
                style={{
                  marginTop: "0.9rem",
                  padding: "0.8rem 0.9rem",
                  borderRadius: "0.65rem",
                  backgroundColor: "#fef2f2",
                  color: "#991b1b",
                  fontSize: "0.84rem",
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            )}
          </div>
        )}

        {!mode && success && (
          <div
            style={{
              padding: "0.85rem 0.95rem",
              borderRadius: "0.75rem",
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#166534",
              fontSize: "0.84rem",
              fontWeight: 600,
            }}
          >
            {success}
          </div>
        )}

        <ResourceSection
          title="Working Documents"
          description="Google Docs, Sheets, Slides, or linked working materials the group is actively collaborating in."
          resources={workingDocuments}
          threadPath={threadPath}
          emptyMessage="No working documents have been linked into this thread yet."
        />

        <ResourceSection
          title="Reference Files"
          description="PDFs, Word documents, uploaded files, and other reference materials shared in the thread."
          resources={referenceFiles}
          threadPath={threadPath}
          emptyMessage="No reference files have been shared in this thread yet."
        />
      </div>
    </div>
  );
}
