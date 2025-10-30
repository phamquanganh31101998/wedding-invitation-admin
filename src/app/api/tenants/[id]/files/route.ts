import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { FileService } from '@/lib/services/file-service';
import { FileRepository } from '@/lib/repositories/file-repository';
import { validateFileType } from '@/lib/utils/file';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const tenantId = parseInt(id);
    if (isNaN(tenantId)) {
      return NextResponse.json({ error: 'Invalid tenant ID' }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('fileType') as string;
    const fileName = formData.get('fileName') as string;
    const displayOrder = parseInt(formData.get('displayOrder') as string) || 0;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (!fileType) {
      return NextResponse.json(
        { error: 'File type is required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!validateFileType(file)) {
      return NextResponse.json(
        {
          error:
            'Invalid file type. Only images and audio files are supported.',
        },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const blob = await FileService.uploadFile(file, tenantId, fileType);

    // Save reference to database
    const fileRecord = await FileRepository.saveFileReference(
      tenantId,
      blob.url,
      fileType,
      fileName || file.name,
      displayOrder
    );

    return NextResponse.json({
      success: true,
      file: fileRecord,
      url: blob.url,
    });
  } catch (error) {
    console.error('File upload error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const tenantId = parseInt(id);
    if (isNaN(tenantId)) {
      return NextResponse.json({ error: 'Invalid tenant ID' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const fileType = searchParams.get('type');

    let files;
    if (fileType) {
      files = await FileRepository.getFilesByType(tenantId, fileType);
    } else {
      files = await FileRepository.getFilesByTenant(tenantId);
    }

    return NextResponse.json({
      success: true,
      files,
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch files',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const tenantId = parseInt(id);
    if (isNaN(tenantId)) {
      return NextResponse.json({ error: 'Invalid tenant ID' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    const fileUrl = searchParams.get('fileUrl');

    if (!fileId || !fileUrl) {
      return NextResponse.json(
        {
          error: 'File ID and URL are required',
        },
        { status: 400 }
      );
    }

    // Delete from Vercel Blob
    await FileService.deleteFile(fileUrl);

    // Delete reference from database
    await FileRepository.deleteFileReference(parseInt(fileId));

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete file',
      },
      { status: 500 }
    );
  }
}
