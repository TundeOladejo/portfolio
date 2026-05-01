'use server';

import { createServerClient } from '@/src/lib/supabase/server';
import { generateUploadSignature } from '@/src/lib/cloudinary';
import { validateMimeType, validateFileSize } from '@/src/features/media/validation';
import type { ActionResult } from '@/src/features/case-studies/types';
import type { SectionType } from '@/src/features/sections/types';

/**
 * Returns a signed Cloudinary upload signature for a section media upload.
 * The browser uses this to upload directly to Cloudinary.
 *
 * Auth-gated — only authenticated admins can get a signature.
 */
export async function getCloudinarySignature(
  sectionId: string,
  mimeType: string,
  fileSize: number
): Promise<ActionResult<{
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  uploadUrl: string;
}>> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, errors: { _form: ['Unauthorized'] } };

  // Fetch section type for MIME validation
  const { data: section, error: sectionError } = await supabase
    .from('sections')
    .select('type')
    .eq('id', sectionId)
    .single();

  if (sectionError || !section) {
    return { success: false, errors: { _form: [sectionError?.message ?? 'Section not found'] } };
  }

  if (!validateMimeType(mimeType, section.type as SectionType)) {
    return { success: false, errors: { mimeType: ['Unsupported file type for this section'] } };
  }

  if (!validateFileSize(fileSize)) {
    return { success: false, errors: { fileSize: ['File must be 50 MB or smaller'] } };
  }

  const sigData = await generateUploadSignature('sections');
  const uploadUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`;

  return { success: true, data: { ...sigData, uploadUrl } };
}

/**
 * Returns a signed Cloudinary upload signature for a cover image upload.
 */
export async function getCoverImageSignature(): Promise<ActionResult<{
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  uploadUrl: string;
}>> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, errors: { _form: ['Unauthorized'] } };

  const sigData = await generateUploadSignature('covers');
  const uploadUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`;

  return { success: true, data: { ...sigData, uploadUrl } };
}

/**
 * Persists a Cloudinary URL to a section's media_url after upload.
 */
export async function saveCloudinaryMediaUrl(
  sectionId: string,
  publicUrl: string
): Promise<ActionResult<{ publicUrl: string }>> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, errors: { _form: ['Unauthorized'] } };

  const { error } = await supabase
    .from('sections')
    .update({ media_url: publicUrl })
    .eq('id', sectionId);

  if (error) return { success: false, errors: { _form: [error.message] } };

  return { success: true, data: { publicUrl } };
}
