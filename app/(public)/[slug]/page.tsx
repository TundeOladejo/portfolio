import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import Nav from '@/src/components/Nav';
import Footer from '@/src/components/Footer';
import CoverImage from '@/src/components/CoverImage';
import SectionRenderer from '@/src/features/sections/components/SectionRenderer';
import type { CaseStudy } from '@/src/features/case-studies/types';
import type { Section } from '@/src/features/sections/types';

// Revalidate every 60 seconds (ISR) — also revalidated on-demand via
// revalidatePath('/${slug}') after admin mutations.
export const revalidate = 60;

// Pre-render all published case study slugs at build time.
// generateStaticParams runs without an HTTP request, so cookies() cannot be
// used here. Use a plain anon Supabase client instead of createServerClient.
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
  // params is a Promise in Next.js 16 — must be awaited
  const { slug } = await params;

  // Plain anon client — no session needed for public read of published studies.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: caseStudyData } = await supabase
    .from('case_studies')
    .select('*')
    .eq('slug', slug)
    .single();

  // 404 if not found or draft (Req 7.2, 7.3)
  if (!caseStudyData || caseStudyData.status !== 'published') {
    notFound();
  }

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

      {/* ── Cover image ─────────────────────────────────────────── */}
      <div className="relative w-full aspect-video sm:aspect-[16/7]">
        <CoverImage
          src={caseStudy.cover_image_url}
          alt={caseStudy.title}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* ── Case study content ───────────────────────────────────── */}
      <main className="px-5 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/case-studies"
            className="mb-8 sm:mb-10 inline-flex items-center gap-2 text-xs tracking-widest uppercase text-neutral-500 hover:text-white transition-colors"
          >
            ← All Work
          </Link>
          <header className="mb-12 sm:mb-16 mt-4 sm:mt-6">
            <p className="mb-3 text-xs tracking-[0.3em] uppercase text-neutral-500">Case Study</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
              {caseStudy.title}
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg font-light leading-relaxed text-neutral-400">
              {caseStudy.description}
            </p>
          </header>

          {/* Sections */}
          {sections.length > 0 && (
            <div className="flex flex-col gap-16">
              {sections.map((section) => (
                <SectionRenderer key={section.id} section={section} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
