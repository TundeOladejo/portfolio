import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@/src/lib/supabase/server';
import SectionRenderer from '@/src/features/sections/components/SectionRenderer';
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
      <div className="sticky top-0 z-50 flex items-center justify-between gap-4 bg-amber-500 px-6 py-2.5">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-black">
            Preview Mode
          </span>
          <span className={`text-xs px-2 py-0.5 font-medium rounded-full ${
            caseStudy.status === 'published'
              ? 'bg-emerald-600 text-white'
              : 'bg-black/20 text-black'
          }`}>
            {caseStudy.status}
          </span>
          {caseStudy.status === 'draft' && (
            <span className="text-xs text-black/70">
              This page is not visible to visitors until published.
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

      {/* ── Cover image ─────────────────────────────────────────── */}
      {caseStudy.cover_image_url && (
        <div className="relative w-full" style={{ aspectRatio: '16/7' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={caseStudy.cover_image_url}
            alt={caseStudy.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      {/* ── Content ─────────────────────────────────────────────── */}
      <main className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 text-xs tracking-[0.3em] uppercase text-neutral-500">
            Case Study
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {caseStudy.title}
          </h1>
          <p className="mt-6 text-lg font-light leading-relaxed text-neutral-400">
            {caseStudy.description}
          </p>

          {sections.length > 0 && (
            <div className="mt-16 flex flex-col gap-16">
              {sections.map((section) => (
                <SectionRenderer key={section.id} section={section} />
              ))}
            </div>
          )}

          {sections.length === 0 && (
            <div className="mt-16 border border-dashed border-neutral-800 py-16 text-center">
              <p className="text-neutral-600 text-sm">No sections added yet.</p>
              <Link
                href={`/admin/case-studies/${caseStudy.id}`}
                className="mt-3 inline-block text-xs text-neutral-500 hover:text-white transition-colors underline"
              >
                Add sections in the editor
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
