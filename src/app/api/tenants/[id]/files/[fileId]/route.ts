import { NextRequest, NextResponse } from 'next/server';
import { FileRepository } from '@/lib/repositories/file-repository';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const { id, fileId } = await params;
    const tenantId = parseInt(id);
    const fileIdNum = parseInt(fileId);

    if (isNaN(tenantId) || isNaN(fileIdNum)) {
      return NextResponse.json(
        { error: 'Invalid tenant ID or file ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, displayOrder } = body;

    // Update file metadata
    await FileRepository.updateFileMetadata(fileIdNum, name, displayOrder);

    return NextResponse.json({
      success: true,
      message: 'File updated successfully',
    });
  } catch (error) {
    console.error('Error updating file:', error);
    return NextResponse.json(
      {
        error: 'Failed to update file',
      },
      { status: 500 }
    );
  }
}
