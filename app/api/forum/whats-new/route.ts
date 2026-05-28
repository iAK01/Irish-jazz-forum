import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { DiscussionThreadModel } from "@/models/Discussionthread";
import { WorkingGroupModel } from "@/models/Workinggroup";
import {
  isPrivilegedForumRole,
  buildAccessibleThreadQuery,
  withForumVisitState,
} from "@/lib/forumDiscovery";
import { withReactionState } from "@/lib/reactions";
import mongoose from "mongoose";

interface WhatsNewGroup {
  _id: { toString(): string } | string;
  name: string;
  slug: string;
  isPrivate: boolean;
}

interface WhatsNewThread {
  _id: { toString(): string } | string;
  workingGroups?: Array<{ toString(): string } | string>;
  lastActivityAt: Date;
  reactions?: Parameters<typeof withReactionState>[0]["reactions"];
  [key: string]: unknown;
}

export async function GET() {
  try {
    const currentUser = await requireAuth();
    await dbConnect();

    // Use previousForumVisitAt as the baseline — this is the timestamp from
    // before the current session started, so "new" means new since last login
    const previousVisitAt =
      currentUser.previousForumVisitAt ?? currentUser.lastForumVisitAt ?? null;

    if (!previousVisitAt) {
      return NextResponse.json({
        success: true,
        data: [],
        meta: { previousForumVisitAt: null, count: 0 },
      });
    }

    const isPrivileged = isPrivilegedForumRole(currentUser.role);
    const userObjectId = new mongoose.Types.ObjectId(currentUser._id);

    // Fetch accessible groups to build a correct access query
    let groupQuery: any = { isActive: true, deleted: { $ne: true } };
    if (!isPrivileged) {
      groupQuery.$or = [
        { isPrivate: false },
        { members: userObjectId },
        { coordinator: userObjectId },
      ];
    }

    const groups = (await WorkingGroupModel.find(groupQuery)
      .select("_id name slug isPrivate coordinator members")
      .lean()) as unknown as WhatsNewGroup[];

    const allPublicGroupIds: string[] = [];
    const memberPrivateGroupIds: string[] = [];

    for (const group of groups) {
      const gid = group._id.toString();
      if (!group.isPrivate) {
        allPublicGroupIds.push(gid);
      } else {
        memberPrivateGroupIds.push(gid);
      }
    }

    const accessQuery = isPrivileged
      ? {}
      : buildAccessibleThreadQuery(currentUser, undefined, {
          allPublicGroupIds,
          memberPrivateGroupIds,
        });

    const threads = (await DiscussionThreadModel.find({
      deleted: { $ne: true },
      lastActivityAt: { $gt: new Date(previousVisitAt) },
      ...accessQuery,
    })
      .sort({ pinned: -1, lastActivityAt: -1 })
      .limit(100)
      .populate("createdBy", "name image email")
      .populate("lastReplyBy", "name image email")
      .lean()) as unknown as WhatsNewThread[];

    const groupIds = [
      ...new Set(
        threads.flatMap((thread) =>
          (thread.workingGroups || []).map((id) => id.toString())
        )
      ),
    ];

    const threadGroups = (groupIds.length
      ? await WorkingGroupModel.find({ _id: { $in: groupIds } })
          .select("name slug")
          .lean()
      : []) as unknown as WhatsNewGroup[];

    const groupMap = new Map(
      threadGroups.map((g) => [
        g._id.toString(),
        { name: g.name, slug: g.slug },
      ])
    );

    return NextResponse.json({
      success: true,
      data: threads.map((thread) => {
        const primaryGroupId = (thread.workingGroups || [])[0]?.toString() || null;
        const group = primaryGroupId ? groupMap.get(primaryGroupId) : null;

        return {
          ...withForumVisitState(
            withReactionState(thread, currentUser._id.toString()),
            previousVisitAt
          ),
          groupName: group?.name || "General Discussion",
          groupSlug: group?.slug || "general",
        };
      }),
      meta: {
        previousForumVisitAt: previousVisitAt,
        count: threads.length,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: message === "Unauthorized" ? 401 : 500 }
    );
  }
}
