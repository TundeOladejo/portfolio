import type { Section } from '@/src/features/sections/types';
import TextSection from './TextSection';
import ImageSection from './ImageSection';
import VideoSection from './VideoSection';

interface SectionRendererProps {
  section: Section;
}

export default function SectionRenderer({ section }: SectionRendererProps) {
  switch (section.type) {
    case 'text':
      return <TextSection content={section.content} />;
    case 'image':
      return <ImageSection mediaUrl={section.media_url} alt="Section image" />;
    case 'video':
      return <VideoSection mediaUrl={section.media_url} />;
    default:
      return null;
  }
}
