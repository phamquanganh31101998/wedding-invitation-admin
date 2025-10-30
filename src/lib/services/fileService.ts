import { put, del } from '@vercel/blob';

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

  /**
   * Get supported image MIME types
   */
  static getSupportedImageMimeTypes(): string[] {
    return ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  }

  /**
   * Get supported audio MIME types
   */
  static getSupportedAudioMimeTypes(): string[] {
    return [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'audio/aac',
      'audio/m4a',
    ];
  }

  /**
   * Check if file is an image
   */
  static isImageFile(file: File): boolean {
    return (
      file.type.startsWith('image/') &&
      this.getSupportedImageMimeTypes().includes(file.type)
    );
  }

  /**
   * Check if file is audio
   */
  static isAudioFile(file: File): boolean {
    return (
      file.type.startsWith('audio/') &&
      this.getSupportedAudioMimeTypes().includes(file.type)
    );
  }

  /**
   * Get file category based on MIME type
   */
  static getFileCategory(file: File): string {
    if (this.isImageFile(file)) return 'image';
    if (this.isAudioFile(file)) return 'audio';
    return 'other';
  }

  /**
   * Validate file type for upload
   */
  static validateFileType(file: File): boolean {
    return this.isImageFile(file) || this.isAudioFile(file);
  }
}
