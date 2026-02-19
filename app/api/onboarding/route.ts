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

    const validation = await validateInvitationToken(token);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const invitation = validation.invitation;
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

    const resolvedName = profileData.personalName?.trim() || session.user.name || authenticatedEmail;

    // Find or create the User in our custom UserModel
    let user = await UserModel.findOne({ email: authenticatedEmail });

    if (!user) {
      user = await UserModel.create({
        email: authenticatedEmail,
        name: resolvedName,
        image: session.user.image || undefined,
        role: "member",
      });
    } else {
      if (!user.name || user.name === authenticatedEmail) {
        user.name = resolvedName;
        await user.save();
      }
    }

    const invitationType = invitation.invitationType || "new_member";

    // =============================================
    // PATH A: Join an existing member organisation
    // =============================================
    if (invitationType === "join_member") {
      const memberSlug = invitation.memberSlug;

      if (!memberSlug) {
        return NextResponse.json(
          { success: false, error: "No member organisation specified in this invitation" },
          { status: 400 }
        );
      }

      const existingMember = await MemberModel.findOne({ slug: memberSlug });

      if (!existingMember) {
        return NextResponse.json(
          { success: false, error: "The member organisation this invitation references no longer exists" },
          { status: 404 }
        );
      }

      // Check user isn't already attached to this member
      const alreadyLinked = existingMember.users?.some(
        (u: any) => u.userEmail === authenticatedEmail
      );

      if (!alreadyLinked) {
        await MemberModel.findByIdAndUpdate(existingMember._id, {
          $push: {
            users: {
              userId: user._id.toString(),
              userEmail: authenticatedEmail,
              role: "staff",
              addedAt: new Date(),
            },
          },
        });
      }

      // Link User to this member profile
      await UserModel.findByIdAndUpdate(user._id, {
        memberProfile: memberSlug,
        role: "member",
      });

      await markInvitationUsed(token, existingMember._id.toString());

      return NextResponse.json({
        success: true,
        message: `You have been added to ${existingMember.name}.`,
        data: {
          memberId: existingMember._id.toString(),
          memberSlug: existingMember.slug,
          memberName: existingMember.name,
          status: existingMember.membershipStatus,
          invitationType: "join_member",
        },
      });
    }

    // =============================================
    // PATH B: Create a new member organisation
    // =============================================
    const existingMember = await MemberModel.findOne({ slug: profileData.slug });
    if (existingMember) {
      return NextResponse.json(
        { success: false, error: "A member with this slug already exists. Please choose a different URL slug." },
        { status: 400 }
      );
    }

    const member = await MemberModel.create({
      ...profileData,
      name: profileData.name?.trim() || resolvedName,
      users: [
        {
          userId: user._id.toString(),
          userEmail: authenticatedEmail,
          role: "primary",
          addedAt: new Date(),
        },
      ],
      membershipStatus: "prospective",
      joinedAt: new Date(),
      privacySettings: {
        publicProfile: profileData.privacySettings?.publicProfile ?? true,
        shareDataForAdvocacy: profileData.privacySettings?.shareDataForAdvocacy ?? false,
        consentDate: new Date(),
        consentVersion: "1.0",
      },
    });

    // Link User to the new member profile
    await UserModel.findByIdAndUpdate(user._id, {
      memberProfile: member.slug,
      role: "member",
    });

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
        invitationType: "new_member",
      },
    });
  } catch (error: any) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}