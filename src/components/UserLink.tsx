import Link from 'next/link';

export interface LinkableUser {
  id: string;
  name: string | null;
  mobile: string;
}

export function userDisplayName(user: { name: string | null }): string {
  return user.name ?? 'Unnamed customer';
}

/** Customer name + mobile, linked through to that user's page. */
export function UserLink({ user }: { user: LinkableUser }) {
  return (
    <Link href={`/users/${user.id}`} className="group block">
      <div className="font-medium text-(--color-text) group-hover:text-(--color-brand-blue-dark) group-hover:underline">
        {userDisplayName(user)}
      </div>
      <div className="text-xs text-(--color-text-muted)">{user.mobile}</div>
    </Link>
  );
}
