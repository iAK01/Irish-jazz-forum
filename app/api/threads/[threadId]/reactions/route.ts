import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { DiscussionThreadModel } from "@/models/Discussionthread";
import { requireThreadAccess } from "@/lib/forumAccess";
import {
  isReactionType,
  StoredReaction,
  toggleReaction,
  withReactionState,
} from "@/lib/reactions";

interface ReactionReadyThread {
  reactions?: StoredReaction[];
  [key: string]: unknown;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    await dbConnect();
    const { threadId } = await params;
    const { reactionType } = await request.json();

    if (!isReactionType(reactionType)) {
      return NextResponse.json(
        { success: false, error: "Invalid reaction type" },
        { status: 400 }
      );
    }

    const thread = await DiscussionThreadModel.findById(threadId);

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

    const currentUser = await requireThreadAccess(thread);

    thread.reactions = toggleReaction(
      thread.reactions,
      currentUser._id.toString(),
      reactionType
    ) as typeof thread.reactions;
    await thread.save();

    return NextResponse.json({
      success: true,
      data: withReactionState(
        thread.toObject() as ReactionReadyThread,
        currentUser._id.toString()
      ),
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
