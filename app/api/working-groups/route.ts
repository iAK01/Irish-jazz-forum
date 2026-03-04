import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { WorkingGroupModel } from "@/models/Workinggroup";
import { requireAuth } from "@/lib/auth";
import slugify from "slugify";
import { createWorkingGroupFolder } from "@/lib/googledrive";
import mongoose from "mongoose";

// GET /api/working-groups
// List all working groups (filtered by user access)
export async function GET(request: Request) {
  try {
    const currentUser = await requireAuth();
    await dbConnect();

    let query: any = { isActive: true, deleted: { $ne: true } };

    if (
      currentUser.role !== "super_admin" &&
      currentUser.role !== "admin" &&
      currentUser.role !== "steering"
    ) {
      const groupIds = (currentUser.workingGroups || []).map(
        (id: string) => new mongoose.Types.ObjectId(id)
      );

      query.$or = [
        { isPrivate: false },
        { members: currentUser._id },
        { _id: { $in: groupIds } },
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

    const baseSlug = slugify(name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await WorkingGroupModel.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    let driveFolderId: string | undefined;

    try {
      driveFolderId = await createWorkingGroupFolder(name.trim());
    } catch (driveError) {
      console.error("Failed to create Drive folder:", driveError);
    }

    const group = await WorkingGroupModel.create({
      name: name.trim(),
      slug,
      description: description.trim(),
      coordinator: coordinatorId,
      members: [coordinatorId],
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