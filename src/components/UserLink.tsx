'use client';

import Link from 'next/link';
import { useTranslations } from '@/lib/i18n/client';

export interface LinkableUser {
  id: string;
  name: string | null;
  mobile: string;
}

/** Customer name + mobile, linked through to that user's page. */
export function UserLink({ user }: { user: LinkableUser }) {
  const t = useTranslations();

  return (
    <Link href={`/users/${user.id}`} className="group block">
      <div className="font-medium text-(--color-text) group-hover:text-(--color-brand-blue-dark) group-hover:underline">
        {user.name ?? t.common.unnamedCustomer}
      </div>
      <div className="text-xs text-(--color-text-muted)">{user.mobile}</div>
    </Link>
  );
}
