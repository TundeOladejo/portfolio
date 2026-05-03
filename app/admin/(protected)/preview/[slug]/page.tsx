import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@/src/lib/supabase/server';
import { SectionListRenderer } from '@/src/features/sections/components/SectionRenderer';
import type { CaseStudy } from '@/src/features/case-studies/types';
import type { Section } from '@/src/features/sections/types';

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createServerClient();

  const { data: caseStudyData } = await supabase
    .from('case_studies')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!caseStudyData) notFound();

  const caseStudy = caseStudyData as CaseStudy;

  const { data: sectionsData } = await supabase
    .from('sections')
    .select('*')
    .eq('case_study_id', caseStudy.id)
    .order('order', { ascending: true });

  const sections = (sectionsData ?? []) as Section[];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ── Preview banner ──────────────────────────────────────── */}
      <div className="sticky top-0 z-[100] flex flex-wrap items-center justify-between gap-3 bg-amber-500 px-5 py-2.5">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-widest text-black">
            Preview Mode
          </span>
          <span className={`text-xs px-2 py-0.5 font-medium ${
            caseStudy.status === 'published'
              ? 'bg-emerald-600 text-white'
              : 'bg-black/20 text-black'
          }`}>
            {caseStudy.status}
          </span>
          {caseStudy.status === 'draft' && (
            <span className="text-xs text-black/70 hidden sm:inline">
              Not visible to visitors until published.
            </span>
          )}
        </div>
        <Link
          href={`/admin/case-studies/${caseStudy.id}`}
          className="text-xs font-medium text-black hover:underline"
        >
          ← Back to editor
        </Link>
      </div>

      {/* ── Hero — full-bleed cover with title overlaid ──────────── */}
      <section className="relative w-full aspect-video sm:aspect-[16/7] min-h-[60vw] sm:min-h-0">
        {caseStudy.cover_image_url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={caseStudy.cover_image_url}
              alt={caseStudy.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-neutral-900" />
        )}

        <div className="absolute bottom-0 left-0 right-0 px-5 pb-10 sm:px-10 sm:pb-14">
          <p className="mb-2 text-xs tracking-[0.3em] uppercase text-neutral-400">Case Study</p>
          <h1 className="text-[clamp(2rem,6vw,6rem)] font-semibold leading-[0.9] tracking-tight text-white max-w-4xl">
            {caseStudy.title}
          </h1>
        </div>
      </section>

      {/* ── Description ─────────────────────────────────────────── */}
      <section className="px-5 py-12 sm:px-10 sm:py-16 border-b border-neutral-900">
        <p className="text-xl sm:text-2xl font-light leading-relaxed text-neutral-300 max-w-3xl">
          {caseStudy.description}
        </p>
      </section>

      {/* ── Sections ────────────────────────────────────────────── */}
      {sections.length > 0 ? (
        <section className="py-12 sm:py-16">
          <SectionListRenderer sections={sections} />
        </section>
      ) : (
        <div className="px-5 sm:px-10 py-24 text-center">
          <p className="text-neutral-600 text-sm mb-4">No sections added yet.</p>
          <Link
            href={`/admin/case-studies/${caseStudy.id}`}
            className="text-xs text-neutral-500 hover:text-white transition-colors underline"
          >
            Add sections in the editor
          </Link>
        </div>
      )}
    </div>
  );
}
