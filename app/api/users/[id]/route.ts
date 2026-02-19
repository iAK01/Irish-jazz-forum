import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { UserModel } from '@/models/User';
import { requireAuth } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuth(["super_admin", "admin"]);
    await dbConnect();
    
    const body = await request.json();
    const { role, memberProfile, workingGroups } = body;
    
    // Admin can't change super_admin roles
    if (currentUser.role === "admin") {
      const targetUser = await UserModel.findById(id);
      if (targetUser?.role === "super_admin") {
        return NextResponse.json(
          { success: false, error: "Cannot modify super admin" },
          { status: 403 }
        );
      }
    }
    
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { role, memberProfile, workingGroups },
      { new: true }
    );
    
    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}