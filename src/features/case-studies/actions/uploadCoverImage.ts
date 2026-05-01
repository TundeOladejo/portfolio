'use server';

import { createServerClient } from '@/src/lib/supabase/server';
import type { ActionResult } from '@/src/features/case-studies/types';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

/**
 * Uploads a cover image directly to Supabase Storage and returns the public URL.
 * Used by the CoverImageInput component for file-based cover image upload.
 */
export async function uploadCoverImage(
  formData: FormData
): Promise<ActionResult<{ publicUrl: string }>> {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, errors: { _form: ['Unauthorized'] } };
  }

  const file = formData.get('file') as File | null;
  if (!file || file.size === 0) {
    return { success: false, errors: { _form: ['No file provided'] } };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, errors: { _form: ['Unsupported file type. Use JPEG, PNG, WebP, or GIF.'] } };
  }

  if (file.size > MAX_SIZE) {
    return { success: false, errors: { _form: ['File exceeds the 50 MB limit.'] } };
  }

  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `covers/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const bytes = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from('media')
    .upload(path, bytes, { contentType: file.type, upsert: false });

  if (error) {
    return { success: false, errors: { _form: [error.message] } };
  }

  const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);

  return { success: true, data: { publicUrl: urlData.publicUrl } };
}
