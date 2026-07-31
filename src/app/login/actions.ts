'use server';

import { redirect } from 'next/navigation';
import { verifyCredentials } from '@/lib/session';
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

  if (!verifyCredentials(username, password)) {
    return { error: 'Invalid username or password' };
  }

  await createSession();
  redirect(next.startsWith('/') ? next : '/');
}
