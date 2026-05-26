// /app/api/members/[slug]/remind/route.ts
// POST — send a "complete your profile" reminder to all users linked to this member

import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import { MemberModel } from "@/models/Member";
import { UserModel } from "@/models/User";
import { sendCompleteProfileEmail } from "@/lib/email";

const COOLDOWN_DAYS = 7;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const adminUser = await UserModel.findOne({ email: session.user.email });
    if (!adminUser || !["super_admin", "admin"].includes(adminUser.role)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { slug } = await params;

    const member = await MemberModel.findOne({ slug }).lean() as any;
    if (!member) {
      return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
    }

    // Enforce cooldown
    if (member.lastProfileReminderSentAt) {
      const daysSinceLast = Math.floor(
        (Date.now() - new Date(member.lastProfileReminderSentAt).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (daysSinceLast < COOLDOWN_DAYS) {
        const daysRemaining = COOLDOWN_DAYS - daysSinceLast;
        return NextResponse.json(
          {
            success: false,
            error: `A reminder was already sent ${daysSinceLast === 0 ? "today" : `${daysSinceLast} day${daysSinceLast === 1 ? "" : "s"} ago`}. Please wait ${daysRemaining} more day${daysRemaining === 1 ? "" : "s"} before sending another.`,
            lastSentAt: member.lastProfileReminderSentAt,
          },
          { status: 429 }
        );
      }
    }

    // Collect emails of all linked users
    const linkedUsers: { userId: string; userEmail: string; role: string }[] =
      member.users || [];

    if (linkedUsers.length === 0) {
      return NextResponse.json(
        { success: false, error: "This member has no linked users to email" },
        { status: 400 }
      );
    }

    const emails = linkedUsers.map((u) => u.userEmail).filter(Boolean);

    // Determine what's missing for a helpful nudge
    const missingItems: string[] = [];
    if (!member.logoUrl) missingItems.push("Logo / profile image");
    if (!member.heroImageUrl) missingItems.push("Cover / hero image");
    if (!member.description) missingItems.push("Organisation description");
    if (!member.website) missingItems.push("Website URL");
    if (!member.region) missingItems.push("Region");

    const profileLink = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/profile`;

    await sendCompleteProfileEmail({
      to: emails,
      memberName: member.name,
      profileLink,
      missingItems: missingItems.length > 0 ? missingItems : undefined,
    });

    // Stamp the timestamp so we can enforce the cooldown next time
    await MemberModel.updateOne(
      { slug },
      { $set: { lastProfileReminderSentAt: new Date() } }
    );

    return NextResponse.json({
      success: true,
      data: {
        sentTo: emails,
        memberName: member.name,
        missingItems,
        lastSentAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("[remind] error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
