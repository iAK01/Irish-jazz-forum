// /app/api/users/[id]/notify/route.ts
// Sends a "you've been added to a working group" notification to a specific user.

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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sender = await requireAuth(["super_admin", "admin"]);
    await dbConnect();

    const { id } = await params;
    const body = await request.json();
    const { groupId } = body;

    if (!groupId) {
      return NextResponse.json(
        { success: false, error: "groupId is required" },
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
    const forumUrl = `${baseUrl}/dashboard/forum/${group.slug}`;

    await sendEmail({
      to: user.email,
      subject: generateWorkingGroupAddedSubject(group.name),
      html: generateWorkingGroupAddedEmail({
        recipientName: user.name || user.email,
        groupName: group.name,
        groupDescription: group.description,
        forumUrl,
        addedByName: sender.name || "The Irish Jazz Forum Team",
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to send notification" },
      { status: 500 }
    );
  }
}
