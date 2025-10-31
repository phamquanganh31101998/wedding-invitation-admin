import { put, del } from '@vercel/blob';
import { validateFileType, validateFileSize } from '@/lib/utils/file';

export class FileService {
  /**
   * Upload a file to Vercel Blob storage
   */
  static async uploadFile(file: File, fileName: string) {
    // Validate file size (max 50MB)
    if (!validateFileSize(file)) {
      throw new Error('File size must be less than 50MB');
    }

    // Validate file type
    if (!validateFileType(file)) {
      throw new Error('Unsupported file type');
    }

    try {
      const blob = await put(fileName, file, {
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
