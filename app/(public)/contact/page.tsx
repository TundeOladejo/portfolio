import Nav from '@/src/components/Nav';
import Footer from '@/src/components/Footer';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Nav />

      {/* ── Header ──────────────────────────────────────────────── */}
      <section className="px-5 pt-32 pb-14 sm:px-6 sm:pt-40 sm:pb-24">
        <p className="mb-4 text-xs tracking-[0.3em] uppercase text-neutral-500">
          Get In Touch
        </p>
        <h1 className="text-[clamp(2.5rem,7vw,7rem)] font-semibold leading-[0.9] tracking-tight text-white">
          Let's talk.
        </h1>
      </section>

      {/* ── Contact content ─────────────────────────────────────── */}
      <section className="border-t border-neutral-900 px-5 py-14 sm:px-6 sm:py-24">
        <div className="grid grid-cols-1 gap-12 sm:gap-16 lg:grid-cols-2 max-w-6xl">

          {/* Contact info */}
          <div className="flex flex-col gap-8 sm:gap-12">
            <div>
              <p className="mb-3 text-xs tracking-[0.3em] uppercase text-neutral-500">Email</p>
              <a href="mailto:hello@portfolio.com" className="text-lg sm:text-xl text-neutral-300 hover:text-white transition-colors">
                hello@portfolio.com
              </a>
            </div>
            <div>
              <p className="mb-3 text-xs tracking-[0.3em] uppercase text-neutral-500">New Business</p>
              <a href="mailto:work@portfolio.com" className="text-lg sm:text-xl text-neutral-300 hover:text-white transition-colors">
                work@portfolio.com
              </a>
            </div>
            <div>
              <p className="mb-3 text-xs tracking-[0.3em] uppercase text-neutral-500">Location</p>
              <p className="text-lg sm:text-xl text-neutral-300">Lagos · New York · London</p>
            </div>
          </div>

          {/* Contact form */}
          <div>
            <p className="mb-6 sm:mb-8 text-xs tracking-[0.3em] uppercase text-neutral-500">Send a Message</p>
            <form className="flex flex-col gap-5 sm:gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-xs tracking-widest uppercase text-neutral-500">Name</label>
                <input id="name" name="name" type="text" placeholder="Your name"
                  className="bg-transparent border-b border-neutral-800 py-3 text-white placeholder-neutral-700 outline-none focus:border-neutral-500 transition-colors" />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-xs tracking-widest uppercase text-neutral-500">Email</label>
                <input id="email" name="email" type="email" placeholder="your@email.com"
                  className="bg-transparent border-b border-neutral-800 py-3 text-white placeholder-neutral-700 outline-none focus:border-neutral-500 transition-colors" />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-xs tracking-widest uppercase text-neutral-500">Message</label>
                <textarea id="message" name="message" rows={5} placeholder="Tell us about your project…"
                  className="bg-transparent border-b border-neutral-800 py-3 text-white placeholder-neutral-700 outline-none focus:border-neutral-500 transition-colors resize-none" />
              </div>
              <button type="submit"
                className="mt-2 w-full sm:w-auto sm:self-start inline-flex items-center justify-center gap-2 border border-neutral-700 px-8 py-3 text-xs tracking-widest uppercase text-neutral-300 hover:border-white hover:text-white transition-colors">
                Send Message <span>→</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
