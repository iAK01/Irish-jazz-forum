import { requireAuth } from "@/lib/auth";
import { WorkingGroupModel } from "@/models/Workinggroup";

interface ThreadAccessShape {
  workingGroups?: Array<string | { toString(): string }>;
  publicToMembers?: boolean;
  deleted?: boolean;
}

/**
 * Check if a user is a member of any of the given working groups.
 * Uses WorkingGroup.members / .coordinator as the authoritative source.
 * User.workingGroups is never synced by the admin UI — do not use it.
 */
export async function isGroupMember(
  userId: string,
  groupIds: string[],
  userRole: string
): Promise<boolean> {
  if (
    userRole === "super_admin" ||
    userRole === "admin" ||
    userRole === "steering"
  ) {
    return true;
  }
  if (!groupIds.length) return false;

  const groups = await WorkingGroupModel.find({ _id: { $in: groupIds } })
    .select("members coordinator")
    .lean() as any[];

  return groups.some(
    (g) =>
      g.coordinator?.toString() === userId ||
      (g.members || []).some((m: any) => m.toString() === userId)
  );
}

export async function requireThreadAccess(thread: ThreadAccessShape) {
  const currentUser = await requireAuth();

  if (thread.deleted) {
    throw new Error("Item has been deleted");
  }

  const groupIds = (thread.workingGroups || []).map((g) => g.toString());

  if (groupIds.length === 0 || thread.publicToMembers) {
    return currentUser;
  }

  const hasAccess = await isGroupMember(
    currentUser._id.toString(),
    groupIds,
    currentUser.role
  );

  if (!hasAccess) {
    throw new Error("Access denied");
  }

  return currentUser;
}
