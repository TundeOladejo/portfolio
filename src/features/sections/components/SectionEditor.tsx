'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSection, deleteSection, reorderSections } from '@/src/features/sections/actions';
import type { Section } from '@/src/features/sections/types';
import MediaUploader from '@/src/features/media/components/MediaUploader';

interface SectionEditorProps {
  section: Section;
  index: number;
  total: number;
  allSections: Section[];
}

const TYPE_LABELS: Record<string, string> = {
  text: '¶ Text',
  image: '⬜ Image',
  video: '▶ Video',
};

export default function SectionEditor({ section, index, total, allSections }: SectionEditorProps) {
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

  return (
    <div className="border border-neutral-800 bg-neutral-950 overflow-hidden">
      {/* Section header */}
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-neutral-900 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          {/* Order badge */}
          <span className="text-xs text-neutral-600 font-mono w-4 text-center">{index + 1}</span>
          <span className="text-xs font-medium text-neutral-400">{TYPE_LABELS[section.type]}</span>
          {saving && <span className="text-xs text-neutral-600">Saving…</span>}
          {saved && <span className="text-xs text-emerald-500">Saved</span>}
        </div>

        <div className="flex items-center gap-1">
          {/* Reorder */}
          <button
            type="button"
            onClick={handleMoveUp}
            disabled={index === 0}
            className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-800 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            aria-label="Move up"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={handleMoveDown}
            disabled={index === total - 1}
            className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-800 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            aria-label="Move down"
          >
            ↓
          </button>
          {/* Delete */}
          <button
            type="button"
            onClick={handleDelete}
            className="w-7 h-7 flex items-center justify-center text-neutral-600 hover:text-red-400 hover:bg-neutral-800 transition-colors"
            aria-label="Delete section"
          >
            ×
          </button>
        </div>
      </div>

      {/* Section content */}
      <div className="p-4">
        {section.type === 'text' && (
          <textarea
            key={section.id}
            defaultValue={section.content ?? ''}
            onBlur={(e) => handleTextBlur(e.target.value)}
            rows={6}
            placeholder="Write your content here… (auto-saves on blur)"
            className="w-full resize-y bg-transparent border-0 text-sm text-neutral-200 placeholder-neutral-700 outline-none leading-relaxed"
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
