import { Types } from "mongoose";

export const REACTION_TYPES = ["like", "agree", "thanks"] as const;

export type ReactionType = (typeof REACTION_TYPES)[number];

export interface StoredReaction {
  userId: Types.ObjectId | string;
  type: ReactionType;
  createdAt: Date;
}

export interface ReactionSummary {
  counts: Record<ReactionType, number>;
  total: number;
}

export interface ReactionState {
  reactionSummary: ReactionSummary;
  currentUserReaction: ReactionType | null;
}

export function withReactionState<T extends { reactions?: StoredReaction[] }>(
  item: T,
  currentUserId?: string | null
): Omit<T, "reactions"> & ReactionState {
  const { reactions, ...rest } = item;
  return {
    ...rest,
    ...buildReactionState(reactions, currentUserId),
  };
}

export function isReactionType(value: unknown): value is ReactionType {
  return (
    typeof value === "string" &&
    (REACTION_TYPES as readonly string[]).includes(value)
  );
}

export function createEmptyReactionSummary(): ReactionSummary {
  return {
    counts: {
      like: 0,
      agree: 0,
      thanks: 0,
    },
    total: 0,
  };
}

export function buildReactionState(
  reactions: StoredReaction[] | undefined,
  currentUserId?: string | null
): ReactionState {
  const reactionSummary = createEmptyReactionSummary();
  let currentUserReaction: ReactionType | null = null;

  for (const reaction of reactions || []) {
    if (!isReactionType(reaction.type)) continue;

    reactionSummary.counts[reaction.type] += 1;
    reactionSummary.total += 1;

    if (
      currentUserId &&
      reaction.userId?.toString() === currentUserId &&
      currentUserReaction === null
    ) {
      currentUserReaction = reaction.type;
    }
  }

  return { reactionSummary, currentUserReaction };
}

export function toggleReaction(
  reactions: StoredReaction[] | undefined,
  userId: string,
  reactionType: ReactionType
): StoredReaction[] {
  const nextReactions = [...(reactions || [])];
  const existingIndex = nextReactions.findIndex(
    (reaction) => reaction.userId?.toString() === userId
  );

  if (existingIndex === -1) {
    nextReactions.push({
      userId,
      type: reactionType,
      createdAt: new Date(),
    });
    return nextReactions;
  }

  if (nextReactions[existingIndex].type === reactionType) {
    nextReactions.splice(existingIndex, 1);
    return nextReactions;
  }

  nextReactions[existingIndex] = {
    ...nextReactions[existingIndex],
    type: reactionType,
  };

  return nextReactions;
}
