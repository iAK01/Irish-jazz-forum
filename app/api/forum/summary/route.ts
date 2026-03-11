// /app/api/forum/summary/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { WorkingGroupModel } from "@/models/Workinggroup";
import { DiscussionThreadModel } from "@/models/Discussionthread";
import { requireAuth } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET() {
  try {
    const currentUser = await requireAuth();
    await dbConnect();

    const isPrivileged =
      currentUser.role === "super_admin" ||
      currentUser.role === "admin" ||
      currentUser.role === "steering";

    // --- 1. Fetch accessible working groups ---
    let groupQuery: any = { isActive: true, deleted: { $ne: true } };

    if (!isPrivileged) {
      const userObjectId = new mongoose.Types.ObjectId(currentUser._id);

      const userGroupIds = (currentUser.workingGroups || []).map(
        (id: string) => new mongoose.Types.ObjectId(id)
      );

      groupQuery.$or = [
        { isPrivate: false },
        { members: userObjectId },
        { coordinator: userObjectId },
        { _id: { $in: userGroupIds } },
      ];
    }

    const groups = await WorkingGroupModel.find(groupQuery)
      .populate("coordinator", "name email image lastSeenAt")
      .populate("members", "name email image lastSeenAt")
      .sort({ name: 1 })
      .lean();

    // workingGroups field on threads stores ObjectId strings — match exactly as threads API does
    const groupIds = groups.map((g: any) => g._id.toString());

    // --- 2. General thread count — threads with workingGroups: [] (empty array) ---
    const generalThreadCount = await DiscussionThreadModel.countDocuments({
      workingGroups: { $size: 0 },
      deleted: { $ne: true },
    });

    // --- 3. Per-group counts — query by ObjectId string, exactly as threads GET does ---
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

    // If user is a member, also count private threads they can see
    let memberThreadCounts: number[] = [];
    if (!isPrivileged && groupIds.length > 0) {
      memberThreadCounts = await Promise.all(
        groupIds.map((groupId: string) =>
          DiscussionThreadModel.countDocuments({
            workingGroups: groupId,
            deleted: { $ne: true },
          })
        )
      );
    }

    const finalThreadCounts =
      !isPrivileged && memberThreadCounts.length > 0
        ? memberThreadCounts
        : groupThreadCounts;

    // --- 4. Collect all unique members across all groups ---
    const memberMap = new Map<string, any>();
    for (const group of groups) {
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

    const allMembers = [...memberMap.values()];

    // --- 5. Build group stats ---
    const workingGroupStats = groups.map((group: any, index: number) => ({
      _id: group._id,
      slug: group.slug,
      name: group.name,
      description: group.description,
      isPrivate: group.isPrivate,
      threadCount: finalThreadCounts[index] || 0,
      lastActivityAt: (lastActivityResults[index] as any)?.lastActivityAt || null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        generalThreadCount,
        workingGroups: workingGroupStats,
        members: allMembers,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}