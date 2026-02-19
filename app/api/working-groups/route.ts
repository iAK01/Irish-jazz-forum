import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { WorkingGroupModel } from "@/models/Workinggroup";
import { requireAuth } from "@/lib/auth";
import slugify from "slugify";
import { createWorkingGroupFolder } from "@/lib/googledrive";

// GET /api/working-groups
// List all working groups (filtered by user access)
export async function GET(request: Request) {
  try {
    const currentUser = await requireAuth();
    await dbConnect();

let query: any = { isActive: true, deleted: { $ne: true } };

    // Non-admin users only see groups they have access to
    if (currentUser.role !== "super_admin" && currentUser.role !== "admin" && currentUser.role !== "steering") {
      query.$or = [
        { isPrivate: false }, // Public groups
        { members: currentUser._id }, // Groups they're a member of
      ];
    }

    const groups = await WorkingGroupModel.find(query)
      .populate("coordinator", "name email image")
      .populate("members", "name email image")
      .populate("createdBy", "name email")
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({ success: true, data: groups });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/working-groups
// Create a new working group (admin only)
export async function POST(request: Request) {
  try {
    const currentUser = await requireAuth(["admin", "super_admin"]);
    await dbConnect();

    const body = await request.json();
    const { name, description, coordinatorId, isPrivate } = body;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Name required" },
        { status: 400 }
      );
    }

    if (!description || description.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Description required" },
        { status: 400 }
      );
    }

    if (!coordinatorId) {
      return NextResponse.json(
        { success: false, error: "Coordinator required" },
        { status: 400 }
      );
    }

    // Generate unique slug
    const baseSlug = slugify(name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await WorkingGroupModel.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create Google Drive folder for this working group
    let driveFolderId: string | undefined;
    try {
      driveFolderId = await createWorkingGroupFolder(name.trim());
    } catch (driveError) {
      console.error("Failed to create Drive folder:", driveError);
      // Continue without Drive folder - can be added later manually
    }

    // Create working group
    const group = await WorkingGroupModel.create({
      name: name.trim(),
      slug,
      description: description.trim(),
      coordinator: coordinatorId,
      members: [coordinatorId], // Coordinator is automatically a member
      isPrivate: isPrivate || false,
      googleDriveFolderId: driveFolderId,
      createdBy: currentUser._id,
      isActive: true,
    });

    const populatedGroup = await WorkingGroupModel.findById(group._id)
      .populate("coordinator", "name email image")
      .populate("members", "name email image")
      .populate("createdBy", "name email")
      .lean();

    return NextResponse.json({ success: true, data: populatedGroup });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}