// /app/api/threads/[threadId]/posts/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { DiscussionThreadModel } from "@/models/Discussionthread";
import { DiscussionPostModel } from "@/models/Discussionpost";
import { UserModel } from "@/models/User";
import { WorkingGroupModel } from "@/models/Workinggroup";
import { requireAuth } from "@/lib/auth";
import { requireThreadAccess } from "@/lib/forumAccess";
import { parseMentionIds } from "@/lib/parseMentions";
import { withReactionState } from "@/lib/reactions";
import { sendMentionNotificationEmail } from "@/lib/email";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const currentUser = await requireAuth();
    await dbConnect();
    const { threadId } = await params;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const thread = await DiscussionThreadModel.findById(threadId).lean() as any;

    if (!thread) {
      return NextResponse.json(
        { success: false, error: "Thread not found" },
        { status: 404 }
      );
    }

    if (thread.deleted) {
      return NextResponse.json(
        { success: false, error: "Thread has been deleted" },
        { status: 404 }
      );
    }

    await requireThreadAccess(thread);

    const posts = await DiscussionPostModel.find({
      threadId: threadId,
      deleted: { $ne: true },
    })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name image email")
      .populate("editedBy", "name email")
      .lean();

    const totalPosts = await DiscussionPostModel.countDocuments({
      threadId: threadId,
      deleted: { $ne: true },
    });

    return NextResponse.json({
      success: true,
      data: posts.map((post: any) =>
        withReactionState(post, currentUser._id.toString())
      ),
      pagination: {
        page,
        limit,
        total: totalPosts,
        hasMore: skip + posts.length < totalPosts,
      },
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const currentUser = await requireAuth();
    await dbConnect();
    const { threadId } = await params;

    const body = await request.json();
    const { content, attachments } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Content required" },
        { status: 400 }
      );
    }

    const thread = await DiscussionThreadModel.findById(threadId).lean() as any;

    if (!thread) {
      return NextResponse.json(
        { success: false, error: "Thread not found" },
        { status: 404 }
      );
    }

    if (thread.deleted) {
      return NextResponse.json(
        { success: false, error: "Cannot reply to deleted thread" },
        { status: 400 }
      );
    }

    await requireThreadAccess(thread);

    // Parse mention IDs from the HTML content
    const mentionIds = parseMentionIds(content);

    const post = await DiscussionPostModel.create({
      threadId: threadId,
      content: content.trim(),
      createdBy: currentUser._id,
      attachments: attachments || [],
      mentions: mentionIds,
      deleted: false,
    });

    await DiscussionThreadModel.findByIdAndUpdate(threadId, {
      $inc: { replyCount: 1 },
      lastActivityAt: new Date(),
      lastReplyBy: currentUser._id,
    });

    const populatedPost = await DiscussionPostModel.findById(post._id)
      .populate("createdBy", "name image email")
      .lean();

    // Fire mention emails — non-blocking, never breaks the response
    if (mentionIds.length > 0) {
      (async () => {
        try {
          // Resolve working group slug for the thread URL
          let forumPath = "general";
          if (thread.workingGroups && thread.workingGroups.length > 0) {
            const wg = await WorkingGroupModel.findById(
              thread.workingGroups[0]
            )
              .select("slug")
              .lean() as any;
            if (wg?.slug) forumPath = wg.slug;
          }

          const threadUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/forum/${forumPath}/${thread.slug}`;

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
                threadTitle: thread.title,
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
      data: withReactionState(populatedPost as any, currentUser._id.toString()),
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
