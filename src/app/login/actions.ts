'use server';

import { redirect } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { createSession } from '@/lib/auth';

export interface LoginState {
  error?: string;
}

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get('username') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '/');

  if (!username || !password) {
    return { error: 'Enter both username and password' };
  }

  let result;
  try {
    result = await api.adminLogin(username, password);
  } catch (err) {
    if (err instanceof ApiError) {
      return { error: err.message };
    }
    return { error: 'Could not reach the JalLink API.' };
  }

  await createSession({
    adminId: result.admin.id,
    name: result.admin.name,
    username: result.admin.username,
    role: result.admin.role,
    accessToken: result.accessToken,
  });

  // A manager has no dashboard/users/etc. screens (see proxy.ts) — send them straight to the
  // one page they can actually use rather than bouncing off `/` immediately after landing.
  const fallback = result.admin.role === 'manager' ? '/profile' : '/';
  redirect(next.startsWith('/') ? next : fallback);
}
