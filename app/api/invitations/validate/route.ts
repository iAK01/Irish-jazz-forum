// /app/api/invitations/validate/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { validateInvitationToken } from "@/lib/invitation-helpers";

// POST /api/invitations/validate
// Validate invitation token (public endpoint - no auth required)
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

    // Return safe invitation data (don't expose internal IDs or tokens)
    return NextResponse.json({
      success: true,
      data: {
        email: result.invitation.email,
        message: result.invitation.message,
        invitedBy: {
          name: result.invitation.invitedBy.name,
        },
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