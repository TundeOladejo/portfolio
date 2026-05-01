import type { CaseStudyStatus } from '@/src/features/case-studies/types';

interface StatusBadgeProps {
  status: CaseStudyStatus;
}

const styles: Record<CaseStudyStatus, string> = {
  draft: 'bg-neutral-800 text-neutral-400 border border-neutral-700',
  published: 'bg-emerald-950 text-emerald-400 border border-emerald-800',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5',
        'text-xs font-medium uppercase tracking-widest',
        styles[status],
      ].join(' ')}
    >
      {status}
    </span>
  );
}
