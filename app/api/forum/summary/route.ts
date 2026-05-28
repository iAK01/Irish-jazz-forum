import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { WorkingGroupModel } from "@/models/Workinggroup";
import { DiscussionThreadModel } from "@/models/Discussionthread";
import { requireAuth } from "@/lib/auth";
import { isPrivilegedForumRole, buildAccessibleThreadQuery } from "@/lib/forumDiscovery";
import mongoose from "mongoose";

export async function GET() {
  try {
    const currentUser = await requireAuth();
    await dbConnect();

    const isPrivileged = isPrivilegedForumRole(currentUser.role);
    const userObjectId = new mongoose.Types.ObjectId(currentUser._id);

    // --- 1. Fetch accessible working groups ---
    let groupQuery: any = { isActive: true, deleted: { $ne: true } };

    if (!isPrivileged) {
      groupQuery.$or = [
        { isPrivate: false },
        { members: userObjectId },
        { coordinator: userObjectId },
      ];
    }

    const groups = await WorkingGroupModel.find(groupQuery)
      .populate("coordinator", "name email image lastSeenAt _id")
      .populate("members", "name email image lastSeenAt _id")
      .sort({ name: 1 })
      .lean();

    // Split groups into public and private (for access query)
    const allPublicGroupIds: string[] = [];
    const memberPrivateGroupIds: string[] = [];

    for (const group of groups as any[]) {
      const gid = group._id.toString();
      if (!group.isPrivate) {
        allPublicGroupIds.push(gid);
      } else {
        const isCoord = group.coordinator?._id?.toString() === currentUser._id.toString();
        const isMem = (group.members || []).some(
          (m: any) => m._id?.toString() === currentUser._id.toString()
        );
        if (isCoord || isMem || isPrivileged) {
          memberPrivateGroupIds.push(gid);
        }
      }
    }

    const groupIds = groups.map((g: any) => g._id.toString());

    // Use previousForumVisitAt as the "new since last visit" baseline
    const previousVisitAt = currentUser.previousForumVisitAt ?? currentUser.lastForumVisitAt ?? null;

    // --- 2. General thread count ---
    const generalThreadCount = await DiscussionThreadModel.countDocuments({
      workingGroups: { $size: 0 },
      deleted: { $ne: true },
    });

    // --- 3. Per-group counts + last activity ---
    const [groupThreadCounts, lastActivityResults] = await Promise.all([
      Promise.all(
        groupIds.map((groupId: string) =>
          DiscussionThreadModel.countDocuments({
            workingGroups: groupId,
            deleted: { $ne: true },
          })
        )
      ),
      Promise.all(
        groupIds.map((groupId: string) =>
          DiscussionThreadModel.findOne({
            workingGroups: groupId,
            deleted: { $ne: true },
          })
            .sort({ lastActivityAt: -1 })
            .select("lastActivityAt")
            .lean()
        )
      ),
    ]);

    // --- 4. "New since last visit" counts using previousForumVisitAt ---
    let whatsNewCount = 0;
    let generalNewThreadCount = 0;
    let groupNewThreadCounts: number[] = groupIds.map(() => 0);

    if (previousVisitAt) {
      const accessQuery = isPrivileged
        ? {}
        : buildAccessibleThreadQuery(currentUser, undefined, {
            allPublicGroupIds,
            memberPrivateGroupIds,
          });

      const freshThreads = await DiscussionThreadModel.find({
        deleted: { $ne: true },
        lastActivityAt: { $gt: new Date(previousVisitAt) },
        ...accessQuery,
      })
        .select("workingGroups")
        .lean();

      whatsNewCount = freshThreads.length;
      generalNewThreadCount = freshThreads.filter(
        (t: any) => !t.workingGroups || t.workingGroups.length === 0
      ).length;
      groupNewThreadCounts = groupIds.map((groupId: string) =>
        freshThreads.filter((t: any) =>
          (t.workingGroups || []).map((v: any) => v.toString()).includes(groupId)
        ).length
      );
    }

    // --- 5. Collect all unique members across all groups ---
    const memberMap = new Map<string, any>();
    for (const group of groups as any[]) {
      const everyone = [
        ...(group.coordinator ? [group.coordinator] : []),
        ...((group.members as any[]) || []),
      ];
      for (const m of everyone) {
        if (m && m._id && !memberMap.has(m._id.toString())) {
          memberMap.set(m._id.toString(), {
            _id: m._id.toString(),
            name: m.name,
            image: m.image,
            lastSeenAt: m.lastSeenAt,
          });
        }
      }
    }

    // --- 6. Build group stats, including isCoordinator and isMember for current user ---
    const workingGroupStats = (groups as any[]).map((group, index) => {
      const coordId = group.coordinator?._id?.toString();
      const isCoordinator = coordId === currentUser._id.toString();
      const isMember =
        isCoordinator ||
        (group.members || []).some(
          (m: any) => m._id?.toString() === currentUser._id.toString()
        );

      const memberList = (group.members || []).map((m: any) => ({
        _id: m._id?.toString(),
        name: m.name,
        image: m.image || null,
      }));

      return {
        _id: group._id,
        slug: group.slug,
        name: group.name,
        description: group.description,
        isPrivate: group.isPrivate,
        googleDriveFolderId: group.googleDriveFolderId || null,
        coordinatorId: coordId || null,
        coordinatorName: group.coordinator?.name || null,
        coordinatorImage: group.coordinator?.image || null,
        currentFocus: group.currentFocus || "",
        isCoordinator,
        isMember,
        memberCount: memberList.length,
        members: memberList,
        threadCount: groupThreadCounts[index] || 0,
        newThreadCount: groupNewThreadCounts[index] || 0,
        lastActivityAt: (lastActivityResults[index] as any)?.lastActivityAt || null,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        generalThreadCount,
        generalNewThreadCount,
        whatsNewCount,
        previousForumVisitAt: previousVisitAt,
        workingGroups: workingGroupStats,
        members: [...memberMap.values()],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
