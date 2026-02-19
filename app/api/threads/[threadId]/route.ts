// /app/api/threads/[threadId]/route.ts
// API endpoint for managing individual threads (GET, PATCH, DELETE)

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { DiscussionThreadModel } from "@/models/Discussionthread";
import { DiscussionPostModel } from "@/models/Discussionpost";
import { WorkingGroupModel } from "@/models/Workinggroup";
import { requireAuth } from "@/lib/auth";
import { createDeletedAttachmentsFolder, moveFileToFolder } from "@/lib/googledrive";
import { deleteMultipleFilesFromGCS } from "@/lib/gcs";

// GET /api/threads/[threadId]
// Get single thread details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const currentUser = await requireAuth();
    await dbConnect();
    const { threadId } = await params;

    const thread = await DiscussionThreadModel.findById(threadId)
      .populate("createdBy", "name image email")
      .lean() as any;

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

    // Check access - general threads (empty array) are accessible to everyone
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

    // Increment view count
    await DiscussionThreadModel.findByIdAndUpdate(threadId, {
      $inc: { viewCount: 1 },
    });

    return NextResponse.json({ success: true, data: thread });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/threads/[threadId]
// Update thread (pin, status, etc.) - Admin only
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const currentUser = await requireAuth();
    await dbConnect();
    const { threadId } = await params;

    const body = await request.json();
    const { pinned, status, action } = body;

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
        { success: false, error: "Cannot modify deleted thread" },
        { status: 400 }
      );
    }

    // Check access
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
          { success: false, error: "Access denied" },
          { status: 403 }
        );
      }
    }

    // Handle different actions
    if (action === "incrementView") {
      await DiscussionThreadModel.findByIdAndUpdate(threadId, {
        $inc: { viewCount: 1 },
      });
      return NextResponse.json({ success: true });
    }

    // Admin-only actions
    const isAdmin = currentUser.role === "super_admin" || currentUser.role === "admin";
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const updates: any = {};
    if (typeof pinned === "boolean") updates.pinned = pinned;
    if (status) updates.status = status;

    const updatedThread = await DiscussionThreadModel.findByIdAndUpdate(
      threadId,
      updates,
      { new: true }
    )
      .populate("createdBy", "name image email")
      .lean();

    return NextResponse.json({ success: true, data: updatedThread });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/threads/[threadId]
// Soft delete thread with cascading deletion and file handling
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    // Only super admins can delete threads
    const currentUser = await requireAuth(["super_admin"]);
    await dbConnect();
    const { threadId } = await params;

    // Find the thread
    const thread = await DiscussionThreadModel.findById(threadId).lean() as any;

    if (!thread) {
      return NextResponse.json(
        { success: false, error: "Thread not found" },
        { status: 404 }
      );
    }

    // Check if already deleted
    if (thread.deleted) {
      return NextResponse.json(
        { success: false, error: "Thread already deleted" },
        { status: 400 }
      );
    }

    // Find all posts in this thread
    const posts = await DiscussionPostModel.find({
      threadId: threadId,
      deleted: { $ne: true }
    }).lean() as any[];

    // Count files to be processed
    let gcsFilesCount = 0;
    let driveFilesCount = 0;
    const gcsFilesToDelete: string[] = [];
    const driveFilesToMove: { fileId: string; filename: string }[] = [];

    // Track which working group's Drive folder to use (if any)
    let workingGroupDriveFolderId: string | null = null;
    
    // If thread belongs to working groups, get the first one's Drive folder
    if (thread.workingGroups && thread.workingGroups.length > 0) {
      const workingGroup = await WorkingGroupModel.findOne({
        slug: thread.workingGroups[0]
      }).lean() as any;
      
      if (workingGroup && workingGroup.googleDriveFolderId) {
        workingGroupDriveFolderId = workingGroup.googleDriveFolderId;
      }
    }

    // Process attachments from all posts
    for (const post of posts) {
      if (post.attachments && post.attachments.length > 0) {
        for (const attachment of post.attachments) {
          if (attachment.storage === 'gcs' && attachment.gcsFilename) {
            gcsFilesToDelete.push(attachment.gcsFilename);
            gcsFilesCount++;
          } else if (attachment.storage === 'drive' && attachment.driveFileId) {
            driveFilesToMove.push({
              fileId: attachment.driveFileId,
              filename: attachment.filename
            });
            driveFilesCount++;
          }
        }
      }
    }

    // STEP 1: Soft delete the thread
const updateResult = await DiscussionThreadModel.findByIdAndUpdate(threadId, {
  deleted: true,
  deletedAt: new Date(),
  deletedBy: currentUser._id,
});


    // STEP 2: Cascade soft delete all posts
    const postIds = posts.map(p => p._id);
    if (postIds.length > 0) {
      await DiscussionPostModel.updateMany(
        { _id: { $in: postIds } },
        {
          deleted: true,
          deletedAt: new Date(),
          deletedBy: currentUser._id,
        }
      );
    }

    // STEP 3: Delete GCS files immediately
    if (gcsFilesToDelete.length > 0) {
      try {
        await deleteMultipleFilesFromGCS(gcsFilesToDelete);
      } catch (error) {
        console.error('Failed to delete some GCS files:', error);
        // Continue even if some deletions fail
      }
    }

    // STEP 4: Move Drive files to "Deleted Attachments" subfolder
    if (driveFilesToMove.length > 0 && workingGroupDriveFolderId) {
      try {
        const deletedAttachmentsFolderId = await createDeletedAttachmentsFolder(
          workingGroupDriveFolderId
        );

        for (const file of driveFilesToMove) {
          try {
            await moveFileToFolder(file.fileId, deletedAttachmentsFolderId);
          } catch (error) {
            console.error(`Failed to move file ${file.filename}:`, error);
            // Continue with other files
          }
        }
      } catch (error) {
        console.error('Failed to create/move to Deleted Attachments folder:', error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Thread deleted successfully",
      counts: {
        threads: 1,
        posts: postIds.length,
        gcsFiles: gcsFilesCount,
        driveFiles: driveFilesCount,
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}