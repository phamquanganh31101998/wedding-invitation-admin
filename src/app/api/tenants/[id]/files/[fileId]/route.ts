import { NextRequest, NextResponse } from 'next/server';
import { FileRepository } from '@/lib/repositories/file-repository';
import { checkTenantAndFileIdParams } from '@/lib/utils/api-helpers';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const { id, fileId: fileIdStr } = await params;
    const { fileId, error } = checkTenantAndFileIdParams(id, fileIdStr);
    if (error) return error;

    const body = await request.json();
    const { name, displayOrder } = body;

    // Update file metadata
    await FileRepository.updateFileMetadata(fileId, name, displayOrder);

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
