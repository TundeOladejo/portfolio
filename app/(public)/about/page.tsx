import Nav from '@/src/components/Nav';
import Footer from '@/src/components/Footer';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Nav />

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="px-5 pt-32 pb-14 sm:px-6 sm:pt-40 sm:pb-24">
        <p className="mb-4 text-xs tracking-[0.3em] uppercase text-neutral-500">
          About Us
        </p>
        <h1 className="text-[clamp(2.5rem,7vw,7rem)] font-semibold leading-[0.9] tracking-tight text-white max-w-4xl">
          We make things<br />
          <em className="not-italic text-neutral-500">that matter.</em>
        </h1>
      </section>

      {/* ── Mission ─────────────────────────────────────────────── */}
      <section className="border-t border-neutral-900 px-5 py-14 sm:px-6 sm:py-24">
        <div className="grid grid-cols-1 gap-10 sm:gap-16 lg:grid-cols-2 max-w-6xl">
          <div>
            <p className="mb-4 sm:mb-6 text-xs tracking-[0.3em] uppercase text-neutral-500">
              Our Mission
            </p>
            <p className="text-lg sm:text-xl font-light leading-relaxed text-neutral-300">
              We are a creative studio that brings brands, stories, and
              experiences to life through art, design, and technology. Since
              our founding, we have been building a home for the world's most
              talented dreamers, makers, and doers.
            </p>
          </div>
          <div>
            <p className="mb-4 sm:mb-6 text-xs tracking-[0.3em] uppercase text-neutral-500">
              Our Approach
            </p>
            <p className="text-lg sm:text-xl font-light leading-relaxed text-neutral-300">
              At our core, we exist to find creative opportunity in every
              challenge — not just to think, but to make. We work in a
              collaborative, ego-free culture that breeds partnership and
              creative ambition.
            </p>
          </div>
        </div>
      </section>

      {/* ── Values ──────────────────────────────────────────────── */}
      <section className="border-t border-neutral-900 px-5 py-14 sm:px-6 sm:py-24">
        <p className="mb-8 sm:mb-12 text-xs tracking-[0.3em] uppercase text-neutral-500">
          What We Do
        </p>
        <div className="grid grid-cols-1 gap-px bg-neutral-900 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl">
          {[
            { title: 'Brand Identity', desc: 'Visual systems that define and differentiate.' },
            { title: 'Motion & Film', desc: 'Stories told through movement and light.' },
            { title: 'Digital Design', desc: 'Experiences built for screens of every size.' },
            { title: 'Strategy', desc: 'Thinking that shapes what we make.' },
          ].map(({ title, desc }) => (
            <div key={title} className="bg-black p-6 sm:p-8">
              <h3 className="text-base font-semibold text-white mb-2 sm:mb-3">{title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="border-t border-neutral-900 px-5 py-14 sm:px-6 sm:py-24">
        <div className="max-w-xl">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-5 sm:mb-6">
            Let's make something together.
          </h2>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 border border-neutral-700 px-6 sm:px-8 py-3 text-xs tracking-widest uppercase text-neutral-300 hover:border-white hover:text-white transition-colors"
          >
            Get in touch <span>→</span>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
