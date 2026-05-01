import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import Nav from '@/src/components/Nav';
import Footer from '@/src/components/Footer';
import CoverImage from '@/src/components/CoverImage';
import type { CaseStudy } from '@/src/features/case-studies/types';

export const revalidate = 60;

export default async function CaseStudiesPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from('case_studies')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  const caseStudies = (data ?? []) as CaseStudy[];

  return (
    <div className="min-h-screen bg-black text-white">
      <Nav />

      {/* ── Page header ─────────────────────────────────────────── */}
      <section className="px-5 pt-32 pb-10 sm:px-6 sm:pt-40 sm:pb-16">
        <p className="mb-4 text-xs tracking-[0.3em] uppercase text-neutral-500">Our Work</p>
        <h1 className="text-[clamp(2.5rem,7vw,7rem)] font-semibold leading-[0.9] tracking-tight text-white">
          Case Studies
        </h1>
      </section>

      {/* ── Grid ────────────────────────────────────────────────── */}
      <section className="px-5 pb-20 sm:px-6 sm:pb-32">
        {caseStudies.length === 0 ? (
          <div className="py-32 text-center">
            <p className="text-neutral-600 text-sm">No case studies published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {caseStudies.map((cs) => (
              <CaseStudyCard key={cs.id} caseStudy={cs} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

function CaseStudyCard({ caseStudy }: { caseStudy: CaseStudy }) {
  return (
    <Link
      href={`/${caseStudy.slug}`}
      className="group relative block overflow-hidden bg-neutral-900"
      style={{ aspectRatio: '4/3' }}
    >
      <CoverImage
        src={caseStudy.cover_image_url}
        alt={caseStudy.title}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent sm:from-black/0 sm:via-transparent transition-colors duration-500 sm:group-hover:from-black/70 sm:group-hover:via-black/20" />
      <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 opacity-100 sm:translate-y-4 sm:opacity-0 transition-all duration-500 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
        <p className="text-xs tracking-[0.25em] uppercase text-neutral-400 mb-1">Case Study</p>
        <h2 className="text-base sm:text-lg font-semibold leading-tight text-white">{caseStudy.title}</h2>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-neutral-300 line-clamp-2">{caseStudy.description}</p>
      </div>
      <div className="absolute top-5 right-5 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <span className="text-white text-lg">↗</span>
      </div>
    </Link>
  );
}
