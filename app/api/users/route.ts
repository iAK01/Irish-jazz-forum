import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { UserModel } from '@/models/User';
import { MemberModel } from '@/models/Member';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth(["super_admin", "admin"]);
    await dbConnect();
    
    const users = await UserModel.find({}).sort({ createdAt: -1 }).lean() as any[];
    const members = await MemberModel.find({}, { name: 1, slug: 1, users: 1 }).lean() as any[];

    // Attach memberOrgs to each user
    const usersWithOrgs = users.map((u) => {
      const memberOrgs = members
        .filter((m) => m.users?.some((mu: any) => mu.userId?.toString() === u._id.toString()))
        .map((m) => {
          const membership = m.users.find((mu: any) => mu.userId?.toString() === u._id.toString());
          return { slug: m.slug, name: m.name, isPrimary: membership?.role === "primary" };
        });
      return { ...u, memberOrgs };
    });

    return NextResponse.json({ success: true, data: usersWithOrgs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 403 });
  }
}