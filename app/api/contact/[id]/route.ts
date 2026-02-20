import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { ContactSubmissionModel } from "@/models/ContactSubmission";
import { sendEmail } from "@/lib/email";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(["admin", "super_admin"]);
    await dbConnect();

    const { id } = await params;
    const submission = await ContactSubmissionModel.findById(id)
      .populate("respondedBy", "name email")
      .populate("assignedTo", "name email")
      .lean();

    if (!submission) {
      return NextResponse.json(
        { success: false, error: "Submission not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: submission });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 403 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAuth(["admin", "super_admin"]);
    await dbConnect();

    const { id } = await params;
    const body = await request.json();
    const { status, reply } = body;

    const submission = await ContactSubmissionModel.findById(id);
    if (!submission) {
      return NextResponse.json(
        { success: false, error: "Submission not found" },
        { status: 404 }
      );
    }

    // Status update only
    if (status && !reply) {
      submission.status = status;
      await submission.save();
      return NextResponse.json({ success: true, data: submission });
    }

    // Reply — send email, log it, mark resolved
    if (reply) {
      await sendEmail({
        to: submission.email,
        subject: `Re: Your message to the Irish Jazz Forum`,
        replyTo: process.env.CONTACT_NOTIFICATION_EMAIL || "info@irishjazzforum.ie",
        html: `
          <p>Hi ${submission.name},</p>
          <p>${reply.replace(/\n/g, "<br>")}</p>
          <hr>
          <p style="color:#888;font-size:12px;">
            This is a reply to your enquiry submitted on ${new Date(submission.createdAt).toLocaleDateString("en-IE")}.
          </p>
          <p style="color:#888;font-size:12px;">Your original message: ${submission.message}</p>
          <hr>
          <p>Best regards,<br>The Irish Jazz Forum Team</p>
        `,
      });

      submission.response = reply;
      submission.respondedAt = new Date();
      submission.respondedBy = (authUser as any)._id;
      submission.status = "resolved";
      await submission.save();

      const populated = await ContactSubmissionModel.findById(id)
        .populate("respondedBy", "name email")
        .lean();

      return NextResponse.json({ success: true, data: populated });
    }

    return NextResponse.json(
      { success: false, error: "No valid update provided" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 403 }
    );
  }
}