import { put, del } from '@vercel/blob';
import { validateFileType } from '@/lib/utils/file';

export class FileService {
  /**
   * Upload a file to Vercel Blob storage
   */
  static async uploadFile(file: File, tenantId: number, fileType: string) {
    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 50MB');
    }

    // Validate file type
    if (!validateFileType(file)) {
      throw new Error('Unsupported file type');
    }

    // Create organized filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `tenant-${tenantId}/files/${fileType}/${timestamp}-${sanitizedName}`;

    try {
      const blob = await put(filename, file, {
        access: 'public',
        addRandomSuffix: false,
      });

      return blob;
    } catch (error) {
      console.error('Error uploading file to Vercel Blob:', error);
      throw new Error('Failed to upload file');
    }
  }

  /**
   * Delete a file from Vercel Blob storage
   */
  static async deleteFile(url: string) {
    try {
      await del(url);
    } catch (error) {
      console.error('Error deleting file from Vercel Blob:', error);
      throw new Error('Failed to delete file');
    }
  }
}
