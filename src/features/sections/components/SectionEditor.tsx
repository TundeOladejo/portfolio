'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSection, deleteSection, reorderSections, ungroupSection } from '@/src/features/sections/actions';
import type { Section } from '@/src/features/sections/types';
import MediaUploader from '@/src/features/media/components/MediaUploader';
import RichTextEditor from '@/src/components/RichTextEditor';

interface SectionEditorProps {
  section: Section;
  index: number;
  total: number;
  allSections: Section[];
  selected: boolean;
  onToggleSelect: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  text: '¶ Text',
  image: '⬜ Image',
  video: '▶ Video',
};

export default function SectionEditor({
  section,
  index,
  total,
  allSections,
  selected,
  onToggleSelect,
}: SectionEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleTextBlur(value: string) {
    if (value === (section.content ?? '')) return;
    setSaving(true);
    setSaved(false);
    await updateSection(section.id, { content: value });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm('Delete this section?')) return;
    await deleteSection(section.id);
    router.refresh();
  }

  async function handleMoveUp() {
    if (index === 0) return;
    const prev = allSections[index - 1];
    await reorderSections([
      { id: section.id, order: prev.order },
      { id: prev.id, order: section.order },
    ]);
    router.refresh();
  }

  async function handleMoveDown() {
    if (index === total - 1) return;
    const next = allSections[index + 1];
    await reorderSections([
      { id: section.id, order: next.order },
      { id: next.id, order: section.order },
    ]);
    router.refresh();
  }

  async function handleUngroup() {
    await ungroupSection(section.id);
    router.refresh();
  }

  const isGrouped = !!section.column_group;

  return (
    <div className={`border overflow-hidden transition-colors ${
      selected ? 'border-neutral-500 bg-neutral-900' : 'border-neutral-800 bg-neutral-950'
    }`}>
      {/* Section header */}
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 bg-neutral-900 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          {/* Checkbox for grouping */}
          <button
            type="button"
            onClick={onToggleSelect}
            className={`w-4 h-4 border flex items-center justify-center shrink-0 transition-colors ${
              selected
                ? 'border-white bg-white'
                : 'border-neutral-600 hover:border-neutral-400'
            }`}
            aria-label={selected ? 'Deselect section' : 'Select section for grouping'}
          >
            {selected && <span className="text-black text-[10px] leading-none">✓</span>}
          </button>

          {/* Order badge */}
          <span className="text-xs text-neutral-600 font-mono w-4 text-center">{index + 1}</span>
          <span className="text-xs font-medium text-neutral-400">{TYPE_LABELS[section.type]}</span>

          {/* Column group badge */}
          {isGrouped && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-neutral-800 text-neutral-400 border border-neutral-700">
              {section.column_count}-col
              <button
                type="button"
                onClick={handleUngroup}
                className="text-neutral-600 hover:text-red-400 transition-colors ml-0.5"
                aria-label="Remove from column group"
              >
                ×
              </button>
            </span>
          )}

          {saving && <span className="text-xs text-neutral-600">Saving…</span>}
          {saved && <span className="text-xs text-emerald-500">Saved</span>}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleMoveUp}
            disabled={index === 0}
            className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-800 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            aria-label="Move up"
          >↑</button>
          <button
            type="button"
            onClick={handleMoveDown}
            disabled={index === total - 1}
            className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-800 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            aria-label="Move down"
          >↓</button>
          <button
            type="button"
            onClick={handleDelete}
            className="w-7 h-7 flex items-center justify-center text-neutral-600 hover:text-red-400 hover:bg-neutral-800 transition-colors"
            aria-label="Delete section"
          >×</button>
        </div>
      </div>

      {/* Section content */}
      <div className="p-4">
        {section.type === 'text' && (
          <RichTextEditor
            key={section.id}
            defaultValue={section.content ?? ''}
            onChange={async (html) => {
              setSaving(true);
              setSaved(false);
              await updateSection(section.id, { content: html });
              setSaving(false);
              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
            }}
            placeholder="Write your content here… (auto-saves as you type)"
            minHeight="180px"
          />
        )}
        {(section.type === 'image' || section.type === 'video') && (
          <MediaUploader
            sectionId={section.id}
            sectionType={section.type}
            currentUrl={section.media_url}
          />
        )}
      </div>
    </div>
  );
}
