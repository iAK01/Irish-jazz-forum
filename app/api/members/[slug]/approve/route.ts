// /app/api/members/[slug]/approve/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import { MemberModel } from "@/models/Member";
import { UserModel } from "@/models/User";
import {
  generateMemberApprovedEmail,
  generateMemberApprovedSubject,
} from "@/lib/email-templates/member-approved";
import { sendEmail } from "@/lib/email";

// PATCH /api/members/[slug]/approve
// Approve pending member (admin only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
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

    const { slug } = await params;

    // Find by slug instead of ID
    const member = await MemberModel.findOne({ slug });

    if (!member) {
      return NextResponse.json(
        { success: false, error: "Member not found" },
        { status: 404 }
      );
    }

    if (member.membershipStatus !== "prospective") {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot approve member with status: ${member.membershipStatus}`,
        },
        { status: 400 }
      );
    }

    // Update member status to active
    member.membershipStatus = "active";
    await member.save();

    // Find the user by memberProfile slug
    const memberUser = await UserModel.findOne({
      memberProfile: slug,
    }).lean() as any;

    if (memberUser && memberUser.email) {
      const dashboardLink = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`;

      const emailHtml = generateMemberApprovedEmail({
        memberName: member.name,
        dashboardLink,
      });

      await sendEmail({
        to: memberUser.email,
        subject: generateMemberApprovedSubject(),
        html: emailHtml,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Member approved successfully",
      data: {
        memberId: member._id.toString(),
        status: member.membershipStatus,
      },
    });
  } catch (error: any) {
    console.error("Approve member error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}