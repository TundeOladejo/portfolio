import type { Section } from '@/src/features/sections/types';
import TextSection from './TextSection';
import ImageSection from './ImageSection';
import VideoSection from './VideoSection';

interface SectionRendererProps {
  section: Section;
}

function SingleSection({ section }: SectionRendererProps) {
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

export default function SectionRenderer({ section }: SectionRendererProps) {
  return <SingleSection section={section} />;
}

/**
 * Renders a list of sections with an editorial, full-bleed layout.
 *
 * - Text sections: padded, max-width readable column
 * - Image/video sections: full-bleed edge-to-edge
 * - Column groups: side-by-side grid (2 or 3 cols), responsive
 */
export function SectionListRenderer({ sections }: { sections: Section[] }) {
  // Group consecutive sections that share a column_group UUID
  const groups: Array<{
    key: string;
    sections: Section[];
    cols: number;
  }> = [];

  for (const section of sections) {
    if (section.column_group) {
      const existing = groups.find((g) => g.key === section.column_group);
      if (existing) {
        existing.sections.push(section);
      } else {
        groups.push({
          key: section.column_group,
          sections: [section],
          cols: section.column_count ?? 2,
        });
      }
    } else {
      groups.push({ key: section.id, sections: [section], cols: 1 });
    }
  }

  return (
    <div className="flex flex-col gap-16 sm:gap-20">
      {groups.map((group) => {
        // Single section — full-bleed for media, padded for text
        if (group.cols === 1) {
          const s = group.sections[0];
          return (
            <div key={group.key}>
              <SingleSection section={s} />
            </div>
          );
        }

        // Column group — grid layout, padded on sides
        const gridClass =
          group.cols === 3
            ? 'grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 px-5 sm:px-10'
            : 'grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 px-5 sm:px-10';

        return (
          <div key={group.key} className={gridClass}>
            {group.sections.map((s) => (
              <div key={s.id} className="overflow-hidden">
                <SingleSection section={s} />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
