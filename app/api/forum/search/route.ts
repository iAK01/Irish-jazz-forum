import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { DiscussionThreadModel } from "@/models/Discussionthread";
import { DiscussionPostModel } from "@/models/Discussionpost";
import { WorkingGroupModel } from "@/models/Workinggroup";
import { buildAccessibleThreadQuery } from "@/lib/forumDiscovery";
import { buildSearchSnippet, escapeRegExp } from "@/lib/html";

interface SearchGroup {
  _id: { toString(): string } | string;
  name: string;
  slug: string;
}

interface SearchThreadMatch {
  _id: { toString(): string } | string;
  workingGroups?: Array<{ toString(): string } | string>;
  title: string;
  slug: string;
  tags?: string[];
  lastActivityAt: Date;
  createdBy?: {
    name?: string;
    image?: string;
    email?: string;
  } | null;
}

interface SearchPostMatch {
  _id: { toString(): string } | string;
  content: string;
  thread: {
    _id: { toString(): string } | string;
    workingGroups?: Array<{ toString(): string } | string>;
    title: string;
    slug: string;
    lastActivityAt: Date;
  };
}

interface SearchResultItem {
  type: "thread" | "post";
  threadId: string;
  postId: string | null;
  title: string;
  threadSlug: string;
  matchedIn: "title" | "tag" | "reply";
  snippet: string;
  groupName: string;
  groupSlug: string;
  lastActivityAt: Date;
  createdBy: SearchThreadMatch["createdBy"] | null;
}

export async function GET(request: Request) {
  try {
    const currentUser = await requireAuth();
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();

    if (q.length < 2) {
      return NextResponse.json(
        { success: false, error: "Query must be at least 2 characters" },
        { status: 400 }
      );
    }

    const regex = new RegExp(escapeRegExp(q), "i");

    const threadMatches = (await DiscussionThreadModel.find({
      deleted: { $ne: true },
      ...buildAccessibleThreadQuery(currentUser),
      $or: [{ title: regex }, { tags: regex }],
    })
      .sort({ pinned: -1, lastActivityAt: -1 })
      .limit(20)
      .populate("createdBy", "name image email")
      .lean()) as unknown as SearchThreadMatch[];

    const postMatches = (await DiscussionPostModel.aggregate([
      {
        $match: {
          deleted: { $ne: true },
          content: regex,
        },
      },
      {
        $lookup: {
          from: DiscussionThreadModel.collection.name,
          localField: "threadId",
          foreignField: "_id",
          as: "thread",
        },
      },
      { $unwind: "$thread" },
      {
        $match: {
          "thread.deleted": { $ne: true },
          ...buildAccessibleThreadQuery(currentUser, "thread"),
        },
      },
      { $sort: { "thread.lastActivityAt": -1, createdAt: -1 } },
      { $limit: 20 },
    ])) as SearchPostMatch[];

    const groupIds = [
      ...new Set(
        [
          ...threadMatches.flatMap((thread) =>
            (thread.workingGroups || []).map((groupId) => groupId.toString())
          ),
          ...postMatches.flatMap((post) =>
            (post.thread.workingGroups || []).map((groupId) => groupId.toString())
          ),
        ]
      ),
    ];

    const groups = (groupIds.length
      ? await WorkingGroupModel.find({ _id: { $in: groupIds } })
          .select("name slug")
          .lean()
      : []) as unknown as SearchGroup[];

    const groupMap = new Map(
      groups.map((group) => [
        group._id.toString(),
        { name: group.name, slug: group.slug },
      ])
    );

    const threadResults: SearchResultItem[] = threadMatches.map((thread) => {
      const primaryGroupId = (thread.workingGroups || [])[0]?.toString() || null;
      const group = primaryGroupId ? groupMap.get(primaryGroupId) : null;

      return {
        type: "thread",
        threadId: thread._id.toString(),
        postId: null,
        title: thread.title,
        threadSlug: thread.slug,
        matchedIn: thread.title.match(regex) ? "title" : "tag",
        snippet:
          thread.tags && thread.tags.length > 0
            ? `Tags: ${thread.tags.join(", ")}`
            : "Thread match",
        groupName: group?.name || "General Discussion",
        groupSlug: group?.slug || "general",
        lastActivityAt: new Date(thread.lastActivityAt),
        createdBy: thread.createdBy || null,
      };
    });

    const seenPairs = new Set<string>();
    const postResults = postMatches
      .map((post): SearchResultItem | null => {
        const primaryGroupId = (post.thread.workingGroups || [])[0]?.toString() || null;
        const group = primaryGroupId ? groupMap.get(primaryGroupId) : null;
        const pairKey = `${post.thread._id.toString()}:${post._id.toString()}`;

        if (seenPairs.has(pairKey)) {
          return null;
        }

        seenPairs.add(pairKey);

        return {
          type: "post",
          threadId: post.thread._id.toString(),
          postId: post._id.toString(),
          title: post.thread.title,
          threadSlug: post.thread.slug,
          matchedIn: "reply",
          snippet: buildSearchSnippet(post.content, q),
          groupName: group?.name || "General Discussion",
          groupSlug: group?.slug || "general",
          lastActivityAt: new Date(post.thread.lastActivityAt),
          createdBy: null,
        };
      })
      .filter((result): result is SearchResultItem => result !== null);

    return NextResponse.json({
      success: true,
      data: [...threadResults, ...postResults]
        .sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime())
        .slice(0, 30),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { success: false, error: message },
      { status: message === "Unauthorized" ? 401 : 500 }
    );
  }
}
