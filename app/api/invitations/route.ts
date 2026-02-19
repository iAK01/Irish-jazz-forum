// /app/api/invitations/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import { InvitationModel } from "@/models/Invitation";
import { UserModel } from "@/models/User";
import { MemberModel } from "@/models/Member";
import {
  generateInvitationToken,
  calculateExpiryDate,
  hasPendingInvitation,
} from "@/lib/invitation-helpers";
import {
  generateInvitationEmail,
  generateInvitationSubject,
} from "@/lib/email-templates/invitation";
import { sendEmail } from "@/lib/email";

// GET /api/invitations — list all (admin only)
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await UserModel.findOne({ email: session.user.email });

    if (!user || !["super_admin", "admin"].includes(user.role)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const invitations = await InvitationModel.find()
      .populate("invitedBy", "name email")
      .populate({ path: "memberCreated", model: MemberModel, select: "name slug" })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: invitations });
  } catch (error: any) {
    console.error("Get invitations error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/invitations — create new invitation (admin only)
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await UserModel.findOne({ email: session.user.email });

    if (!user || !["super_admin", "admin"].includes(user.role)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      email,
      message,
      expiryDays = 30,
      invitationType = "new_member",
      memberSlug,
    } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid email address is required" },
        { status: 400 }
      );
    }

    // For join_member invitations, verify the target member actually exists
    if (invitationType === "join_member") {
      if (!memberSlug) {
        return NextResponse.json(
          { success: false, error: "A member must be selected for join invitations" },
          { status: 400 }
        );
      }
      const targetMember = await MemberModel.findOne({ slug: memberSlug }).lean();
      if (!targetMember) {
        return NextResponse.json(
          { success: false, error: "Selected member organisation not found" },
          { status: 400 }
        );
      }
    }

    const normalizedEmail = email.toLowerCase().trim();

    const hasPending = await hasPendingInvitation(normalizedEmail);
    if (hasPending) {
      return NextResponse.json(
        { success: false, error: "This email already has a pending invitation" },
        { status: 400 }
      );
    }

    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "This email is already registered" },
        { status: 400 }
      );
    }

    const token = generateInvitationToken();
    const expiresAt = calculateExpiryDate(expiryDays);

    const invitation = await InvitationModel.create({
      token,
      email: normalizedEmail,
      invitedBy: user._id,
      message,
      expiresAt,
      status: "pending",
      invitationType,
      memberSlug: invitationType === "join_member" ? memberSlug : undefined,
    });

    const invitationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/join?token=${token}`;
    const expiryDateFormatted = expiresAt.toLocaleDateString("en-IE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const emailHtml = generateInvitationEmail({
      inviterName: user.name || "The Irish Jazz Forum Team",
      invitationLink,
      expiryDate: expiryDateFormatted,
      personalMessage: message,
    });

    await sendEmail({
      to: normalizedEmail,
      subject: generateInvitationSubject(user.name || "The Irish Jazz Forum Team"),
      html: emailHtml,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: invitation._id.toString(),
        token: invitation.token,
        email: invitation.email,
        invitationType: invitation.invitationType,
        memberSlug: invitation.memberSlug,
        expiresAt: invitation.expiresAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Create invitation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}