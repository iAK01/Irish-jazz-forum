import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import { requireAuth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { WorkingGroupModel } from '@/models/Workinggroup';
import { uploadFileToDrive } from '@/lib/googledrive';

const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  credentials: {
    client_email: process.env.GCS_CLIENT_EMAIL,
    private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME!);

export async function POST(request: Request) {
  try {
    await requireAuth();
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const workingGroupSlug = formData.get('workingGroup') as string | null;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    let publicUrl: string;

    // Determine upload destination
    if (workingGroupSlug && workingGroupSlug !== 'general') {
      // Upload to working group's Drive folder
      await dbConnect();
     const group = await WorkingGroupModel.findOne({ slug: workingGroupSlug }).lean() as any;

      
      if (!group) {
        return NextResponse.json(
          { success: false, error: 'Working group not found' },
          { status: 404 }
        );
      }

      if (!group.googleDriveFolderId) {
        return NextResponse.json(
          { success: false, error: 'Working group Drive folder not configured' },
          { status: 500 }
        );
      }

      publicUrl = await uploadFileToDrive(
        buffer,
        filename,
        file.type,
        group.googleDriveFolderId
      );
    } else {
      // Upload to GCS bucket for general discussion
      const blob = bucket.file(filename);
      
      await blob.save(buffer, {
        contentType: file.type,
        metadata: {
          cacheControl: 'public, max-age=31536000',
        },
      });

      await blob.makePublic();
      
      publicUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${filename}`;
    }
    
    return NextResponse.json({ 
      success: true, 
      url: publicUrl 
    });
    
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}