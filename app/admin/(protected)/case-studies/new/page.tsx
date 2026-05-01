import Link from 'next/link';
import CaseStudyForm from '@/src/features/case-studies/components/CaseStudyForm';

export default function NewCaseStudyPage() {
  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-2xl mx-auto">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="mb-8 flex items-center gap-3">
        <Link
          href="/admin"
          className="text-neutral-500 hover:text-white transition-colors"
          aria-label="Back to dashboard"
        >
          ←
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-white">New Case Study</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Fill in the details below to create a new case study.</p>
        </div>
      </div>

      <CaseStudyForm />
    </div>
  );
}
