import { UserRole } from "@/models/User";

type NormalizableId = string | { toString(): string };

export interface ForumDiscoveryUser {
  role: UserRole;
  workingGroups?: NormalizableId[];
  lastForumVisitAt?: Date | string | null;
  previousForumVisitAt?: Date | string | null;
}

export interface ForumActivityShape {
  lastActivityAt?: Date | string | null;
}

function fieldName(name: string, prefix?: string) {
  return prefix ? `${prefix}.${name}` : name;
}

export function normalizeGroupIds(groups?: NormalizableId[]) {
  return (groups || []).map((group) => group.toString());
}

export function isPrivilegedForumRole(role: UserRole) {
  return role === "super_admin" || role === "admin" || role === "steering";
}

export interface AccessibleThreadQueryOptions {
  /** IDs of all non-private groups — all threads in these are visible to every member */
  allPublicGroupIds?: string[];
  /** IDs of private groups the user is actually a member of (from WorkingGroup.members) */
  memberPrivateGroupIds?: string[];
}

/**
 * Build a MongoDB query that returns only threads the user is allowed to see.
 *
 * When options are supplied (preferred), they are used directly and publicToMembers
 * is NOT checked — all threads in public groups are visible to all authenticated members.
 *
 * When options are omitted (legacy fallback), the old behaviour using user.workingGroups
 * and publicToMembers is preserved for routes not yet updated.
 */
export function buildAccessibleThreadQuery(
  user: ForumDiscoveryUser,
  prefix?: string,
  options?: AccessibleThreadQueryOptions
) {
  if (isPrivilegedForumRole(user.role)) {
    return {};
  }

  if (options) {
    const { allPublicGroupIds = [], memberPrivateGroupIds = [] } = options;
    const conditions: Record<string, unknown>[] = [
      { [fieldName("workingGroups", prefix)]: { $size: 0 } },
    ];

    if (allPublicGroupIds.length > 0) {
      conditions.push({
        [fieldName("workingGroups", prefix)]: { $in: allPublicGroupIds },
      });
    }

    if (memberPrivateGroupIds.length > 0) {
      conditions.push({
        [fieldName("workingGroups", prefix)]: { $in: memberPrivateGroupIds },
      });
    }

    return { $or: conditions };
  }

  // Legacy fallback — uses User.workingGroups advisory field
  const groupIds = normalizeGroupIds(user.workingGroups);
  const query: Record<string, unknown>[] = [
    { [fieldName("workingGroups", prefix)]: { $size: 0 } },
    { [fieldName("publicToMembers", prefix)]: true },
  ];

  if (groupIds.length > 0) {
    query.push({ [fieldName("workingGroups", prefix)]: { $in: groupIds } });
  }

  return { $or: query };
}

export function isThreadNewSinceLastVisit(
  item: ForumActivityShape,
  lastForumVisitAt?: Date | string | null
) {
  if (!item.lastActivityAt || !lastForumVisitAt) {
    return false;
  }

  return (
    new Date(item.lastActivityAt).getTime() >
    new Date(lastForumVisitAt).getTime()
  );
}

export function withForumVisitState<T extends object>(
  item: T & ForumActivityShape,
  lastForumVisitAt?: Date | string | null
) {
  return {
    ...item,
    isNewSinceLastVisit: isThreadNewSinceLastVisit(item, lastForumVisitAt),
  };
}
