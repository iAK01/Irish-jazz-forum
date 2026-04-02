import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { escapeHtml } from "@/lib/html";
import { withReactionState } from "@/lib/reactions";
import { createGoogleDocInFolder } from "@/lib/googledrive";
import { DiscussionThreadModel } from "@/models/Discussionthread";
import { DiscussionPostModel } from "@/models/Discussionpost";
import { WorkingGroupModel } from "@/models/Workinggroup";

type ResourceAction = "create_google_doc" | "attach_drive_link";

function userCanPostInThread(
  currentUser: {
    role: string;
    workingGroups?: Array<{ toString(): string } | string>;
  },
  thread: {
    publicToMembers?: boolean;
    workingGroups?: Array<{ toString(): string } | string>;
  }
) {
  if (!thread.workingGroups || thread.workingGroups.length === 0) {
    return true;
  }

  if (thread.publicToMembers) {
    return true;
  }

  const groupIds = thread.workingGroups.map((groupId) => groupId.toString());
  const memberGroupIds = (currentUser.workingGroups || []).map((groupId) =>
    groupId.toString()
  );

  return (
    currentUser.role === "super_admin" ||
    currentUser.role === "admin" ||
    currentUser.role === "steering" ||
    groupIds.some((groupId) => memberGroupIds.includes(groupId))
  );
}

function isGoogleDriveResourceUrl(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();

    if (!["docs.google.com", "drive.google.com"].includes(hostname)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

function buildCreatedDocContent(title: string, url: string) {
  return `<p><strong>Working document created for this thread:</strong> <a data-thread-resource-kind="working-document" href="${escapeHtml(
    url
  )}" target="_blank" rel="noopener noreferrer">${escapeHtml(
    title
  )}</a></p><p>This document is now available in Thread Resources.</p>`;
}

function buildAttachedResourceContent(title: string, url: string) {
  return `<p><strong>Resource added to this thread:</strong> <a data-thread-resource-kind="reference-file" href="${escapeHtml(
    url
  )}" target="_blank" rel="noopener noreferrer">${escapeHtml(
    title
  )}</a></p><p>This link is now surfaced in Thread Resources.</p>`;
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
    const action = body?.action as ResourceAction | undefined;

    if (!action) {
      return NextResponse.json(
        { success: false, error: "Action is required" },
        { status: 400 }
      );
    }

    const thread = (await DiscussionThreadModel.findById(threadId).lean()) as {
      _id: { toString(): string } | string;
      title: string;
      slug: string;
      deleted?: boolean;
      publicToMembers?: boolean;
      workingGroups?: Array<{ toString(): string } | string>;
    } | null;

    if (!thread) {
      return NextResponse.json(
        { success: false, error: "Thread not found" },
        { status: 404 }
      );
    }

    if (thread.deleted) {
      return NextResponse.json(
        { success: false, error: "Thread has been deleted" },
        { status: 400 }
      );
    }

    if (!thread.workingGroups || thread.workingGroups.length === 0) {
      return NextResponse.json(
        { success: false, error: "Thread resources are only available on working-group threads" },
        { status: 400 }
      );
    }

    if (!userCanPostInThread(currentUser, thread)) {
      return NextResponse.json(
        { success: false, error: "Access denied to add resources to this thread" },
        { status: 403 }
      );
    }

    const primaryGroupId = thread.workingGroups[0].toString();
    const group = (await WorkingGroupModel.findById(primaryGroupId)
      .select("name slug googleDriveFolderId")
      .lean()) as {
      name: string;
      slug: string;
      googleDriveFolderId?: string;
    } | null;

    if (!group) {
      return NextResponse.json(
        { success: false, error: "Working group not found" },
        { status: 404 }
      );
    }

    if (!group.googleDriveFolderId) {
      return NextResponse.json(
        { success: false, error: "Working group Drive folder is not configured" },
        { status: 500 }
      );
    }

    let content = "";
    let resourceUrl = "";

    if (action === "create_google_doc") {
      const title = String(body?.title || "").trim();

      if (!title) {
        return NextResponse.json(
          { success: false, error: "Document title is required" },
          { status: 400 }
        );
      }

      const document = await createGoogleDocInFolder(
        title,
        group.googleDriveFolderId
      );

      resourceUrl = document.url;
      content = buildCreatedDocContent(document.title, document.url);
    }

    if (action === "attach_drive_link") {
      const title = String(body?.title || "").trim();
      const url = String(body?.url || "").trim();

      if (!title) {
        return NextResponse.json(
          { success: false, error: "Resource title is required" },
          { status: 400 }
        );
      }

      if (!url || !isGoogleDriveResourceUrl(url)) {
        return NextResponse.json(
          { success: false, error: "Please provide a valid Google Docs or Drive link" },
          { status: 400 }
        );
      }

      resourceUrl = url;
      content = buildAttachedResourceContent(title, url);
    }

    if (!content) {
      return NextResponse.json(
        { success: false, error: "Unsupported action" },
        { status: 400 }
      );
    }

    const post = await DiscussionPostModel.create({
      threadId: thread._id,
      content,
      createdBy: currentUser._id,
      attachments: [],
      mentions: [],
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

    return NextResponse.json({
      success: true,
      data: withReactionState(
        populatedPost as { reactions?: Parameters<typeof withReactionState>[0]["reactions"] },
        currentUser._id.toString()
      ),
      meta: {
        threadTitle: thread.title,
        groupSlug: group.slug,
        resourceUrl,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { success: false, error: message },
      { status: message === "Unauthorized" ? 401 : 500 }
    );
  }
}
