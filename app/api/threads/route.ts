// /app/api/threads/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { DiscussionThreadModel } from "@/models/Discussionthread";
import { WorkingGroupModel } from "@/models/Workinggroup";
import { UserModel } from "@/models/User";
import { requireAuth } from "@/lib/auth";
import { parseMentionIds } from "@/lib/parseMentions";
import { withReactionState } from "@/lib/reactions";
import { sendMentionNotificationEmail } from "@/lib/email";
import slugify from "slugify";

export async function GET(request: Request) {
  try {
    const currentUser = await requireAuth();
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const workingGroup = searchParams.get("workingGroup");

    if (!workingGroup) {
      return NextResponse.json(
        { success: false, error: "workingGroup parameter required" },
        { status: 400 }
      );
    }

    let groupId: string | null = null;

    if (workingGroup !== "general") {
      const group = await WorkingGroupModel.findOne({ slug: workingGroup }).lean() as any;

      if (!group) {
        return NextResponse.json(
          { success: false, error: "Working group not found" },
          { status: 404 }
        );
      }

      groupId = group._id.toString();
    }

    let query;

    if (workingGroup === "general") {
      query = { workingGroups: { $size: 0 }, deleted: { $ne: true } };
    } else {
      const isMember =
        currentUser.role === "super_admin" ||
        currentUser.role === "admin" ||
        currentUser.role === "steering" ||
        (currentUser.workingGroups || [])
          .map((g: any) => g.toString())
          .includes(groupId);

      if (isMember) {
        query = { workingGroups: groupId, deleted: { $ne: true } };
      } else {
        query = {
          workingGroups: groupId,
          publicToMembers: true,
          deleted: { $ne: true },
        };
      }
    }

    const threads = await DiscussionThreadModel.find(query)
      .sort({ pinned: -1, lastActivityAt: -1 })
      .populate("createdBy", "name image email")
      .populate("lastReplyBy", "name image email")
      .lean();

    return NextResponse.json({
      success: true,
      data: threads.map((thread: any) =>
        withReactionState(thread, currentUser._id.toString())
      ),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuth();
    await dbConnect();

    const body = await request.json();
    const { workingGroups, title, tags, content, attachments, publicToMembers } = body;

    if (!Array.isArray(workingGroups)) {
      return NextResponse.json(
        { success: false, error: "workingGroups must be an array" },
        { status: 400 }
      );
    }

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Title required" },
        { status: 400 }
      );
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Content required" },
        { status: 400 }
      );
    }

    let groupIds: string[] = [];
    let resolvedGroups: any[] = [];

    if (workingGroups.length > 0) {
      resolvedGroups = await WorkingGroupModel.find({
        slug: { $in: workingGroups },
      }).lean() as any[];

      if (!resolvedGroups.length) {
        return NextResponse.json(
          { success: false, error: "Working group not found" },
          { status: 404 }
        );
      }

      groupIds = resolvedGroups.map((g) => g._id.toString());

      const hasAccess = groupIds.some(
        (gid: string) =>
          currentUser.role === "super_admin" ||
          currentUser.role === "admin" ||
          currentUser.role === "steering" ||
          (currentUser.workingGroups || [])
            .map((g: any) => g.toString())
            .includes(gid)
      );

      if (!hasAccess) {
        return NextResponse.json(
          {
            success: false,
            error: "Access denied to create threads in these working groups",
          },
          { status: 403 }
        );
      }
    }

    const baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await DiscussionThreadModel.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const thread = await DiscussionThreadModel.create({
      workingGroups: groupIds,
      publicToMembers: publicToMembers === true,
      title: title.trim(),
      slug,
      createdBy: currentUser._id,
      lastReplyBy: currentUser._id,
      lastActivityAt: new Date(),
      status: "active",
      pinned: false,
      replyCount: 0,
      viewCount: 0,
      tags: tags || [],
    });

    const DiscussionPostModel =
      require("@/models/Discussionpost").DiscussionPostModel;

    // Parse mention IDs from the initial post content
    const mentionIds = parseMentionIds(content);

    await DiscussionPostModel.create({
      threadId: thread._id,
      content: content.trim(),
      createdBy: currentUser._id,
      attachments: attachments || [],
      mentions: mentionIds,
      deleted: false,
    });

    const populatedThread = await DiscussionThreadModel.findById(thread._id)
      .populate("createdBy", "name image email")
      .populate("lastReplyBy", "name image email")
      .lean();

    // Fire mention emails — non-blocking, never breaks the response
    if (mentionIds.length > 0) {
      (async () => {
        try {
          const forumPath =
            resolvedGroups.length > 0 ? resolvedGroups[0].slug : "general";
          const threadUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/forum/${forumPath}/${slug}`;

          const mentionedUsers = await UserModel.find({
            _id: { $in: mentionIds },
          })
            .select("name email")
            .lean() as any[];

          for (const user of mentionedUsers) {
            if (!user.email) continue;
            try {
              await sendMentionNotificationEmail({
                to: user.email,
                mentionedName: user.name,
                mentionerName: currentUser.name,
                threadTitle: title.trim(),
                threadUrl,
              });
            } catch (err) {
              console.error(`Failed to send mention email to ${user.email}:`, err);
            }
          }
        } catch (err) {
          console.error("Mention notification block failed:", err);
        }
      })();
    }

    return NextResponse.json({
      success: true,
      data: withReactionState(
        populatedThread as any,
        currentUser._id.toString()
      ),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
