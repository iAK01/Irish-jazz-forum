"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";

interface SearchResult {
  type: "thread" | "post";
  threadId: string;
  postId: string | null;
  title: string;
  threadSlug: string;
  matchedIn: string;
  snippet: string;
  groupName: string;
  groupSlug: string;
  lastActivityAt: string;
}

function formatRelative(dateString: string) {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffHours < 24) {
    return `${Math.max(Math.floor(diffMs / 60000), 1)}m ago`;
  }

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return date.toLocaleDateString("en-IE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ForumSearchPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(Boolean(initialQuery));
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialQuery.trim().length >= 2) {
      runSearch(initialQuery);
    }
  }, [initialQuery]);

  const runSearch = async (nextQuery: string) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/forum/search?q=${encodeURIComponent(nextQuery)}`
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Search failed");
      }

      setResults(result.data || []);
    } catch (err: unknown) {
      setResults([]);
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setError("Search needs at least 2 characters.");
      setResults([]);
      return;
    }

    router.replace(`/dashboard/forum/search?q=${encodeURIComponent(trimmed)}`);
    await runSearch(trimmed);
  };

  return (
    <DashboardLayout title="Forum Search" userName={session?.user?.name || ""}>
      <div style={{ maxWidth: "72rem", margin: "0 auto" }}>
        <div style={{ marginBottom: "1.25rem" }}>
          <Link href="/dashboard/forum" className="hover:underline" style={{ color: "var(--color-ijf-accent)", fontSize: "0.875rem" }}>
            ← Back to Forum
          </Link>
        </div>

        <div
          style={{
            marginBottom: "1.5rem",
            padding: "1.5rem 2rem",
            borderRadius: "0.75rem",
            background: "linear-gradient(135deg, var(--color-ijf-bg) 0%, #1a1f2e 100%)",
          }}
        >
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "white", margin: 0 }}>
            Search The Forum
          </h1>
          <p style={{ color: "#d1d5db", marginTop: "0.5rem" }}>
            Search thread titles, tags, and reply content across the forum.
          </p>

          <form onSubmit={handleSubmit} style={{ marginTop: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search discussions, replies, tags..."
              style={{
                flex: 1,
                minWidth: "16rem",
                padding: "0.85rem 1rem",
                borderRadius: "0.625rem",
                border: "1px solid rgba(255,255,255,0.12)",
                backgroundColor: "rgba(255,255,255,0.08)",
                color: "white",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "0.85rem 1.25rem",
                borderRadius: "0.625rem",
                backgroundColor: "var(--color-ijf-accent)",
                color: "var(--color-ijf-bg)",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Search
            </button>
          </form>
        </div>

        {error && (
          <div style={{ marginBottom: "1rem", padding: "1rem", borderRadius: "0.75rem", backgroundColor: "#fef2f2", color: "#991b1b" }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem 0", color: "#6b7280" }}>
            Searching...
          </div>
        ) : results.length === 0 ? (
          <div style={{ padding: "2rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", backgroundColor: "white" }}>
            <p style={{ color: "#374151", fontWeight: 600, marginBottom: "0.4rem" }}>
              {initialQuery ? "No results found." : "Start with a search term."}
            </p>
            <p style={{ color: "#6b7280" }}>
              Try a topic, working group theme, or a phrase from a reply.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {results.map((result) => {
              const hrefBase =
                result.groupSlug === "general"
                  ? `/dashboard/forum/general/${result.threadSlug}`
                  : `/dashboard/forum/${result.groupSlug}/${result.threadSlug}`;
              const href = result.postId ? `${hrefBase}#post-${result.postId}` : hrefBase;

              return (
                <Link
                  key={`${result.type}-${result.postId || result.threadId}`}
                  href={href}
                  style={{
                    display: "block",
                    textDecoration: "none",
                    color: "inherit",
                    backgroundColor: "white",
                    borderRadius: "0.75rem",
                    border: "1px solid #e5e7eb",
                    padding: "1rem 1.15rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.45rem" }}>
                    <span style={{ padding: "0.12rem 0.55rem", borderRadius: "9999px", backgroundColor: result.type === "post" ? "#eef2ff" : "#f3f4f6", color: result.type === "post" ? "#4338ca" : "#374151", fontSize: "0.72rem", fontWeight: 700 }}>
                      {result.type === "post" ? "Reply match" : "Thread match"}
                    </span>
                    <span style={{ fontSize: "0.76rem", color: "#6b7280", fontWeight: 600 }}>
                      {result.groupName}
                    </span>
                    <span style={{ color: "#d1d5db" }}>•</span>
                    <span style={{ fontSize: "0.76rem", color: "#9ca3af" }}>
                      {formatRelative(result.lastActivityAt)}
                    </span>
                  </div>

                  <h2 style={{ margin: 0, color: "#111827", fontSize: "1rem", fontWeight: 700 }}>
                    {result.title}
                  </h2>

                  <p style={{ marginTop: "0.45rem", marginBottom: 0, color: "#4b5563", lineHeight: 1.55 }}>
                    {result.snippet}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
