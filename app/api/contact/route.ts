import { NextResponse } from "next/server";
import { headers } from "next/headers";
import dbConnect from "@/lib/mongodb";
import { ContactSubmissionModel } from "@/models/ContactSubmission";
import { sendEmail } from "@/lib/email";

// Simple in-memory rate limiter — max 3 submissions per IP per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return false;
  }

  if (entry.count >= 3) return true;

  entry.count++;
  return false;
}

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: ip,
    }),
  });
  const data = await res.json();
  return data.success === true;
}

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      "unknown";

    // Rate limiting
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, organization, inquiryType, message, honeypot, turnstileToken } = body;

    // Honeypot — bots fill hidden fields, humans don't
    if (honeypot) {
      // Return success so bots don't know they've been caught
      return NextResponse.json({ success: true, data: { message: "Submitted" } });
    }

    // Turnstile verification
    if (!turnstileToken) {
      return NextResponse.json(
        { success: false, error: "Security check failed. Please try again." },
        { status: 400 }
      );
    }

    const turnstileValid = await verifyTurnstile(turnstileToken, ip);
    if (!turnstileValid) {
      return NextResponse.json(
        { success: false, error: "Security check failed. Please try again." },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!name || !email || !inquiryType || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    const submission = await ContactSubmissionModel.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      organization: organization?.trim() || undefined,
      inquiryType,
      message: message.trim(),
      status: "new",
    });

    // Admin notification email
    try {
      await sendEmail({
        to: process.env.CONTACT_NOTIFICATION_EMAIL || "info@irishjazzforum.ie",
        subject: `New Contact Form Submission: ${inquiryType}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${organization ? `<p><strong>Organization:</strong> ${organization}</p>` : ""}
          <p><strong>Inquiry Type:</strong> ${inquiryType}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br>")}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString("en-IE")}</p>
          <hr>
          <p><small>View in admin dashboard: ${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/admin/contact/${submission._id}</small></p>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send admin notification email:", emailError);
    }

    // Auto-reply to submitter
    try {
      await sendEmail({
        to: email,
        subject: "Thank you for contacting the Irish Jazz Forum",
        html: `
          <h2>Thank you for your message</h2>
          <p>Hi ${name},</p>
          <p>Thank you for contacting the Irish Jazz Forum. We've received your ${inquiryType.toLowerCase()} and will get back to you as soon as possible.</p>
          <p><strong>Your message:</strong></p>
          <p>${message.replace(/\n/g, "<br>")}</p>
          <hr>
          <p>Best regards,<br>The Irish Jazz Forum Team</p>
          <p><small>This is an automated message. Please do not reply to this email.</small></p>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send auto-reply email:", emailError);
    }

    return NextResponse.json({
      success: true,
      data: { id: submission._id, message: "Contact form submitted successfully" },
    });
  } catch (error: any) {
    console.error("Contact form submission error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit contact form" },
      { status: 500 }
    );
  }
}

// GET /api/contact — admin only, list all submissions
export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const inquiryType = searchParams.get("inquiryType");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const query: any = {};
    if (status) query.status = status;
    if (inquiryType) query.inquiryType = inquiryType;

    const submissions = await ContactSubmissionModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("assignedTo", "name email")
      .populate("respondedBy", "name email")
      .lean();

    const total = await ContactSubmissionModel.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: submissions,
      pagination: { page, limit, total, hasMore: skip + submissions.length < total },
    });
  } catch (error: any) {
    console.error("Contact submissions list error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}