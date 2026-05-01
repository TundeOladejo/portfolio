'use client';

import { useActionState } from 'react';
import { signIn } from '@/src/features/auth/actions';
import type { ActionResult } from '@/src/features/case-studies/types';

const initialState: ActionResult<null> = { success: true, data: null };

export default function LoginPage() {
  const [state, action, pending] = useActionState(signIn, initialState);

  const formError =
    !state.success && state.errors._form ? state.errors._form[0] : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-white">
            Admin Portal
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Sign in to manage case studies
          </p>
        </div>

        <form action={action} className="space-y-5">
          {formError && (
            <div role="alert" className="border border-red-800 bg-red-950/30 px-4 py-3 text-sm text-red-400">
              {formError}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-medium tracking-widest uppercase text-neutral-400">
              Email
            </label>
            <input
              id="email" name="email" type="email" autoComplete="email" required
              placeholder="you@example.com"
              className="block w-full bg-neutral-900 border border-neutral-800 px-3 py-2.5 text-sm text-white placeholder-neutral-700 outline-none focus:border-neutral-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-medium tracking-widest uppercase text-neutral-400">
              Password
            </label>
            <input
              id="password" name="password" type="password" autoComplete="current-password" required
              placeholder="••••••••"
              className="block w-full bg-neutral-900 border border-neutral-800 px-3 py-2.5 text-sm text-white placeholder-neutral-700 outline-none focus:border-neutral-500 transition-colors"
            />
          </div>

          <button
            type="submit" disabled={pending}
            className="w-full bg-white text-black py-2.5 text-sm font-medium hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
