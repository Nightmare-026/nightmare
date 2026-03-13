'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';

export function AdminLink() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return null;
  }

  return (
    <li>
      <Link
        href="/admin"
        className="text-fuchsia-400 hover:text-fuchsia-300 transition-colors text-sm font-medium flex items-center gap-1"
      >
        Management
      </Link>
    </li>
  );
}
