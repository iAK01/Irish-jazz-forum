// /app/api/working-groups/[id]/route.ts
// API endpoint for managing individual working groups (PATCH, DELETE)

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { WorkingGroupModel } from "@/models/Workinggroup";
import { DiscussionThreadModel } from "@/models/Discussionthread";
import { DiscussionPostModel } from "@/models/Discussionpost";
import { requireAuth } from "@/lib/auth";
import slugify from "slugify";
import { renameFolder, createDeletedAttachmentsFolder, moveFileToFolder } from "@/lib/googledrive";
import { deleteMultipleFilesFromGCS } from "@/lib/gcs";

// PATCH /api/working-groups/[id]
// Update working group details
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuth(["admin", "super_admin"]);
    await dbConnect();
    const { id } = await params;

    const body = await request.json();
    const { name, description, coordinatorId, members, isPrivate, isActive } = body;

    // Find the working group
    const group = await WorkingGroupModel.findById(id).lean() as any;

    if (!group) {
      return NextResponse.json(
        { success: false, error: "Working group not found" },
        { status: 404 }
      );
    }

    // Build update object
    const updateData: any = {};

    if (name !== undefined && name.trim().length > 0) {
      updateData.name = name.trim();
      
      // Regenerate slug if name changed
      if (name.trim() !== group.name) {
        const baseSlug = slugify(name, { lower: true, strict: true });
        let slug = baseSlug;
        let counter = 1;

        while (await WorkingGroupModel.findOne({ slug, _id: { $ne: id } })) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
        updateData.slug = slug;
      }
    }

    if (description !== undefined && description.trim().length > 0) {
      updateData.description = description.trim();
    }

    if (coordinatorId !== undefined) {
      updateData.coordinator = coordinatorId;
      
      // Ensure coordinator is in members list
      if (members && !members.includes(coordinatorId)) {
        members.push(coordinatorId);
      }
    }

    if (members !== undefined) {
      updateData.members = members;
    }

    if (isPrivate !== undefined) {
      updateData.isPrivate = isPrivate;
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    // Update the working group
    const updatedGroup = await WorkingGroupModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate("coordinator", "name email image")
      .populate("members", "name email image")
      .populate("createdBy", "name email")
      .lean();

    return NextResponse.json({ success: true, data: updatedGroup });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/working-groups/[id]
// Soft delete working group with cascading deletion and file handling
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Only super admins can delete working groups
    const currentUser = await requireAuth(["super_admin"]);
    await dbConnect();
    const { id } = await params;

    // Find the working group
    const group = await WorkingGroupModel.findById(id).lean() as any;

    if (!group) {
      return NextResponse.json(
        { success: false, error: "Working group not found" },
        { status: 404 }
      );
    }

    // Check if already deleted
    if (group.deleted) {
      return NextResponse.json(
        { success: false, error: "Working group already deleted" },
        { status: 400 }
      );
    }

    // Find all threads in this working group
    const threads = await DiscussionThreadModel.find({
      workingGroups: group.slug,
      deleted: { $ne: true }
    }).lean() as any[];

    const threadIds = threads.map(t => t._id);

    // Find all posts in these threads
    const posts = await DiscussionPostModel.find({
      threadId: { $in: threadIds },
      deleted: { $ne: true }
    }).lean() as any[];

    // Count files to be processed
    let gcsFilesCount = 0;
    let driveFilesCount = 0;
    const gcsFilesToDelete: string[] = [];
    const driveFilesToMove: { fileId: string; filename: string }[] = [];

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

    // STEP 1: Soft delete the working group
    await WorkingGroupModel.findByIdAndUpdate(id, {
      deleted: true,
      deletedAt: new Date(),
      deletedBy: currentUser._id,
    });

    // STEP 2: Rename Drive folder to "[DELETED] Group Name"
    if (group.googleDriveFolderId) {
      try {
        await renameFolder(group.googleDriveFolderId, `[DELETED] ${group.name}`);
      } catch (error) {
        console.error('Failed to rename Drive folder:', error);
        // Continue even if rename fails
      }
    }

    // STEP 3: Cascade soft delete all threads
    if (threadIds.length > 0) {
      await DiscussionThreadModel.updateMany(
        { _id: { $in: threadIds } },
        {
          deleted: true,
          deletedAt: new Date(),
          deletedBy: currentUser._id,
        }
      );
    }

    // STEP 4: Cascade soft delete all posts
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

    // STEP 5: Delete GCS files immediately
    if (gcsFilesToDelete.length > 0) {
      try {
        await deleteMultipleFilesFromGCS(gcsFilesToDelete);
      } catch (error) {
        console.error('Failed to delete some GCS files:', error);
        // Continue even if some deletions fail
      }
    }

    // STEP 6: Move Drive files to "Deleted Attachments" subfolder
    if (driveFilesToMove.length > 0 && group.googleDriveFolderId) {
      try {
        const deletedAttachmentsFolderId = await createDeletedAttachmentsFolder(
          group.googleDriveFolderId
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
      message: "Working group deleted successfully",
      counts: {
        threads: threadIds.length,
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