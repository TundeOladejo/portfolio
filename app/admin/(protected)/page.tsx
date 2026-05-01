import Link from 'next/link';
import { createServerClient } from '@/src/lib/supabase/server';
import { publishCaseStudy, draftCaseStudy } from '@/src/features/case-studies/actions';
import StatusBadge from '@/src/components/StatusBadge';
import DeleteCaseStudyButton from '@/src/features/case-studies/components/DeleteCaseStudyButton';
import type { CaseStudy } from '@/src/features/case-studies/types';

export default async function AdminDashboard() {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('case_studies')
    .select('*')
    .order('created_at', { ascending: false });

  const studies = (data ?? []) as CaseStudy[];
  const published = studies.filter((s) => s.status === 'published').length;
  const drafts = studies.filter((s) => s.status === 'draft').length;

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-5xl mx-auto">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="mb-6 sm:mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500">Manage your case studies</p>
        </div>
        <Link
          href="/admin/case-studies/new"
          className="shrink-0 inline-flex items-center gap-1.5 bg-white text-black px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium hover:bg-neutral-200 transition-colors"
        >
          <span className="text-base leading-none">+</span>
          <span className="hidden sm:inline">New Case Study</span>
          <span className="sm:hidden">New</span>
        </Link>
      </div>

      {/* ── Stats ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8">
        {[
          { label: 'Total', value: studies.length },
          { label: 'Published', value: published },
          { label: 'Drafts', value: drafts },
        ].map(({ label, value }) => (
          <div key={label} className="border border-neutral-800 bg-neutral-900 px-3 sm:px-5 py-3 sm:py-4">
            <p className="text-xl sm:text-2xl font-semibold text-white">{value}</p>
            <p className="mt-0.5 text-xs tracking-widest uppercase text-neutral-500">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Case study list ─────────────────────────────────────── */}
      {studies.length === 0 ? (
        <div className="border border-dashed border-neutral-800 py-16 sm:py-20 text-center px-4">
          <p className="text-neutral-500 text-sm mb-4">No case studies yet.</p>
          <Link
            href="/admin/case-studies/new"
            className="inline-flex items-center gap-2 border border-neutral-700 px-5 py-2 text-xs tracking-widest uppercase text-neutral-400 hover:border-neutral-500 hover:text-white transition-colors"
          >
            Create your first case study →
          </Link>
        </div>
      ) : (
        <div className="border border-neutral-800 divide-y divide-neutral-800">
          {/* Table header — desktop only */}
          <div className="hidden sm:grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-3 bg-neutral-900">
            <span className="text-xs tracking-widest uppercase text-neutral-500">Title</span>
            <span className="text-xs tracking-widest uppercase text-neutral-500">Status</span>
            <span className="text-xs tracking-widest uppercase text-neutral-500">Actions</span>
          </div>

          {studies.map((cs) => (
            <div key={cs.id} className="px-4 sm:px-5 py-4 hover:bg-neutral-900/50 transition-colors">
              {/* Mobile layout */}
              <div className="flex items-start justify-between gap-3 sm:hidden">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white text-sm truncate">{cs.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <StatusBadge status={cs.status} />
                    <span className="text-xs text-neutral-600 truncate">/{cs.slug}</span>
                  </div>
                </div>
                <Link
                  href={`/admin/case-studies/${cs.id}`}
                  className="shrink-0 px-3 py-1.5 text-xs text-neutral-300 border border-neutral-700 hover:border-neutral-500 hover:text-white transition-colors"
                >
                  Edit
                </Link>
              </div>
              {/* Mobile action row */}
              <div className="mt-3 flex items-center gap-2 sm:hidden">
                {cs.status === 'draft' ? (
                  <form action={async () => { 'use server'; await publishCaseStudy(cs.id); }}>
                    <button type="submit" className="px-3 py-1.5 text-xs text-emerald-400 border border-emerald-900 hover:border-emerald-700 transition-colors">
                      Publish
                    </button>
                  </form>
                ) : (
                  <form action={async () => { 'use server'; await draftCaseStudy(cs.id); }}>
                    <button type="submit" className="px-3 py-1.5 text-xs text-neutral-400 border border-neutral-700 hover:border-neutral-500 transition-colors">
                      Unpublish
                    </button>
                  </form>
                )}
                <DeleteCaseStudyButton id={cs.id} title={cs.title} />
              </div>

              {/* Desktop layout */}
              <div className="hidden sm:grid grid-cols-[1fr_auto_auto] gap-4 items-center">
                <div className="min-w-0">
                  <p className="font-medium text-white truncate">{cs.title}</p>
                  <p className="mt-0.5 text-xs text-neutral-600 truncate">/{cs.slug}</p>
                </div>
                <div className="flex items-center">
                  <StatusBadge status={cs.status} />
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/case-studies/${cs.id}`} className="px-3 py-1.5 text-xs text-neutral-300 border border-neutral-700 hover:border-neutral-500 hover:text-white transition-colors">
                    Edit
                  </Link>
                  {cs.status === 'draft' ? (
                    <form action={async () => { 'use server'; await publishCaseStudy(cs.id); }}>
                      <button type="submit" className="px-3 py-1.5 text-xs text-emerald-400 border border-emerald-900 hover:border-emerald-700 hover:text-emerald-300 transition-colors">
                        Publish
                      </button>
                    </form>
                  ) : (
                    <form action={async () => { 'use server'; await draftCaseStudy(cs.id); }}>
                      <button type="submit" className="px-3 py-1.5 text-xs text-neutral-400 border border-neutral-700 hover:border-neutral-500 hover:text-neutral-200 transition-colors">
                        Unpublish
                      </button>
                    </form>
                  )}
                  <DeleteCaseStudyButton id={cs.id} title={cs.title} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
