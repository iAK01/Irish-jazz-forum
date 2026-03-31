import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { DiscussionPostModel } from "@/models/Discussionpost";
import { DiscussionThreadModel } from "@/models/Discussionthread";
import { requireThreadAccess } from "@/lib/forumAccess";
import {
  isReactionType,
  toggleReaction,
  withReactionState,
} from "@/lib/reactions";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    await dbConnect();
    const { postId } = await params;
    const { reactionType } = await request.json();

    if (!isReactionType(reactionType)) {
      return NextResponse.json(
        { success: false, error: "Invalid reaction type" },
        { status: 400 }
      );
    }

    const post = await DiscussionPostModel.findById(postId);

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    if (post.deleted) {
      return NextResponse.json(
        { success: false, error: "Post has been deleted" },
        { status: 400 }
      );
    }

    const thread = await DiscussionThreadModel.findById(post.threadId)
      .select("workingGroups publicToMembers deleted")
      .lean() as {
        workingGroups?: string[];
        publicToMembers?: boolean;
        deleted?: boolean;
      } | null;

    if (!thread) {
      return NextResponse.json(
        { success: false, error: "Thread not found" },
        { status: 404 }
      );
    }

    const currentUser = await requireThreadAccess(thread);

    post.reactions = toggleReaction(
      post.reactions,
      currentUser._id.toString(),
      reactionType
    ) as typeof post.reactions;
    await post.save();

    const populatedPost = await DiscussionPostModel.findById(post._id)
      .populate("createdBy", "name image email")
      .populate("editedBy", "name email")
      .lean();

    if (!populatedPost) {
      return NextResponse.json(
        { success: false, error: "Post not found after update" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: withReactionState(populatedPost, currentUser._id.toString()),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { success: false, error: message },
      {
        status:
          message === "Access denied"
            ? 403
            : message === "Unauthorized"
              ? 401
              : 500,
      }
    );
  }
}
