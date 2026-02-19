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

// GET /api/invitations
// List all invitations (admin only)
export async function GET() {
  try {
   const session = await auth();


    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const user = await UserModel.findOne({ email: session.user.email });

    if (!user || !["super_admin", "admin"].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const invitations = await InvitationModel.find()
      .populate("invitedBy", "name email")
      .populate("memberCreated", "name slug")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: invitations,
    });
  } catch (error: any) {
    console.error("Get invitations error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/invitations
// Create new invitation (admin only)
export async function POST(request: Request) {
  try {
    const session = await auth();


    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const user = await UserModel.findOne({ email: session.user.email });

    if (!user || !["super_admin", "admin"].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, message, expiryDays = 30 } = body;

    // Validate email
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid email address is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already has a pending invitation
    const hasPending = await hasPendingInvitation(normalizedEmail);
    if (hasPending) {
      return NextResponse.json(
        {
          success: false,
          error: "This email already has a pending invitation",
        },
        { status: 400 }
      );
    }

    // Check if email is already a member (has User account)
    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "This email is already registered" },
        { status: 400 }
      );
    }

    // Generate token and create invitation
    const token = generateInvitationToken();
    const expiresAt = calculateExpiryDate(expiryDays);

    const invitation = await InvitationModel.create({
      token,
      email: normalizedEmail,
      invitedBy: user._id,
      message,
      expiresAt,
      status: "pending",
    });

    // Send invitation email
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

    const emailSubject = generateInvitationSubject(
      user.name || "The Irish Jazz Forum Team"
    );

    await sendEmail({
      to: normalizedEmail,
      subject: emailSubject,
      html: emailHtml,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: invitation._id.toString(),
        token: invitation.token,
        email: invitation.email,
        expiresAt: invitation.expiresAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Create invitation error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}