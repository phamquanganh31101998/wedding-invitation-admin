/**
 * File utility functions for validation and type checking
 */

/**
 * Get supported image MIME types
 */
export function getSupportedImageMimeTypes(): string[] {
  return ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
}

/**
 * Get supported audio MIME types
 */
export function getSupportedAudioMimeTypes(): string[] {
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
export function isImageFile(file: File): boolean {
  return (
    file.type.startsWith('image/') &&
    getSupportedImageMimeTypes().includes(file.type)
  );
}

/**
 * Check if file is audio
 */
export function isAudioFile(file: File): boolean {
  return (
    file.type.startsWith('audio/') &&
    getSupportedAudioMimeTypes().includes(file.type)
  );
}

/**
 * Get file category based on MIME type
 */
export function getFileCategory(file: File): string {
  if (isImageFile(file)) return 'image';
  if (isAudioFile(file)) return 'audio';
  return 'other';
}

/**
 * Validate file size (max 50MB)
 */
export function validateFileSize(file: File, maxSizeInMB: number = 5): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}

/**
 * Validate file type for upload
 */
export function validateFileType(file: File): boolean {
  return isImageFile(file) || isAudioFile(file);
}
