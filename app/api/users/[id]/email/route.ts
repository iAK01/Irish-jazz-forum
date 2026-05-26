// /app/api/users/[id]/email/route.ts

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { sendEmail } from "@/lib/email";
import { generateFollowUpEmail } from "@/lib/email-templates/invitation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sender = await requireAuth(["super_admin", "admin"]);
    await dbConnect();

    const { id } = await params;
    const body = await request.json();
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

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

    const user = await UserModel.findById(id).select("name email").lean() as
      | { name?: string; email?: string }
      | null;

    if (!user || !user.email) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const html = generateFollowUpEmail({
      senderName: sender.name || "The Irish Jazz Forum Team",
      invitationLink: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
      expiryDate: "",
      subject,
      message,
    });

    // Use a plain version — strip the CTA button by using the template but without link prominence
    const plainHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background:linear-gradient(135deg,#1a1f2e 0%,#2d3748 100%);padding:28px 30px;text-align:center;">
              <p style="margin:0;color:#cbd5e0;font-size:14px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;">Irish Jazz Forum</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 30px;">
              <p style="margin:0 0 20px;color:#1f2937;font-size:16px;line-height:1.7;white-space:pre-line;">${message}</p>
              <p style="margin:28px 0 0;color:#374151;font-size:15px;">— ${sender.name || "The Irish Jazz Forum Team"}</p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f9fafb;padding:20px 30px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} Irish Jazz Forum. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await sendEmail({
      to: user.email,
      subject,
      html: plainHtml,
      replyTo: sender.email,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to send email" },
      { status: 500 }
    );
  }
}
