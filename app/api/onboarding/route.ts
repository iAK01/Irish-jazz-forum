// /app/api/onboarding/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { MemberModel } from "@/models/Member";
import { validateInvitationToken, markInvitationUsed } from "@/lib/invitation-helpers";
import {
  generateMemberPendingEmail,
  generateMemberPendingSubject,
} from "@/lib/email-templates/member-pending";
import { sendEmail } from "@/lib/email";

// POST /app/api/onboarding
// Complete member onboarding (authenticated users only)
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "You must be signed in to complete onboarding" },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { token, profileData } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Invitation token is required" },
        { status: 400 }
      );
    }

    // Validate invitation token
    const validation = await validateInvitationToken(token);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const invitation = validation.invitation;

    // CRITICAL: Verify that the authenticated email matches the invited email
    const authenticatedEmail = session.user.email.toLowerCase();
    const invitedEmail = invitation.email.toLowerCase();

    if (authenticatedEmail !== invitedEmail) {
      return NextResponse.json(
        {
          success: false,
          error: `This invitation was sent to ${invitedEmail}. Please sign in with that email address.`,
        },
        { status: 403 }
      );
    }

    // Determine the name to use: prefer what they entered in the form,
    // fall back to OAuth name from session
    const resolvedName = profileData.name?.trim() || session.user.name || authenticatedEmail;

    // Find or create the User in our custom UserModel
    // (The NextAuth adapter creates its own record; we maintain a separate one)
    let user = await UserModel.findOne({ email: authenticatedEmail });

    if (!user) {
      user = await UserModel.create({
        email: authenticatedEmail,
        name: resolvedName,
        image: session.user.image || undefined,
        // googleId intentionally omitted for magic link users
        role: "member",
      });
    } else {
      // Update name if it was missing (e.g. magic link user who had no name yet)
      if (!user.name || user.name === authenticatedEmail) {
        user.name = resolvedName;
        await user.save();
      }
    }

    // Check if member profile slug is already taken
    const existingMember = await MemberModel.findOne({ slug: profileData.slug });
    if (existingMember) {
      return NextResponse.json(
        { success: false, error: "A member with this slug already exists. Please choose a different URL slug." },
        { status: 400 }
      );
    }

    // Create Member profile with prospective status
    // Store userId and userEmail for reliable User↔Member lookups in both directions
    const member = await MemberModel.create({
      ...profileData,
      name: resolvedName, // Use the resolved name, not whatever came in profileData
      userId: user._id.toString(),
      userEmail: authenticatedEmail,
      membershipStatus: "prospective",
      joinedAt: new Date(),
      privacySettings: {
        publicProfile: profileData.privacySettings?.publicProfile ?? true,
        shareDataForAdvocacy: profileData.privacySettings?.shareDataForAdvocacy ?? false,
        consentDate: new Date(),
        consentVersion: "1.0",
      },
    });

    // Link the Member back to the User
    await UserModel.findByIdAndUpdate(user._id, {
      memberProfile: member.slug,
      role: "member", // Ensure role is set
    });

    // Mark invitation as used
    await markInvitationUsed(token, member._id.toString());

    // Notify admins
    const admins = await UserModel.find({
      role: { $in: ["admin", "super_admin"] },
    }).lean();

    const reviewLink = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/admin/members/${member.slug}/review`;

    for (const admin of admins) {
      const emailHtml = generateMemberPendingEmail({
        adminName: admin.name || "Admin",
        memberName: member.name,
        memberEmail: authenticatedEmail,
        memberType: Array.isArray(member.memberType)
          ? member.memberType.join(", ")
          : member.memberType,
        reviewLink,
      });

      await sendEmail({
        to: admin.email,
        subject: generateMemberPendingSubject(member.name),
        html: emailHtml,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Profile submitted successfully. Awaiting admin approval.",
      data: {
        memberId: member._id.toString(),
        memberSlug: member.slug,
        status: member.membershipStatus,
      },
    });
  } catch (error: any) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}