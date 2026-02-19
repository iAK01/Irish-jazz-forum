import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { UserModel } from '@/models/User';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth(["super_admin", "admin"]);
    await dbConnect();
    
    const users = await UserModel.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 403 });
  }
}