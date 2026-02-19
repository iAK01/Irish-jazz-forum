// /app/api/invitations/[invitationId]/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import { InvitationModel } from "@/models/Invitation";
import { UserModel } from "@/models/User";
import {
  generateInvitationEmail,
  generateInvitationSubject,
} from "@/lib/email-templates/invitation";
import { sendEmail } from "@/lib/email";

// GET /api/invitations/[invitationId]
// Get single invitation details (admin only)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ invitationId: string }> }
) {
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

    const { invitationId } = await params;

    const invitation = await InvitationModel.findById(invitationId)
      .populate("invitedBy", "name email")
      .populate("memberCreated", "name slug")
      .lean();

    if (!invitation) {
      return NextResponse.json(
        { success: false, error: "Invitation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: invitation,
    });
  } catch (error: any) {
    console.error("Get invitation error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/invitations/[invitationId]
// Resend or revoke invitation (admin only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ invitationId: string }> }
) {
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

    const { invitationId } = await params;
    const body = await request.json();
    const { action } = body; // "resend" or "revoke"

    const invitation = await InvitationModel.findById(invitationId);

    if (!invitation) {
      return NextResponse.json(
        { success: false, error: "Invitation not found" },
        { status: 404 }
      );
    }

    if (action === "revoke") {
      // Revoke invitation
      invitation.status = "revoked";
      await invitation.save();

      return NextResponse.json({
        success: true,
        message: "Invitation revoked successfully",
      });
    } else if (action === "resend") {
      // Can only resend pending or expired invitations
      if (!["pending", "expired"].includes(invitation.status)) {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot resend invitation with status: ${invitation.status}`,
          },
          { status: 400 }
        );
      }

      // Reset status to pending if it was expired
      if (invitation.status === "expired") {
        invitation.status = "pending";
      }

      // Extend expiry by 30 days from now
      const newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + 30);
      invitation.expiresAt = newExpiry;
      await invitation.save();

      // Resend email
      const invitationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/join?token=${invitation.token}`;
      const expiryDateFormatted = newExpiry.toLocaleDateString("en-IE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const emailHtml = generateInvitationEmail({
        inviterName: user.name || "The Irish Jazz Forum Team",
        invitationLink,
        expiryDate: expiryDateFormatted,
        personalMessage: invitation.message,
      });

      const emailSubject = generateInvitationSubject(
        user.name || "The Irish Jazz Forum Team"
      );

      await sendEmail({
        to: invitation.email,
        subject: emailSubject,
        html: emailHtml,
      });

      return NextResponse.json({
        success: true,
        message: "Invitation resent successfully",
        data: {
          expiresAt: invitation.expiresAt.toISOString(),
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid action. Use 'resend' or 'revoke'" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Update invitation error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/invitations/[invitationId]
// Delete invitation (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ invitationId: string }> }
) {
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

    const { invitationId } = await params;

    const invitation = await InvitationModel.findByIdAndDelete(invitationId);

    if (!invitation) {
      return NextResponse.json(
        { success: false, error: "Invitation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Invitation deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete invitation error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}