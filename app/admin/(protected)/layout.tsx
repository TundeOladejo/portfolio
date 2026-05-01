import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@/src/lib/supabase/server';
import { signOut } from '@/src/features/auth/actions';

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex">
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-56 flex-col fixed inset-y-0 left-0 border-r border-neutral-800 bg-neutral-950 z-40">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-neutral-800">
          <Link href="/" className="text-sm font-semibold tracking-widest uppercase text-white hover:opacity-70 transition-opacity">
            Portfolio
          </Link>
          <p className="mt-0.5 text-xs text-neutral-600">Admin</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors rounded-sm"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
              <rect x="1" y="1" width="5" height="5" stroke="currentColor" strokeWidth="1.2"/>
              <rect x="8" y="1" width="5" height="5" stroke="currentColor" strokeWidth="1.2"/>
              <rect x="1" y="8" width="5" height="5" stroke="currentColor" strokeWidth="1.2"/>
              <rect x="8" y="8" width="5" height="5" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
            Dashboard
          </Link>
          <Link
            href="/admin/case-studies/new"
            className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors rounded-sm"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
              <line x1="7" y1="2" x2="7" y2="12" stroke="currentColor" strokeWidth="1.2"/>
              <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
            New Case Study
          </Link>
        </nav>

        {/* Bottom: user + sign out */}
        <div className="px-3 py-4 border-t border-neutral-800">
          <p className="px-3 mb-2 text-xs text-neutral-600 truncate">{user.email}</p>
          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors rounded-sm text-left"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
                <path d="M5 2H2v10h3M9 4l3 3-3 3M12 7H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────── */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-neutral-800">
          <Link href="/admin" className="text-sm font-semibold tracking-widest uppercase">
            Portfolio Admin
          </Link>
          <Link href="/admin/case-studies/new" className="text-xs text-neutral-400 hover:text-white transition-colors">
            + New
          </Link>
        </div>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
