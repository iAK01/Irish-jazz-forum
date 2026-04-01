import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { ForumDigestPreference, UserModel } from "@/models/User";

function getEffectivePreference(value?: ForumDigestPreference) {
  return value || "weekly";
}

function getAllowedPreferences(isSuperAdmin: boolean) {
  return isSuperAdmin ? ["off", "weekly", "daily"] : ["off", "weekly"];
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Request failed";
}

export async function GET() {
  try {
    const currentUser = await requireAuth();
    await dbConnect();

    const user = await UserModel.findById(currentUser._id)
      .select("forumDigest")
      .lean() as { forumDigest?: ForumDigestPreference } | null;

    return NextResponse.json({
      success: true,
      data: {
        forumDigest: getEffectivePreference(user?.forumDigest),
        allowedForumDigestOptions: getAllowedPreferences(
          currentUser.role === "super_admin"
        ),
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 401 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = await requireAuth();
    await dbConnect();

    const body = await request.json();
    const forumDigest = body?.forumDigest as ForumDigestPreference | undefined;
    const allowedPreferences = getAllowedPreferences(
      currentUser.role === "super_admin"
    );

    if (!forumDigest || !allowedPreferences.includes(forumDigest)) {
      return NextResponse.json(
        { success: false, error: "Invalid forumDigest value" },
        { status: 400 }
      );
    }

    const user = await UserModel.findByIdAndUpdate(
      currentUser._id,
      { forumDigest },
      { new: true }
    )
      .select("forumDigest")
      .lean() as { forumDigest?: ForumDigestPreference } | null;

    return NextResponse.json({
      success: true,
      data: {
        forumDigest: getEffectivePreference(user?.forumDigest),
        allowedForumDigestOptions: allowedPreferences,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 400 }
    );
  }
}
