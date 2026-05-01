export type SectionType = 'text' | 'image' | 'video';

export interface Section {
  id: string;
  case_study_id: string;
  type: SectionType;
  content: string | null;
  media_url: string | null;
  order: number;
  created_at: string;
}
