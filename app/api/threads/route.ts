// /app/api/threads/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { DiscussionThreadModel } from "@/models/Discussionthread";
import { requireAuth } from "@/lib/auth";
import slugify from "slugify";

// GET /api/threads?workingGroup=advocacy
// List threads for a specific working group
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

    // Check if user has access to this working group
    // General discussion = everyone has access
    if (workingGroup !== "general") {
      const hasAccess =
        currentUser.role === "super_admin" ||
        currentUser.role === "admin" ||
        currentUser.role === "steering" ||
        (currentUser.workingGroups && currentUser.workingGroups.includes(workingGroup));

      if (!hasAccess) {
        return NextResponse.json(
          { success: false, error: "Access denied to this working group" },
          { status: 403 }
        );
      }
    }

    // Build query based on working group
let query;
if (workingGroup === "general") {
  query = { workingGroups: { $size: 0 }, deleted: { $ne: true } };
} else {
  query = { workingGroups: workingGroup, deleted: { $ne: true } };
}

    // Fetch threads for this working group
    // Sort by: pinned first, then by lastActivityAt descending
    const threads = await DiscussionThreadModel.find(query)
      .sort({ pinned: -1, lastActivityAt: -1 })
      .populate("createdBy", "name image email")
      .lean();

    return NextResponse.json({ success: true, data: threads });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/threads
// Create a new thread
export async function POST(request: Request) {
  try {
    const currentUser = await requireAuth();
    await dbConnect();

    const body = await request.json();
    const { workingGroups, title, tags, content, attachments } = body;

    // Validate required fields
    if (!workingGroups || !Array.isArray(workingGroups)) {
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

    // Check access - empty array means general discussion (everyone can access)
    if (workingGroups.length > 0) {
      const hasAccess = workingGroups.some(
        (wg: string) =>
          currentUser.role === "super_admin" ||
          currentUser.role === "admin" ||
          currentUser.role === "steering" ||
          (currentUser.workingGroups && currentUser.workingGroups.includes(wg))
      );

      if (!hasAccess) {
        return NextResponse.json(
          { success: false, error: "Access denied to create threads in these working groups" },
          { status: 403 }
        );
      }
    }

    // Generate unique slug
    const baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await DiscussionThreadModel.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create thread (with first post content)
    const thread = await DiscussionThreadModel.create({
      workingGroups,
      title: title.trim(),
      slug,
      createdBy: currentUser._id,
      lastActivityAt: new Date(),
      status: "active",
      pinned: false,
      replyCount: 0,
      viewCount: 0,
      tags: tags || [],
    });

    // Create the first post in the thread
    const DiscussionPostModel = require("@/models/Discussionpost").DiscussionPostModel;
    await DiscussionPostModel.create({
      threadId: thread._id,
      content: content.trim(),
      createdBy: currentUser._id,
      attachments: attachments || [],
      deleted: false,
    });

    const populatedThread = await DiscussionThreadModel.findById(thread._id)
      .populate("createdBy", "name image email")
      .lean();

    return NextResponse.json({ success: true, data: populatedThread });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}   