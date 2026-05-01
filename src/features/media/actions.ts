'use server';

import { createServerClient } from '@/src/lib/supabase/server';
import { validateMimeType, validateFileSize } from '@/src/features/media/validation';
import type { ActionResult } from '@/src/features/case-studies/types';
import type { SectionType } from '@/src/features/sections/types';

// ---------------------------------------------------------------------------
// getSignedUploadUrl
// ---------------------------------------------------------------------------

/**
 * Returns a short-lived signed upload URL for direct browser-to-Storage upload.
 *
 * Steps:
 * 1. Auth check — reject unauthenticated callers.
 * 2. Fetch the section to get its type (SectionType).
 * 3. Validate MIME type against the allowed set for that section type.
 * 4. Validate file size against the 50 MB limit.
 * 5. Generate a unique storage path: {sectionId}/{timestamp}-{uuid}
 * 6. Call supabase.storage.from('media').createSignedUploadUrl(path)
 * 7. Return { signedUrl, path }
 *
 * Requirements: 5.1, 5.2, 5.3, 5.5, 5.6, 8.3
 */
export async function getSignedUploadUrl(
  sectionId: string,
  mimeType: string,
  fileSize: number
): Promise<ActionResult<{ signedUrl: string; path: string }>> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, errors: { _form: ['Unauthorized'] } };
  }

  // Fetch the section to determine its type
  const { data: section, error: sectionError } = await supabase
    .from('sections')
    .select('type')
    .eq('id', sectionId)
    .single();

  if (sectionError || !section) {
    return {
      success: false,
      errors: { _form: [sectionError?.message ?? 'Section not found'] },
    };
  }

  const sectionType = section.type as SectionType;

  // Validate MIME type for this section type
  if (!validateMimeType(mimeType, sectionType)) {
    return {
      success: false,
      errors: { mimeType: ['Unsupported file type for this section'] },
    };
  }

  // Validate file size (≤ 50 MB)
  if (!validateFileSize(fileSize)) {
    return {
      success: false,
      errors: { fileSize: ['File must be 50 MB or smaller'] },
    };
  }

  // Generate a unique storage path
  const path = `${sectionId}/${Date.now()}-${crypto.randomUUID()}`;

  // Request a signed upload URL from Supabase Storage
  const { data, error: storageError } = await supabase.storage
    .from('media')
    .createSignedUploadUrl(path);

  if (storageError || !data) {
    return {
      success: false,
      errors: { _form: [storageError?.message ?? 'Failed to create signed URL'] },
    };
  }

  return { success: true, data: { signedUrl: data.signedUrl, path } };
}

// ---------------------------------------------------------------------------
// confirmMediaUpload
// ---------------------------------------------------------------------------

/**
 * Called after the browser has successfully uploaded a file directly to Storage.
 * Retrieves the public URL for the uploaded file and persists it to the section
 * record's media_url column.
 *
 * Steps:
 * 1. Auth check — reject unauthenticated callers.
 * 2. Get the public URL via supabase.storage.from('media').getPublicUrl(path)
 * 3. Update sections.media_url with the public URL.
 * 4. Return { publicUrl }
 *
 * Requirements: 5.4, 8.3
 */
export async function confirmMediaUpload(
  sectionId: string,
  path: string
): Promise<ActionResult<{ publicUrl: string }>> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, errors: { _form: ['Unauthorized'] } };
  }

  // Retrieve the public URL for the uploaded file
  const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);

  const publicUrl = urlData.publicUrl;

  // Persist the public URL to the section record
  const { error: updateError } = await supabase
    .from('sections')
    .update({ media_url: publicUrl })
    .eq('id', sectionId);

  if (updateError) {
    return {
      success: false,
      errors: { _form: [updateError.message] },
    };
  }

  return { success: true, data: { publicUrl } };
}
