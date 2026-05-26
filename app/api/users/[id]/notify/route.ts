// /app/api/users/[id]/notify/route.ts
// Sends working group add/remove notifications to a specific user.

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { WorkingGroupModel } from "@/models/Workinggroup";
import { sendEmail } from "@/lib/email";
import {
  generateWorkingGroupAddedEmail,
  generateWorkingGroupAddedSubject,
} from "@/lib/email-templates/working-group-added";
import {
  generateWorkingGroupRemovedEmail,
  generateWorkingGroupRemovedSubject,
} from "@/lib/email-templates/working-group-removed";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sender = await requireAuth(["super_admin", "admin"]);
    await dbConnect();

    const { id } = await params;
    const body = await request.json();
    const { groupId, action } = body; // action: "added" | "removed"

    if (!groupId) {
      return NextResponse.json(
        { success: false, error: "groupId is required" },
        { status: 400 }
      );
    }
    if (action !== "added" && action !== "removed") {
      return NextResponse.json(
        { success: false, error: "action must be 'added' or 'removed'" },
        { status: 400 }
      );
    }

    const [user, group] = await Promise.all([
      UserModel.findById(id).select("name email").lean() as Promise<{ name?: string; email?: string } | null>,
      WorkingGroupModel.findById(groupId).select("name slug description").lean() as Promise<{ name: string; slug: string; description?: string } | null>,
    ]);

    if (!user || !user.email) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
    if (!group) {
      return NextResponse.json(
        { success: false, error: "Working group not found" },
        { status: 404 }
      );
    }

    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "").replace(/\/+$/, "");
    const senderName = sender.name || "The Irish Jazz Forum Team";
    const recipientName = user.name || user.email;

    if (action === "added") {
      await sendEmail({
        to: user.email,
        subject: generateWorkingGroupAddedSubject(group.name),
        html: generateWorkingGroupAddedEmail({
          recipientName,
          groupName: group.name,
          groupDescription: group.description,
          forumUrl: `${baseUrl}/dashboard/forum/${group.slug}`,
          addedByName: senderName,
        }),
      });
    } else {
      await sendEmail({
        to: user.email,
        subject: generateWorkingGroupRemovedSubject(group.name),
        html: generateWorkingGroupRemovedEmail({
          recipientName,
          groupName: group.name,
          senderName,
          forumUrl: `${baseUrl}/dashboard/forum`,
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to send notification" },
      { status: 500 }
    );
  }
}
