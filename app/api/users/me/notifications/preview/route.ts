import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  buildDailyDigestWindow,
  buildForumDigestForUser,
  buildWeeklyDigestWindow,
  ForumDigestCadence,
  getEffectiveForumDigestPreference,
} from "@/lib/forumDigest";
import { generateForumDigestEmail } from "@/lib/email-templates/forum-digest";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Request failed";
}

export async function GET(request: Request) {
  try {
    const currentUser = await requireAuth();
    const { searchParams } = new URL(request.url);
    const requestedPreference = searchParams.get("forumDigest");
    const effectivePreference =
      requestedPreference === "daily" && currentUser.role === "super_admin"
        ? "daily"
        : getEffectiveForumDigestPreference(
            requestedPreference === "off"
              ? undefined
              : (requestedPreference as "weekly" | "daily" | null) || undefined
          );
    const cadence: ForumDigestCadence =
      effectivePreference === "daily" ? "daily" : "weekly";
    const window =
      cadence === "daily" ? buildDailyDigestWindow() : buildWeeklyDigestWindow();
    const payload = await buildForumDigestForUser(
      {
        _id: currentUser._id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        workingGroups: currentUser.workingGroups || [],
      },
      window,
      cadence
    );

    return NextResponse.json({
      success: true,
      data: {
        html: generateForumDigestEmail(payload),
        summary: {
          cadence,
          threadCount: payload.threadCount,
          periodStart: payload.periodStart.toISOString(),
          periodEnd: payload.periodEnd.toISOString(),
        },
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 401 }
    );
  }
}
