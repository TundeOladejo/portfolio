'use client';

import { useState } from 'react';
import Link from 'next/link';

const links = [
  { href: '/case-studies', label: 'Work' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Full-screen mobile menu — rendered first so nav bar sits on top */}
      {open && (
        <div
          className="fixed inset-0 bg-black z-50 flex flex-col sm:hidden"
          style={{ paddingTop: '80px' }}
        >
          <ul className="flex flex-col px-8 pt-8 gap-10">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className="block text-4xl font-semibold text-white"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Nav bar — always on top */}
      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="text-sm font-semibold tracking-widest uppercase text-white hover:opacity-70 transition-opacity"
        >
          Portfolio
        </Link>

        {/* Desktop links */}
        <ul className="hidden sm:flex items-center gap-8">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="text-xs tracking-widest uppercase text-neutral-400 hover:text-white transition-colors"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="sm:hidden flex flex-col justify-center items-center gap-[5px] w-10 h-10"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          <span
            className={`block w-6 h-[2px] bg-white transition-all duration-200 origin-center ${
              open ? 'rotate-45 translate-y-[7px]' : ''
            }`}
          />
          <span
            className={`block w-6 h-[2px] bg-white transition-all duration-200 ${
              open ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block w-6 h-[2px] bg-white transition-all duration-200 origin-center ${
              open ? '-rotate-45 -translate-y-[7px]' : ''
            }`}
          />
        </button>
      </nav>
    </>
  );
}
