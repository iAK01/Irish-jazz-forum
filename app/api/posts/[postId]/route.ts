// /app/api/posts/[postId]/route.ts
// API endpoint for managing individual posts (PATCH edit, DELETE)

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { DiscussionPostModel } from "@/models/Discussionpost";
import { DiscussionThreadModel } from "@/models/Discussionthread";
import { WorkingGroupModel } from "@/models/Workinggroup";
import { requireAuth } from "@/lib/auth";
import { createDeletedAttachmentsFolder, moveFileToFolder } from "@/lib/googledrive";
import { deleteMultipleFilesFromGCS } from "@/lib/gcs";

// PATCH /api/posts/[postId]
// Edit post content - Author within 24hrs OR Admin anytime
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const currentUser = await requireAuth();
    await dbConnect();
    const { postId } = await params;

    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Content required" },
        { status: 400 }
      );
    }

    const post = await DiscussionPostModel.findById(postId).lean() as any;

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    // Check if post is deleted
    if (post.deleted) {
      return NextResponse.json(
        { success: false, error: "Cannot edit deleted post" },
        { status: 400 }
      );
    }

    const isAuthor = post.createdBy.toString() === currentUser._id.toString();
    const isAdmin = currentUser.role === "super_admin" || currentUser.role === "admin";

    if (!isAdmin) {
      if (!isAuthor) {
        return NextResponse.json(
          { success: false, error: "Access denied" },
          { status: 403 }
        );
      }

      const hoursSinceCreation = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
      if (hoursSinceCreation > 24) {
        return NextResponse.json(
          { success: false, error: "Can only edit within 24 hours" },
          { status: 403 }
        );
      }
    }

    const updatedPost = await DiscussionPostModel.findByIdAndUpdate(
      postId,
      {
        content: content.trim(),
        editedAt: new Date(),
        editedBy: currentUser._id,
      },
      { new: true }
    )
      .populate("createdBy", "name image email")
      .populate("editedBy", "name email")
      .lean();

    return NextResponse.json({ success: true, data: updatedPost });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[postId]
// Soft delete post - Admin and Super Admin only
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    // Admin or Super Admin can delete posts
    const currentUser = await requireAuth(["admin", "super_admin"]);
    await dbConnect();
    const { postId } = await params;

    // Find the post
    const post = await DiscussionPostModel.findById(postId).lean() as any;

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    // Check if already deleted
    if (post.deleted) {
      return NextResponse.json(
        { success: false, error: "Post already deleted" },
        { status: 400 }
      );
    }

    // Get the thread to find working group (for Drive folder)
    const thread = await DiscussionThreadModel.findById(post.threadId).lean() as any;
    
    let workingGroupDriveFolderId: string | null = null;
    
    // If thread belongs to working groups, get the first one's Drive folder
    if (thread && thread.workingGroups && thread.workingGroups.length > 0) {
      const workingGroup = await WorkingGroupModel.findOne({
        slug: thread.workingGroups[0]
      }).lean() as any;
      
      if (workingGroup && workingGroup.googleDriveFolderId) {
        workingGroupDriveFolderId = workingGroup.googleDriveFolderId;
      }
    }

    // Count files to be processed
    let gcsFilesCount = 0;
    let driveFilesCount = 0;
    const gcsFilesToDelete: string[] = [];
    const driveFilesToMove: { fileId: string; filename: string }[] = [];

    // Process attachments
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

    // STEP 1: Soft delete the post
    await DiscussionPostModel.findByIdAndUpdate(postId, {
      deleted: true,
      deletedAt: new Date(),
      deletedBy: currentUser._id,
    });

    // STEP 2: Delete GCS files immediately
    if (gcsFilesToDelete.length > 0) {
      try {
        await deleteMultipleFilesFromGCS(gcsFilesToDelete);
      } catch (error) {
        console.error('Failed to delete some GCS files:', error);
        // Continue even if some deletions fail
      }
    }

    // STEP 3: Move Drive files to "Deleted Attachments" subfolder
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

    // STEP 4: Update thread reply count
    if (thread) {
      await DiscussionThreadModel.findByIdAndUpdate(post.threadId, {
        $inc: { replyCount: -1 }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Post deleted successfully",
      counts: {
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