import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-neutral-900 px-6 py-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs text-neutral-600 tracking-widest uppercase">
        © {new Date().getFullYear()} Portfolio. All rights reserved.
      </span>
      <ul className="flex items-center gap-6">
        <li>
          <Link
            href="/case-studies"
            className="text-xs text-neutral-600 tracking-widest uppercase hover:text-neutral-300 transition-colors"
          >
            Work
          </Link>
        </li>
        <li>
          <Link
            href="/about"
            className="text-xs text-neutral-600 tracking-widest uppercase hover:text-neutral-300 transition-colors"
          >
            About
          </Link>
        </li>
        <li>
          <Link
            href="/contact"
            className="text-xs text-neutral-600 tracking-widest uppercase hover:text-neutral-300 transition-colors"
          >
            Contact
          </Link>
        </li>
      </ul>
    </footer>
  );
}
