import type { SectionType } from '@/src/features/sections/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'] as const;

/** 50 MB in bytes */
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

// ---------------------------------------------------------------------------
// validateMimeType
// ---------------------------------------------------------------------------

/**
 * Returns true if the given MIME type is allowed for the given section type.
 *
 * - 'image' sections accept: image/jpeg, image/png, image/webp, image/gif
 * - 'video' sections accept: video/mp4, video/webm
 * - 'text' sections never accept any media (always returns false)
 *
 * Requirements: 5.1, 5.2, 5.3
 */
export function validateMimeType(
  mimeType: string,
  sectionType: SectionType
): boolean {
  switch (sectionType) {
    case 'image':
      return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(mimeType);
    case 'video':
      return (ALLOWED_VIDEO_TYPES as readonly string[]).includes(mimeType);
    case 'text':
      return false;
  }
}

// ---------------------------------------------------------------------------
// validateFileSize
// ---------------------------------------------------------------------------

/**
 * Returns true if the file size is within the 50 MB limit.
 *
 * Requirements: 5.5, 5.6
 */
export function validateFileSize(bytes: number): boolean {
  return bytes <= MAX_FILE_SIZE_BYTES;
}
