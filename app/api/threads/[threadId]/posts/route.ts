// /app/api/threads/[threadId]/posts/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { DiscussionThreadModel } from "@/models/Discussionthread";
import { DiscussionPostModel } from "@/models/Discussionpost";
import { requireAuth } from "@/lib/auth";

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

    if (thread.workingGroups && thread.workingGroups.length > 0 && !thread.publicToMembers) {
      const groupIds = thread.workingGroups.map((g: any) => g.toString());

      const hasAccess =
        currentUser.role === "super_admin" ||
        currentUser.role === "admin" ||
        currentUser.role === "steering" ||
        groupIds.some((id: string) =>
          (currentUser.workingGroups || [])
            .map((g: any) => g.toString())
            .includes(id)
        );

      if (!hasAccess) {
        return NextResponse.json(
          { success: false, error: "Access denied to this thread" },
          { status: 403 }
        );
      }
    }

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
      data: posts,
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

    if (thread.workingGroups && thread.workingGroups.length > 0 && !thread.publicToMembers) {

      const groupIds = thread.workingGroups.map((g: any) => g.toString());

      const hasAccess =
        currentUser.role === "super_admin" ||
        currentUser.role === "admin" ||
        currentUser.role === "steering" ||
        groupIds.some((id: string) =>
          (currentUser.workingGroups || [])
            .map((g: any) => g.toString())
            .includes(id)
        );

      if (!hasAccess) {
        return NextResponse.json(
          { success: false, error: "Access denied to post in this thread" },
          { status: 403 }
        );
      }
    }

    const post = await DiscussionPostModel.create({
      threadId: threadId,
      content: content.trim(),
      createdBy: currentUser._id,
      attachments: attachments || [],
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

    return NextResponse.json({ success: true, data: populatedPost });

  } catch (error: any) {

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );

  }
}