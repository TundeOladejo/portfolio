import type { Section } from '@/src/features/sections/types';

export type CaseStudyStatus = 'draft' | 'published';

export interface CaseStudy {
  id: string;
  title: string;
  description: string;
  cover_image_url: string;
  slug: string;
  status: CaseStudyStatus;
  created_at: string;
  updated_at: string;
}

export type CaseStudyWithSections = CaseStudy & {
  sections: Section[];
};

// ActionResult discriminated union for server actions
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string[]> };
