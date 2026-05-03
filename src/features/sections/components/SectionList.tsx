'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addSection, groupSections } from '@/src/features/sections/actions';
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
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [grouping, setGrouping] = useState(false);

  async function handleAdd(type: 'text' | 'image' | 'video') {
    await addSection(caseStudyId, type);
    router.refresh();
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleGroup(cols: 2 | 3) {
    if (selected.size < 2) return;
    setGrouping(true);
    await groupSections(Array.from(selected), cols);
    setSelected(new Set());
    setGrouping(false);
    router.refresh();
  }

  const canGroup = selected.size >= 2;

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
        <div className="flex flex-col gap-3">
          {/* Column group toolbar */}
          <div className="flex items-center justify-between">
            <p className="text-xs tracking-widest uppercase text-neutral-500">
              {sections.length} Section{sections.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              {selected.size > 0 && (
                <span className="text-xs text-neutral-500">{selected.size} selected</span>
              )}
              <button
                type="button"
                onClick={() => handleGroup(2)}
                disabled={!canGroup || grouping}
                title="Group selected sections into 2 columns"
                className={`px-2.5 py-1 text-xs border transition-colors ${
                  canGroup
                    ? 'border-neutral-600 text-neutral-300 hover:border-neutral-400 hover:text-white'
                    : 'border-neutral-800 text-neutral-700 cursor-not-allowed'
                }`}
              >
                ⊞ 2-col
              </button>
              <button
                type="button"
                onClick={() => handleGroup(3)}
                disabled={!canGroup || grouping}
                title="Group selected sections into 3 columns"
                className={`px-2.5 py-1 text-xs border transition-colors ${
                  canGroup
                    ? 'border-neutral-600 text-neutral-300 hover:border-neutral-400 hover:text-white'
                    : 'border-neutral-800 text-neutral-700 cursor-not-allowed'
                }`}
              >
                ⊟ 3-col
              </button>
              {selected.size > 0 && (
                <button
                  type="button"
                  onClick={() => setSelected(new Set())}
                  className="px-2.5 py-1 text-xs border border-neutral-800 text-neutral-600 hover:text-neutral-400 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {selected.size === 0 && sections.some(s => !s.column_group) && (
            <p className="text-xs text-neutral-700">
              Tip: check sections below to group them into columns.
            </p>
          )}

          <div className="flex flex-col gap-2">
            {sections.map((section, index) => (
              <SectionEditor
                key={section.id}
                section={section}
                index={index}
                total={sections.length}
                allSections={sections}
                selected={selected.has(section.id)}
                onToggleSelect={() => toggleSelect(section.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
