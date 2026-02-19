// /app/api/threads/[threadId]/posts/route.ts
// API endpoint for listing posts and creating replies in a thread

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { DiscussionThreadModel } from "@/models/Discussionthread";
import { DiscussionPostModel } from "@/models/Discussionpost";
import { requireAuth } from "@/lib/auth";

// GET /api/threads/[threadId]/posts
// Get all posts for a thread
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

    // Verify thread exists and user has access
    const thread = await DiscussionThreadModel.findById(threadId).lean() as any;

    if (!thread) {
      return NextResponse.json(
        { success: false, error: "Thread not found" },
        { status: 404 }
      );
    }

    // Check if thread is deleted
    if (thread.deleted) {
      return NextResponse.json(
        { success: false, error: "Thread has been deleted" },
        { status: 404 }
      );
    }

    // Check access - empty workingGroups means general (everyone has access)
    if (thread.workingGroups && thread.workingGroups.length > 0) {
      const hasAccess = thread.workingGroups.some(
        (wg: string) =>
          currentUser.role === "super_admin" ||
          currentUser.role === "admin" ||
          currentUser.role === "steering" ||
          (currentUser.workingGroups && currentUser.workingGroups.includes(wg))
      );

      if (!hasAccess) {
        return NextResponse.json(
          { success: false, error: "Access denied to this thread" },
          { status: 403 }
        );
      }
    }

    // Fetch posts (exclude soft-deleted posts)
    const posts = await DiscussionPostModel.find({
      threadId: threadId,
      deleted: { $ne: true },
    })
      .sort({ createdAt: 1 }) // Chronological order
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
        hasMore: skip + posts.length < totalPosts
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/threads/[threadId]/posts
// Create a reply to a thread
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

    // Validate content
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Content required" },
        { status: 400 }
      );
    }

    // Verify thread exists and user has access
    const thread = await DiscussionThreadModel.findById(threadId).lean() as any;

    if (!thread) {
      return NextResponse.json(
        { success: false, error: "Thread not found" },
        { status: 404 }
      );
    }

    // Check if thread is deleted
    if (thread.deleted) {
      return NextResponse.json(
        { success: false, error: "Cannot reply to deleted thread" },
        { status: 400 }
      );
    }

    // Check access - empty workingGroups means general (everyone has access)
    if (thread.workingGroups && thread.workingGroups.length > 0) {
      const hasAccess = thread.workingGroups.some(
        (wg: string) =>
          currentUser.role === "super_admin" ||
          currentUser.role === "admin" ||
          currentUser.role === "steering" ||
          (currentUser.workingGroups && currentUser.workingGroups.includes(wg))
      );

      if (!hasAccess) {
        return NextResponse.json(
          { success: false, error: "Access denied to post in this thread" },
          { status: 403 }
        );
      }
    }

    // Create post
    const post = await DiscussionPostModel.create({
      threadId: threadId,
      content: content.trim(),
      createdBy: currentUser._id,
      attachments: attachments || [],
      deleted: false,
    });

    // Update thread stats and lastActivityAt
    await DiscussionThreadModel.findByIdAndUpdate(threadId, {
      $inc: { replyCount: 1 },
      lastActivityAt: new Date(),
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