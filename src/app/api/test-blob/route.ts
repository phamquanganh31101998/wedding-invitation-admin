import { NextRequest, NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';

export async function GET() {
  try {
    // Test listing blobs
    const { blobs } = await list();

    return NextResponse.json({
      success: true,
      message: 'Vercel Blob connection successful',
      blobCount: blobs.length,
      blobs: blobs.slice(0, 5), // Show first 5 blobs
    });
  } catch (error) {
    console.error('Blob test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'No file provided',
        },
        { status: 400 }
      );
    }

    // Test upload
    const blob = await put(`test/${Date.now()}-${file.name}`, file, {
      access: 'public',
    });

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      url: blob.url,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('Blob upload test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      },
      { status: 500 }
    );
  }
}
