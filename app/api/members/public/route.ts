// /app/api/members/public/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { MemberModel } from "@/models/Member";

// GET /api/members/public
// Get all members with public profiles (no auth required)
export async function GET() {
  try {
    await dbConnect();

    // Only return members who have opted in to public profiles and are active
    const members = await MemberModel.find({
      "privacySettings.publicProfile": true,
      membershipStatus: "active",
    })
      .select(
        "name slug memberType region cityTown shortTagline heroImageUrl logoUrl publicTags"
      )
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: members,
    });
  } catch (error: any) {
    console.error("Public members list error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}