// app/api/publications/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import { PublicationModel } from "@/models/Publication";
import { UserModel } from "@/models/User";

// GET /api/publications
// Public: returns public items only
// Members+: returns public + members_only
// Admin/Team: returns all including drafts
export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category"); // "news" | "resource"
    const status = searchParams.get("status");

    const session = await auth();
    let userRole = "public";

    if (session?.user?.email) {
      const user = await UserModel.findOne({ email: session.user.email }).lean() as any;
      userRole = user?.role || "public";
    }

    const isAdmin = ["admin", "super_admin", "team"].includes(userRole);
    const isMember = ["member", "working_group", "steering", "admin", "super_admin", "team"].includes(userRole);

    // Build status filter based on role
    let statusFilter: any;
    if (isAdmin && status) {
      statusFilter = status;
    } else if (isAdmin) {
      statusFilter = { $in: ["draft", "members_only", "public"] };
    } else if (isMember) {
      statusFilter = { $in: ["members_only", "public"] };
    } else {
      statusFilter = "public";
    }

    const query: any = { status: statusFilter };
    if (category) query.category = category;

    const publications = await PublicationModel.find(query)
      .populate("author", "name")
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: publications });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/publications — admin/team only
export async function POST(request: Request) {
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

    const body = await request.json();
    const { title, excerpt, body: content, category, resourceType, status, tags, attachments, slug } = body;

    if (!title || !excerpt || !content || !category || !slug) {
      return NextResponse.json(
        { success: false, error: "title, excerpt, body, category, and slug are required" },
        { status: 400 }
      );
    }

    const existing = await PublicationModel.findOne({ slug });
    if (existing) {
      return NextResponse.json({ success: false, error: "A publication with this slug already exists" }, { status: 400 });
    }

    const publication = await PublicationModel.create({
      title,
      slug,
      excerpt,
      body: content,
      category,
      resourceType: category === "resource" ? resourceType : undefined,
      status: status || "draft",
      author: user._id,
      tags: tags || [],
      attachments: attachments || [],
      publishedAt: status === "public" ? new Date() : undefined,
    });

    return NextResponse.json({ success: true, data: publication });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}