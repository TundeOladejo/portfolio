'use client';

import { useTransition } from 'react';
import { deleteCaseStudy } from '@/src/features/case-studies/actions';

interface DeleteCaseStudyButtonProps {
  id: string;
  title: string;
}

export default function DeleteCaseStudyButton({ id, title }: DeleteCaseStudyButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteCaseStudy(id);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="px-3 py-1.5 text-xs text-red-500 border border-red-900/50 hover:border-red-700 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isPending ? 'Deleting…' : 'Delete'}
    </button>
  );
}
