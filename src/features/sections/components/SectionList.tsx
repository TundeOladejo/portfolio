'use client';

import { useRouter } from 'next/navigation';
import { addSection } from '@/src/features/sections/actions';
import type { Section } from '@/src/features/sections/types';
import SectionEditor from './SectionEditor';

interface SectionListProps {
  caseStudyId: string;
  sections: Section[];
}

const SECTION_TYPES = [
  { type: 'text' as const, label: 'Text', icon: '¶', desc: 'Rich text paragraph' },
  { type: 'image' as const, label: 'Image', icon: '⬜', desc: 'Photo or graphic' },
  { type: 'video' as const, label: 'Video', icon: '▶', desc: 'MP4 or WebM' },
];

export default function SectionList({ caseStudyId, sections }: SectionListProps) {
  const router = useRouter();

  async function handleAdd(type: 'text' | 'image' | 'video') {
    await addSection(caseStudyId, type);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Add section buttons */}
      <div>
        <p className="text-xs tracking-widest uppercase text-neutral-500 mb-3">Add Section</p>
        <div className="grid grid-cols-3 gap-2">
          {SECTION_TYPES.map(({ type, label, icon, desc }) => (
            <button
              key={type}
              type="button"
              onClick={() => handleAdd(type)}
              className="flex flex-col items-center gap-1.5 border border-neutral-800 bg-neutral-950 px-3 py-4 text-center hover:border-neutral-600 hover:bg-neutral-900 transition-colors group"
            >
              <span className="text-lg text-neutral-500 group-hover:text-neutral-300 transition-colors">{icon}</span>
              <span className="text-xs font-medium text-neutral-300">{label}</span>
              <span className="text-xs text-neutral-600">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Section list */}
      {sections.length === 0 ? (
        <div className="border border-dashed border-neutral-800 py-12 text-center">
          <p className="text-sm text-neutral-600">No sections yet.</p>
          <p className="text-xs text-neutral-700 mt-1">Add a section above to start building your case study.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-xs tracking-widest uppercase text-neutral-500">
            {sections.length} Section{sections.length !== 1 ? 's' : ''}
          </p>
          {sections.map((section, index) => (
            <SectionEditor
              key={section.id}
              section={section}
              index={index}
              total={sections.length}
              allSections={sections}
            />
          ))}
        </div>
      )}
    </div>
  );
}
