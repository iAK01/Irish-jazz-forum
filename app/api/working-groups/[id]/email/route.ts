import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { WorkingGroupModel } from "@/models/Workinggroup";
import { UserModel } from "@/models/User";
import { sendEmail } from "@/lib/email";
import { generateWorkingGroupMessageEmail } from "@/lib/email-templates/working-group-message";

type Audience = "members_only" | "members_and_coordinator" | "coordinator_only";

function normalizeAudience(value: unknown): Audience {
  if (
    value === "members_only" ||
    value === "members_and_coordinator" ||
    value === "coordinator_only"
  ) {
    return value;
  }

  return "members_and_coordinator";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuth();
    await dbConnect();

    const { id } = await params;
    const body = await request.json();
    const subject =
      typeof body.subject === "string" ? body.subject.trim() : "";
    const message =
      typeof body.message === "string" ? body.message.trim() : "";
    const audience = normalizeAudience(body.audience);

    if (!subject) {
      return NextResponse.json(
        { success: false, error: "Subject is required" },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    const group = (await WorkingGroupModel.findById(id)
      .populate("coordinator", "name email _id")
      .lean()) as
      | {
          _id: unknown;
          name: string;
          slug: string;
          googleDriveFolderId?: string;
          coordinator?: { name?: string; email?: string } | null;
        }
      | null;

    if (!group) {
      return NextResponse.json(
        { success: false, error: "Working group not found" },
        { status: 404 }
      );
    }

    // Allow admins, super_admins, and the coordinator of this specific group
    const isAdmin =
      currentUser.role === "admin" || currentUser.role === "super_admin";
    const isCoordinator =
      (group.coordinator as any)?._id?.toString() === currentUser._id.toString();

    if (!isAdmin && !isCoordinator) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    const assignedUsers = (await UserModel.find({
      workingGroups: id,
    })
      .select("name email")
      .lean()) as Array<{ name?: string; email?: string }>;

    const recipients = new Map<string, { name: string; email: string }>();

    const addRecipient = (user?: { name?: string; email?: string } | null) => {
      const email = user?.email?.trim().toLowerCase();
      if (!email) return;

      recipients.set(email, {
        name: user?.name?.trim() || email,
        email,
      });
    };

    if (audience === "members_only" || audience === "members_and_coordinator") {
      assignedUsers.forEach((user) => addRecipient(user));
    }

    if (audience === "members_and_coordinator" || audience === "coordinator_only") {
      addRecipient(group.coordinator || null);
    }

    const recipientList = Array.from(recipients.values());

    if (recipientList.length === 0) {
      return NextResponse.json(
        { success: false, error: "No recipients found for this audience" },
        { status: 400 }
      );
    }

    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "").replace(/\/+$/, "");
    const forumUrl = baseUrl
      ? `${baseUrl}/dashboard/forum/${group.slug}`
      : undefined;
    const driveUrl = group.googleDriveFolderId
      ? `https://drive.google.com/drive/folders/${group.googleDriveFolderId}`
      : undefined;

    await Promise.all(
      recipientList.map((recipient) =>
        sendEmail({
          to: recipient.email,
          subject,
          replyTo: currentUser.email,
          html: generateWorkingGroupMessageEmail({
            senderName: currentUser.name || "Irish Jazz Forum",
            groupName: group.name,
            message,
            forumUrl,
            driveUrl,
          }),
          from: "Irish Jazz Forum <hello@irishjazzforum.com>",
        })
      )
    );

    return NextResponse.json({
      success: true,
      data: {
        recipientCount: recipientList.length,
        recipients: recipientList,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send email",
      },
      { status: 500 }
    );
  }
}
