// app/api/users/[id]/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { MemberModel } from "@/models/Member";
import { requireAuth } from "@/lib/auth";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuth(["super_admin", "admin"]);
    await dbConnect();

    const { id } = await params;
    const body = await request.json();
    const { role, memberProfile, workingGroups } = body;

    if (currentUser.role === "admin") {
      const targetUser = await UserModel.findById(id);
      if (targetUser?.role === "super_admin") {
        return NextResponse.json(
          { success: false, error: "Cannot modify super admin" },
          { status: 403 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};

    if (role !== undefined) {
      updateData.role = role;
    }

    if (memberProfile !== undefined) {
      updateData.memberProfile = memberProfile;
    }

    if (workingGroups !== undefined) {
      updateData.workingGroups = workingGroups;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuth(["super_admin", "admin"]);
    await dbConnect();

    const { id } = await params;

    const targetUser = await UserModel.findById(id);
    if (!targetUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Protect super admins
    if (targetUser.role === "super_admin" && currentUser.role !== "super_admin") {
      return NextResponse.json(
        { success: false, error: "Only a super admin can delete another super admin" },
        { status: 403 }
      );
    }

    // Prevent self-deletion
    if (targetUser._id.toString() === currentUser._id?.toString()) {
      return NextResponse.json(
        { success: false, error: "You cannot delete your own account" },
        { status: 403 }
      );
    }

    const userIdStr = targetUser._id.toString();
    // Remove user from any Member org's users array
    await MemberModel.updateMany(
      { "users.userId": userIdStr },
      { $pull: { users: { userId: userIdStr } } }
    );

    // Hard delete the User document
    await UserModel.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: `User ${targetUser.name || targetUser.email} deleted`,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
