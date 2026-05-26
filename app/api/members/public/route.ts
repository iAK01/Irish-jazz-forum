// /app/api/members/public/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import { MemberModel } from "@/models/Member";

// GET /api/members/public
// Get all members with public profiles (no auth required)
// Admins receive additional fields: lastProfileReminderSentAt, hasLinkedUsers
export async function GET() {
  try {
    await dbConnect();

    const session = await auth();
    const isAdmin =
      session?.user?.role === "admin" || session?.user?.role === "super_admin";

    const baseSelect =
      "name slug memberType region cityTown shortTagline heroImageUrl logoUrl publicTags description website";
    const adminSelect = isAdmin
      ? " lastProfileReminderSentAt users"
      : "";

    const members = await MemberModel.find({
      "privacySettings.publicProfile": true,
      membershipStatus: "active",
    })
      .select(baseSelect + adminSelect)
      .sort({ name: 1 })
      .lean();

    // For admins, replace full users array with a simple boolean
    const data = isAdmin
      ? members.map((m: any) => ({
          ...m,
          hasLinkedUsers: Array.isArray(m.users) && m.users.length > 0,
          users: undefined,
        }))
      : members;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("Public members list error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}