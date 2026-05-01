'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/src/lib/supabase/server';
import { uniqueSlug } from '@/src/features/case-studies/slug';
import type { CaseStudy, ActionResult } from '@/src/features/case-studies/types';

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

interface CaseStudyFields {
  title: string;
  description: string;
  cover_image_url: string;
}

function validateCaseStudyFields(formData: FormData): {
  fields: CaseStudyFields | null;
  errors: Record<string, string[]>;
} {
  const title = (formData.get('title') as string | null)?.trim() ?? '';
  const description = (formData.get('description') as string | null)?.trim() ?? '';
  const cover_image_url = (formData.get('cover_image_url') as string | null)?.trim() ?? '';

  const errors: Record<string, string[]> = {};

  if (!title) errors['title'] = ['Title is required'];
  if (!description) errors['description'] = ['Description is required'];
  if (!cover_image_url) errors['cover_image_url'] = ['Cover image URL is required'];

  if (Object.keys(errors).length > 0) {
    return { fields: null, errors };
  }

  return { fields: { title, description, cover_image_url }, errors: {} };
}

// ---------------------------------------------------------------------------
// createCaseStudy
// ---------------------------------------------------------------------------

/**
 * Creates a new case study with status = 'draft'.
 * Validates required fields, generates a unique slug, inserts the row,
 * and revalidates the public listing page.
 *
 * Requirements: 2.1, 2.4, 2.5, 2.6, 8.3
 */
export async function createCaseStudy(
  _prevState: ActionResult<CaseStudy>,
  formData: FormData
): Promise<ActionResult<CaseStudy>> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, errors: { _form: ['Unauthorized'] } };
  }

  const { fields, errors } = validateCaseStudyFields(formData);
  if (!fields) {
    return { success: false, errors };
  }

  const slug = await uniqueSlug(fields.title, supabase);

  const { data, error } = await supabase
    .from('case_studies')
    .insert({
      title: fields.title,
      description: fields.description,
      cover_image_url: fields.cover_image_url,
      slug,
      status: 'draft',
    })
    .select()
    .single();

  if (error || !data) {
    return {
      success: false,
      errors: { _form: [error?.message ?? 'Failed to create case study'] },
    };
  }

  revalidatePath('/');

  return { success: true, data: data as CaseStudy };
}

// ---------------------------------------------------------------------------
// updateCaseStudy
// ---------------------------------------------------------------------------

/**
 * Updates an existing case study's metadata and bumps updated_at.
 * Revalidates both the listing page and the case study's detail page.
 *
 * Requirements: 2.6, 3.1, 8.3
 */
export async function updateCaseStudy(
  id: string,
  _prevState: ActionResult<CaseStudy>,
  formData: FormData
): Promise<ActionResult<CaseStudy>> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, errors: { _form: ['Unauthorized'] } };
  }

  const { fields, errors } = validateCaseStudyFields(formData);
  if (!fields) {
    return { success: false, errors };
  }

  const { data, error } = await supabase
    .from('case_studies')
    .update({
      title: fields.title,
      description: fields.description,
      cover_image_url: fields.cover_image_url,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    return {
      success: false,
      errors: { _form: [error?.message ?? 'Failed to update case study'] },
    };
  }

  const caseStudy = data as CaseStudy;

  revalidatePath('/');
  revalidatePath(`/${caseStudy.slug}`);

  return { success: true, data: caseStudy };
}

// ---------------------------------------------------------------------------
// publishCaseStudy
// ---------------------------------------------------------------------------

/**
 * Sets a case study's status to 'published', making it visible on the
 * public website. Revalidates the listing and detail pages.
 *
 * Requirements: 3.2, 8.3
 */
export async function publishCaseStudy(id: string): Promise<ActionResult<CaseStudy>> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, errors: { _form: ['Unauthorized'] } };
  }

  const { data, error } = await supabase
    .from('case_studies')
    .update({ status: 'published' })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    return {
      success: false,
      errors: { _form: [error?.message ?? 'Failed to publish case study'] },
    };
  }

  const caseStudy = data as CaseStudy;

  revalidatePath('/');
  revalidatePath(`/${caseStudy.slug}`);

  return { success: true, data: caseStudy };
}

// ---------------------------------------------------------------------------
// draftCaseStudy
// ---------------------------------------------------------------------------

/**
 * Sets a case study's status back to 'draft', removing it from the public
 * website. Revalidates the listing and detail pages.
 *
 * Requirements: 3.3, 8.3
 */
export async function draftCaseStudy(id: string): Promise<ActionResult<CaseStudy>> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, errors: { _form: ['Unauthorized'] } };
  }

  const { data, error } = await supabase
    .from('case_studies')
    .update({ status: 'draft' })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    return {
      success: false,
      errors: { _form: [error?.message ?? 'Failed to draft case study'] },
    };
  }

  const caseStudy = data as CaseStudy;

  revalidatePath('/');
  revalidatePath(`/${caseStudy.slug}`);

  return { success: true, data: caseStudy };
}

// ---------------------------------------------------------------------------
// deleteCaseStudy
// ---------------------------------------------------------------------------

/**
 * Deletes a case study and all its associated media from Supabase Storage.
 *
 * Steps:
 * 1. Fetch the case study to capture its slug for cache revalidation.
 * 2. Fetch all sections that have a non-null media_url.
 * 3. Extract the storage path from each public URL and delete the objects.
 * 4. Delete the case study row (ON DELETE CASCADE removes sections).
 * 5. Revalidate the listing and detail pages.
 *
 * Storage URL format:
 *   https://{project}.supabase.co/storage/v1/object/public/media/{path}
 *
 * Requirements: 5.7, 8.3
 */
export async function deleteCaseStudy(id: string): Promise<ActionResult<null>> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, errors: { _form: ['Unauthorized'] } };
  }

  // Fetch the case study first so we have the slug for revalidation.
  const { data: caseStudy, error: fetchError } = await supabase
    .from('case_studies')
    .select('slug')
    .eq('id', id)
    .single();

  if (fetchError || !caseStudy) {
    return {
      success: false,
      errors: { _form: [fetchError?.message ?? 'Case study not found'] },
    };
  }

  // Fetch all sections that have media so we can clean up Storage.
  const { data: sections } = await supabase
    .from('sections')
    .select('media_url')
    .eq('case_study_id', id)
    .not('media_url', 'is', null);

  // Delete each media file from Supabase Storage.
  if (sections && sections.length > 0) {
    for (const section of sections) {
      if (section.media_url) {
        const path = section.media_url.split('/storage/v1/object/public/media/')[1];
        if (path) {
          // Storage deletion failures are logged but do not block the DB delete
          // to prevent orphaned database records — see design.md Error Handling.
          const { error: storageError } = await supabase.storage
            .from('media')
            .remove([path]);
          if (storageError) {
            console.error(`Failed to delete media at path "${path}":`, storageError.message);
          }
        }
      }
    }
  }

  // Delete the case study row; ON DELETE CASCADE removes all sections.
  const { error: deleteError } = await supabase
    .from('case_studies')
    .delete()
    .eq('id', id);

  if (deleteError) {
    return {
      success: false,
      errors: { _form: [deleteError.message] },
    };
  }

  revalidatePath('/');
  revalidatePath(`/${caseStudy.slug}`);

  return { success: true, data: null };
}
