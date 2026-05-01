import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Derives a URL-safe slug from a title string.
 *
 * Algorithm:
 * 1. Lowercase the title.
 * 2. Replace any run of non-alphanumeric characters with a single hyphen.
 * 3. Trim leading/trailing hyphens.
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Returns a slug that is guaranteed to be unique within the `case_studies`
 * table.
 *
 * Algorithm:
 * 1. Derive the base slug from the title.
 * 2. Query for any existing slugs that are either the base slug or follow the
 *    pattern `{base}-{n}`.
 * 3. If no matches exist, return the base slug.
 * 4. Otherwise, find the highest existing numeric suffix and return
 *    `{base}-{max + 1}`.
 */
export async function uniqueSlug(
  title: string,
  db: SupabaseClient
): Promise<string> {
  const base = generateSlug(title);

  const { data } = await db
    .from('case_studies')
    .select('slug')
    .or(`slug.eq.${base},slug.like.${base}-%`);

  if (!data?.length) return base;

  const suffixes = data.map((r: { slug: string }) => {
    const match = r.slug.match(new RegExp(`^${base}-(\\d+)$`));
    return match ? parseInt(match[1], 10) : 0;
  });

  return `${base}-${Math.max(...suffixes) + 1}`;
}
