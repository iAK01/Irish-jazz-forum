import { UserRole } from "@/models/User";

type NormalizableId = string | { toString(): string };

export interface ForumDiscoveryUser {
  role: UserRole;
  workingGroups?: NormalizableId[];
  lastForumVisitAt?: Date | string | null;
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

export function buildAccessibleThreadQuery(
  user: ForumDiscoveryUser,
  prefix?: string
) {
  if (isPrivilegedForumRole(user.role)) {
    return {};
  }

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

export function withForumVisitState<T extends ForumActivityShape>(
  item: T,
  lastForumVisitAt?: Date | string | null
) {
  return {
    ...item,
    isNewSinceLastVisit: isThreadNewSinceLastVisit(item, lastForumVisitAt),
  };
}
