export type SectionType = 'text' | 'image' | 'video';

export interface Section {
  id: string;
  case_study_id: string;
  type: SectionType;
  content: string | null;
  media_url: string | null;
  order: number;
  column_group: string | null;  // UUID shared by sections in the same column group
  column_count: number | null;  // 2 or 3 — how many columns in the group
  created_at: string;
}
