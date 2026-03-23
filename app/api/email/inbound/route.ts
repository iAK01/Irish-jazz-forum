// /app/api/email/inbound/route.ts

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { ContactSubmissionModel } from '@/models/ContactSubmission';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const subject = (formData.get('subject') as string) || '';
    const from = (formData.get('sender') as string) || '';
    const body = (formData.get('body-plain') as string) || '';

    if (!subject || !from || !body) {
      return NextResponse.json({ ok: true });
    }

    const match = subject.match(/\[SUB-(.+?)\]/);
    if (!match) {
      return NextResponse.json({ ok: true });
    }

    const submissionId = match[1];

    await dbConnect();

    await ContactSubmissionModel.findByIdAndUpdate(
      submissionId,
      {
        $push: {
          replies: {
            body,
            from,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Inbound email error:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}