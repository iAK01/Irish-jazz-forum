import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { MemberModel } from '@/models/Member';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }  // ADD Promise<>
) {
  try {
    await dbConnect();
    
    const { slug } = await params;  // AWAIT params
    
    const member = await MemberModel.findOne({ slug });
    
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
  { params }: { params: Promise<{ slug: string }> }  // ADD Promise<>
) {
  try {
    const user = await requireAuth();
    await dbConnect();
    
    const { slug } = await params;  // AWAIT params
    
    if (user.memberProfile !== slug && 
        !['admin', 'super_admin', 'team'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    body.lastProfileUpdatedAt = new Date();
    
    const member = await MemberModel.findOneAndUpdate(
      { slug: (await params).slug },
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