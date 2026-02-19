// /app/api/members/public/[slug]/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { MemberModel } from "@/models/Member";

// GET /api/members/public/[slug]
// Get single member public profile (no auth required)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();
    const { slug } = await params;

    const member = await MemberModel.findOne({
      slug,
      "privacySettings.publicProfile": true,
      membershipStatus: "active",
    })
      .select(
        `name slug memberType region cityTown county shortTagline longBio 
        logoUrl heroImageUrl galleryImageUrls publicTags keyProjects pressQuotes 
        contactInfo.website contactInfo.socialMedia geographicReach 
        primaryArtformTags activityModes partnerships.networkMemberships`
      )
      .lean();

    if (!member) {
      return NextResponse.json(
        { success: false, error: "Member not found or profile not public" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: member,
    });
  } catch (error: any) {
    console.error("Public member profile error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}