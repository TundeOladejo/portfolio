import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerClient } from '@/src/lib/supabase/server';
import { publishCaseStudy, draftCaseStudy } from '@/src/features/case-studies/actions';
import CaseStudyForm from '@/src/features/case-studies/components/CaseStudyForm';
import SectionList from '@/src/features/sections/components/SectionList';
import StatusBadge from '@/src/components/StatusBadge';
import AdminCoverPreview from '@/src/components/AdminCoverPreview';
import type { CaseStudy } from '@/src/features/case-studies/types';
import type { Section } from '@/src/features/sections/types';

export default async function EditCaseStudyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: caseStudyData } = await supabase
    .from('case_studies')
    .select('*')
    .eq('id', id)
    .single();

  if (!caseStudyData) notFound();

  const caseStudy = caseStudyData as CaseStudy;

  const { data: sectionsData } = await supabase
    .from('sections')
    .select('*')
    .eq('case_study_id', id)
    .order('order', { ascending: true });

  const sections = (sectionsData ?? []) as Section[];

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-6xl mx-auto">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="mb-6 sm:mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/admin" className="shrink-0 text-neutral-500 hover:text-white transition-colors" aria-label="Back">←</Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-semibold text-white truncate">{caseStudy.title}</h1>
              <StatusBadge status={caseStudy.status} />
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">/{caseStudy.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {caseStudy.status === 'draft' ? (
            <form action={async () => { 'use server'; await publishCaseStudy(id); }}>
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors">
                Publish
              </button>
            </form>
          ) : (
            <form action={async () => { 'use server'; await draftCaseStudy(id); }}>
              <button type="submit" className="border border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:text-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors">
                Unpublish
              </button>
            </form>
          )}
          <Link href={`/admin/preview/${caseStudy.slug}`} target="_blank"
            className="border border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-white px-3 sm:px-4 py-2 text-xs sm:text-sm transition-colors">
            Preview ↗
          </Link>
        </div>
      </div>

      {/* ── Two-column layout ───────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 sm:gap-8 xl:grid-cols-[1fr_1.4fr]">

        {/* Left: metadata */}
        <div className="flex flex-col gap-6">
          <div className="border border-neutral-800 bg-neutral-900/50">
            <div className="px-5 py-4 border-b border-neutral-800">
              <h2 className="text-sm font-medium text-white">Details</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Title, description, and cover image</p>
            </div>
            <div className="px-5 py-5">
              <CaseStudyForm caseStudy={caseStudy} />
            </div>
          </div>

          {/* Cover image preview */}
          {caseStudy.cover_image_url && (
            <AdminCoverPreview src={caseStudy.cover_image_url} />
          )}
        </div>

        {/* Right: sections */}
        <div className="border border-neutral-800 bg-neutral-900/50">
          <div className="px-5 py-4 border-b border-neutral-800">
            <h2 className="text-sm font-medium text-white">Content Sections</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Add text, images, and videos to build the case study narrative
            </p>
          </div>
          <div className="px-5 py-5">
            <SectionList caseStudyId={id} sections={sections} />
          </div>
        </div>
      </div>
    </div>
  );
}
