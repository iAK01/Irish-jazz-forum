import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { MemberModel } from '@/models/Member';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await dbConnect();
    
    const member = await MemberModel.findOne({ slug: params.slug });
    
    if (!member) {
      return NextResponse.json(
        { success: false, error: "Member not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: member });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await requireAuth();
    await dbConnect();
    
    if (user.memberProfile !== params.slug && 
        !['admin', 'super_admin', 'team'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    body.lastProfileUpdatedAt = new Date();
    
    const member = await MemberModel.findOneAndUpdate(
      { slug: params.slug },
      body,
      { new: true }
    );
    
    if (!member) {
      return NextResponse.json(
        { success: false, error: "Member not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: member });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}