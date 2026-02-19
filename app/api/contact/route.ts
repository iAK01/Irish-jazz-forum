// /app/api/contact/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { ContactSubmissionModel } from "@/models/ContactSubmission";
import { sendEmail } from "@/lib/email";

// POST /api/contact
// Submit contact form (public endpoint, no auth required)
export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, email, organization, inquiryType, message, attachment } = body;

    // Validate required fields
    if (!name || !email || !inquiryType || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create contact submission
    const submission = await ContactSubmissionModel.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      organization: organization?.trim() || undefined,
      inquiryType,
      message: message.trim(),
      attachment: attachment || undefined,
      status: "new",
    });

    // Send email notification to admins
    try {
      await sendEmail({
        to: process.env.CONTACT_NOTIFICATION_EMAIL || "info@irishjazzforum.ie",
        subject: `New Contact Form Submission: ${inquiryType}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${organization ? `<p><strong>Organization:</strong> ${organization}</p>` : ''}
          <p><strong>Inquiry Type:</strong> ${inquiryType}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          ${attachment ? `<p><strong>Attachment:</strong> <a href="${attachment.url}">${attachment.filename}</a></p>` : ''}
          <p><strong>Submitted:</strong> ${new Date().toLocaleString('en-IE')}</p>
          <hr>
          <p><small>View in admin dashboard: ${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/admin/contact/${submission._id}</small></p>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send admin notification email:", emailError);
      // Don't fail the request if email fails
    }

    // Send auto-reply to submitter
    try {
      await sendEmail({
        to: email,
        subject: "Thank you for contacting the Irish Jazz Forum",
        html: `
          <h2>Thank you for your message</h2>
          <p>Hi ${name},</p>
          <p>Thank you for contacting the Irish Jazz Forum. We've received your ${inquiryType.toLowerCase()} and will get back to you as soon as possible.</p>
          <p><strong>Your message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p>Best regards,<br>The Irish Jazz Forum Team</p>
          <p><small>This is an automated message. Please do not reply to this email.</small></p>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send auto-reply email:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      data: {
        id: submission._id,
        message: "Contact form submitted successfully",
      },
    });
  } catch (error: any) {
    console.error("Contact form submission error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit contact form" },
      { status: 500 }
    );
  }
}

// GET /api/contact
// List all contact submissions (admin only)
export async function GET(request: Request) {
  try {
    // This will be protected by middleware or auth check
    // For now, just return submissions
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
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + submissions.length < total,
      },
    });
  } catch (error: any) {
    console.error("Contact submissions list error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}