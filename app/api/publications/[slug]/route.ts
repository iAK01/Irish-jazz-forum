// app/api/publications/[slug]/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import { PublicationModel } from "@/models/Publication";
import { UserModel } from "@/models/User";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();
    const { slug } = await params;

    const session = await auth();
    let userRole = "public";
    if (session?.user?.email) {
      const user = await UserModel.findOne({ email: session.user.email }).lean() as any;
      userRole = user?.role || "public";
    }

    const publication = await PublicationModel.findOne({ slug })
      .populate("author", "name")
      .lean() as any;

    if (!publication) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    const isAdmin = ["admin", "super_admin", "team"].includes(userRole);
    const isMember = ["member", "working_group", "steering", "admin", "super_admin", "team"].includes(userRole);

    if (publication.status === "draft" && !isAdmin) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }
    if (publication.status === "members_only" && !isMember) {
      return NextResponse.json({ success: false, error: "Members only" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: publication });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await UserModel.findOne({ email: session.user.email });

    if (!user || !["admin", "super_admin", "team"].includes(user.role)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { slug } = await params;
    const body = await request.json();

    // If publishing for the first time, set publishedAt
    if (body.status === "public") {
      const existing = await PublicationModel.findOne({ slug });
      if (existing && !existing.publishedAt) {
        body.publishedAt = new Date();
      }
    }

    const publication = await PublicationModel.findOneAndUpdate(
      { slug },
      body,
      { new: true }
    );

    if (!publication) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: publication });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await UserModel.findOne({ email: session.user.email });

    if (!user || !["admin", "super_admin"].includes(user.role)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { slug } = await params;
    const publication = await PublicationModel.findOneAndDelete({ slug });

    if (!publication) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Publication deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}