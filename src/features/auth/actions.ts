'use server';

import { redirect } from 'next/navigation';
import { createServerClient } from '@/src/lib/supabase/server';
import type { ActionResult } from '@/src/features/case-studies/types';

/**
 * Signs in an admin user with email and password.
 * Returns a generic error message on any failure to avoid revealing
 * which field (email or password) was incorrect — Requirement 1.3.
 */
export async function signIn(
  _prevState: ActionResult<null>,
  formData: FormData
): Promise<ActionResult<null>> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createServerClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Never reveal whether the email or password was wrong — Requirement 1.3
    return {
      success: false,
      errors: { _form: ['Invalid credentials'] },
    };
  }

  redirect('/admin');
}

/**
 * Signs out the current admin user, invalidates the session,
 * and redirects to the login page — Requirement 1.5.
 */
export async function signOut(): Promise<never> {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}
