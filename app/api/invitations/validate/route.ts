// /app/api/invitations/validate/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { validateInvitationToken } from "@/lib/invitation-helpers";
import { MemberModel } from "@/models/Member";

// POST /api/invitations/validate
// Public endpoint — no auth required
export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token is required" },
        { status: 400 }
      );
    }

    const result = await validateInvitationToken(token);

    if (!result.valid) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    const invitation = result.invitation;

    // For join_member invitations, fetch the existing member name so we can
    // display it on the onboarding screen
    let existingMemberName: string | undefined;
    if (invitation.invitationType === "join_member" && invitation.memberSlug) {
      const member = await MemberModel.findOne(
        { slug: invitation.memberSlug },
        { name: 1 }
      ).lean() as any;
      existingMemberName = member?.name;
    }

    return NextResponse.json({
      success: true,
      data: {
        email: invitation.email,
        message: invitation.message,
        expiresAt: invitation.expiresAt,
        inviterName: invitation.invitedBy?.name || "The Irish Jazz Forum Team",
        invitationType: invitation.invitationType || "new_member",
        memberSlug: invitation.memberSlug || null,
        memberName: existingMemberName || null,
      },
    });
  } catch (error: any) {
    console.error("Validate invitation error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}