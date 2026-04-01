import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { DiscussionThreadModel } from "@/models/Discussionthread";
import { WorkingGroupModel } from "@/models/Workinggroup";
import {
  buildAccessibleThreadQuery,
  withForumVisitState,
} from "@/lib/forumDiscovery";
import { withReactionState } from "@/lib/reactions";

interface WhatsNewGroup {
  _id: { toString(): string } | string;
  name: string;
  slug: string;
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

    if (!currentUser.lastForumVisitAt) {
      return NextResponse.json({
        success: true,
        data: [],
        meta: {
          lastForumVisitAt: null,
          count: 0,
        },
      });
    }

    const threads = (await DiscussionThreadModel.find({
      deleted: { $ne: true },
      lastActivityAt: { $gt: new Date(currentUser.lastForumVisitAt) },
      ...buildAccessibleThreadQuery(currentUser),
    })
      .sort({ pinned: -1, lastActivityAt: -1 })
      .limit(50)
      .populate("createdBy", "name image email")
      .populate("lastReplyBy", "name image email")
      .lean()) as unknown as WhatsNewThread[];

    const groupIds = [
      ...new Set(
        threads.flatMap((thread) =>
          (thread.workingGroups || []).map((groupId) => groupId.toString())
        )
      ),
    ];

    const groups = (groupIds.length
      ? await WorkingGroupModel.find({ _id: { $in: groupIds } })
          .select("name slug")
          .lean()
      : []) as unknown as WhatsNewGroup[];

    const groupMap = new Map(
      groups.map((group) => [
        group._id.toString(),
        { name: group.name, slug: group.slug },
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
            currentUser.lastForumVisitAt
          ),
          groupName: group?.name || "General Discussion",
          groupSlug: group?.slug || "general",
        };
      }),
      meta: {
        lastForumVisitAt: currentUser.lastForumVisitAt,
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
