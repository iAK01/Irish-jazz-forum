import { requireAuth } from "@/lib/auth";

interface ThreadAccessShape {
  workingGroups?: Array<string | { toString(): string }>;
  publicToMembers?: boolean;
  deleted?: boolean;
}

export async function requireThreadAccess(thread: ThreadAccessShape) {
  const currentUser = await requireAuth();

  if (thread.deleted) {
    throw new Error("Item has been deleted");
  }

  const groupIds = (thread.workingGroups || []).map((group) => group.toString());

  if (groupIds.length === 0 || thread.publicToMembers) {
    return currentUser;
  }

  const hasAccess =
    currentUser.role === "super_admin" ||
    currentUser.role === "admin" ||
    currentUser.role === "steering" ||
    groupIds.some((groupId) =>
      (currentUser.workingGroups || [])
        .map((group: string | { toString(): string }) => group.toString())
        .includes(groupId)
    );

  if (!hasAccess) {
    throw new Error("Access denied");
  }

  return currentUser;
}
