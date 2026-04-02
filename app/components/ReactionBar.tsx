"use client";

import { useEffect, useState } from "react";
import { enqueue } from "@/lib/offlineQueue";
import { BadgeCheck, HandHeart, ThumbsUp } from "lucide-react";

type ReactionType = "like" | "agree" | "thanks";

interface ReactionSummary {
  counts: Record<ReactionType, number>;
  total: number;
}

interface ReactionResponse {
  reactionSummary: ReactionSummary;
  currentUserReaction: ReactionType | null;
}

interface ReactionBarProps {
  targetType: "thread" | "post";
  targetId: string;
  reactionSummary: ReactionSummary;
  currentUserReaction: ReactionType | null;
  variant?: "light" | "dark";
  onChange?: (nextState: ReactionResponse) => void;
}

const REACTIONS: Array<{ type: ReactionType; label: string }> = [
  { type: "like", label: "Like" },
  { type: "agree", label: "Agree" },
  { type: "thanks", label: "Thanks" },
];

const REACTION_ICONS = {
  like: ThumbsUp,
  agree: BadgeCheck,
  thanks: HandHeart,
} satisfies Record<ReactionType, typeof ThumbsUp>;

interface ReactionSummaryInlineProps {
  reactionSummary: ReactionSummary;
  variant?: "light" | "dark";
  size?: "sm" | "md";
}

export function ReactionSummaryInline({
  reactionSummary,
  variant = "light",
  size = "sm",
}: ReactionSummaryInlineProps) {
  const visibleReactions = REACTIONS.filter(
    ({ type }) => reactionSummary.counts[type] > 0
  );

  if (visibleReactions.length === 0) {
    return null;
  }

  const isDark = variant === "dark";
  const iconSize = size === "md" ? 14 : 12;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }}>
      {visibleReactions.map(({ type, label }) => {
        const Icon = REACTION_ICONS[type];
        const count = reactionSummary.counts[type];

        return (
          <span
            key={type}
            title={`${count} ${label.toLowerCase()} reaction${count === 1 ? "" : "s"}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              padding: "0.12rem 0.42rem",
              borderRadius: "9999px",
              border: "1px solid",
              fontSize: size === "md" ? "0.75rem" : "0.6875rem",
              fontWeight: 600,
              backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#f8fafc",
              color: isDark ? "#e5e7eb" : "#4b5563",
              borderColor: isDark ? "rgba(255,255,255,0.12)" : "#e5e7eb",
            }}
          >
            <Icon size={iconSize} strokeWidth={2} />
            <span>{count}</span>
          </span>
        );
      })}
    </div>
  );
}

export default function ReactionBar({
  targetType,
  targetId,
  reactionSummary,
  currentUserReaction,
  variant = "light",
  onChange,
}: ReactionBarProps) {
  const [state, setState] = useState<ReactionResponse>({
    reactionSummary,
    currentUserReaction,
  });
  const [pendingReaction, setPendingReaction] = useState<ReactionType | null>(null);

  useEffect(() => {
    setState({ reactionSummary, currentUserReaction });
  }, [reactionSummary, currentUserReaction]);

  const isDark = variant === "dark";

  const handleReaction = async (reactionType: ReactionType) => {
    setPendingReaction(reactionType);

    // Optimistic update
    const prev = state;
    const isRemoving = state.currentUserReaction === reactionType;
    const nextReaction = isRemoving ? null : reactionType;
    const nextCounts = { ...state.reactionSummary.counts };
    if (isRemoving) {
      nextCounts[reactionType] = Math.max(0, (nextCounts[reactionType] || 0) - 1);
    } else {
      if (state.currentUserReaction) {
        nextCounts[state.currentUserReaction] = Math.max(0, (nextCounts[state.currentUserReaction] || 0) - 1);
      }
      nextCounts[reactionType] = (nextCounts[reactionType] || 0) + 1;
    }
    const optimistic = {
      reactionSummary: {
        counts: nextCounts,
        total: Object.values(nextCounts).reduce((a, b) => a + b, 0),
      },
      currentUserReaction: nextReaction,
    };
    setState(optimistic);
    onChange?.(optimistic);

    // Queue if offline — optimistic state is already applied
    if (!navigator.onLine) {
      const url = `/api/${targetType === "thread" ? "threads" : "posts"}/${targetId}/reactions`;
      await enqueue({
        type: "reaction",
        url,
        method: "POST",
        body: JSON.stringify({ reactionType }),
        queuedAt: Date.now(),
        label: `${reactionType} reaction`,
      });
      setPendingReaction(null);
      return;
    }

    try {
      const response = await fetch(
        `/api/${targetType === "thread" ? "threads" : "posts"}/${targetId}/reactions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reactionType }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to update reaction");
      }

      const nextState = {
        reactionSummary: result.data.reactionSummary,
        currentUserReaction: result.data.currentUserReaction,
      };

      setState(nextState);
      onChange?.(nextState);
    } catch (error) {
      console.error("Reaction update failed:", error);
      // Revert optimistic update on error
      setState(prev);
      onChange?.(prev);
    } finally {
      setPendingReaction(null);
    }
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
      {REACTIONS.map(({ type, label }) => {
        const count = state.reactionSummary.counts[type] || 0;
        const isActive = state.currentUserReaction === type;
        const isPending = pendingReaction === type;
        const Icon = REACTION_ICONS[type];
        const tooltip = count > 0 ? `${label} (${count})` : label;

        return (
          <button
            key={type}
            type="button"
            onClick={() => handleReaction(type)}
            disabled={pendingReaction !== null}
            title={tooltip}
            aria-label={tooltip}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.42rem 0.62rem",
              borderRadius: "9999px",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: pendingReaction !== null ? "not-allowed" : "pointer",
              border: "1px solid",
              opacity: isPending ? 0.7 : 1,
              transition: "all 0.15s ease",
              backgroundColor: isActive
                ? isDark
                  ? "rgba(228,185,91,0.22)"
                  : "rgba(228,185,91,0.14)"
                : isDark
                  ? "rgba(255,255,255,0.08)"
                  : "#ffffff",
              color: isActive
                ? isDark
                  ? "var(--color-ijf-accent)"
                  : "#8a6612"
                : isDark
                  ? "#d1d5db"
                  : "#4b5563",
              borderColor: isActive
                ? isDark
                  ? "rgba(228,185,91,0.45)"
                  : "rgba(228,185,91,0.3)"
                : isDark
                  ? "rgba(255,255,255,0.12)"
                  : "#d1d5db",
            }}
          >
            <Icon size={15} strokeWidth={2.2} />
            <span
              style={{
                minWidth: count > 0 ? "1.1rem" : undefined,
                textAlign: "center",
                color: isActive
                  ? isDark
                    ? "var(--color-ijf-accent)"
                    : "#8a6612"
                  : isDark
                    ? "#f3f4f6"
                    : "#111827",
              }}
            >
              {count > 0 ? count : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
