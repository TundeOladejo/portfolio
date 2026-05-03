import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import Nav from '@/src/components/Nav';
import Footer from '@/src/components/Footer';
import CoverImage from '@/src/components/CoverImage';
import { SectionListRenderer } from '@/src/features/sections/components/SectionRenderer';
import type { CaseStudy } from '@/src/features/case-studies/types';
import type { Section } from '@/src/features/sections/types';

export const revalidate = 60;

export async function generateStaticParams() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from('case_studies')
    .select('slug')
    .eq('status', 'published');
  return (data ?? []).map((row: { slug: string }) => ({ slug: row.slug }));
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: caseStudyData } = await supabase
    .from('case_studies')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!caseStudyData || caseStudyData.status !== 'published') notFound();

  const caseStudy = caseStudyData as CaseStudy;

  const { data: sectionsData } = await supabase
    .from('sections')
    .select('*')
    .eq('case_study_id', caseStudy.id)
    .order('order', { ascending: true });

  const sections = (sectionsData ?? []) as Section[];

  return (
    <div className="min-h-screen bg-black text-white">
      <Nav />

      {/* ── Hero — full-bleed cover with title overlaid ──────────── */}
      <section className="relative w-full aspect-video sm:aspect-[16/7] min-h-[60vw] sm:min-h-0">
        <CoverImage
          src={caseStudy.cover_image_url}
          alt={caseStudy.title}
          sizes="100vw"
          className="transition-none"
        />
        {/* Gradient from bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* Title overlaid at bottom-left */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-10 sm:px-10 sm:pb-14">
          <Link
            href="/case-studies"
            className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-neutral-400 hover:text-white transition-colors mb-5 sm:mb-8"
          >
            ← All Work
          </Link>
          <p className="mb-2 text-xs tracking-[0.3em] uppercase text-neutral-400">Case Study</p>
          <h1 className="text-[clamp(2rem,6vw,6rem)] font-semibold leading-[0.9] tracking-tight text-white max-w-4xl">
            {caseStudy.title}
          </h1>
        </div>
      </section>

      {/* ── Description — full width, large ─────────────────────── */}
      <section className="px-5 py-12 sm:px-10 sm:py-16 border-b border-neutral-900">
        <p className="text-xl sm:text-2xl font-light leading-relaxed text-neutral-300 max-w-3xl">
          {caseStudy.description}
        </p>
      </section>

      {/* ── Sections — edge-to-edge ──────────────────────────────── */}
      {sections.length > 0 && (
        <section className="py-12 sm:py-16">
          <SectionListRenderer sections={sections} />
        </section>
      )}

      <Footer />
    </div>
  );
}
