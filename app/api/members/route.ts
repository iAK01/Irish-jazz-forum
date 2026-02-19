// MODIFICATION FOR: /app/api/members/route.ts
// CHANGE: Add status filter support for ?status=prospective

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { MemberModel } from '@/models/Member';
import { UserModel } from '@/models/User';
import { requireAuth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    await dbConnect();
    
    const body = await request.json();
    
    const existing = await MemberModel.findOne({ slug: body.slug });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Slug already exists" },
        { status: 400 }
      );
    }
    
    const member = await MemberModel.create({
      ...body,
      joinedAt: new Date(),
      membershipStatus: 'prospective'
    });
    
    await UserModel.findByIdAndUpdate(user.id, {
      memberProfile: body.slug
    });
    
    return NextResponse.json({ success: true, data: member });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const publicOnly = searchParams.get('public') === 'true';
    const status = searchParams.get('status'); // ADDED: 'prospective', 'active', etc.
    
    const query: any = publicOnly 
      ? { 'privacySettings.publicProfile': true }
      : {};
    
    // ADDED: Status filter if provided
    if (status) {
      query.membershipStatus = status;
    }
    
    const members = await MemberModel.find(query).sort({ name: 1 });
    
    return NextResponse.json({ success: true, data: members });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}