import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { sendForumDigestEmail } from "@/lib/email";
import {
  buildForumDigestForUser,
  buildWeeklyDigestWindow,
} from "@/lib/forumDigest";
import { ForumDigestSendModel } from "@/models/ForumDigestSend";
import { ForumDigestPreference, UserModel, UserRole } from "@/models/User";

const CRON_SECRET = process.env.CRON_SECRET;

function isDuplicateKeyError(error: unknown) {
  return (
    !!error &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

function isAuthorizedRequest(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (CRON_SECRET && authHeader === `Bearer ${CRON_SECRET}`) {
    return true;
  }

  const vercelCronHeader = request.headers.get("x-vercel-cron");
  return !CRON_SECRET || !!vercelCronHeader;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Forum digest run failed";
}

interface DigestRecipient {
  _id: { toString(): string } | string;
  name: string;
  email: string;
  role: UserRole;
  workingGroups?: string[];
  forumDigest?: ForumDigestPreference;
}

export async function GET(request: Request) {
  try {
    if (!isAuthorizedRequest(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      return NextResponse.json(
        { success: false, error: "NEXT_PUBLIC_BASE_URL is required" },
        { status: 500 }
      );
    }

    await dbConnect();

    const digestWindow = buildWeeklyDigestWindow();
    const recipients = (await UserModel.find({
      email: { $exists: true, $nin: [""] },
      role: { $ne: "public" },
      $or: [
        { forumDigest: "weekly" as ForumDigestPreference },
        { forumDigest: { $exists: false } },
      ],
    })
      .select("name email role workingGroups forumDigest")
      .lean()) as unknown as DigestRecipient[];

    const results = {
      eligibleUsers: recipients.length,
      sent: 0,
      skippedAlreadySent: 0,
      skippedNoActivity: 0,
      errors: [] as string[],
    };

    for (const user of recipients) {
      const userId = user._id.toString();

      try {
        const existingSend = await ForumDigestSendModel.findOne({
          userId,
          digestType: "weekly",
          digestKey: digestWindow.digestKey,
        }).lean();

        if (existingSend) {
          results.skippedAlreadySent++;
          continue;
        }

        const payload = await buildForumDigestForUser(
          {
            _id: userId,
            name: user.name,
            email: user.email,
            role: user.role,
            workingGroups: user.workingGroups || [],
            forumDigest: user.forumDigest,
          },
          digestWindow
        );

        if (payload.threadCount === 0) {
          results.skippedNoActivity++;
          continue;
        }

        await sendForumDigestEmail({
          to: user.email,
          payload,
        });

        await ForumDigestSendModel.create({
          userId,
          digestType: "weekly",
          digestKey: digestWindow.digestKey,
          periodStart: digestWindow.periodStart,
          periodEnd: digestWindow.periodEnd,
          threadCount: payload.threadCount,
          sentAt: new Date(),
        });

        results.sent++;
      } catch (error: unknown) {
        if (isDuplicateKeyError(error)) {
          results.skippedAlreadySent++;
          continue;
        }

        results.errors.push(
          `${user.email}: ${getErrorMessage(error)}`
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Forum digest run completed",
      digestKey: digestWindow.digestKey,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
