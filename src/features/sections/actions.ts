'use server';

import { createServerClient } from '@/src/lib/supabase/server';
import type { Section, SectionType } from '@/src/features/sections/types';
import type { ActionResult } from '@/src/features/case-studies/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VALID_SECTION_TYPES: SectionType[] = ['text', 'image', 'video'];

// ---------------------------------------------------------------------------
// addSection
// ---------------------------------------------------------------------------

/**
 * Adds a new section to a case study with the next available order index.
 *
 * Steps:
 * 1. Validate the section type is one of 'text' | 'image' | 'video'.
 * 2. Query the max order for the case study and compute next = max + 1 (default 0).
 * 3. Insert the section row.
 *
 * Requirements: 4.1, 4.2, 4.7, 8.3
 */
export async function addSection(
  caseStudyId: string,
  type: string
): Promise<ActionResult<Section>> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, errors: { _form: ['Unauthorized'] } };
  }

  // Validate section type
  if (!VALID_SECTION_TYPES.includes(type as SectionType)) {
    return {
      success: false,
      errors: { type: ['Invalid section type. Must be text, image, or video'] },
    };
  }

  // Compute next order index: max(order) + 1, defaulting to 0 if no sections exist
  const { data: maxRow } = await supabase
    .from('sections')
    .select('order')
    .eq('case_study_id', caseStudyId)
    .order('order', { ascending: false })
    .limit(1)
    .single();

  const nextOrder = maxRow != null ? maxRow.order + 1 : 0;

  const { data, error } = await supabase
    .from('sections')
    .insert({
      case_study_id: caseStudyId,
      type: type as SectionType,
      order: nextOrder,
      content: null,
      media_url: null,
    })
    .select()
    .single();

  if (error || !data) {
    return {
      success: false,
      errors: { _form: [error?.message ?? 'Failed to add section'] },
    };
  }

  return { success: true, data: data as Section };
}

// ---------------------------------------------------------------------------
// updateSection
// ---------------------------------------------------------------------------

/**
 * Updates the content and/or media_url of an existing section.
 *
 * Requirements: 4.1, 4.3, 8.3
 */
export async function updateSection(
  id: string,
  fields: { content?: string | null; media_url?: string | null }
): Promise<ActionResult<Section>> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, errors: { _form: ['Unauthorized'] } };
  }

  const { data, error } = await supabase
    .from('sections')
    .update(fields)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    return {
      success: false,
      errors: { _form: [error?.message ?? 'Failed to update section'] },
    };
  }

  return { success: true, data: data as Section };
}

// ---------------------------------------------------------------------------
// reorderSections
// ---------------------------------------------------------------------------

/**
 * Batch-updates the order index for a set of sections.
 *
 * Supabase JS v2 doesn't support batch upsert with conflict resolution easily,
 * so we issue individual updates in a loop.
 *
 * Requirements: 4.3, 8.3
 */
export async function reorderSections(
  updates: Array<{ id: string; order: number }>
): Promise<ActionResult<null>> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, errors: { _form: ['Unauthorized'] } };
  }

  for (const { id, order } of updates) {
    const { error } = await supabase
      .from('sections')
      .update({ order })
      .eq('id', id);

    if (error) {
      return {
        success: false,
        errors: { _form: [error.message] },
      };
    }
  }

  return { success: true, data: null };
}

// ---------------------------------------------------------------------------
// deleteSection
// ---------------------------------------------------------------------------

/**
 * Deletes a section row. If the section has a media_url, the corresponding
 * Storage object is deleted first. Storage errors are logged but do not block
 * the database deletion — see design.md Error Handling.
 *
 * Storage URL format:
 *   https://{project}.supabase.co/storage/v1/object/public/media/{path}
 *
 * Requirements: 4.4, 8.3
 */
export async function deleteSection(id: string): Promise<ActionResult<null>> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, errors: { _form: ['Unauthorized'] } };
  }

  // Fetch the section to check for a media_url before deleting
  const { data: section, error: fetchError } = await supabase
    .from('sections')
    .select('media_url')
    .eq('id', id)
    .single();

  if (fetchError || !section) {
    return {
      success: false,
      errors: { _form: [fetchError?.message ?? 'Section not found'] },
    };
  }

  // If the section has media, delete the Storage object
  if (section.media_url) {
    const path = section.media_url.split('/storage/v1/object/public/media/')[1];
    if (path) {
      const { error: storageError } = await supabase.storage
        .from('media')
        .remove([path]);
      if (storageError) {
        console.error(
          `Failed to delete media at path "${path}":`,
          storageError.message
        );
      }
    }
  }

  // Delete the section row
  const { error: deleteError } = await supabase
    .from('sections')
    .delete()
    .eq('id', id);

  if (deleteError) {
    return {
      success: false,
      errors: { _form: [deleteError.message] },
    };
  }

  return { success: true, data: null };
}
