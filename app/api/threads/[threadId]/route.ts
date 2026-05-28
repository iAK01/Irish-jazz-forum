// /app/api/threads/[threadId]/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { DiscussionThreadModel } from "@/models/Discussionthread";
import { DiscussionPostModel } from "@/models/Discussionpost";
import { WorkingGroupModel } from "@/models/Workinggroup";
import { requireAuth } from "@/lib/auth";
import { requireThreadAccess } from "@/lib/forumAccess";
import { createDeletedAttachmentsFolder, moveFileToFolder } from "@/lib/googledrive";
import { deleteMultipleFilesFromGCS } from "@/lib/gcs";
import { withReactionState } from "@/lib/reactions";

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

    if (thread.deleted) {
      return NextResponse.json(
        { success: false, error: "Thread has been deleted" },
        { status: 404 }
      );
    }

    await requireThreadAccess(thread);

    await DiscussionThreadModel.findByIdAndUpdate(threadId, {
      $inc: { viewCount: 1 },
    });

    return NextResponse.json({
      success: true,
      data: withReactionState(thread, currentUser._id.toString()),
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const currentUser = await requireAuth();
    await dbConnect();
    const { threadId } = await params;

    const body = await request.json();
    const { pinned, status, publicToMembers, action, tags } = body;

    const thread = await DiscussionThreadModel.findById(threadId).lean() as any;

    if (!thread) {
      return NextResponse.json(
        { success: false, error: "Thread not found" },
        { status: 404 }
      );
    }

    if (thread.deleted) {
      return NextResponse.json(
        { success: false, error: "Cannot modify deleted thread" },
        { status: 400 }
      );
    }

    await requireThreadAccess(thread);

    if (action === "incrementView") {
      await DiscussionThreadModel.findByIdAndUpdate(threadId, {
        $inc: { viewCount: 1 },
      });
      return NextResponse.json({ success: true });
    }

    const isAdmin =
      currentUser.role === "super_admin" || currentUser.role === "admin";

    const isThreadAuthor =
      thread.createdBy?.toString() === currentUser._id.toString();

    // Check coordinator status for this thread's working group
    let isCoordinator = false;
    if (!isAdmin && !isThreadAuthor && thread.workingGroups?.length > 0) {
      const wg = await WorkingGroupModel.findById(thread.workingGroups[0])
        .select("coordinator")
        .lean() as any;
      isCoordinator = wg?.coordinator?.toString() === currentUser._id.toString();
    }

    // Tag updates are allowed for admin, coordinator, or original author
    if (action === "setTags" && Array.isArray(tags)) {
      if (!isAdmin && !isCoordinator && !isThreadAuthor) {
        return NextResponse.json(
          { success: false, error: "Access denied" },
          { status: 403 }
        );
      }
      const cleaned = tags
        .map((t: string) => t.trim().toLowerCase())
        .filter((t: string) => t.length > 0 && t.length <= 30)
        .slice(0, 10);

      const updatedThread = await DiscussionThreadModel.findByIdAndUpdate(
        threadId,
        { tags: cleaned },
        { new: true }
      )
        .populate("createdBy", "name image email")
        .lean();

      return NextResponse.json({
        success: true,
        data: withReactionState(updatedThread as any, currentUser._id.toString()),
      });
    }

    // All other mutations are admin-only
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const updates: any = {};
    if (typeof pinned === "boolean") updates.pinned = pinned;
    if (action === "pin") updates.pinned = true;
    if (action === "unpin") updates.pinned = false;
    if (status) updates.status = status;
    if (action === "setStatus" && body.status) updates.status = body.status;
    if (typeof publicToMembers === "boolean") updates.publicToMembers = publicToMembers;

    const updatedThread = await DiscussionThreadModel.findByIdAndUpdate(
      threadId,
      updates,
      { new: true }
    )
      .populate("createdBy", "name image email")
      .lean();

    return NextResponse.json({
      success: true,
      data: withReactionState(updatedThread as any, currentUser._id.toString()),
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {

    const currentUser = await requireAuth(["super_admin"]);
    await dbConnect();
    const { threadId } = await params;

    const thread = await DiscussionThreadModel.findById(threadId).lean() as any;

    if (!thread) {
      return NextResponse.json(
        { success: false, error: "Thread not found" },
        { status: 404 }
      );
    }

    if (thread.deleted) {
      return NextResponse.json(
        { success: false, error: "Thread already deleted" },
        { status: 400 }
      );
    }

    const posts = await DiscussionPostModel.find({
      threadId: threadId,
      deleted: { $ne: true }
    }).lean() as any[];

    let gcsFilesCount = 0;
    let driveFilesCount = 0;

    const gcsFilesToDelete: string[] = [];
    const driveFilesToMove: { fileId: string; filename: string }[] = [];

    let workingGroupDriveFolderId: string | null = null;

    if (thread.workingGroups && thread.workingGroups.length > 0) {
      const workingGroup = await WorkingGroupModel.findById(
        thread.workingGroups[0]
      ).lean() as any;

      if (workingGroup && workingGroup.googleDriveFolderId) {
        workingGroupDriveFolderId = workingGroup.googleDriveFolderId;
      }
    }

    for (const post of posts) {
      if (post.attachments && post.attachments.length > 0) {
        for (const attachment of post.attachments) {

          if (attachment.storage === "gcs" && attachment.gcsFilename) {
            gcsFilesToDelete.push(attachment.gcsFilename);
            gcsFilesCount++;
          }

          else if (attachment.storage === "drive" && attachment.driveFileId) {
            driveFilesToMove.push({
              fileId: attachment.driveFileId,
              filename: attachment.filename
            });
            driveFilesCount++;
          }
        }
      }
    }

    await DiscussionThreadModel.findByIdAndUpdate(threadId, {
      deleted: true,
      deletedAt: new Date(),
      deletedBy: currentUser._id,
    });

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

    if (gcsFilesToDelete.length > 0) {
      try {
        await deleteMultipleFilesFromGCS(gcsFilesToDelete);
      } catch (error) {
        console.error("Failed to delete some GCS files:", error);
      }
    }

    if (driveFilesToMove.length > 0 && workingGroupDriveFolderId) {
      try {

        const deletedAttachmentsFolderId =
          await createDeletedAttachmentsFolder(workingGroupDriveFolderId);

        for (const file of driveFilesToMove) {

          try {
            await moveFileToFolder(file.fileId, deletedAttachmentsFolderId);
          }

          catch (error) {
            console.error(`Failed to move file ${file.filename}:`, error);
          }
        }

      } catch (error) {
        console.error(
          "Failed to create/move to Deleted Attachments folder:",
          error
        );
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
