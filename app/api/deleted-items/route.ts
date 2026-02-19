// /app/api/deleted-items/route.ts
// API endpoint for viewing and restoring soft-deleted items (Admin + Super Admin)

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { WorkingGroupModel } from "@/models/Workinggroup";
import { DiscussionThreadModel } from "@/models/Discussionthread";
import { DiscussionPostModel } from "@/models/Discussionpost";
import { requireAuth } from "@/lib/auth";
import { renameFolder, moveFileToFolder } from "@/lib/googledrive";

// GET /api/deleted-items
// List all soft-deleted items for admin review
export async function GET(request: Request) {
  try {
    const currentUser = await requireAuth(["admin", "super_admin"]);
    await dbConnect();

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Fetch deleted working groups
    const workingGroups = await WorkingGroupModel.find({
      deleted: true,
    })
      .populate("deletedBy", "name email")
      .sort({ deletedAt: -1 })
      .lean() as any[];

    // Add thread/post counts to each working group
    const workingGroupsWithCounts = await Promise.all(
      workingGroups.map(async (group) => {
        const threadCount = await DiscussionThreadModel.countDocuments({
          workingGroups: group.slug,
          deleted: true,
        });
        const postCount = await DiscussionPostModel.countDocuments({
          threadId: {
            $in: (
              await DiscussionThreadModel.find({
                workingGroups: group.slug,
              }).select("_id")
            ).map((t) => t._id),
          },
          deleted: true,
        });

        return {
          ...group,
          threadCount,
          postCount,
          expiringSoon: new Date(group.deletedAt) < sevenDaysAgo,
          daysUntilPermanent: Math.max(
            0,
            7 - Math.floor((Date.now() - new Date(group.deletedAt).getTime()) / (24 * 60 * 60 * 1000))
          ),
        };
      })
    );

    // Fetch deleted threads (not part of a deleted working group)
    const deletedWorkingGroupSlugs = workingGroups.map((g) => g.slug);
    const threads = await DiscussionThreadModel.find({
      deleted: true,
      $or: [
        { workingGroups: { $size: 0 } }, // General threads
        { workingGroups: { $nin: deletedWorkingGroupSlugs } }, // Not in deleted groups
      ],
    })
      .populate("createdBy", "name email")
      .populate("deletedBy", "name email")
      .sort({ deletedAt: -1 })
      .lean() as any[];

    // Add post counts to each thread
    const threadsWithCounts = await Promise.all(
      threads.map(async (thread) => {
        const postCount = await DiscussionPostModel.countDocuments({
          threadId: thread._id,
          deleted: true,
        });

        return {
          ...thread,
          postCount,
          expiringSoon: new Date(thread.deletedAt) < sevenDaysAgo,
          daysUntilPermanent: Math.max(
            0,
            7 - Math.floor((Date.now() - new Date(thread.deletedAt).getTime()) / (24 * 60 * 60 * 1000))
          ),
        };
      })
    );

    // Fetch deleted posts (not part of a deleted thread)
    const deletedThreadIds = threads.map((t) => t._id);
    const posts = await DiscussionPostModel.find({
      deleted: true,
      threadId: { $nin: deletedThreadIds },
    })
      .populate("createdBy", "name email")
      .populate("deletedBy", "name email")
      .sort({ deletedAt: -1 })
      .lean() as any[];

    const postsWithMeta = posts.map((post) => ({
      ...post,
      attachmentCount: post.attachments?.length || 0,
      expiringSoon: new Date(post.deletedAt) < sevenDaysAgo,
      daysUntilPermanent: Math.max(
        0,
        7 - Math.floor((Date.now() - new Date(post.deletedAt).getTime()) / (24 * 60 * 60 * 1000))
      ),
    }));

    return NextResponse.json({
      success: true,
      data: {
        workingGroups: workingGroupsWithCounts,
        threads: threadsWithCounts,
        posts: postsWithMeta,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/deleted-items
// Restore a soft-deleted item
export async function POST(request: Request) {
  try {
    const currentUser = await requireAuth(["admin", "super_admin"]);
    await dbConnect();

    const body = await request.json();
    const { type, id } = body;

    if (!type || !id) {
      return NextResponse.json(
        { success: false, error: "type and id are required" },
        { status: 400 }
      );
    }

    if (!["workingGroup", "thread", "post"].includes(type)) {
      return NextResponse.json(
        { success: false, error: "Invalid type. Must be workingGroup, thread, or post" },
        { status: 400 }
      );
    }

    // Check if item exists and is deleted
    let item: any;
    let restoredCounts = { workingGroups: 0, threads: 0, posts: 0 };

    if (type === "workingGroup") {
      // Only super admin can restore working groups
      if (currentUser.role !== "super_admin") {
        return NextResponse.json(
          { success: false, error: "Only super admins can restore working groups" },
          { status: 403 }
        );
      }

      item = await WorkingGroupModel.findById(id).lean() as any;
      if (!item) {
        return NextResponse.json(
          { success: false, error: "Working group not found" },
          { status: 404 }
        );
      }
      if (!item.deleted) {
        return NextResponse.json(
          { success: false, error: "Working group is not deleted" },
          { status: 400 }
        );
      }

      // Restore working group
      await WorkingGroupModel.findByIdAndUpdate(id, {
        deleted: false,
        deletedAt: null,
        deletedBy: null,
      });
      restoredCounts.workingGroups = 1;

      // Rename Drive folder back (remove "[DELETED]" prefix)
      if (item.googleDriveFolderId) {
        try {
          const originalName = item.name.replace(/^\[DELETED\]\s*/, "");
          await renameFolder(item.googleDriveFolderId, originalName);
        } catch (error) {
          console.error("Failed to rename Drive folder:", error);
        }
      }

      // Cascade restore all threads in this group
      const threads = await DiscussionThreadModel.find({
        workingGroups: item.slug,
        deleted: true,
      });

      for (const thread of threads) {
        await DiscussionThreadModel.findByIdAndUpdate(thread._id, {
          deleted: false,
          deletedAt: null,
          deletedBy: null,
        });
        restoredCounts.threads++;

        // Cascade restore all posts in this thread
        const postsRestored = await DiscussionPostModel.updateMany(
          { threadId: thread._id, deleted: true },
          { deleted: false, deletedAt: null, deletedBy: null }
        );
        restoredCounts.posts += postsRestored.modifiedCount;
      }

    } else if (type === "thread") {
      // Only super admin can restore threads
      if (currentUser.role !== "super_admin") {
        return NextResponse.json(
          { success: false, error: "Only super admins can restore threads" },
          { status: 403 }
        );
      }

      item = await DiscussionThreadModel.findById(id).lean() as any;
      if (!item) {
        return NextResponse.json(
          { success: false, error: "Thread not found" },
          { status: 404 }
        );
      }
      if (!item.deleted) {
        return NextResponse.json(
          { success: false, error: "Thread is not deleted" },
          { status: 400 }
        );
      }

      // Restore thread
      await DiscussionThreadModel.findByIdAndUpdate(id, {
        deleted: false,
        deletedAt: null,
        deletedBy: null,
      });
      restoredCounts.threads = 1;

      // Cascade restore all posts in this thread
      const postsRestored = await DiscussionPostModel.updateMany(
        { threadId: id, deleted: true },
        { deleted: false, deletedAt: null, deletedBy: null }
      );
      restoredCounts.posts = postsRestored.modifiedCount;

    } else if (type === "post") {
      item = await DiscussionPostModel.findById(id).lean() as any;
      if (!item) {
        return NextResponse.json(
          { success: false, error: "Post not found" },
          { status: 404 }
        );
      }
      if (!item.deleted) {
        return NextResponse.json(
          { success: false, error: "Post is not deleted" },
          { status: 400 }
        );
      }

      // Restore post
      await DiscussionPostModel.findByIdAndUpdate(id, {
        deleted: false,
        deletedAt: null,
        deletedBy: null,
      });
      restoredCounts.posts = 1;

      // Update thread reply count
      await DiscussionThreadModel.findByIdAndUpdate(item.threadId, {
        $inc: { replyCount: 1 },
      });

      // NOTE: GCS files are permanently deleted and cannot be restored
      // Drive files in "Deleted Attachments" would need manual restoration
    }

    return NextResponse.json({
      success: true,
      message: `${type} restored successfully`,
      restored: restoredCounts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}