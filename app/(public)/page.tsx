import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import Nav from '@/src/components/Nav';
import Footer from '@/src/components/Footer';
import CoverImage from '@/src/components/CoverImage';
import type { CaseStudy } from '@/src/features/case-studies/types';

export const revalidate = 60;

export default async function HomePage() {
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
  const featured = caseStudies.slice(0, 6);

  return (
    <div className="min-h-screen bg-black text-white">
      <Nav />

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="flex min-h-[85vh] flex-col justify-end px-5 pb-12 pt-28 sm:px-6 sm:pb-16 sm:pt-32 pointer-events-none">
        <div className="max-w-5xl pointer-events-auto">
          <p className="mb-3 text-xs tracking-[0.3em] uppercase text-neutral-500">
            Selected Work
          </p>
          <h1 className="text-[clamp(2.5rem,10vw,9rem)] font-semibold leading-[0.9] tracking-tight text-white">
            We make<br />
            things that<br />
            <em className="not-italic text-neutral-500">matter.</em>
          </h1>
        </div>
      </section>

      {/* ── Featured work grid ──────────────────────────────────── */}
      <section className="px-5 pb-12 sm:px-6 sm:pb-16">
        {featured.length === 0 ? (
          <EmptyState />
        ) : (
          <WorkGrid caseStudies={featured} />
        )}

        {/* View all link */}
        {caseStudies.length > 0 && (
          <div className="mt-12 flex justify-center">
            <Link
              href="/case-studies"
              className="inline-flex items-center gap-2 border border-neutral-700 px-8 py-3 text-xs tracking-widest uppercase text-neutral-300 hover:border-white hover:text-white transition-colors"
            >
              View All Work
              <span>→</span>
            </Link>
          </div>
        )}
      </section>

      {/* ── About strip ─────────────────────────────────────────── */}
      <section className="border-t border-neutral-900 px-5 py-14 sm:px-6 sm:py-24">
        <div className="max-w-3xl">
          <p className="mb-6 text-xs tracking-[0.3em] uppercase text-neutral-500">
            About
          </p>
          <p className="text-2xl font-light leading-relaxed text-neutral-300">
            A creative studio building brands, stories, and experiences through
            art, design, and technology. We exist to find creative opportunity
            in every challenge.
          </p>
          <Link
            href="/about"
            className="mt-8 inline-flex items-center gap-2 text-xs tracking-widest uppercase text-neutral-500 hover:text-white transition-colors"
          >
            Learn more <span>→</span>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ── Work grid ──────────────────────────────────────────────────────────── */

function WorkGrid({ caseStudies }: { caseStudies: CaseStudy[] }) {
  const layouts = getLayouts(caseStudies.length);
  let idx = 0;
  const rows: CaseStudy[][] = [];
  for (const count of layouts) {
    rows.push(caseStudies.slice(idx, idx + count));
    idx += count;
    if (idx >= caseStudies.length) break;
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, rowIdx) => (
        <div
          key={rowIdx}
          className={`grid gap-3 ${
            row.length === 1 ? 'grid-cols-1' :
            row.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {row.map((cs) => (
            <WorkCard
              key={cs.id}
              caseStudy={cs}
              tall={row.length === 1 || (row.length === 2 && rowIdx % 3 === 1)}
              wide={row.length === 1}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function getLayouts(total: number): number[] {
  const pattern = [1, 2, 3, 2];
  const result: number[] = [];
  let remaining = total;
  let i = 0;
  while (remaining > 0) {
    const n = Math.min(pattern[i % pattern.length], remaining);
    result.push(n);
    remaining -= n;
    i++;
  }
  return result;
}

/* ── Work card ──────────────────────────────────────────────────────────── */

function WorkCard({ caseStudy, tall, wide }: { caseStudy: CaseStudy; tall?: boolean; wide?: boolean }) {
  return (
    <Link
      href={`/${caseStudy.slug}`}
      className={`group relative block overflow-hidden bg-neutral-900 ${
        wide ? 'aspect-video sm:aspect-[21/7]' : 'aspect-video'
      }`}
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
        <h2 className="text-base sm:text-xl font-semibold leading-tight text-white">{caseStudy.title}</h2>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-neutral-300 line-clamp-2">{caseStudy.description}</p>
      </div>
      <div className="absolute top-4 right-4 hidden sm:block opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <span className="text-white text-lg">↗</span>
      </div>
    </Link>
  );
}

/* ── Empty state ────────────────────────────────────────────────────────── */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-40 text-center">
      <div className="mb-16 grid grid-cols-3 gap-3 w-full max-w-2xl opacity-10">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-neutral-800" style={{ aspectRatio: i % 3 === 0 ? '4/5' : '4/3' }} />
        ))}
      </div>
      <p className="text-xs tracking-[0.3em] uppercase text-neutral-600 mb-4">Coming Soon</p>
      <h2 className="text-4xl font-semibold text-neutral-300 mb-4">Work in progress.</h2>
      <p className="text-neutral-600 max-w-sm text-sm leading-relaxed">
        Case studies are being prepared. Check back soon or{' '}
        <Link href="/admin/login" className="text-neutral-400 underline underline-offset-4 hover:text-white transition-colors">
          sign in to add work
        </Link>.
      </p>
    </div>
  );
}
