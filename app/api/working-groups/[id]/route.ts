// /app/api/working-groups/[id]/route.ts

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

    const group = await WorkingGroupModel.findById(id).lean() as any;

    if (!group) {
      return NextResponse.json(
        { success: false, error: "Working group not found" },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (name !== undefined && name.trim().length > 0) {
      updateData.name = name.trim();

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

    // Handle coordinator — accept null/empty string as "clear coordinator"
    if (coordinatorId !== undefined) {
      updateData.coordinator = coordinatorId || null;
    }

    // Handle members — deduplicate and ensure coordinator is included if set
    if (members !== undefined) {
      let memberList: string[] = [...new Set(members as string[])];

      // If a new coordinator is being set, ensure they're in the members list
      const effectiveCoordinator = coordinatorId !== undefined ? coordinatorId : group.coordinator?.toString();
      if (effectiveCoordinator && !memberList.includes(effectiveCoordinator)) {
        memberList.push(effectiveCoordinator);
      }

      updateData.members = memberList;
    }

    if (isPrivate !== undefined) {
      updateData.isPrivate = isPrivate;
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const updatedGroup = await WorkingGroupModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate("coordinator", "name email image lastSeenAt")
      .populate("members", "name email image lastSeenAt")
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
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuth(["super_admin"]);
    await dbConnect();
    const { id } = await params;

    const group = await WorkingGroupModel.findById(id).lean() as any;

    if (!group) {
      return NextResponse.json(
        { success: false, error: "Working group not found" },
        { status: 404 }
      );
    }

    if (group.deleted) {
      return NextResponse.json(
        { success: false, error: "Working group already deleted" },
        { status: 400 }
      );
    }

    const threads = await DiscussionThreadModel.find({
      workingGroups: group.slug,
      deleted: { $ne: true }
    }).lean() as any[];

    const threadIds = threads.map(t => t._id);

    const posts = await DiscussionPostModel.find({
      threadId: { $in: threadIds },
      deleted: { $ne: true }
    }).lean() as any[];

    let gcsFilesCount = 0;
    let driveFilesCount = 0;
    const gcsFilesToDelete: string[] = [];
    const driveFilesToMove: { fileId: string; filename: string }[] = [];

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

    await WorkingGroupModel.findByIdAndUpdate(id, {
      deleted: true,
      deletedAt: new Date(),
      deletedBy: currentUser._id,
    });

    if (group.googleDriveFolderId) {
      try {
        await renameFolder(group.googleDriveFolderId, `[DELETED] ${group.name}`);
      } catch (error) {
        console.error('Failed to rename Drive folder:', error);
      }
    }

    if (threadIds.length > 0) {
      await DiscussionThreadModel.updateMany(
        { _id: { $in: threadIds } },
        { deleted: true, deletedAt: new Date(), deletedBy: currentUser._id }
      );
    }

    const postIds = posts.map(p => p._id);
    if (postIds.length > 0) {
      await DiscussionPostModel.updateMany(
        { _id: { $in: postIds } },
        { deleted: true, deletedAt: new Date(), deletedBy: currentUser._id }
      );
    }

    if (gcsFilesToDelete.length > 0) {
      try {
        await deleteMultipleFilesFromGCS(gcsFilesToDelete);
      } catch (error) {
        console.error('Failed to delete some GCS files:', error);
      }
    }

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